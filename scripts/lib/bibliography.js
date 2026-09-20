const fs = require("node:fs");
const path = require("node:path");

const { Cite } = require("@citation-js/core");
require("@citation-js/plugin-bibtex");
require("@citation-js/plugin-csl");

const { parseDOM } = require("htmlparser2");
const DomUtils = require("domutils");
const serialize = require("dom-serializer");

const CITATION_CLUSTER_RE = /\[([^\]\n]*@[^\]\n]+)\]/g;
const CITE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9_:.+\/-]*/;
const SKIPPED_TAGS = new Set(["a", "code", "pre", "script", "style", "kbd", "samp"]);
const SKIPPED_CLASSES = new Set(["katex", "MathJax", "mathjax", "tikzjax", "mermaid"]);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function citationId(key) {
  return key.replace(/[^A-Za-z0-9_-]/g, (character) => {
    return `-${character.codePointAt(0).toString(16)}-`;
  });
}

function findBibFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const resolved = path.join(current, entry.name);

      if (entry.isDirectory()) {
        visit(resolved);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".bib")) {
        files.push(resolved);
      }
    }
  };

  visit(directory);
  return files.sort();
}

function loadBibliography(directory) {
  const files = findBibFiles(directory);
  const entries = new Map();
  const origins = new Map();

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    let parsed;

    try {
      parsed = new Cite(source).data;
    } catch (error) {
      throw new Error(`无法解析 BibTeX 文件 ${file}: ${error.message}`, { cause: error });
    }

    if (source.trim() && parsed.length === 0) {
      throw new Error(`BibTeX 文件没有可识别的条目: ${file}`);
    }

    for (const entry of parsed) {
      const key = entry.id || entry["citation-key"];

      if (!key) {
        throw new Error(`BibTeX 条目缺少 citation key: ${file}`);
      }

      if (entries.has(key)) {
        throw new Error(
          `BibTeX citation key 重复: ${key}\n- ${origins.get(key)}\n- ${file}`
        );
      }

      entries.set(key, entry);
      origins.set(key, file);
    }
  }

  return { entries, files, origins };
}

function parseCitationCluster(raw) {
  const citations = [];

  for (const originalSegment of raw.split(";")) {
    const segment = originalSegment.trim();
    const at = segment.indexOf("@");

    if (at < 0) {
      return null;
    }

    let prefix = segment.slice(0, at);
    let suppressed = false;

    if (prefix.endsWith("-")) {
      suppressed = true;
      prefix = prefix.slice(0, -1);
    }

    if (prefix && !/\s$/.test(prefix)) {
      return null;
    }

    const keyMatch = segment.slice(at + 1).match(CITE_KEY_RE);
    if (!keyMatch) {
      return null;
    }

    const key = keyMatch[0];
    const suffix = segment.slice(at + 1 + key.length);
    citations.push({ key, prefix, suffix, suppressed });
  }

  return citations.length ? citations : null;
}

function renderCitationText(text, state, sourceName) {
  let cursor = 0;
  let changed = false;
  let html = "";

  for (const match of text.matchAll(CITATION_CLUSTER_RE)) {
    const citations = parseCitationCluster(match[1]);

    if (!citations) {
      continue;
    }

    html += escapeHtml(text.slice(cursor, match.index));
    html += "[";

    citations.forEach((citation, index) => {
      const entry = state.library.entries.get(citation.key);

      if (!entry) {
        throw new Error(
          `文章 ${sourceName || "(unknown)"} 引用了不存在的 BibTeX key: ${citation.key}`
        );
      }

      if (!state.numbers.has(citation.key)) {
        state.keys.push(citation.key);
        state.numbers.set(citation.key, state.keys.length);
      }

      const occurrence = (state.occurrences.get(citation.key) || 0) + 1;
      state.occurrences.set(citation.key, occurrence);

      const safeKey = citationId(citation.key);
      const citeId = `cite-${safeKey}-${occurrence}`;
      const links = state.backlinks.get(citation.key) || [];
      links.push(citeId);
      state.backlinks.set(citation.key, links);

      if (index > 0) {
        html += "; ";
      }

      html += escapeHtml(citation.prefix);
      html += `<a class="citation-link" id="${citeId}" href="#ref-${safeKey}"`;
      html += ` data-cite-key="${escapeHtml(citation.key)}"`;
      html += ` title="${escapeHtml(entry.title || citation.key)}">`;
      html += String(state.numbers.get(citation.key));
      html += "</a>";
      html += escapeHtml(citation.suffix);
    });

    html += "]";
    cursor = match.index + match[0].length;
    changed = true;
  }

  if (!changed) {
    return null;
  }

  html += escapeHtml(text.slice(cursor));
  return html;
}

function hasSkippedClass(node) {
  const classes = (node.attribs?.class || "").split(/\s+/);
  return classes.some((name) => SKIPPED_CLASSES.has(name));
}

