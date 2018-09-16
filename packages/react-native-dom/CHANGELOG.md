# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.4.1"></a>
## [0.4.1](https://github.com/vincentriemer/react-native-dom/compare/v0.4.0...v0.4.1) (2018-09-16)


### Bug Fixes

* **RCTBlobManager:** Fix Blob's native module name ([171d9c4](https://github.com/vincentriemer/react-native-dom/commit/171d9c4))
* **TextMetrics:** Remove unecessary trimming from fast text measurement ([fd816e5](https://github.com/vincentriemer/react-native-dom/commit/fd816e5))




<a name="0.4.0"></a>
# [0.4.0](https://github.com/vincentriemer/react-native-dom/compare/v0.3.0...v0.4.0) (2018-09-15)


### Bug Fixes

* **LayoutAnimation:** Fix layout animations with heirarchy optimizer ([8a158af](https://github.com/vincentriemer/react-native-dom/commit/8a158af))
* **RCTScrollView:** move scrolling logic back to host element ([d629031](https://github.com/vincentriemer/react-native-dom/commit/d629031))


### Features

* **RCTNativeViewHierarchyOptimizer:** Enable hierarchy optimization ([5038e70](https://github.com/vincentriemer/react-native-dom/commit/5038e70))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/vincentriemer/react-native-dom/compare/v0.2.0...v0.3.0) (2018-09-13)


### Bug Fixes

* **generator:** Fix default body style to fix rendering in Firefox ([87fd468](https://github.com/vincentriemer/react-native-dom/commit/87fd468))
* More attempts to work around iOS's draconian insistance that the documentElement should be scro ([391d50f](https://github.com/vincentriemer/react-native-dom/commit/391d50f))


### Features

* **RCTUIManager:** Add rootTagForReactTag method to UIManager ([1ceea98](https://github.com/vincentriemer/react-native-dom/commit/1ceea98))
* **yoga-dom:** Update yoga-dom to v0.0.12 ([9093ff7](https://github.com/vincentriemer/react-native-dom/commit/9093ff7))
* Add support for RN 0.57 ([#73](https://github.com/vincentriemer/react-native-dom/issues/73)) ([313b00e](https://github.com/vincentriemer/react-native-dom/commit/313b00e))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/vincentriemer/react-native-dom/compare/v0.1.2...v0.2.0) (2018-06-03)


### Bug Fixes

* **flow:** Fix flow errors ([0304c11](https://github.com/vincentriemer/react-native-dom/commit/0304c11))
* **RCTBridge:** Silence bundle progress parse errors ([62ddca5](https://github.com/vincentriemer/react-native-dom/commit/62ddca5))
* **RCTPropsAnimatedNode:** Fix iteration over prop config ([cdabeb5](https://github.com/vincentriemer/react-native-dom/commit/cdabeb5))


### Features

* **AsyncLocalStorage:** Add clear method to native AsyncLocalStorage ([6e72487](https://github.com/vincentriemer/react-native-dom/commit/6e72487))
* **RCTImage:** Add Image resizeMode=repeat ([3d441ca](https://github.com/vincentriemer/react-native-dom/commit/3d441ca))
* **RCTRootView:** Begin work on decoupling the root view from the document's body ([79a02bc](https://github.com/vincentriemer/react-native-dom/commit/79a02bc))
* **RCTVibration:** Add Vibration API ([9277d56](https://github.com/vincentriemer/react-native-dom/commit/9277d56))
