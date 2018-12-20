/** @flow */
import type { Exports as YogaExports } from "yoga-dom";
import invariant from "invariant";

import { moduleConfigFactory } from "RCTModuleConfig";
import NotificationCenter from "NotificationCenter";
import {
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync
} from "RCTBridgeMethod";
import type { RCTFunctionType } from "RCTBridgeMethod";
import type RCTEventDispatcher from "RCTEventDispatcher";
import type RCTImageLoader from "RCTImageLoader";
import type RCTDeviceInfo from "RCTDeviceInfo";
import type RCTDevLoadingView from "RCTDevLoadingView";
import type RCTDevSettings from "RCTDevSettings";
import type RCTNetworking from "RCTNetworkingNative";
import type RCTBlobManager from "RCTBlobManager";
import RCTModule, {
  type ModuleDescription,
  type NativeModuleImports
} from "RCTModule";
import { bridgeModuleNameForClass } from "RCTModule";
import type RCTRedBox from "RCTRedBox";
import type RCTUIManager from "RCTUIManager";

export { RCTFunctionTypeNormal, RCTFunctionTypePromise, RCTFunctionTypeSync };
export type { RCTFunctionType };

declare var __DEV__: boolean;

type ClassInstance = <T>(Class<T>) => T;

type MessagePayload = {
  data: {
    topic: string,
    payload: any
  }
};

type NativeCall = {
  moduleId: number,
  methodId: number,
  args: Array<any>
};

const MODULE_IDS = 0;
const METHOD_IDS = 1;
const PARAMS = 2;

const DEVTOOLS_FLAG = /\bdevtools\b/;
const HOTRELOAD_FLAG = /\bhotreload\b/;

// $FlowFixMe
let WORKER_SRC = preval`
  const fs = require('fs');
  const path = require('path');

  module.exports = fs.readFileSync(
    path.resolve(__dirname, 'RCTBridge.worker.js'),
    'utf8'
  );
`;

if (__DEV__) {
  WORKER_SRC = "__DEV__ = true;\n" + WORKER_SRC;
  if (DEVTOOLS_FLAG.test(location.search)) {
    WORKER_SRC = "__DEVTOOLS__ = true;\n" + WORKER_SRC;
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log(
        "We detected that you have the React Devtools extension installed. " +
          "Please note that at this time, React Native DOM is only compatible with the " +
          "standalone version of React Developer Tools."
      );
    }
  }
} else {
  WORKER_SRC = "__DEV__ = false;\n" + WORKER_SRC;
}

export function getPropertyNames(obj: ?Object): Array<string> {
  if (obj == null) return [];

  const currentPropertyNames = Object.getOwnPropertyNames(obj);
  return currentPropertyNames.concat(
    getPropertyNames(Object.getPrototypeOf(obj))
  );
}

type ModuleData = {
  name: string,
  methods: string[],
  constants: { [string]: any }
};

export default class RCTBridge {
  nativeModules: NativeModuleImports;

  modulesByName: { [name: string]: RCTModule } = {};
  moduleClasses: Array<Class<RCTModule>> = [];
  moduleConfigs: Array<ModuleDescription> = [];
  bundleFinishedLoading: ?() => void;
  messages: Array<NativeCall> = [];
  moduleName: string;
  bundleLocation: string;
  loading: boolean;
  parent: HTMLElement;
  urlScheme: string;
  basename: string;

  Yoga: YogaExports;

  _uiManager: ?RCTUIManager;
  _eventDispatcher: ?RCTEventDispatcher;
  _imageLoader: ?RCTImageLoader;
  _deviceInfo: ?RCTDeviceInfo;
  _devLoadingView: ?RCTDevLoadingView;
  _devSettings: ?RCTDevSettings;
  _redBox: ?RCTRedBox;
  _networking: ?RCTNetworking;
  _blobManager: ?RCTBlobManager;

