/**
 * @providesModule RCTBridge
 * @flow
 */
import invariant from "Invariant";
import Yoga, * as YG from "yoga-dom";
import { moduleConfigFactory } from "RCTModuleConfig";
import NotificationCenter from "NotificationCenter";
import {
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync
} from "RCTBridgeMethod";
import type { ModuleConfig } from "RCTModuleConfig";
import type { RCTFunctionType } from "RCTBridgeMethod";
import type RCTEventDispatcher from "RCTEventDispatcher";
import type RCTImageLoader from "RCTImageLoader";
import type RCTDeviceInfo from "RCTDeviceInfo";
import type RCTDevLoadingView from "RCTDevLoadingView";
import type RCTDevSettings from "RCTDevSettings";

import typeof _RCTUIManager from "RCTUIManager";
type RCTUIManager = $Call<$await<_RCTUIManager>>;

export { RCTFunctionTypeNormal, RCTFunctionTypePromise, RCTFunctionTypeSync };
export type { RCTFunctionType };

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
          "Please note that at this time, React VR is only compatible with the " +
          "standalone React Native Inspector that ships with Nuclide."
      );
    }
  }
} else {
  WORKER_SRC = "__DEV__ = false;\n" + WORKER_SRC;
}

export interface RCTModuleClass {
  constructor(bridge: RCTBridge): RCTModule;
  constantsToExport?: () => { [string]: any };
  [propName: string]: any;
}

export type RCTModuleStatics = {
  __moduleName: ?string
};

export type RCTModule = RCTModuleClass & RCTModuleStatics;

export function getPropertyNames(obj: ?Object): Array<string> {
  if (obj == null) return [];

  const currentPropertyNames = Object.getOwnPropertyNames(obj);
  return currentPropertyNames.concat(
    getPropertyNames(Object.getPrototypeOf(obj))
  );
}

export function bridgeModuleNameForClass(cls: RCTModuleStatics): string {
  let name = cls.__moduleName;

  if (name != null) {
    if (name.startsWith("RK")) {
      name = name.substring(2);
    } else if (name.startsWith("RCT")) {
      name = name.substring(3);
    }
    return name;
  }

  return "";
}

function generateModuleConfig(name: string, bridgeModule: RCTModule) {
  const methodNames = [...new Set(getPropertyNames(bridgeModule))].filter(
    (methodName) => methodName.startsWith("__rct_export__")
  );

  const constants = bridgeModule.constantsToExport
    ? bridgeModule.constantsToExport()
    : undefined;

  const allMethods = [];
  const promiseMethods = [];
  const syncMethods = [];

  methodNames.forEach((rctName) => {
    if (bridgeModule[rctName]) {
      const [methodName, methodType] = bridgeModule[rctName].call(bridgeModule);
      allMethods.push(methodName);

      if (methodType === RCTFunctionTypePromise) {
        promiseMethods.push(allMethods.length - 1);
      }

      if (methodType === RCTFunctionTypeSync) {
        syncMethods.push(allMethods.length - 1);
      }
    }
  });

  return [name, constants, allMethods, promiseMethods, syncMethods];
}

export default class RCTBridge {
  nativeModules: Array<Promise<Class<RCTModule>> | Class<RCTModule>>;

  modulesByName: { [name: string]: RCTModule } = {};
  moduleClasses: Array<Class<RCTModule>> = [];
  moduleConfigs: Array<ModuleConfig> = [];
  bundleFinishedLoading: ?() => void;
  messages: Array<NativeCall> = [];
  moduleName: string;
  bundleLocation: string;
  loading: boolean;

  _uiManager: ?RCTUIManager;
  _eventDispatcher: ?RCTEventDispatcher;
  _imageLoader: ?RCTImageLoader;
  _deviceInfo: ?RCTDeviceInfo;
  _devLoadingView: ?RCTDevLoadingView;
  _devSettings: ?RCTDevSettings;

  constructor(
    moduleName: string,
    bundle: string,
    nativeModules: Array<Promise<Class<RCTModule>> | Class<RCTModule>>
  ) {
    this.loading = true;
    this.moduleName = moduleName;
    this.bundleLocation = bundle;
    this.nativeModules = nativeModules;

    const bridgeCodeBlob = new Blob([WORKER_SRC]);
    const worker = new Worker(URL.createObjectURL(bridgeCodeBlob));
    this.setThread(worker);
  }

  moduleForClass(cls: RCTModuleStatics): RCTModule {
    invariant(cls.__moduleName, "Class does not seem to be exported");
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
    const [name, , functions] = moduleConfig;

    invariant(functions, `Module ${name} has no methods to call`);
    const functionName = functions[methodId];

    invariant(
      functionName,
      `No such function in module ${name} with id ${methodId}`
    );
    const nativeModule = this.modulesByName[name];

    invariant(nativeModule, `No such module with name ${name}`);
    invariant(
      nativeModule[functionName],
      `No such method ${functionName} on module ${name}`
    );

    // console.log("JS -> Native", name, functionName, params);

    nativeModule[functionName].apply(nativeModule, params);
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
      return maybeModule.__esModule ? (maybeModule: any).default : maybeModule;
    });

    this.moduleClasses.forEach((moduleClass: Class<RCTModule>) => {
      const module = new moduleClass(this);
      const moduleName = bridgeModuleNameForClass(moduleClass);
      this.modulesByName[moduleName] = module;
    });
  };

  generateModuleConfig(name: string, bridgeModule: RCTModule) {
    const methodNames = [...new Set(getPropertyNames(bridgeModule))].filter(
      (methodName) => methodName.startsWith("__rct_export__")
    );

    const constants = bridgeModule.constantsToExport
      ? bridgeModule.constantsToExport()
      : undefined;

    const allMethods = [];
    const promiseMethods = [];
    const syncMethods = [];

    methodNames.forEach((rctName) => {
      if (bridgeModule[rctName]) {
        const [methodName, methodType] = bridgeModule[rctName].call(
          bridgeModule
        );
        allMethods.push(methodName);

        if (methodType === RCTFunctionTypePromise) {
          promiseMethods.push(allMethods.length - 1);
        }

        if (methodType === RCTFunctionTypeSync) {
          syncMethods.push(allMethods.length - 1);
        }
      }
    });
    this.moduleConfigs.push(
      moduleConfigFactory(
        name,
        constants,
        allMethods,
        promiseMethods,
        syncMethods
      )
    );
    return [name, constants, allMethods, promiseMethods, syncMethods];
  }

  loadBridgeConfig() {
    const config = this.getInitialModuleConfig();
    this.sendMessage("loadBridgeConfig", {
      config,
      bundle: this.bundleLocation
    });
  }

  getInitialModuleConfig = () => {
    const remoteModuleConfig = Object.keys(this.modulesByName).map(
      (moduleName) => {
        const bridgeModule = this.modulesByName[moduleName];
        return this.generateModuleConfig(moduleName, bridgeModule);
      }
    );
    return { remoteModuleConfig };
  };

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

export function RCT_EXPORT_METHOD(type: RCTFunctionType) {
  return (target: any, key: any, descriptor: any) => {
    if (typeof descriptor.value === "function") {
      Object.defineProperty(target, `__rct_export__${key}`, {
        ...descriptor,
        value: () => [key, type]
      });
    }

    return descriptor;
  };
}

export const RCT_EXPORT_MODULE = (name: string) => (
  target: RCTModuleStatics
) => {
  target.__moduleName = name;
};
