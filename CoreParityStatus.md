# Components

| Name                 | Prop/Method              | Status | Notes                                                                |
| -------------------- | ------------------------ | ------ | -------------------------------------------------------------------- |
| ActivityIndicator    |                          | ✅     |                                                                      |
|                      | `animating`              | ✅     |                                                                      |
|                      | `color`                  | ✅     |                                                                      |
|                      | `size`                   | ✅     |                                                                      |
|                      | `hidesWhenStopped`       | ✅     |                                                                      |
| Button               |                          | ⚠️     |                                                                      |
|                      | `onPress`                | ✅     |                                                                      |
|                      | `title`                  | ✅     |                                                                      |
|                      | `accessibilityLabel`     | ❌     | Requires accessibility plan                                          |
|                      | `color`                  | ✅     |                                                                      |
|                      | `disabled`               | ✅     |                                                                      |
|                      | `hasTVPreferredFocus`    | 🚫     | TVOS only                                                            |
| DatePickerIOS        |                          | 🚫     | iOS only                                                             |
| DrawerLayoutAndroid  |                          | 🚫     | Android only                                                         |
| FlatList             |                          | ⚠️     | JS-only component so no direct native implementation required, buggy |
| Image                |                          | ⚠️     |                                                                      |
|                      | `style.tintColor`        | ✅     |                                                                      |
|                      | `style.overlayColor`     | 🚫     | Android only                                                         |
|                      | `style.resizeMode`       | ✅     |                                                                      |
|                      | `blurRadius`             | ✅     |                                                                      |
|                      | `onLayout`               | ✅     |                                                                      |
|                      | `onLoad`                 | ✅     |                                                                      |
|                      | `onLoadEnd`              | ✅     |                                                                      |
|                      | `onLoadStart`            | ✅     |                                                                      |
|                      | `resizeMode`             | ✅     |                                                                      |
|                      | `source`                 | ✅     |                                                                      |
|                      | `loadingIndicatorSource` | ❌     |                                                                      |
|                      | `onError`                | ⚠️     | Buggy                                                                |
|                      | `resizeMethod`           | 🚫     | Android only                                                         |
|                      | `accessibilityLabel`     | ❌     | Requires accessibility plan                                          |
|                      | `accessible`             | ❌     | Requires accessibility plan                                          |
|                      | `defaultSource`          | 🚫     | iOS only                                                             |
|                      | `onPartialLoad`          | 🚫     | iOS only                                                             |
|                      | `onProgress`             | 🚫     | iOS only                                                             |
|                      | `fadeDuration`           | 🚫     | Android only                                                         |
|                      | `getSize()`              | ✅     |                                                                      |
|                      | `prefetch()`             | ✅     |                                                                      |
|                      | `abortPrefetch()`        | 🚫     | Android only                                                         |
|                      | `queryCache()`           | ❌     |                                                                      |
|                      | `resolveAssetSource()`   | ✅     |                                                                      |
| InputAccessoryView   |                          | 🚫     | iOS only                                                             |
| KeyboardAvoidingView |                          | ❌     | Not really possible with current DOM APIs                            |
| ListView             |                          | ✅     | JS-only component                                                    |
| MaskedViewIOS        |                          | 🚫     | iOS only                                                             |
| Modal                |                          | ❌     |                                                                      |
| NavigatorIOS         |                          | 🚫     | iOS only                                                             |
| Picker               |                          | ❌     | WIP PR: #46                                                          |
|                      | onValueChange            | ❌     |                                                                      |
|                      | enabled                  | ❌     |                                                                      |
|                      | mode                     | 🚫     | Android only                                                         |
|                      | prompt                   | 🚫     | Android only                                                         |
|                      | itemStyle                | 🚫     | iOS only                                                             |
| PickerIOS            |                          | 🚫     | iOS only                                                             |
| ProgressBarAndroid   |                          | 🚫     | Android only                                                         |
| ProgressViewIOS      |                          | 🚫     | iOS only                                                             |
| RefreshControl       |                          | ❌     |                                                                      |
| SafeAreaView         |                          | ⚠️     | Currently shimmed to `View`                                          |
| ScrollView           |                          | ⚠️     |                                                                      |
