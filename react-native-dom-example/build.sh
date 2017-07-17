#!/usr/bin/env bash

../node_modules/.bin/react-native bundle \
  --config ../../../../Examples/TransformLayoutAnimations/rn-cli.config.js \
  --entry-file ./Examples/TransformLayoutAnimations/web/client.js \
  --bundle-output client.js \
  --platform web \
  --reset-cache

../node_modules/.bin/react-native bundle \
  --config ../../../../Examples/TransformLayoutAnimations/rn-cli.config.js \
  --entry-file ./Examples/TransformLayoutAnimations/index.web.js \
  --bundle-output index.web.js \
  --platform web \
  --reset-cache

now

# now alias react-native-dom-example-hfqmncxtui.now.sh layout-animation-example