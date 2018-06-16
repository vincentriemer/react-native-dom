// @flow

/**
 * Utility function to ensure that object properties are copied by value, and not by reference
 * @private
 * @param {Object} target Target object to copy properties into
 * @param {Object} source Source object for the properties to copy
 * @param {string} propertyObj Object containing properties names we want to loop over
 */
export function deepCopyProperties<T: Object, R: Object>(
  target: T,
  source: R,
  propertyObj: R
) {
  for (const prop in propertyObj) {
    if (Array.isArray(source[prop])) {
      target[prop] = source[prop].slice();
    } else {
      target[prop] = source[prop];
    }
  }
}
