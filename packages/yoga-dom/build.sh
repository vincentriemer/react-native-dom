#!/usr/bin/env bash
set -e

OUTPUT_FILENAME="yoga.js"

# clean up build folder
rm -rf build && mkdir -p build

# compile to wasm
docker run --rm -v $(pwd):$(pwd) -w $(pwd) -u emscripten -t trzeci/emscripten:sdk-incoming-64bit emcc \
  yoga/*.cpp bindings/*.cc \
  --bind -Os --memory-init-file 0 --closure 1 --llvm-lto 1 \
  -s BINARYEN=1 \
  -s "BINARYEN_METHOD='native-wasm'" \
  -s EXPORTED_RUNTIME_METHODS=[] \
  -s DISABLE_EXCEPTION_CATCHING=1 \
  -s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s ASSERTIONS=0 \
  -s SINGLE_FILE=1 \
  -s NO_FILESYSTEM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s "DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=['memcpy','memset','malloc','free','strlen']" \
  -o build/$OUTPUT_FILENAME