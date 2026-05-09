const { parseDocument } = require("htmlparser2");
const DomUtils = require("domutils");
const serialize = require("dom-serializer").default;

const MERMAID_LANG_RE = /(^|\s)language-mermaid(\s|$)/;
const MERMAID_FENCE_RE = /```mermaid\b/i;

function createTextNode(data) {
  return {
    type: "text",
    data
  };
}

function createMermaidNode(source) {
  const node = {
    type: "tag",
    name: "pre",
    attribs: {
      class: "mermaid"
    },
    children: [createTextNode(source)]
  };

  node.children[0].parent = node;
  return node;
}

function isMermaidCode(node) {
  return node.name === "code" && MERMAID_LANG_RE.test(node.attribs?.class || "");
}

function normalizeDiagramSource(source) {
  return source.replace(/^\n+|\n+$/g, "");
}

hexo.extend.filter.register("before_post_render", function(data) {
  if (data?.content && MERMAID_FENCE_RE.test(data.content)) {
    data.mermaid = true;
  }

  return data;
});

hexo.extend.filter.register("after_post_render", function(data) {
  if (!data?.content || !data.content.includes("language-mermaid")) {
    return data;
  }

  const document = parseDocument(data.content, { decodeEntities: true });
  const mermaidBlocks = DomUtils.findAll(isMermaidCode, document.children);

  if (!mermaidBlocks.length) {
    return data;
  }

  mermaidBlocks.forEach((code) => {
    const pre = code.parent;

    if (!pre || pre.name !== "pre") {
      return;
    }

    const source = normalizeDiagramSource(DomUtils.getText(code));
    DomUtils.replaceElement(pre, createMermaidNode(source));
  });

  data.content = serialize(document.children, {
    decodeEntities: true,
    encodeEntities: "utf8"
  });
  return data;
});

hexo.extend.filter.register("theme_inject", function(injects) {
  injects.bodyEnd.raw("mermaid-render", `
script(type="module").
  (() => {
    const mermaidUrl = "https://cdn.jsdelivr.net/npm/mermaid@10.9.3/dist/mermaid.esm.min.mjs";
    let mermaidLoader;

    const loadMermaid = () => {
      mermaidLoader ||= import(mermaidUrl).then((mod) => mod.default || mod);
      return mermaidLoader;
    };

    const renderMermaid = async () => {
      const nodes = Array.from(document.querySelectorAll("pre.mermaid, div.mermaid"))
        .filter((node) => !node.dataset.processed);

      if (!nodes.length) {
        return;
      }

      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "default"
        });

        await mermaid.run({ nodes });
        document.querySelectorAll("pre.mermaid > svg, div.mermaid > svg").forEach((svg) => {
          svg.style.maxWidth = "";
        });
      } catch (error) {
        console.error("Mermaid render failed:", error);
      }
    };

    window.shokaxRenderMermaid = renderMermaid;
    window.addEventListener("DOMContentLoaded", renderMermaid);
    document.addEventListener("pjax:complete", renderMermaid);
    document.addEventListener("pjax:success", renderMermaid);
  })();
`, {}, {}, 99);
});
