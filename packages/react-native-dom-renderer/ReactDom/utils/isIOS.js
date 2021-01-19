/** @flow */

const isIOS =
  !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

export default isIOS;
