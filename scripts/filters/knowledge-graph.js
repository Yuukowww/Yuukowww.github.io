"use strict";

const { mkdir, readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");

const DEFAULTS = {
  enable: false,
  auto_mount: true,
  categories_path: "/categories/",
  target_selector: ".collapse.wrap",
  insert_position: "beforebegin",
  title: "知识网络",
  height: "620px",
  include_uncategorized: false
};

function normalizeCategoriesPath(categoriesPath) {
  const value = String(categoriesPath || DEFAULTS.categories_path);
  const normalized = value.replace(/^\/+/, "").replace(/\/+$/, "");
  return normalized ? `${normalized}/index.html` : "index.html";
}

function getClassSelectorMatcher(selector) {
  if (!selector || selector[0] !== ".") return null;
  const classes = selector.split(".").filter(Boolean);
  if (!classes.length) return null;
  return new RegExp(
    `<(?<tag>[a-zA-Z][\\w:-]*)(?<attrs>[^>]*)class=(?<quote>["'])[^"']*${classes.map((className) => `\\b${className}\\b`).join(`[^"']*`)}[^"']*\\k<quote>[^>]*>`,
    "i"
  );
}

function collectGraphData(posts, includeUncategorized) {
  const nodes = new Map();
  const links = [];

  const addNode = (id, group, value = 1) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, group, value });
      return;
    }
    const current = nodes.get(id);
    current.value += value;
  };

  posts.forEach((post) => {
    const title = String(post.title || post.slug || "");
    if (!title) return;
    const categoryItems = post.categories && typeof post.categories.toArray === "function"
      ? post.categories.toArray()
      : [];
    if (!categoryItems.length && !includeUncategorized) return;

    addNode(title, "post");
    const categories = categoryItems.length ? categoryItems : [{ name: "uncategorized" }];

    categories.forEach((category) => {
      const categoryName = String(category.name || "uncategorized");
      addNode(categoryName, "category");
      links.push({ source: categoryName, target: title });
    });
  });

  return { nodes: Array.from(nodes.values()), links };
}

function buildKnowledgeGraphHtml(data, options) {
  const title = String(options.title || DEFAULTS.title);
  const height = String(options.height || DEFAULTS.height);
  const payload = JSON.stringify(data);
  const escapedTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `
<section class="knowledge-graph-wrap">
  <h2 class="item title">${escapedTitle}</h2>
  <div id="knowledge-graph" style="height:${height};min-height:420px;border-radius:12px;overflow:hidden;"></div>
</section>
<script type="module">
  import ForceGraph from "https://esm.sh/force-graph@1.52.0?bundle";
  const graphData = ${payload};
  const graphEl = document.getElementById("knowledge-graph");
  if (graphEl && graphData.nodes.length) {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const graph = ForceGraph()(graphEl)
      .graphData(graphData)
      .nodeId("id")
      .nodeLabel((node) => node.id)
      .nodeAutoColorBy("group")
      .linkDirectionalParticles(1)
      .linkDirectionalParticleSpeed(0.002)
      .cooldownTicks(120)
      .backgroundColor(isDark ? "#1f1f1f" : "#ffffff");
    graph.onNodeClick((node) => {
      if (node.group === "category") {
        window.location.href = "/categories/" + encodeURIComponent(node.id) + "/";
      }
    });
  }
</script>
`;
}

async function injectKnowledgeGraph(hexoInstance) {
  const config = Object.assign({}, DEFAULTS, hexoInstance.config.knowledge_graph || {});
  if (!config.enable || !config.auto_mount) return;
  if (String(config.insert_position || "beforebegin").toLowerCase() !== "beforebegin") return;

  const categoriesFile = path.join(hexoInstance.public_dir, normalizeCategoriesPath(config.categories_path));
  let html;
  try {
    html = await readFile(categoriesFile, "utf8");
  } catch {
    return;
  }

  if (html.includes("id=\"knowledge-graph\"")) return;

  const posts = hexoInstance.locals.get("posts").toArray().filter((post) => post.published !== false);
  const graphData = collectGraphData(posts, Boolean(config.include_uncategorized));
  if (!graphData.nodes.length) return;

  const matcher = getClassSelectorMatcher(config.target_selector);
  if (!matcher) return;
  const match = matcher.exec(html);
  if (!match) return;

  const snippet = buildKnowledgeGraphHtml(graphData, config);
  const updatedHtml = html.slice(0, match.index) + snippet + html.slice(match.index);

  await mkdir(path.dirname(categoriesFile), { recursive: true });
  await writeFile(categoriesFile, updatedHtml, "utf8");
}

if (typeof hexo !== "undefined") {
  hexo.extend.filter.register("after_generate", function() {
    return injectKnowledgeGraph(hexo);
  });
}

module.exports = {
  buildKnowledgeGraphHtml,
  collectGraphData,
  normalizeCategoriesPath
};
