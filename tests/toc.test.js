const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { parseDOM } = require("htmlparser2");
const { getText } = require("domutils");

// Run after `npm run build`. Inspect the actual theme output, including renderer
// and post-render filters, rather than a second implementation of Markdown.
const publicDirectory = path.resolve(__dirname, "../public");
assert.ok(fs.existsSync(publicDirectory), "Build the site before running the TOC integration test: npm run build");

function descendants(nodes, predicate) {
  const matches = [];
  for (const node of nodes) {
    if (predicate(node)) matches.push(node);
    matches.push(...descendants(node.children || [], predicate));
  }
  return matches;
}

function hasClass(node, name) {
  return (node.attribs?.class || "").split(/\s+/).includes(name);
}

function ancestors(node) {
  const result = [];
  for (let parent = node.parent; parent; parent = parent.parent) result.push(parent);
  return result;
}

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(filename);
    return entry.isFile() && entry.name.endsWith(".html") ? [filename] : [];
  });
}

const requiredPosts = new Set([
  "CS/LLM/optimize/stiefel",
  "CS/OS/deadlock",
  "CS/OS/进程与线程",
  "CS/OS/进程的同步与互斥",
  "CS/数据结构/树",
  "CS/计组/CPU",
  "CS/计组/磁盘",
  "CS/计网/网络层"
]);
const failures = [];
let postCount = 0;
let linkCount = 0;

for (const filename of htmlFiles(publicDirectory)) {
  const relativePath = path.relative(publicDirectory, filename).split(path.sep).join("/");
  const dom = parseDOM(fs.readFileSync(filename, "utf8"), { decodeEntities: true });
  const articles = descendants(dom, (node) => node.name === "article" && hasClass(node, "post"));
  if (articles.length === 0) continue;
  postCount += 1;

  for (const post of requiredPosts) {
    if (decodeURIComponent(relativePath).endsWith(`/${post}/index.html`)) requiredPosts.delete(post);
  }

  try {
    assert.equal(articles.length, 1, "There must be exactly one full post on the page");
    const bodies = descendants(articles, (node) => node.attribs?.itemprop === "articleBody");
    assert.equal(bodies.length, 1, "The rendered article body must be present");
    const headings = descendants(bodies, (node) => /^h[1-6]$/.test(node.name || ""));
    const panels = descendants(dom, (node) => hasClass(node, "contents") && hasClass(node, "panel"));
    assert.equal(panels.length, 1, "The theme TOC panel must be present");
    const roots = descendants(panels, (node) => node.name === "ol" && hasClass(node, "toc"));
    const items = descendants(panels, (node) => node.name === "li" && hasClass(node, "toc-item"));
    const links = descendants(panels, (node) => node.name === "a" && hasClass(node, "toc-link"));

    if (headings.length === 0) {
      assert.equal(links.length, 0, "A post without headings should have no TOC entries");
      continue;
    }

    const levels = headings.map((node) => Number(node.name[1]));
    const topLevel = Math.min(...levels);
    assert.equal(levels[0], topLevel, "The first heading must be at the article's top level");
    for (let index = 1; index < headings.length; index += 1) {
      assert.ok(
        levels[index] <= levels[index - 1] + 1,
        `Heading levels must not skip: h${levels[index - 1]} -> h${levels[index]} (${getText(headings[index]).trim()})`
      );
    }

    assert.equal(roots.length, 1, "The TOC must have exactly one root ol.toc");
    assert.equal(items.length, headings.length, "Every heading must have one TOC item");
    assert.equal(links.length, headings.length, "Every heading must have one TOC link");
    const ids = new Map();
    for (const node of descendants(dom, (node) => Boolean(node.attribs?.id))) {
      const id = node.attribs.id;
      ids.set(id, [...(ids.get(id) || []), node]);
    }

    for (let index = 0; index < headings.length; index += 1) {
      const heading = headings[index];
      const item = items[index];
      const link = links[index];
      const label = getText(heading).trim();
      const href = link.attribs?.href;
      assert.ok(heading.attribs?.id, `Heading must retain its own id: ${label}`);
      assert.ok(href && href.startsWith("#") && href.length > 1, `TOC link needs a fragment href: ${label}`);
      const targetId = decodeURIComponent(href.slice(1));
      assert.equal(targetId, heading.attribs.id, `TOC link must target its corresponding heading: ${label}`);
      const targets = ids.get(targetId) || [];
      assert.ok(targets.length === 1 && targets[0] === heading, `TOC target must be a unique heading id: ${targetId}`);
      assert.equal(link.parent, item, `TOC link must belong to its item: ${label}`);
      assert.equal(item.parent?.name, "ol", `TOC item must be inside a list: ${label}`);
      const lists = ancestors(item).filter((node) => node.name === "ol");
      assert.ok(lists.includes(roots[0]), `TOC item escaped the root list: ${label}`);
      assert.equal(lists.length, levels[index] - topLevel + 1, `TOC nesting must match heading depth: ${label}`);
      linkCount += 1;
    }

    for (const bibliography of descendants(bodies, (node) => hasClass(node, "post-bibliography"))) {
      const bibliographyHeadings = descendants([bibliography], (node) => /^h[1-6]$/.test(node.name || ""));
      assert.equal(bibliographyHeadings.length, 1, "Bibliography must have one section heading");
      const heading = bibliographyHeadings[0];
      assert.equal(heading.attribs.id, "references", "Bibliography heading must keep its stable anchor");
      assert.equal(Number(heading.name[1]), topLevel, "Bibliography must be a top-level section");
      assert.equal(items[headings.indexOf(heading)].parent, roots[0], "Bibliography must be a root TOC item");
      const anchors = descendants([heading], (node) => node.name === "a" && hasClass(node, "anchor"));
      assert.ok(anchors.length > 0, "Bibliography heading must expose the theme's anchor marker");
    }

    if (relativePath.endsWith("/CS/LLM/optimize/stiefel/index.html")) {
      const appendix = headings.findIndex((node) => /\bAppendix\b/.test(getText(node)));
      assert.ok(appendix >= 0, "Stiefel must retain its Appendix heading");
      assert.equal(items[appendix].parent, roots[0], "Stiefel Appendix must remain inside the root TOC list");
      assert.ok(headings.some((node) => node.attribs.id === "references"), "Stiefel must render its bibliography");
    }
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`);
  }
}

assert.ok(postCount > 0, "No rendered posts were found; build the site before running this test");
assert.deepEqual([...requiredPosts], [], "All eight posts affected by heading skips must be checked");
assert.equal(failures.length, 0, `TOC regressions:\n${failures.join("\n")}`);
console.log(`TOC integration checks passed for ${postCount} posts and ${linkCount} heading links.`);
