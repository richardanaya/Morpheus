function escapeForJSONString(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function buildMistralInput(userPremise, userInput, spans) {

  const nextCount = spans.length + 2;
  const premise = `This is a valid JSON representation of chat between the user representing the main character and various other characters. Be sure to escape special characters for JSON. The chat should not go beyond the json object with property last_line=true, there should only be ${nextCount} items in the JSON chat array. The JSON role specifies the character talking, and content what they say. The text of the content should be markdown only and only use ASCII characters. The story premise is as follows: ${userPremise}`;
  let body = `<s>[INST] ${premise} [/INST][{"role": "user","content": "${escapeForJSONString(userInput)}"},{"last_line": true,"role": "`;

  if (spans.length > 0) {
    body = `<s>[INST] ${premise} [/INST][${spans
      .map((_) => {
        return `{"role": "${escapeForJSONString(_.getAttribute("role"))}","content": "${escapeForJSONString(_.innerText)}"}`;
      })
      .join(",")}, {"role":"user","content": "${escapeForJSONString(userInput)}"},{"last_line": true,"role": "`;
  }

  return body;
}

export function tryParseMistral(text) {
  let parts = text.split("[/INST]");
  if (parts.length < 2) {
    return;
  }
  let json = parts[1].trim();

  if (json.endsWith(`</s>`)) {
    json = json.slice(0, -4);
  }

  // try to finish the json first as is
  let currentJSON = undefined;
  try {
    currentJSON = JSON.parse(json);
  } catch (e) {
    try {
      currentJSON = JSON.parse(json + `"}]`);
    } catch (e) {
      try {
        currentJSON = JSON.parse(json + `}]`);
      } catch (e) {
        // console.log("Couldn't complete \n\n" + e + "\n\n" + json);
      }
    }
  }

  if (!currentJSON) {
    return ;
  }

  return currentJSON;
}
