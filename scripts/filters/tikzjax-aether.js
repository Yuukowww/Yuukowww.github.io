const { localStorage } = require("hexo-filter-tikzjax/dist/common");

const ESCAPED_PLACEHOLDER_RE = /<p>&lt;!-- tikzjax-placeholder-(\w+?) --&gt;<\/p>/g;

hexo.extend.filter.register("after_render:html", function(html, locals) {
  if (!html || !html.includes("tikzjax-placeholder")) {
    return html;
  }

  const config = this.config.tikzjax || {};
  const page = locals?.page || {};
  const indexContains = page.__index && page.posts?.toArray?.().find((post) => post.tikzjax);

  if (!page.tikzjax && !config.every_page && !indexContains) {
    return html;
  }

  return html.replace(ESCAPED_PLACEHOLDER_RE, (_match, hash) => {
    const svg = localStorage.getItem(hash);

    if (!svg) {
      return _match;
    }

    return `<p><span class="tikzjax">${svg}</span></p>`;
  });
});
