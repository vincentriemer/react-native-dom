import * as path from "path";

import * as fse from "fs-extra";

import * as fs from 'fs';

import runDom from './runDom/runDom';

import buildDom from './buildDom/buildDom';

export function generateDom(projectDir, name) {

  const templatePath = path.dirname(
    require.resolve("react-native-dom/package.json", {
      paths: [projectDir]
    })
  );

  fse.copySync(`${templatePath}\\dom`, `${projectDir}\\dom`);
  fs.copyFileSync(`${templatePath}/dom/_npmrc`, `${projectDir}/.npmrc`)
}

export const commands = [runDom, buildDom];
// export const dependencyConfig = dependencyConfigDom;
// export const projectConfig = projectConfigDom;

