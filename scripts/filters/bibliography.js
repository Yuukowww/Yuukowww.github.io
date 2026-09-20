const path = require("node:path");

const {
  loadBibliography,
  transformPostHtml
} = require("../lib/bibliography");

let library;

function getOptions(context) {
  const config = context.config.bibliography || {};

  return {
    directory: path.resolve(context.base_dir, config.path || "bibliography"),
    style: config.style || "vancouver",
    lang: config.lang || "en-US",
    heading: config.heading || "参考文献"
  };
}

function reloadLibrary() {
  const options = getOptions(this);
  library = loadBibliography(options.directory);
  this.log.info(`Loaded ${library.entries.size} references from ${library.files.length} BibTeX file(s).`);
}

hexo.extend.filter.register("before_generate", reloadLibrary);

hexo.extend.filter.register("after_post_render", function(data) {
  if (!data?.content || !data.content.includes("@")) {
    return data;
  }

  const options = getOptions(this);
  library ||= loadBibliography(options.directory);
  data.content = transformPostHtml(data.content, library, {
    style: options.style,
    lang: options.lang,
    heading: options.heading,
    sourceName: data.source || data.path || data.title
  });
  return data;
});
