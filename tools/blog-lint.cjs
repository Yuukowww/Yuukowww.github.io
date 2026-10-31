#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
// Resolve the renderer's declared dependency tree. Aether also bundles KaTeX;
// the real build and renderer regression fixtures cover that bundled runtime.
const rendererRequire = createRequire(require.resolve("hexo-renderer-aether"));
const MarkdownIt = rendererRequire("markdown-it");
const katex = rendererRequire("katex");
const { parseDOM } = require("htmlparser2");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "artifacts/blog-lint");
const blockTags = new Set(["blockquote", "codeblock", "raw", "verbatim", "pullquote", "note", "tabs", "tab", "htmlblock"]);

function files(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).filter(entry => !entry.name.startsWith(".") && entry.name !== "node_modules").sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? files(filename, extension) : entry.isFile() && extension.test(entry.name) ? [filename] : [];
  });
}

function diagnostic(file, source, offset, rule, message) {
  const prefix = source.slice(0, offset);
  return { file, line: prefix.split("\n").length, column: offset - prefix.lastIndexOf("\n"), rule, message };
}

function escaped(text, offset) {
  let count = 0;
  while (offset > 0 && text[--offset] === "\\") count++;
  return count % 2 === 1;
}

// Replace ignored regions with spaces, keeping offsets and newlines intact.
function maskSource(source) {
  let text = source;
  const mask = (start, end) => { text = text.slice(0, start) + text.slice(start, end).replace(/[^\n\r]/g, " ") + text.slice(end); };
  const frontmatter = /^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)(?:\r?\n|$)/.exec(text);
  if (frontmatter) mask(0, frontmatter[0].length);
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  const tokens = new MarkdownIt({ html: true }).parse(text, {});
  for (const token of tokens) {
    if (["fence", "code_block"].includes(token.type) && token.map) mask(starts[token.map[0]], starts[token.map[1]] ?? text.length);
  }
  // HTML code, comments and raw blocks are examples/data rather than Markdown math.
  for (const match of text.matchAll(/<!--[\s\S]*?(?:-->|$)|<(pre|code|script|style|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>/gi)) mask(match.index, match.index + match[0].length);
  // Inline code spans: closing run must have the same length as the opener.
  for (let i = 0; i < text.length;) {
    if (text[i] !== "`" || escaped(text, i)) { i++; continue; }
    const start = i;
    while (text[i] === "`") i++;
    const length = i - start;
    const runs = /`+/g;
    runs.lastIndex = i;
    let match;
    while ((match = runs.exec(text))) {
      if (match[0].length !== length) continue;
      mask(start, match.index + length);
      i = match.index + length;
      break;
    }
  }
  return text;
}

function lintSource(source, file = "example.md") {
  let text = maskSource(source);
  const results = [];
  const add = (offset, rule, message) => results.push(diagnostic(file, source, offset, rule, message));
  // Preserve literal-block delimiters for pairing, but ignore their contents
  // before checking either tags or math (examples may contain malformed tags).
  for (const raw of text.matchAll(/\{%\s*(raw|verbatim|codeblock)\b[^%]*%\}([\s\S]*?)\{%\s*end\1\s*%\}/g)) {
    const contentStart = raw.index + raw[0].indexOf("%}") + 2;
    const contentEnd = raw.index + raw[0].lastIndexOf("{%");
    text = text.slice(0, contentStart) + text.slice(contentStart, contentEnd).replace(/[^\r\n]/g, " ") + text.slice(contentEnd);
  }
  const stack = [];
  const tags = /\{%|%\}/g;
  let match;
  while ((match = tags.exec(text))) {
    if (escaped(text, match.index)) continue;
    if (match[0] === "%}") { add(match.index, "tag-delimiter", "发现没有对应 {% 的 %}。"); continue; }
    const start = match.index;
    const close = text.indexOf("%}", tags.lastIndex);
    const next = text.indexOf("{%", tags.lastIndex);
    if (close < 0 || (next >= 0 && next < close)) {
      add(start, "tag-delimiter", "Hexo 标签缺少 %}，检查是否写成了 }。");
      continue;
    }
    const body = text.slice(tags.lastIndex, close).trim();
    // A bare } on the opening line followed by another tag's closing delimiter.
    if (/^[^\n]*\}(?:\r?\n)/.test(body)) {
      add(start, "tag-delimiter", "Hexo 标签疑似使用 } 结束，应使用 %}。");
    }
    const name = /^(\w+)/.exec(body)?.[1];
    if (!name) add(start, "tag-delimiter", "Hexo 标签缺少有效名称。");
    if (name?.startsWith("end") && blockTags.has(name.slice(3))) {
      if (stack.at(-1)?.name !== name.slice(3)) add(start, "tag-pair", `块标签 ${name} 与开始标签不匹配。`);
      else stack.pop();
    } else if (blockTags.has(name)) stack.push({ name, offset: start });
    // Do not inspect math-like text in tag arguments.
    text = text.slice(0, start) + text.slice(start, close + 2).replace(/[^\r\n]/g, " ") + text.slice(close + 2);
    tags.lastIndex = close + 2;
  }
  for (const tag of stack) add(tag.offset, "tag-pair", `块标签 ${tag.name} 缺少 {% end${tag.name} %}。`);

  function validate(latex, offset, displayMode) {
    try {
      // Aether's math plugin uses defaults and creates no shared macro object.
      katex.renderToString(latex, { displayMode, throwOnError: true, strict: "ignore" });
    } catch (error) {
      if (!(error instanceof katex.ParseError)) throw error;
      add(offset, "katex-syntax", error.message);
    }
  }
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "$" || escaped(text, i)) continue;
    const display = text[i + 1] === "$";
    const size = display ? 2 : 1;
    const start = i;
    let close = i + size;
    for (; close < text.length; close++) {
      if (text[close] === "$" && !escaped(text, close) && (!display || text[close + 1] === "$")) break;
      // Inline math may wrap lines, but cannot span Markdown paragraphs.
      if (!display && /^\r?\n[ \t]*\r?\n/.test(text.slice(close, close + 100))) break;
    }
    if (close >= text.length || text[close] !== "$") {
      // Ordinary currency such as "$20 USD" is intentionally left alone.
      if (!display && /^\$\d+(?:[.,]\d+)*(?:\s|$)/.test(text.slice(start))) continue;
      add(start, "math-delimiter", `疑似数学公式缺少结束 ${display ? "$$" : "$"}。`);
      if (display) break;
      continue;
    }
    const latex = text.slice(start + size, close);
    if (!display && /^\d+(?:[.,]\d+)*(?:\s+[\s\S]*)$/.test(latex) && /\d/.test(text[close + 1] || "")) continue;
    if (!display && (/^[ \t]/.test(latex) || /[ \t]$/.test(latex))) {
      add(start, "math-space", "行内公式的 $ 内侧有空格或制表符，当前渲染器不会识别；请写成 $公式$。");
    } else if (!display && /\d/.test(text[close + 1] || "")) {
      add(close, "math-delimiter", "结束 $ 后紧跟数字，当前渲染器不会将其识别为结束符。");
    } else if (!display && /\r?\n/.test(latex) && /^\s*$/.test(latex)) {
      add(start, "math-delimiter", "疑似空公式或跨段落的 $ 配对错误。");
    } else if (latex.trim()) validate(latex, start, display);
    if (display && !/^(?:\s|>|[-+*]|\d+[.)])*$/.test(text.slice(text.lastIndexOf("\n", start - 1) + 1, start))) {
      add(start, "math-block", "$$ 未放在块的开头；当前渲染器只支持块级 $$ 公式，建议独立成行。");
    }
    i = close + size - 1;
  }
  return results;
}

function lintHtml(html, file = "example.html") {
  const results = [];
  const dom = parseDOM(html, { decodeEntities: true, withStartIndices: true });
  const excluded = new Set(["pre", "code", "script", "style", "textarea", "annotation", "math"]);
  function visit(nodes, inBody = false) {
    for (const node of nodes) {
      const classes = (node.attribs?.class || "").split(/\s+/);
      if (classes.includes("katex-error")) results.push(diagnostic(file, html, node.startIndex ?? 0, "html-katex-error", node.attribs.title || "构建产物中存在 katex-error。"));
      if (excluded.has(node.name) || classes.includes("katex")) continue;
      const body = inBody || node.attribs?.itemprop === "articleBody";
      if (body && node.type === "text") {
        // HTML offsets belong to the generated file, not to the Markdown source.
        const sourceResults = lintSource(node.data, file);
        for (const item of sourceResults) {
          if (item.rule === "katex-syntax") continue;
          results.push(diagnostic(file, html, node.startIndex ?? 0, `html-${item.rule}`, `正文中疑似残留未渲染语法：${item.message}`));
        }
        if (!sourceResults.length && /(^|[^\\])\${1,2}[^$\n]+\${1,2}/.test(node.data)) {
          results.push(diagnostic(file, html, node.startIndex ?? 0, "html-math-residue", "正文中仍有 $...$ 或 $$...$$ 文本，疑似公式未进入渲染器。"));
        }
        if (/\\[A-Za-z]+\b/.test(node.data) && !node.data.includes("$")) {
          results.push(diagnostic(file, html, node.startIndex ?? 0, "html-tex-residue", "正文中疑似残留 TeX 命令，可能是公式解析失败后回退为原文。"));
        }
      }
      if (node.children) visit(node.children, body);
    }
  }
  visit(dom);
  return results;
}

function escapeCommand(value, property = false) {
  let escaped = String(value).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  if (property) escaped = escaped.replace(/:/g, "%3A").replace(/,/g, "%2C");
  return escaped;
}

function writeReport(stage, results, count) {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, `${stage}.json`), JSON.stringify({ stage, files: count, diagnostics: results }, null, 2) + "\n");
  console.log(`${stage}: checked ${count} files; ${results.length} warning(s).`);
  // GitHub displays only a limited number of annotations. The artifact has all of them.
  for (const item of results.slice(0, 10)) {
    if (process.env.GITHUB_ACTIONS === "true") {
      console.log(`::warning file=${escapeCommand(item.file, true)},line=${item.line},col=${item.column},title=${escapeCommand(item.rule, true)}::${escapeCommand(item.message)}`);
    } else console.log(`${item.file}:${item.line}:${item.column} [${item.rule}] ${item.message}`);
  }
  console.log(`Full report: artifacts/blog-lint/${stage}.json`);
}

function summary() {
  fs.mkdirSync(output, { recursive: true });
  const reports = ["source", "html"].map(stage => {
    const filename = path.join(output, `${stage}.json`);
    return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, "utf8")) : { stage, files: 0, diagnostics: [], missing: true };
  });
  const rows = reports.map(report => `| ${report.stage} | ${report.missing ? "未完成" : report.files} | ${report.diagnostics.length} |`);
  const safe = value => String(value).replace(/[|<>`]/g, char => ({ "|": "&#124;", "<": "&lt;", ">": "&gt;", "`": "&#96;" })[char]).replace(/[\r\n]/g, " ");
  let markdown = `# Blog 渲染检查\n\n| 阶段 | 文件数 | 告警数 |\n| --- | ---: | ---: |\n${rows.join("\n")}\n\n告警不阻止部署。源码位置指向 Markdown，HTML 位置指向构建产物。疑似问题需人工确认，完整记录见报告附件。\n`;
  const diagnostics = reports.flatMap(report => report.diagnostics);
  markdown += "\n| 文件位置 | 规则 | 提示 |\n| --- | --- | --- |\n";
  for (const item of diagnostics.slice(0, 100)) markdown += `| ${safe(item.file)}:${item.line}:${item.column} | ${safe(item.rule)} | ${safe(item.message)} |\n`;
  if (diagnostics.length > 100) markdown += "\n仅展示前 100 条；全部告警见 JSON 报告。\n";
  fs.writeFileSync(path.join(output, "summary.md"), markdown);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  console.log(markdown.split("\n").slice(0, 9).join("\n"));
}

function main(stage) {
  if (stage === "summary") return summary();
  if (!["source", "html"].includes(stage)) throw new Error("Usage: node tools/blog-lint.cjs source|html|summary");
  const directory = path.join(root, stage === "source" ? "source" : "public");
  if (!fs.existsSync(directory)) throw new Error(`Missing ${directory}; build the site before HTML checks.`);
  const inputs = files(directory, stage === "source" ? /\.(?:md|markdown|mkd|mkdn|mdwn|mdtxt|mdtext)$/i : /\.html$/i);
  if (!inputs.length) throw new Error(`No input files in ${directory}`);
  const lint = stage === "source" ? lintSource : lintHtml;
  const results = inputs.flatMap(filename => lint(fs.readFileSync(filename, "utf8"), path.relative(root, filename).split(path.sep).join("/")));
  writeReport(stage, results, inputs.length);
}

module.exports = { lintSource, lintHtml, maskSource, escapeCommand };
if (require.main === module) main(process.argv[2]);
