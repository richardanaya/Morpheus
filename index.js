import { html, render } from "./lit.js";
var converter = new showdown.Converter();
import { buildChatMLInput, tryParseChatML } from "./chatml.js";

let mode = "chatml";

// get query string for mode
const urlParams = new URLSearchParams(window.location.search);
const modeParam = urlParams.get("mode");

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

function createChat(text) {
  const currentJSON = tryParseChatML(text);

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

  const body = buildChatMLInput(story.value, textarea.value, spans);

  try {
    const response = await fetch("https://192.168.86.195:8080/api/completion", {
      method: "POST",
      body,
    });

    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let firstChunk = true;
    let accumulatedBytes = new Uint8Array();
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      const newBytes = new Uint8Array(accumulatedBytes.length + value.length);
      newBytes.set(accumulatedBytes);
      newBytes.set(value, accumulatedBytes.length);

      accumulatedBytes = newBytes;

      if (firstChunk) {
        firstChunk = false;
        textarea.value = "";
        textarea.disabled = false;
      }

      const text = decoder.decode(accumulatedBytes);
      // make sure we never have more than 2 newlines in a row, if we do replace them with two newlines
      // use regex to replace all instances of 3 or more newlines with 2 newlines
      // this is a basic cleanup good for almost all use cases
      const regex = /(\n{3,})/g;
      createChat(text.replace(regex, "\n\n").trimStart());
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
