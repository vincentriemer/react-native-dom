// Interfaces
interface RawText {
  reactId: number,
  text: string
}

interface Text {
  reactId: number,
  textChildren: Array<Text | RawText>,

  // Style Props
  fontFamily: string,
  fontSize: number,
  fontStyle: string,
  fontWeight: string,
  lineHeight: number,

  // Text Attributes
  numberOfLines: number,
  ellipsizeMode: "head" | "middle" | "tail" | "clip"
}

type TextResult = {
  reactId: number,
  style: {
    color: string,
    fontFamily: string,
    fontSize: number,
    fontStyle: string,
    fontWeight: string,
    lineHeight: number
  },
  text: string
};

// Algorithm

function flattenText(parentStyle) {
  return (textRoot: Text | RawText) => {
    if (textRoot instanceof RawText) {
      return [
        { reactId: textRoot.reactId, style: parentStyle, text: textRoot.text }
      ];
    } else {
      // merge style with parentStyle
      const mergedStyle = {
        ...parentStyle,
        ...textRoot.style
      };

      return textRoot.textChildren.map(flattenText(mergedStyle));
    }
  };
}

function splitNewlines(input: TextResult[]): TextResult[][] {
  return input.reduce((prevResult, currentText) => {
    const splitLines = currentText.text.match(/\n/g);

    return prevResult.concat(
      splitLines.map(text => ({
        ...currentText,
        text
      }))
    );
  }, []);
}

// taken from https://stackoverflow.com/a/36508315
function splitWord(str: string) {
  return str.match(/\b(\w+\W+)/g);
}

// define MEASURE_MODE_EXACTLY
// define MEASURE_MODE_UNDEFINED

function measure(width, widthMode, height, heightMode) {
  let widthResult;
  let heightResult;

  //
}
