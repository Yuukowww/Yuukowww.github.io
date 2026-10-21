"use strict";

const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const pug = require("pug");
const { JSDOM } = require("jsdom");
const { normalizeTracks } = require("../scripts/generators/audio");

async function main() {
  assert.deepEqual(normalizeTracks([]), []);
  assert.throws(() => normalizeTracks({}), /列表/);
  for (const src of ["javascript:alert(1)", "//example.com/music.mp3", "missing.mp3"]) {
    assert.throws(() => normalizeTracks([{ title: "曲名", src }]), /src/);
  }
  const tracks = normalizeTracks([
    { title: "第一首 <练习>", src: "/audio/files/one.mp3", instrument: "钢琴", date: "2026-10-22" },
    { title: "第二首", src: "https://example.com/two.mp3" }
  ]);
  const template = readFileSync(join(__dirname, "../templates/performances.pug"), "utf8")
    .replace(/^extends page.pug\s+block content\n/, "").replace(/^ {4}/gm, "");
  const html = pug.render(template, { page: { tracks }, url_for: (url) => url });
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://yuuko.site/audio/" });
  const { window } = dom;
  const { document } = window;
  const media = window.HTMLMediaElement.prototype;
  // JSDOM cannot decode audio. Model media events while testing the real controls and DOM.
  Object.defineProperties(media, {
    paused: { configurable: true, get() { return this._paused !== false; } },
    duration: { configurable: true, get() { return this._duration ?? NaN; } },
    ended: { configurable: true, get() { return this._ended || false; } }
  });
  media.play = function () {
    this._paused = false;
    this._ended = false;
    this.dispatchEvent(new window.Event("play"));
    this.dispatchEvent(new window.Event("playing"));
    return Promise.resolve();
  };
  media.pause = function () {
    this._paused = true;
    this.dispatchEvent(new window.Event("pause"));
  };
  media.load = function () { this._duration = NaN; };
  window.eval(readFileSync(join(__dirname, "../source/js/performances.js"), "utf8"));
  const cards = [...document.querySelectorAll(".performance-card")];
  const buttons = cards.map((card) => card.querySelector("button"));
  assert.equal(cards[0].querySelector("h2").textContent, "第一首 <练习>");
  assert.equal(document.querySelector("audio"), null, "initial load must not create/request audio");
  assert.equal(document.querySelector("img"), null);

  cards[0].click();
  const audio = document.querySelector("audio");
  assert.equal(audio.preload, "none");
  assert.equal(audio.paused, false);
  assert.equal(buttons[0].getAttribute("aria-pressed"), "true");
  audio._duration = 120;
  audio.dispatchEvent(new window.Event("loadedmetadata"));
  const seek = cards[0].querySelector("input");
  assert.equal(seek.disabled, false);
  seek.value = 50;
  seek.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(audio.currentTime, 60);
  buttons[0].click();
  assert.equal(audio.paused, true);
  buttons[0].click();
  assert.equal(audio.currentTime, 60, "resume retains progress");
  buttons[1].click();
  assert.equal(document.querySelectorAll("audio").length, 1);
  assert.equal(buttons[0].getAttribute("aria-pressed"), "false");
  assert.equal(buttons[1].getAttribute("aria-pressed"), "true");
  assert.equal(audio.src, "https://example.com/two.mp3");
  audio._paused = true;
  audio._ended = true;
  audio.dispatchEvent(new window.Event("ended"));
  assert.equal(audio.src, "https://example.com/two.mp3", "no automatic next track");
  assert.equal(buttons[1].getAttribute("aria-pressed"), "false");

  buttons[1].click();
  const themeAudio = document.createElement("audio");
  document.body.append(themeAudio);
  await themeAudio.play();
  assert.equal(audio.paused, true, "theme playback pauses performance");
  buttons[1].click();
  assert.equal(themeAudio.paused, true, "performance pauses theme playback");
  document.dispatchEvent(new window.Event("pjax:send"));
  assert.equal(audio.paused, true);
  assert.equal(audio.hasAttribute("src"), false);
  buttons[0].click();
  cards[0].remove();
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  assert.equal(audio.hasAttribute("src"), false, "DOM replacement releases audio");
  buttons[1].click();
  window.dispatchEvent(new window.Event("pagehide"));
  assert.equal(audio.hasAttribute("src"), false);

  media.play = () => Promise.reject(new Error("unavailable"));
  buttons[1].click();
  await Promise.resolve();
  assert.match(cards[1].querySelector(".performance-status").textContent, /播放失败/);
  dom.window.close();
  console.log("Audio rendering and playback controls passed.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
