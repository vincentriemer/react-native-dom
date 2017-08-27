function splitNewlines(input) {
  return input.reduce(
    (result, currentText) => {
      const lastLineIndex = result.length - 1;

      const splitLines = currentText.text.split(/\n/g);

      if (splitLines.length === 1) {
        // No newlines in string so just append to previous line
        result[lastLineIndex].push(currentText);
      } else {
        // Append first text to the previous line
        const prevLineEnd = splitLines.shift();
        result[lastLineIndex].push({
          ...currentText,
          text: prevLineEnd
        });

        // Create new lines for each subsequent text instance that was split
        splitLines.forEach(splitLine => {
          result.push([
            {
              ...currentText,
              text: splitLine
            }
          ]);
        });
      }

      return result;
    },
    [[]]
  );
}

function textLinesToString(lines) {
  return lines.map(line => line.map(text => text.text).join("")).join("\n");
}

const input = [
  {
    reactId: 1,
    style: {},
    text: "This is neat \nThis is \nalso neat."
  },
  {
    reactId: 2,
    style: {},
    text: " This doesn't have a newline"
  },
  {
    reactId: 3,
    style: {},
    text: "\nThis has a newline at beginning."
  },
  {
    reactId: 4,
    style: {},
    text: " This has a newline at end\n"
  },
  {
    reactId: 5,
    style: {},
    text: "Finally, \nthis has a newline in the middle"
  }
];

const result = splitNewlines(input);
console.log("Number of newlines:", result.length);
console.log(textLinesToString(result));
