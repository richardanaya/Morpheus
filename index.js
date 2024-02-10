import { html, render } from "./lit.js";
var converter = new showdown.Converter();

let lastLength = 0;

function sanitize(str) {
  return DOMPurify.sanitize(str);
}

function md(md) {
  let domStr = sanitize(converter.makeHtml(md));
  //make DOM
  let dom = new DOMParser().parseFromString(domStr, "text/html");
  return dom.body.childNodes;
}

function deleteChatItem(e) {
  const p = e.target.parentElement;
  p.remove();
  lastLength = 0;
}

function prepareUserText(s) {
  return s.trim();
}

const output = document.getElementById("output");
const story = document.querySelector("input");
const textarea = document.querySelector("textarea");
const completeButton = document.getElementById("send");
const resetButton = document.getElementById("reset");

const reset = () => {
  render(
    html`<img
        src="./morpheus.png"
        style="width: 8rem; margin: 0 auto; display: block; box-shadow: none"
      />
      <title style="text-align: center; display: block">
        ＭＯＲＰＨＥＵＳ
      </title>`,
    output
  );
  story.value = "";
  textarea.value = "";
  // enable
  completeButton.disabled = false;
  textarea.disabled = false;
  lastLength = 0;
  story.focus();
};

function parseChatML(chatmlString) {
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

function createChat(text) {
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

  render(
    html`${currentJSON.map((line) => {
      let role = line.role || "...";
      if (role === "user") {
        role = "You";
      } else if (role === "assistant") {
        role = "Them";
      }
      if (role === undefined) {
        return "...";
      } else {
        return html`<div style="margin-top: 1rem">
          <b>${sanitize(role)}</b
          ><a href="#" style="float:right" @click="${deleteChatItem}">delete</a>
          <hr style="margin:0" />
          <span role="${sanitize(role)}">${md(line.content) || ""}</span><br />
        </div>`;
      }
    })}`,
    output
  );

  lastLength = text.length;
}

const startCompletion = async () => {
  completeButton.disabled = true;
  completeButton.style.backgroundColor = "#ccc";
  textarea.disabled = true;

  const spans = Array.from(output.querySelectorAll("span"));

  const premise = `${story.value}`;
  const userText = prepareUserText(textarea.value);
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

  try {
    const response = await fetch("/api/completion", {
      method: "POST",
      body,
    });

    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let firstChunk = true;
    let accumulatedChunks = "";
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      const chunks = decoder.decode(value, { stream: true });

      // Process each character in the chunk
      for (let chunk of chunks) {
        if (firstChunk) {
          firstChunk = false;
          textarea.value = "";
          textarea.disabled = false;
        }
        accumulatedChunks = accumulatedChunks + chunk;

        // make sure we never have more than 2 newlines in a row, if we do replace them with two newlines
        // use regex to replace all instances of 3 or more newlines with 2 newlines
        // this is a basic cleanup good for almost all use cases
        const regex = /(\n{3,})/g;
        createChat(accumulatedChunks.replace(regex, "\n\n").trimStart());
      }
    }
  } catch (e) {
  } finally {
    // scroll to bottom of page when completely done and un-disable entry
    window.scrollTo(0, document.body.scrollHeight);
    completeButton.disabled = false;
    completeButton.style.backgroundColor = "#fff";
    resetButton.style.display = "block";
  }
};

story.focus();
resetButton.addEventListener("pointerdown", reset);
reset();
textarea.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "Enter") {
    completeButton.dispatchEvent(new PointerEvent("pointerdown"));
  }
});
completeButton.addEventListener("pointerdown", startCompletion);
