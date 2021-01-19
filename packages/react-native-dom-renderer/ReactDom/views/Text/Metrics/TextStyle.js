// @flow

/*
The MIT License

Copyright (c) 2013-2017 Mathew Groves, Chad Engler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { deepCopyProperties } from "./deepCopyProperties";

type TextStyleObj = {
  breakWords: boolean,
  fontFamily: string,
  fontSize: number,
  fontStyle: string,
  fontVariant: string,
  fontWeight: string,
  lineHeight: number,
  letterSpacing: number,
  whiteSpace: string,
  wordWrap: boolean,
  wordWrapWidth: number
};

export class TextStyle {
  static DefaultTextStyle: TextStyleObj;

  styleID: number;

  constructor(style: Object) {
    this.styleID = 0;

    this.reset();

    deepCopyProperties(this, style, style);
  }

  reset() {
    deepCopyProperties(
      this,
      TextStyle.DefaultTextStyle,
      TextStyle.DefaultTextStyle
    );
  }

  _breakWords: boolean;

  get breakWords() {
    return this._breakWords || TextStyle.DefaultTextStyle.breakWords;
  }

  set breakWords(breakWords: boolean) {
    if (this._breakWords !== breakWords) {
      this._breakWords = breakWords;
      this.styleID++;
    }
  }

  _fontFamily: string;

  get fontFamily() {
    return this._fontFamily || TextStyle.DefaultTextStyle.fontFamily;
  }

  set fontFamily(fontFamily: string) {
    if (this._fontFamily !== fontFamily) {
      this._fontFamily = fontFamily;
      this.styleID++;
    }
  }

  _fontSize: number;

  get fontSize() {
    return this._fontSize || TextStyle.DefaultTextStyle.fontSize;
  }

  set fontSize(fontSize: number) {
    if (this._fontSize !== fontSize) {
      this._fontSize = fontSize;
      this.styleID++;
    }
  }

  _fontStyle: string;

  get fontStyle() {
    return this._fontStyle || TextStyle.DefaultTextStyle.fontStyle;
  }

  set fontStyle(fontStyle: string) {
    if (this._fontStyle !== fontStyle) {
      this._fontStyle = fontStyle;
      this.styleID++;
    }
  }

  _fontVariant: string;

  get fontVariant() {
    return this._fontVariant || TextStyle.DefaultTextStyle.fontVariant;
  }

  set fontVariant(fontVariant: string) {
    if (this._fontVariant !== fontVariant) {
      this._fontVariant = fontVariant;
      this.styleID++;
    }
  }

  _fontWeight: string;

  get fontWeight() {
    return this._fontWeight || TextStyle.DefaultTextStyle.fontWeight;
  }

  set fontWeight(fontWeight: string) {
    if (this._fontWeight !== fontWeight) {
      this._fontWeight = fontWeight;
      this.styleID++;
    }
  }

  _letterSpacing: number;

  get letterSpacing() {
    return this._letterSpacing || TextStyle.DefaultTextStyle.letterSpacing;
  }

  set letterSpacing(letterSpacing: number) {
    if (this._letterSpacing !== letterSpacing) {
      this._letterSpacing = letterSpacing;
      this.styleID++;
    }
  }

  _lineHeight: number;

  get lineHeight() {
    return this._lineHeight === -1
      ? Math.ceil(this.fontSize * 1.2)
      : this._lineHeight;
  }

  set lineHeight(lineHeight: number) {
    if (this._lineHeight !== lineHeight) {
      this._lineHeight = lineHeight;
    }
  }

  _whiteSpace: string;

  get whiteSpace() {
    return this._whiteSpace || TextStyle.DefaultTextStyle.whiteSpace;
  }

  set whiteSpace(whiteSpace: string) {
    if (this._whiteSpace !== whiteSpace) {
      this._whiteSpace = whiteSpace;
      this.styleID++;
    }
  }

  _wordWrap: boolean;

  get wordWrap() {
    return this._wordWrap || TextStyle.DefaultTextStyle.wordWrap;
  }

  set wordWrap(wordWrap: boolean) {
    if (this._wordWrap !== wordWrap) {
      this._wordWrap = wordWrap;
      this.styleID++;
    }
  }

  _wordWrapWidth: number;

  get wordWrapWidth() {
    return this._wordWrapWidth || TextStyle.DefaultTextStyle.wordWrapWidth;
  }

  set wordWrapWidth(wordWrapWidth: number) {
    if (this._wordWrapWidth !== wordWrapWidth) {
      this._wordWrapWidth = wordWrapWidth;
      this.styleID++;
    }
  }

  toFontString() {
    const fontSizeString = `${this.fontSize}px`;

    // Clean-up fontFamily property by quoting each font name
    // this will support font names with spaces
    let fontFamilies = this.fontFamily.split(",");

    for (let i = fontFamilies.length - 1; i >= 0; i--) {
      // Trim any extra whitespace
      let fontFamily = fontFamilies[i].trim();

      // Check if font already contains strings
      if (!/([\"\'])[^\'\"]+\1/.test(fontFamily)) {
        fontFamily = `"${fontFamily}"`;
      }
      fontFamilies[i] = fontFamily;
    }

    return `${this.fontStyle} ${this.fontVariant} ${
      this.fontWeight
    } ${fontSizeString} ${fontFamilies.join(",")}`;
  }
}
