const path = require("path");
const fs = require("fs");
const glob = require("glob");

const { RN_MAIN_PJSON_NAME } = require("../../constants");

module.exports = function getDomRequirePath(folder) {
  const packageName = path.basename(folder);

  const pJsons = glob.sync(path.join("**", "package.json"), {
    cwd: folder,
    ignore: ["node_modules/**", "ios/**", "android/**"]
  });

  for (pJsonPath of pJsons) {
    const fullPath = path.join(folder, pJsonPath);
    const pJson = JSON.parse(fs.readFileSync(fullPath, "utf8"));

    if (pJson.hasOwnProperty(RN_MAIN_PJSON_NAME)) {
      return path.join(packageName, path.dirname(pJsonPath));
    }
  }

  const defaultDomLocation = path.join(packageName, "dom");

  try {
    require.resolve(defaultDomLocation);
    return defaultDomLocation;
  } catch (err) {
    /* NO OP */
  }

  return null;
};
