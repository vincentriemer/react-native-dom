import * as findUp from 'find-up';
import * as fs from 'fs';
import { userError } from './userError';

export const getReactNativeProjectName = () => {
  console.log('Reading project name from package.json...');
  const cwd = process.cwd();
  const pkgJsonPath = findUp.sync('package.json', {cwd});
  if (!pkgJsonPath) {
    userError(
      'Unable to find package.json.  This should be run from within an existing react-native project.',
      'NO_PACKAGE_JSON',
    );
  }
  let name = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).name;
  if (!name) {
    const appJsonPath = findUp.sync('app.json', {cwd});
    if (appJsonPath) {
      console.log('Reading project name from app.json...');
      name = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')).name;
    }
  }
  if (!name) {
    console.error('Please specify name in package.json or app.json');
  }
  return name;
}