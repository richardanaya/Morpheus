import { html, render } from "./lit.js";
var converter = new showdown.Converter();

function sanitize(str) {
  return DOMPurify.sanitize(str);
}

function md(md) {
  let domStr = sanitize(converter.makeHtml(md));
  //make DOM
  let dom = new DOMParser().parseFromString(domStr, "text/html");
  return dom.body.childNodes;
}

function escapeForJSONString(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

const output = document.getElementById("output");
const story = document.querySelector("input");
const textarea = document.querySelector("textarea");
const completeButton = document.getElementById("send");
const resetButton = document.getElementById("reset");

let lastLength = 0;

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

function createChat(text) {
  if (text.length <= lastLength) {
    return;
  }
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

  render(
    html`${currentJSON.map((line) => {
      let role = line.role || "...";
      if (role === "user") {
        role = "You";
      }
      if (role === undefined) {
        return "...";
      } else {
        return html`<div style="margin-top: 1rem">
          <b>${sanitize(role)}</b
          ><a
            href="#"
            style="float:right"
            onclick="this.parentElement.remove();"
            >delete</a
          >
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

  const premise = `This is a valid JSON representation of chat between the user representing the main character and various other characters. Be sure to escape special characters for JSON. The chat should not go beyond the element with property last_line=true or end with a user role message. The JSON role specifies the character talking, and content what they say. The text of the content should be markdown only and only use ASCII characters. The story premise is as follows: ${story.value}`;
  let body = `USER: ${premise}
  
      ASSISTANT:[
          {
              "role": "user",
              "content": "${escapeForJSONString(textarea.value)}"
          }, {
              "last_line": true,
              "role": "`;

  if (spans.length > 0) {
    body = `USER: ${premise}
      ASSISTANT:[
          ${spans
            .map((_) => {
              return `{
              "role": "${escapeForJSONString(_.getAttribute("role"))}",
              "content": "${escapeForJSONString(_.innerText)}"
          }`;
            })
            .join(",")}, {
              "role": "user",
              "content": "${escapeForJSONString(textarea.value)}"
          }, {
              "last_line": true,
              "role": "`;
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
