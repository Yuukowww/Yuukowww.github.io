"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { lintSource, lintHtml, escapeCommand } = require("../tools/blog-lint.cjs");
const rules = text => lintSource(text).map(item => item.rule);

async function main() {
  // Check actual process status and Actions output, including a clean success.
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "blog-lint-status-"));
  try {
    const summaryFile = path.join(temporary, "job-summary.md");
    const modulePath = JSON.stringify(path.join(__dirname, "../tools/blog-lint.cjs"));
    for (const [stage, fixture, status] of [
      ["source", "$x$", 0],
      ["source", "$x $", 1],
      ["source", "$\\undefinedcommand{x}$", 1],
      ["source", "{% post_link example }", 1],
      ["html", '<div itemprop="articleBody">$x $</div>', 1]
    ]) {
      const code = `const {lintSource,lintHtml,reportDiagnostics}=require(${modulePath}); const stage=${JSON.stringify(stage)}; reportDiagnostics(stage,(stage==='source'?lintSource:lintHtml)(${JSON.stringify(fixture)},'example.md'),1);`;
      const child = spawnSync(process.execPath, ["-e", code], {
        cwd: temporary, encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "true", GITHUB_STEP_SUMMARY: summaryFile }
      });
      assert.equal(child.status, status, child.stderr);
      if (status) assert.match(child.stdout, /::error file=example\.md,line=1,col=\d+,title=/);
      else assert.doesNotMatch(child.stdout, /::error/);
    }
    assert.ok(!fs.existsSync(summaryFile), "Must not create a job summary");
    assert.ok(!fs.existsSync(path.join(temporary, "artifacts")), "Must not create report artifacts");
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }

  assert.deepEqual(rules("正常 $x + y$。\n\n$$\n\\frac{1}{2}\n$$"), []);
  for (const text of ["$xxx $", "$ xxx$", "$\txxx$", "$xxx\t$"]) assert.ok(rules(text).includes("math-space"), text);
  assert.ok(rules("公式 $x").includes("math-delimiter"));
  assert.ok(rules("$$\nx + y").includes("math-delimiter"));
  assert.ok(rules("$x$2").includes("math-delimiter"));
  assert.ok(rules("句中 $$x$$").includes("math-block"));
  assert.ok(rules("$\\frac{1}{$").includes("katex-syntax"));
  assert.ok(rules("$\\undefinedcommand{x}$").includes("katex-syntax"));
  assert.deepEqual(rules("转义 \\$，价格 $20 USD 和 $30 USD。"), []);
  assert.deepEqual(rules("$x\\$y$"), []);
  assert.deepEqual(rules("$\\frac{5\\%}{2}$"), []);
  assert.deepEqual(rules("`$x $` 和 ``含 ` 和 $y $``\n\n```md\n{% broken }\n$x $\n```\n\n    $x $"), []);
  assert.deepEqual(rules("---\ntitle: '$x $'\n---\n<!-- $x $ -->\n<pre>$x $</pre>\n<code>{% broken }</code>"), []);
  assert.deepEqual(rules("{% post_link math/example 标题 %}"), []);
  assert.ok(rules("{% post_link math/example 标题 }").includes("tag-delimiter"));
  assert.ok(rules("{% note %}\n正文").includes("tag-pair"));
  assert.ok(rules("{% note %}{% endblockquote %}").includes("tag-pair"));
  assert.deepEqual(rules("{% note %}\n$x$\n{% endnote %}"), []);
  assert.deepEqual(rules("{% raw %}\n$x $\n{% endraw %}"), []);
  assert.deepEqual(rules("{% codeblock %}\n$x $\n{% endcodeblock %}"), []);
  assert.deepEqual(rules("{% raw %}\n{% broken }\n$x $\n{% endraw %}"), []);
  assert.deepEqual(rules("{% codeblock %}\n{% broken }\n{% endcodeblock %}"), []);
  assert.deepEqual(rules("> 公式 $x $\n"), ["math-space"]);
  assert.deepEqual(rules("- 公式 $x $\n"), ["math-space"]);
  const located = lintSource("---\r\ntitle: test\r\n---\r\n\r\n文字 $x $", "source/test.md")[0];
  assert.equal(located.file, "source/test.md");
  assert.equal(located.line, 5);
  assert.equal(located.column, 4);
  const body = content => `<article class="post"><div itemprop="articleBody">${content}</div></article>`;
  assert.ok(lintHtml(body("$x $")).some(item => item.rule === "html-math-space"));
  assert.ok(lintHtml(body("$x$")).some(item => item.rule === "html-math-residue"));
  assert.ok(lintHtml(body("{% post_link x }")).some(item => item.rule === "html-tag-delimiter"));
  assert.ok(lintHtml(body('<span class="katex-error" title="bad">x</span>')).some(item => item.rule === "html-katex-error"));
  assert.ok(lintHtml(body("\\frac{1}{2}")).some(item => item.rule === "html-tex-residue"));
  assert.deepEqual(lintHtml(body('<code>$x $</code><pre>{% broken }</pre><span class="katex">$x $</span><math>$x $</math>')), []);
  assert.deepEqual(lintHtml("<nav>$x $</nav>"), []);
  assert.equal(escapeCommand("x%\n::error::"), "x%25%0A::error::");
  assert.equal(escapeCommand("a,b:c", true), "a%2Cb%3Ac");

  // Regression fixtures use the installed, real Aether renderer, including its
  // silent fallback. This detects drift between our lint rules and the renderer.
  let render;
  const previous = global.hexo;
  try {
    global.hexo = { theme: { config: {} }, extend: { renderer: { register(extension, output, fn) { if (extension === "md") render = fn; } } } };
    require("hexo-renderer-aether");
  } finally { global.hexo = previous; }
  for (const fixture of ["$x $", "$ x$", "$\\frac{1}{$", "$\\undefinedcommand{x}$"]) {
    const html = await render({ text: fixture });
    assert.ok(!html.includes('class="katex"'), `Expected actual renderer fallback: ${fixture}`);
    assert.ok(lintSource(fixture).length, `Missing source diagnostic: ${fixture}`);
    assert.ok(lintHtml(body(html)).length, `Missing HTML diagnostic: ${fixture}`);
  }
  const valid = await render({ text: "$x + y$\n\n$$\n\\frac{1}{2}\n$$" });
  assert.ok(valid.includes('class="katex"'));
  assert.deepEqual(lintHtml(body(valid)), []);
  console.log("Blog lint tests passed (including real Aether rendering).");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
