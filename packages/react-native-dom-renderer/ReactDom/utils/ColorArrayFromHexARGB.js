/** @flow */

export default function(hex: number) {
  hex = Math.floor(hex);
  return [
    ((hex >> 24) & 255) / 255, // a
    (hex >> 16) & 255, // r
    (hex >> 8) & 255, // g
    hex & 255 //b
  ];
}
