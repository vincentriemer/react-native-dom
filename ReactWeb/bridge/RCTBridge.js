// @flow
import { moduleConfigFactory } from "./RCTModuleConfig";
import {
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync,
  RCTFunctionType,
} from "./RCTBridgeMethod";

export {
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync,
  RCTFunctionType,
};

export interface ModuleClass {
  static __moduleName: ?string,
  setBridge?: RCTBridge => void,
  constantsToExport?: () => { [string]: any },
  [string]: ?Function,
}

function getPropertyNames(obj: ?Object): Array<string> {
  if (obj == null) return [];

  const currentPropertyNames = Object.getOwnPropertyNames(obj);
  return currentPropertyNames.concat(
    getPropertyNames(Object.getPrototypeOf(obj))
  );
}

function generateModuleConfig(name: string, bridgeModule: ModuleClass) {
  const methodNames = [
    ...new Set(getPropertyNames(bridgeModule)),
  ].filter(methodName => methodName.startsWith("__rct_export__"));

  const constants = bridgeModule.constantsToExport
    ? bridgeModule.constantsToExport()
    : undefined;

  const allMethods = [];
  const promiseMethods = [];
  const syncMethods = [];

  methodNames.forEach(rctName => {
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
  static RCTModuleClasses: Array<Class<ModuleClass>> = [];

  static RCTRegisterModule = (cls: Class<ModuleClass>) => {
    RCTBridge.RCTModuleClasses.push(cls);
  };

  modulesByName: { [name: string]: ModuleClass } = {};

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

  onMessage({ data: { topic, payload } }) {
    console.log("Recieved message from worker thread:", topic, payload);
  }

  initializeModules = () => {
    RCTBridge.RCTModuleClasses.forEach((moduleClass: Class<ModuleClass>) => {
      const module = new moduleClass();

      if (module.setBridge != null) {
        module.setBridge(this);
      }

      const moduleName = moduleClass.__moduleName || "";
      this.modulesByName[moduleName] = module;
    });

    this.sendMessage("loadBridgeConfig", this.getInitialModuleConfig());
  };

  getInitialModuleConfig = () => {
    const remoteModuleConfig = Object.keys(
      this.modulesByName
    ).map(moduleName => {
      const bridgeModule = this.modulesByName[moduleName];
      return generateModuleConfig(moduleName, bridgeModule);
    });
    return { remoteModuleConfig };
  };

  enqueueJSCall = (
    moduleName: string,
    methodName: string,
    args: Array<any>
  ) => {
    this.sendMessage("callFunctionReturnFlushedQueue", [
      moduleName,
      methodName,
      args,
    ]);
  };
}

export function RCT_EXPORT_METHOD(type: RCTFunctionType) {
  return (target: any, key: any, descriptor: any) => {
    if (typeof descriptor.value === "function") {
      Object.defineProperty(
        target,
        // `__rct_export__${key}__${getNextModuleCounterValue()}`,
        `__rct_export__${key}`,
        {
          ...descriptor,
          value: () => [key, type],
        }
      );
    }

    return descriptor;
  };
}

export const RCT_EXPORT_MODULE = (target: Class<ModuleClass>) => {
  target.__moduleName = target.prototype.constructor.name;
  RCTBridge.RCTRegisterModule(target);
};
