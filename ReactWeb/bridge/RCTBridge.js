/**
 * @providesModule RCTBridge
 * @flow
 */
import invariant from "Invariant";
import { moduleConfigFactory } from "RCTModuleConfig";
import {
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync,
  RCTFunctionType,
} from "RCTBridgeMethod";

export {
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync,
  RCTFunctionType,
};

type MessagePayload = {
  data: {
    topic: string,
    payload: any,
  },
};

export interface ModuleClass {
  static __moduleName: ?string,
  setBridge?: RCTBridge => void,
  constantsToExport?: () => { [string]: any },
  [string]: ?Function,
}

export function getPropertyNames(obj: ?Object): Array<string> {
  if (obj == null) return [];

  const currentPropertyNames = Object.getOwnPropertyNames(obj);
  return currentPropertyNames.concat(
    getPropertyNames(Object.getPrototypeOf(obj))
  );
}

export function bridgeModuleNameForClass(cls: Class<ModuleClass>): string {
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
  moduleClasses: Array<Class<ModuleClass>> = [];
  bundleFinishedLoading: ?() => void;

  moduleForClass(cls: Class<ModuleClass>): ModuleClass {
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

  onMessage(message: any) {
    const { topic, payload } = message.data;
    // console.log("Recieved message from worker thread:", topic, payload);

    switch (topic) {
      case "bundleFinishedLoading": {
        if (this.bundleFinishedLoading) {
          this.bundleFinishedLoading();
        }
        break;
      }
      default: {
        console.log(`Unknown topic: ${topic}`);
      }
    }
  }

  initializeModules = () => {
    this.moduleClasses = [...RCTBridge.RCTModuleClasses];
    RCTBridge.RCTModuleClasses.forEach((moduleClass: Class<ModuleClass>) => {
      const module = new moduleClass();

      if (module.setBridge != null) {
        module.setBridge(this);
      }

      const moduleName = bridgeModuleNameForClass(moduleClass);
      this.modulesByName[moduleName] = module;
    });
  };

  loadBridgeConfig() {
    this.sendMessage("loadBridgeConfig", this.getInitialModuleConfig());
  }

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
