# Blog 渲染检查

`.github/workflows/page.yml` 在 PR、推送到 `main` 和手动触发时运行，先调用
`blog-lint.yml` 完成依赖安装、测试、源码检查、构建和 HTML 检查，再部署已检查的构建产物。
部署任务通过 `needs: checks` 等待检查成功，仅 `main` 的推送和手动运行会部署，PR 只做检查。
构建只执行一次，`checked-blog-site` 附件将同一份 `public/` 交给部署任务。

源码或 HTML 检查发现任何问题时，输出 Error Annotations 并以退出码 1 结束，
立即阻止后续步骤和部署。依赖安装、测试或实际构建失败也会阻止部署。
CI 使用 `npm ci`，依赖变动后需要同步提交锁文件。

本地执行：

```sh
npm run test:blog-lint
npm test
npm run lint:blog:source
npm run build
npm run test:toc
npm run test:profile
npm run lint:blog:html
```

检查结果只输出到 Actions Annotations 和执行日志，不生成摘要或报告文件。
全部问题都会写入日志，GitHub 可能限制页面展示的 Annotations 数量。
HTML 位置属于 `public/` 文件，需要本地构建查看，不能当作 Markdown 行号。

## 检查内容

- `math-space`：行内公式 `$` 内侧的空格或制表符。
- `math-delimiter` / `math-block`：疑似缺失的结束符、结束 `$` 后紧跟数字、句中使用块公式。
- `tag-delimiter` / `tag-pair`：Hexo 标签缺少 `%}`，以及已知块标签的闭合问题。
- `katex-syntax`：不支持的 TeX 命令、公式语法错误。
- `html-*`：实际构建的文章正文中残留的公式/标签、TeX 命令和 `katex-error` 节点。

源码检查排除 front matter、Markdown 代码块、行内代码、HTML 注释与代码元素、隐藏目录
和 `node_modules`；字面量 Hexo 块 `raw`、`verbatim`、`codeblock` 的正文不做数学检查。
HTML 检查仅扫描 `itemprop="articleBody"` 正文，并跳过代码元素和已渲染的 KaTeX/MathML。

## 边界

源码扫描器使用 Markdown-it 识别代码区域，再用保留源码偏移的规则检查未被识别的语法。
这不是完整的 Hexo/Nunjucks 语法解析器。已知块标签名单在 `blockTags` 中维护，单标签是否
存在、参数是否合法由实际 Hexo 构建验证。金额、复杂嵌套、正文中的字面 TeX 可能存在歧义，
疑似问题需要人工确认；检查器不自动修改文章。

KaTeX 语法诊断来自 Aether 依赖树中的 `katex`，使用与当前插件一致的默认宏行为；不跨公式
共享宏，也不将 Unicode 等严格模式提示视为语法错误。Aether 0.0.6 内置的 KaTeX 与其 npm
依赖解析到的补丁版本可能不同，因此同时使用真实 Aether 渲染器测试错误样例，并检查实际
Hexo 构建产物。升级渲染器后应复核这些测试与规则；不能保证识别所有渲染失败。

这套检查不加载浏览器，不能验证字体、CSS、布局溢出或公式的数学正确性。