function transformTextNodes(container, state, sourceName, inheritedSkip = false) {
  const children = container.children || [];

  for (let index = 0; index < children.length; index += 1) {
    const node = children[index];
    const skip = inheritedSkip ||
      (node.type === "tag" && (SKIPPED_TAGS.has(node.name) || hasSkippedClass(node)));

    if (node.type === "text" && !skip && node.data.includes("@")) {
      const replacementHtml = renderCitationText(node.data, state, sourceName);

      if (replacementHtml) {
        const replacement = parseDOM(replacementHtml, { decodeEntities: true });
        replacement.forEach((child) => {
          child.parent = node.parent || null;
        });
        children.splice(index, 1, ...replacement);
        index += replacement.length - 1;
      }
    } else if (node.children?.length) {
      transformTextNodes(node, state, sourceName, skip);
    }
  }
}

function appendBacklinks(entryHtml, key, backlinkIds) {
  const roots = parseDOM(entryHtml, { decodeEntities: true });
  const entryNode = DomUtils.findOne(
    (node) => node.type === "tag" && (node.attribs?.class || "").split(/\s+/).includes("csl-entry"),
    roots
  );

  if (!entryNode) {
    throw new Error(`无法为参考文献 ${key} 生成 CSL 条目`);
  }

  entryNode.attribs = entryNode.attribs || {};
  entryNode.attribs.id = `ref-${citationId(key)}`;

  const target = DomUtils.findOne(
    (node) => node.type === "tag" && (node.attribs?.class || "").split(/\s+/).includes("csl-right-inline"),
    entryNode.children
  ) || entryNode;

  const backlinkHtml = backlinkIds.map((id, index) => {
    const label = backlinkIds.length === 1 ? "↩" : `↩${index + 1}`;
    return `<a class="citation-backref" href="#${id}" aria-label="返回正文引用 ${index + 1}">${label}</a>`;
  }).join(" ");
  const backlinkNodes = parseDOM(` <span class="citation-backrefs">${backlinkHtml}</span>`, {
    decodeEntities: true
  });

  for (const node of backlinkNodes) {
    node.parent = target;
    target.children.push(node);
  }

  return roots.map((node) => serialize(node, { decodeEntities: true })).join("");
}

function renderBibliography(state, options) {
  const data = state.keys.map((key) => state.library.entries.get(key));
  const cite = new Cite(data);
  const formatted = cite.format("bibliography", {
    format: "html",
    template: options.style || "vancouver",
    lang: options.lang || "en-US",
    hyperlinks: true,
    nosort: true,
    asEntryArray: true
  });

  const entries = formatted.map(([key, entryHtml]) => {
    return appendBacklinks(entryHtml, key, state.backlinks.get(key) || []);
  }).join("");

  return [
    '<section class="post-bibliography" id="references">',
    `<h2 class="post-bibliography-title">${escapeHtml(options.heading || "参考文献")}</h2>`,
    `<div class="csl-bib-body">${entries}</div>`,
    "</section>"
  ].join("");
}

function findBibliographyPlaceholder(nodes) {
  for (const node of nodes) {
    if (node.type === "comment" && node.data.trim().toLowerCase() === "bibliography") {
      return node;
    }

    if (node.children?.length) {
      const nested = findBibliographyPlaceholder(node.children);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function insertBibliography(roots, bibliographyHtml) {
  const bibliographyNodes = parseDOM(bibliographyHtml, { decodeEntities: true });
  const placeholder = findBibliographyPlaceholder(roots);

  if (placeholder?.parent) {
    const parent = placeholder.parent;
    const index = parent.children.indexOf(placeholder);
    bibliographyNodes.forEach((node) => {
      node.parent = parent;
    });
    parent.children.splice(index, 1, ...bibliographyNodes);
    return;
  }

  if (placeholder) {
    const index = roots.indexOf(placeholder);
    bibliographyNodes.forEach((node) => {
      node.parent = null;
    });
    roots.splice(index, 1, ...bibliographyNodes);
    return;
  }

  bibliographyNodes.forEach((node) => {
    node.parent = null;
    roots.push(node);
  });
}

function transformPostHtml(html, library, options = {}) {
  const roots = parseDOM(html, { decodeEntities: true });
  const state = {
    library,
    keys: [],
    numbers: new Map(),
    occurrences: new Map(),
    backlinks: new Map()
  };

  transformTextNodes({ children: roots }, state, options.sourceName);

  if (state.keys.length === 0) {
    return html;
  }

  insertBibliography(roots, renderBibliography(state, options));
  return roots.map((node) => serialize(node, { decodeEntities: true })).join("");
}

module.exports = {
  citationId,
  findBibFiles,
  loadBibliography,
  parseCitationCluster,
  transformPostHtml
};
