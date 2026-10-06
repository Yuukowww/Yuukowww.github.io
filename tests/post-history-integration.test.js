"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseDOM } = require("htmlparser2");
const dom = require("domutils");
const { renderPostHistory } = require("hexo-heat-map");

const publicDir = path.resolve(__dirname, "../public");
const hasClass = (node, value) => (node.attribs?.class || "").split(/\s+/).includes(value);
const findAll = (tree, predicate) => dom.findAll(predicate, tree);
const attr = (tree, name) => findAll(tree, node => node.attribs && name in node.attribs);
const textOf = node => dom.getText(node);
const html = fs.readFileSync(path.join(publicDir, "profile/index.html"), "utf8");
const tree = parseDOM(html, { decodeEntities: true });
const data = JSON.parse(fs.readFileSync(path.join(publicDir, "heat-map/history.json"), "utf8"));
const component = attr(tree, "data-post-history");
assert.equal(component.length, 1, "Profile must mount exactly one history component");
const profileBodies = findAll(tree, node => node.attribs?.itemprop === "articleBody");
assert.equal(profileBodies.length, 1, "Profile must have one article body");
const profileBody = profileBodies[0];
const profileBodyText = textOf(profileBody);
assert.ok(!/<div\b[^>]*\bdata-post-history-mount\b[^>]*>\s*<\/div>/i.test(profileBodyText),
  "An escaped raw HTML placeholder must not remain as visible profile text");
assert.ok(!/POST_HISTORY_COMPONENT_MOUNT|\{%\s*(?:post_history|heat_map)\s*%\}/.test(profileBodyText),
  "The profile mount tag or its internal token must not remain in the rendered body");

