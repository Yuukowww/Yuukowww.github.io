"use strict";

const { readFileSync } = require("node:fs");
const { join } = require("node:path");

function normalizeTracks(data) {
  if (!Array.isArray(data)) throw new Error("audio.yml 必须是音频条目列表");
  return data.map((track, index) => {
    if (!track || typeof track.title !== "string" || !track.title.trim() ||
        typeof track.src !== "string" || !/^(https:\/\/|\/(?!\/))\S+$/i.test(track.src)) {
      throw new Error(`audio.yml 第 ${index + 1} 条需要 title 和站内绝对路径或 HTTPS src`);
    }
    return { ...track, title: track.title.trim() };
  });
}

if (typeof hexo !== "undefined") {
  hexo.extend.filter.register("before_generate", function () {
    hexo.theme.setView("performances.pug", readFileSync(join(__dirname, "../../templates/performances.pug"), "utf8"));
  });
  hexo.extend.generator.register("performances", function (locals) {
    return {
      path: "audio/index.html",
      layout: "performances",
      data: { title: "我的演奏", tracks: normalizeTracks(locals.data.audio || []), audio: false }
    };
  });
  hexo.extend.filter.register("theme_inject", function (injects) {
    const root = hexo.config.root;
    injects.head.raw("performances-style", `link(rel="stylesheet" href="${root}css/performances.css")`, {}, {}, 99);
    injects.bodyEnd.raw("performances-player", `script(defer src="${root}js/performances.js")`, {}, {}, 99);
  });
}

module.exports = { normalizeTracks };
