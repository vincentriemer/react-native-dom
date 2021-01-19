/** @flow */

export default function bundleFromRoot(root: string): string {
  let path = location.pathname;
  if (!path.endsWith("/")) {
    // Trim filename
    path = path.substr(0, path.lastIndexOf("/"));
  } else {
    path = path.substr(0, path.length - 1);
  }
  return location.protocol + "//" + location.host + path + "/" + root;
}