// Compare placement with the user-maintained Markdown, not with a fixed layout.
// Checking only the attribute misses a placeholder escaped into a text node.
const profileMarkdown = fs.readFileSync(path.resolve(__dirname, "../source/profile/link.md"), "utf8");
const sourceMounts = [...profileMarkdown.matchAll(/\{%\s*(?:post_history|heat_map)\s*%\}|<div\s+data-post-history-mount\s*>\s*<\/div>/g)];
assert.equal(sourceMounts.length, 1, "Profile Markdown must define one history mount position");
const sourceMountOffset = sourceMounts[0].index;
const bodyPositions = findAll([profileBody], node => node === component[0] || /^h[1-6]$/.test(node.name || ""));
const componentPosition = bodyPositions.indexOf(component[0]);
assert.ok(componentPosition >= 0, "The history component must be inside the profile article body");
for (const sourceHeading of profileMarkdown.matchAll(/^#{1,6}\s+([^\r\n]+)$/gm)) {
  const headingTitle = sourceHeading[1].trim();
  const headingPosition = bodyPositions.findIndex(node => /^h[1-6]$/.test(node.name || "") &&
    textOf(node).replace(/^[#\s]+/, "").trim() === headingTitle);
  assert.ok(headingPosition >= 0, `Editable profile heading must survive: ${headingTitle}`);
  assert.equal(headingPosition < componentPosition, sourceHeading.index < sourceMountOffset,
    `The history component must preserve its Markdown position relative to "${headingTitle}"`);
}
assert.ok(!html.includes("每一次落笔与修改，都留下一点绿色。"));
const libraryDisclosure = attr(component, "data-history-library-toggle");
assert.equal(libraryDisclosure.length, 1);
assert.equal(libraryDisclosure[0].name, "details");
assert.ok(!("open" in libraryDisclosure[0].attribs), "The full article history must start collapsed");
assert.equal(attr(tree, "data-post-history-mount").length, 0, "The source placeholder must be replaced");
const embedded = attr(tree, "data-post-history-data");
assert.equal(embedded.length, 1);
assert.deepEqual(JSON.parse(textOf(embedded[0])), data, "Embedded and exported histories must match");
assert.equal(data.version, 1);
assert.equal(data.available, true, "CI/local build needs a complete Git checkout");
assert.equal(data.timezone, "Asia/Shanghai");
assert.ok(data.posts.length > 0, "The real site's articles must be present");
assert.ok(data.posts.some(post => post.events.length > 1), "The build must recover older revisions");
assert.ok(data.posts.every(post => post.id.startsWith("source/_posts/") && post.events.every(event => event.date <= data.today)));

const year = Number(data.today.slice(0, 4));
for (const obsoleteControl of ["data-history-search", "data-history-post", "data-history-year"]) {
  assert.equal(attr(component, obsoleteControl).length, 0,
    `The removed search/article/year controls must not return: ${obsoleteControl}`);
}
const yearControls = attr(component, "data-history-years");
assert.equal(yearControls.length, 1, "Year buttons must share one control container");
const yearButtons = attr(yearControls, "data-history-year-button");
assert.equal(yearButtons.length, attr(component, "data-history-year-button").length,
  "Every year button must be inside the year control container");
const expectedYears = [...new Set([
  String(year), ...data.posts.flatMap(post => post.events.map(event => event.date.slice(0, 4)))
])].sort();
assert.deepEqual(yearButtons.map(button => button.attribs["data-history-year-button"]).sort(), expectedYears,
  "Year buttons must include the current year and each year with article revisions exactly once");
for (const button of yearButtons) {
  assert.equal(button.name, "button", "Each year control must be a semantic button");
  assert.equal(button.attribs.type, "button", "Year controls must not submit a surrounding form");
  assert.ok(["true", "false"].includes(button.attribs["aria-pressed"]), "Year selection must expose its pressed state");
}
const selectedYears = yearButtons.filter(button => button.attribs["aria-pressed"] === "true");
assert.equal(selectedYears.length, 1, "Exactly one year must be selected without JavaScript");
assert.equal(selectedYears[0].attribs["data-history-year-button"], String(year),
  "The current year must be selected on the initial page");
const events = data.posts.flatMap(post => post.events).filter(event => event.date.startsWith(`${year}-`));
const counts = new Map();
for (const event of events) counts.set(event.date, (counts.get(event.date) || 0) + 1);
const cells = findAll(component, node => hasClass(node, "post-history-cell"));
const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
assert.equal(cells.length, days, "Every calendar date must have exactly one cell");
assert.equal(new Set(cells.map(cell => cell.attribs["data-date"])).size, days);
for (const cell of cells) {
  const date = cell.attribs["data-date"];
  assert.equal(Number(cell.attribs["data-count"]), counts.get(date) || 0, `Incorrect activity on ${date}`);
  if (date > data.today) assert.equal(cell.attribs["aria-disabled"], "true");
}
assert.equal(Number(textOf(attr(component, "data-history-total")[0])), events.length);
assert.equal(Number(textOf(attr(component, "data-history-days")[0])), counts.size);
assert.equal(findAll(component, node => hasClass(node, "post-history-post")).length, data.posts.length,
  "All article histories must be readable without JavaScript");
for (const post of data.posts) {
  const url = new URL(post.url, "https://yuuko.site");
  assert.equal(url.origin, "https://yuuko.site");
  const route = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  assert.ok(fs.existsSync(path.join(publicDir, route.endsWith("/") ? route + "index.html" : route)),
    `Article history links to a missing generated page: ${post.url}`);
}
assert.ok(!fs.existsSync(path.join(publicDir, "profile/link.html")), "link.md must use the /profile/ permalink");
for (const asset of ["heat-map/heat-map.css", "heat-map/heat-map.js"]) {
  assert.ok(fs.existsSync(path.join(publicDir, asset)));
  assert.ok(html.includes(`/${asset}`), `Profile must load ${asset}`);
}

const home = parseDOM(fs.readFileSync(path.join(publicDir, "index.html"), "utf8"));
const menus = findAll(home, node => hasClass(node, "menu"));
assert.ok(menus.some(menu => {
  const links = findAll([menu], node => node.name === "a");
  const friend = links.findIndex(link => link.attribs.href === "/link/");
  return friend >= 0 && links[friend + 1]?.attribs.href === "/profile/";
}), "Homepage navigation must place Profile immediately after friends");
assert.ok(attr(home, "data-post-history").length === 0, "Only Profile should mount the component");
assert.ok(findAll(home, node => node.name === "script" && node.attribs.src === "/heat-map/heat-map.js").length === 1,
  "The first visit via PJAX needs the history listener loaded on the homepage");
for (const obsoleteFile of ["scripts/generators/post-history.js", "scripts/lib/post-history.js", "scripts/lib/post-history-view.js", "source/css/post-history.css", "source/js/post-history.js"]) {
  assert.ok(!fs.existsSync(path.resolve(__dirname, "..", obsoleteFile)), `The heat map must be loaded only from the npm dependency: ${obsoleteFile}`);
}

// User-maintained titles/commit messages must not escape HTML or JSON script data.
const attack = '</script><img src=x onerror="alert(1)">';
const fixture = {
  version: 1, available: true, reason: null, today: "2024-03-01", timezone: "Asia/Shanghai",
  posts: [{ id: "post", title: attack, url: "javascript:alert(1)", events: [
    { hash: "a".repeat(40), date: "2024-02-29", timestamp: "2024-02-29T00:00:00+08:00", subject: attack, kind: "edit" }
  ] }]
};
const rendered = parseDOM(renderPostHistory(fixture), { decodeEntities: true });
assert.equal(findAll(rendered, node => hasClass(node, "post-history-cell")).length, 366);
assert.equal(findAll(rendered, node => node.name === "img").length, 0);
assert.ok(findAll(rendered, node => node.name === "a").every(node => node.attribs.href === "#"));
assert.deepEqual(JSON.parse(textOf(attr(rendered, "data-post-history-data")[0])), fixture);
assert.ok(findAll(rendered, node => node.attribs?.["data-date"] === "2024-02-29")
  .some(node => node.attribs["data-count"] === "1"));

const offsetFixture = { ...fixture, posts: [{ ...fixture.posts[0], title: "Timezone ordering", events: [
  { hash: "a".repeat(40), date: "2024-02-29", timestamp: "2024-02-29T08:00:00+00:00", subject: "Later", kind: "edit" },
  { hash: "b".repeat(40), date: "2024-02-29", timestamp: "2024-02-29T10:00:00+08:00", subject: "Earlier", kind: "edit" }
] }] };
const offsetRendered = parseDOM(renderPostHistory(offsetFixture));
const subjects = findAll(offsetRendered, node => hasClass(node, "post-history-subject")).map(textOf);
assert.deepEqual(subjects, ["Later", "Earlier", "Later", "Earlier"], "Revision order must compare instants across UTC offsets");

console.log(`Profile integration checks passed: ${data.posts.length} articles, ${events.length} revisions in ${year}, ${days} daily cells.`);
