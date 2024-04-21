function prepareUserText(s) {
  return s.trim();
}

export function parseChatML(chatmlString) {
  const asLines = chatmlString.split("\n\r");
  if (asLines.length > 0 && asLines[0] === "system") {
    const roles = asLines.filter((_, i) => i % 2 === 0);
    const contents = asLines.filter((_, i) => i % 2 === 1);

    return roles.map((role, i) => {
      return {
        role,
        content: contents[i] || "",
      };
    });
  }

  // Regular expression with generic role capture
  const pattern =
    /<\|im_start\|>(?<role>.+?)\r\n(?<content>[\s\S]+?)<\|im_end\|>/gm;

  const conversation = [];

  let match;
  while ((match = pattern.exec(chatmlString)) !== null) {
    if (match.groups.role !== "system") {
      conversation.push({
        role: match.groups.role,
        content: match.groups.content,
      });
    }
  }

  return conversation;
}

export function tryParseChatML(text) {
  // try to finish the json first as is
  let currentJSON = parseChatML(text);
  // if last isn't assistant
  if (
    currentJSON.length > 0 &&
    currentJSON[currentJSON.length - 1].role !== "assistant"
  ) {
    currentJSON = parseChatML(text + `<|im_end|>`);
    if (currentJSON.length === 0) {
      return;
    }
  }
  return currentJSON;
}

export function buildChatMLInput(userPremise, userInput, spans) {
  const premise = `${userPremise}`;
  const userText = prepareUserText(userInput);
  let body = `<|im_start|>system
  ${premise}<|im_end|>${
    userText !== ""
      ? `
  <|im_start|>user
  ${userText}<|im_end|>`
      : ""
  }
  <|im_start|>assistant
  `;

  if (spans.length > 0) {
    body = `<|im_start|>system
  ${premise}<|im_end|>
  ${spans
    .map((_) => {
      return `<|im_start|>${prepareUserText(_.getAttribute("role"))}
  ${prepareUserText(_.innerText)}<|im_end|>`;
    })
    .join("")}${
      userText !== ""
        ? `
  <|im_start|>user
  ${userText}<|im_end|>`
        : ""
    }
  <|im_start|>assistant
  `;
  }

  // make sure all lines don't have any empty space at beginning without regex
  body = body
    .split("\n")
    .map((_) => _.trim())
    .join("\n");

  return body;
}
