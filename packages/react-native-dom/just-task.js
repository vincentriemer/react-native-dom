/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 * @ts-check
 */

const path = require('path');
const {
  task,
  series,
  condition,
  option,
  argv,
  eslintTask,
} = require('just-scripts');
const {execSync} = require('child_process');
const fs = require('fs');
const copyRNLibaries = require('./scripts/copyRNLibraries');

option('production');
option('clean');

task('flow-check', () => {
  require('child_process').execSync('npx flow check', {stdio: 'inherit'});
});

task('eslint', eslintTask());
task('eslint:fix', eslintTask({fix: true}));

task('copyRNLibraries', copyRNLibaries.copyTask(__dirname));

task('copyReadmeAndLicenseFromRoot', () => {
  fs.copyFileSync(
    path.resolve(__dirname, '../README.md'),
    path.resolve(__dirname, 'README.md'),
  );
  fs.copyFileSync(
    path.resolve(__dirname, '../LICENSE'),
    path.resolve(__dirname, 'LICENSE'),
  );
});

task('cleanRnLibraries', copyRNLibaries.cleanTask(__dirname));

task(
  'build',
  series(
    condition('clean', () => argv().clean),
    'copyRNLibraries'
  ),
);

task('clean', series('cleanRnLibraries'));

task('lint', series('eslint', 'flow-check'));
task('lint:fix', series('eslint:fix'));