"use strict";

const { readFileSync, readdirSync } = require("node:fs");
const { join, extname, basename } = require("node:path");

hexo.extend.filter.register("before_generate", function () {
  hexo.theme.setView("picture-gallery.pug", readFileSync(join(__dirname, "../../templates/picture-gallery.pug"), "utf8"));
});

hexo.extend.generator.register("picture-gallery", function () {
  const pictures = readdirSync(join(hexo.source_dir, "picture"), { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(avif|gif|jpe?g|png|webp)$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
    .map(entry => ({
      src: `/picture/${encodeURIComponent(entry.name)}`,
      title: basename(entry.name, extname(entry.name))
    }));

  return {
    path: "gallery/index.html",
    layout: "picture-gallery",
    data: { title: "Gallery", pictures, comments: false }
  };
});

hexo.extend.filter.register("theme_inject", function (injects) {
  injects.head.raw("picture-gallery-style", `link(rel="stylesheet" href="${hexo.config.root}css/picture-gallery.css")`, {}, {}, 99);
});