  constructor(
    moduleName: string,
    bundle: string,
    nativeModules: NativeModuleImports,
    parent: HTMLElement,
    urlScheme: string,
    basename: string
  ) {
    this.loading = true;
    this.moduleName = moduleName;
    this.bundleLocation = bundle;
    this.nativeModules = nativeModules;
    this.parent = parent;
    this.urlScheme = urlScheme;
    this.basename = basename;

    const bridgeCodeBlob = new Blob([WORKER_SRC]);
    const worker = new Worker(URL.createObjectURL(bridgeCodeBlob));
    this.setThread(worker);
  }

  moduleForClass(cls: Class<RCTModule>): RCTModule {
    return this.modulesByName[bridgeModuleNameForClass(cls)];
  }

  queue: Array<any> = [];
  executing: boolean = false;
  thread: ?Worker;

  setThread(thread: Worker) {
    this.thread = thread;
    thread.onmessage = this.onMessage.bind(this);
  }

  sendMessage(topic: string, payload: any) {
    if (this.thread) {
      this.thread.postMessage({ topic, payload });
    }
  }

  callNativeModule(moduleId: number, methodId: number, params: Array<any>) {
    const moduleConfig = this.moduleConfigs[moduleId];

    invariant(moduleConfig, `No such module with id: ${moduleId}`);
    const [name, , , promiseMethods] = moduleConfig;

    const nativeModule = this.modulesByName[name];
    invariant(nativeModule, `No such module with name ${name}`);

    // console.log("JS -> Native", name, functionName, params);

    const nativeMethod = nativeModule.functionMap[methodId];

    if (promiseMethods.includes(methodId)) {
      const [resolveId, rejectId] = params.splice(-2, 2);
      Promise.resolve(nativeMethod.apply(nativeModule, params))
        .then((res) => {
          res = JSON.parse(JSON.stringify(res));
          this.callbackFromId(resolveId)(res);
        })
        .catch((err) => {
          err = JSON.parse(JSON.stringify(err));
          this.callbackFromId(rejectId)(err);
        });
    } else {
      nativeModule.functionMap[methodId].apply(nativeModule, params);
    }
  }

  onMessage(message: any) {
    const { topic, payload } = message.data;

    switch (topic) {
      case "bundleFinishedLoading": {
        this.loading = false;
        NotificationCenter.emitEvent("RCTJavaScriptDidLoadNotification");
        if (this.bundleFinishedLoading) {
          this.bundleFinishedLoading();
        }
        break;
      }
      case "flushedQueue": {
        if (payload != null && Array.isArray(payload)) {
          const [moduleIds, methodIds, params] = payload;
          for (let i = 0; i < moduleIds.length; i++) {
            this.messages.push({
              moduleId: moduleIds[i],
              methodId: methodIds[i],
              args: params[i]
            });
          }
        }
        break;
      }
      case "updateProgress": {
        this.devLoadingView.updateProgress(payload);
        break;
      }
      default: {
        console.warn(`Unknown topic: ${topic}`);
      }
    }

    if (this.shouldContinue()) {
      this.uiManager.requestTick();
    }
  }

  initializeModules = async () => {
    this.moduleClasses = await Promise.all(this.nativeModules);

    // resolve default exports from es modules
    this.moduleClasses = this.moduleClasses.map((maybeModule) => {
      return (maybeModule: any).default != null
        ? (maybeModule: any).default
        : maybeModule;
    });

    this.moduleClasses.forEach((moduleClass: Class<RCTModule>) => {
      const module = new moduleClass(this);
      const moduleName = bridgeModuleNameForClass(moduleClass);
      this.modulesByName[moduleName] = module;
    });
  };

  generateModuleConfig(
    name: string,
    bridgeModule: RCTModule
  ): ModuleDescription {
    const moduleDescription = bridgeModule._describe();
    this.moduleConfigs.push(moduleDescription);
    return moduleDescription;
  }

  loadBridgeConfig() {
    const config = this.getInitialModuleConfig();
    this.sendMessage("loadBridgeConfig", {
      config,
      bundle: this.bundleLocation
    });
  }

