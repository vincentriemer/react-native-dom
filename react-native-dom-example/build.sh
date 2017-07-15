#!/usr/bin/env bash

../node_modules/.bin/react-native bundle \
  --config ../../../../Examples/LayoutAnimations/layout-animations.config.js \
  --entry-file ./Examples/LayoutAnimations/web/client.js \
  --bundle-output client.js \
  --platform web \
  --reset-cache

../node_modules/.bin/react-native bundle \
  --config ../../../../Examples/LayoutAnimations/layout-animations.config.js \
  --entry-file ./Examples/LayoutAnimations/index.web.js \
  --bundle-output index.web.js \
  --platform web \
  --reset-cache

now