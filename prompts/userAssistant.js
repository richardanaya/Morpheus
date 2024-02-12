function escapeForJSONString(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function buildUserAssistantInput(userPremise, userInput, spans) {
  const premise = `This is a valid JSON representation of chat between the user representing the main character and various other characters. Be sure to escape special characters for JSON. The chat should not go beyond the element with property last_line=true or end with a user role message. The JSON role specifies the character talking, and content what they say. The text of the content should be markdown only and only use ASCII characters. The story premise is as follows: ${userPremise}`;
  let body = `USER: ${premise} ASSISTANT:[
    {
        "role": "user",
        "content": "${escapeForJSONString(userInput)}"
    }, {
        "last_line": true,
        "role": "`;

  if (spans.length > 0) {
    body = `USER: ${premise} ASSISTANT:[
    ${spans
      .map((_) => {
        return `{
        "role": "${escapeForJSONString(_.getAttribute("role"))}",
        "content": "${escapeForJSONString(_.innerText)}"
    }`;
      })
      .join(",")}, {
        "role": "user",
        "content": "${escapeForJSONString(userInput)}"
    }, {
        "last_line": true,
        "role": "`;
  }

  return body;
}

export function tryParseUserAssistant(text) {
  debugger;
  let parts = text.split("ASSISTANT:");
  if (parts.length < 2) {
    return;
  }
  const json = parts[1].trim();

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
    return;
  }

  return currentJSON;
}