  getInitialModuleConfig = () => {
    const remoteModuleConfig: ModuleDescription[] = [];

    for (let moduleName in this.modulesByName) {
      const bridgeModule = this.modulesByName[moduleName];
      const description = this.generateModuleConfig(moduleName, bridgeModule);
      remoteModuleConfig.push(description);
    }

    return { remoteModuleConfig };
  };

  modulesConformingToProtocol<T: Class<any>>(
    protocol: T
  ): $Call<ClassInstance, T>[] {
    return Object.values(this.modulesByName).filter((module) => {
      return module instanceof RCTModule && module instanceof protocol;
    });
  }

  enqueueJSCall(moduleName: string, methodName: string, args: Array<any>) {
    // console.log("Native -> JS", moduleName, methodName, args);
    this.sendMessage("callFunctionReturnFlushedQueue", [
      moduleName,
      methodName,
      args
    ]);
  }

  enqueueJSCallWithDotMethod(moduleDotMethod: string, args: Array<any>) {
    const [module, method] = moduleDotMethod.split(".");
    this.enqueueJSCall(module, method, args);
  }

  enqueueJSCallback(id: number, args: Array<any>) {
    // console.log("invokeCallback", id, args);
    this.sendMessage("invokeCallbackAndReturnFlushedQueue", [id, args]);
  }

  callbackFromId(id: number) {
    return (...args: Array<any>) => {
      this.enqueueJSCallback(id, args);
    };
  }

  getModuleByName<T>(name: string): T {
    const module: any = this.modulesByName[name];
    invariant(module, `No such module found with name '${name}'`);
    return module;
  }

  get uiManager(): RCTUIManager {
    if (!this._uiManager) {
      const uiManager: any = this.modulesByName["UIManager"];
      this._uiManager = uiManager;
    }
    return this._uiManager;
  }

  get devLoadingView(): RCTDevLoadingView {
    if (!this._devLoadingView) {
      const devLoadingView: any = this.modulesByName["DevLoadingView"];
      this._devLoadingView = devLoadingView;
    }
    return this._devLoadingView;
  }

  get eventDispatcher(): RCTEventDispatcher {
    if (!this._eventDispatcher) {
      const eventDispatcher: any = this.modulesByName["EventDispatcher"];
      this._eventDispatcher = eventDispatcher;
    }
    return this._eventDispatcher;
  }

  get imageLoader(): RCTImageLoader {
    if (!this._imageLoader) {
      const imageLoader: any = this.modulesByName["ImageLoader"];
      this._imageLoader = imageLoader;
    }
    return this._imageLoader;
  }

  get deviceInfo(): RCTDeviceInfo {
    if (!this._deviceInfo) {
      const deviceInfo: any = this.modulesByName["DeviceInfo"];
      this._deviceInfo = deviceInfo;
    }
    return this._deviceInfo;
  }

  get devSettings(): RCTDevSettings {
    if (!this._devSettings) {
      const devSettings: any = this.modulesByName["DevSettings"];
      this._devSettings = devSettings;
    }
    return this._devSettings;
  }

  get redBox(): RCTRedBox {
    if (!this._redBox) {
      const redBox: any = this.modulesByName["RedBox"];
      this._redBox = redBox;
    }
    return this._redBox;
  }

  get networking(): RCTNetworking {
    if (!this._networking) {
      const networking: any = this.modulesByName["Networking"];
      this._networking = networking;
    }
    return this._networking;
  }

  get blobManager(): RCTBlobManager {
    if (!this._blobManager) {
      const blobModule: any = this.modulesByName["BlobModule"];
      this._blobManager = blobModule;
    }
    return this._blobManager;
  }

  async frame() {
    this.sendMessage("flush");

    const messages = [...this.messages];
    this.messages = [];

    messages.forEach(({ moduleId, methodId, args }) => {
      this.callNativeModule(moduleId, methodId, args);
    });
  }

  shouldContinue(): boolean {
    return this.messages.length !== 0;
  }
}
