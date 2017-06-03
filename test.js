import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
} from "./src/bridge/RCTBridge";

// Bridged module definition
@RCT_EXPORT_MODULE class TestModule {
  @RCT_EXPORT_METHOD testFunction(foo) {
    return foo;
  }
}

// injected module name
console.log(TestModule.__moduleName);

// automatically stored in RCTBridge
const bridge = new RCTBridge();
bridge.initializeModules();
const bridgeModule = bridge.modulesByName["TestModule"];

// exported method definition added to module prototype
console.log(
  Object.getOwnPropertyNames.call(
    undefined,
    Object.getPrototypeOf(bridgeModule)
  )
);

// method defition returns name and argument length
console.log(bridgeModule["__rct_export__testFunction"]());
