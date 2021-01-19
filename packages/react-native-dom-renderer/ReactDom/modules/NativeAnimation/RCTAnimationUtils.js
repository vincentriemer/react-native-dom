/** @flow */

export const EXTRAPOLATE_TYPE_IDENTITY = "identity";
export const EXTRAPOLATE_TYPE_CLAMP = "clamp";
export const EXTRAPOLATE_TYPE_EXTEND = "extend";

function RCTFindIndexOfNearestValue(value: number, range: number[]) {
  let index;
  const rangeCount = range.length;
  for (index = 1; index < rangeCount - 1; index++) {
    const inputValue = range[index];
    if (inputValue >= value) {
      break;
    }
  }
  return index - 1;
}

export function RCTInterpolateValue(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  extrapolateLeft: string,
  extrapolateRight: string
) {
  if (value < inputMin) {
    if (extrapolateLeft === "identity") {
      return value;
    } else if (extrapolateLeft === "clamp") {
      value = inputMin;
    } else if (extrapolateLeft === "extend") {
      // noop
    } else {
      throw new Error(
        `Invalid extrapolation type ${extrapolateLeft} for left extrapolation`
      );
    }
  }

  if (value > inputMax) {
    if (extrapolateRight === "identity") {
      return value;
    } else if (extrapolateRight === "clamp") {
      value = inputMax;
    } else if (extrapolateRight === "extend") {
      // noop
    } else {
      throw new Error(
        `Invalid extrapolation type ${extrapolateRight} for right extrapolation`
      );
    }
  }

  return (
    outputMin +
    ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin)
  );
}

export function RCTInterpolateValueInRange(
  value: number,
  inputRange: number[],
  outputRange: number[],
  extrapolateLeft: string,
  extrapolateRight: string
) {
  const rangeIndex = RCTFindIndexOfNearestValue(value, inputRange);
  const inputMin = inputRange[rangeIndex];
  const inputMax = inputRange[rangeIndex + 1];
  const outputMin = outputRange[rangeIndex];
  const outputMax = outputRange[rangeIndex + 1];

  const output = RCTInterpolateValue(
    value,
    inputMin,
    inputMax,
    outputMin,
    outputMax,
    extrapolateLeft,
    extrapolateRight
  );

  return output;
}
