const assert = require("node:assert/strict");

const { Cite } = require("@citation-js/core");
require("@citation-js/plugin-bibtex");

const {
  parseCitationCluster,
  transformPostHtml
} = require("../scripts/lib/bibliography");

const key = "edelman1998geometryalgorithmsorthogonalityconstraints";
const bibtex = `
@misc{${key},
  title={The Geometry of Algorithms with Orthogonality Constraints},
  author={Alan Edelman and T. A. Arias and Steven T. Smith},
  year={1998},
  url={https://arxiv.org/abs/physics/9806030}
}`;
const entry = new Cite(bibtex).data[0];
const library = {
  entries: new Map([[key, entry]])
};

assert.deepEqual(parseCitationCluster(`@${key}, p. 15`), [{
  key,
  prefix: "",
  suffix: ", p. 15",
  suppressed: false
}]);

const html = transformPostHtml(
  `<h4>Frobenius 度量</h4><p>参考 [@${key}]，再次参考 [@${key}, p. 15]。</p><pre><code>[@${key}]</code></pre>`,
  library,
  { sourceName: "stiefel.md" }
);

assert.match(html, new RegExp(`id="cite-${key}-1"`));
assert.match(html, new RegExp(`id="cite-${key}-2"`));
assert.match(html, new RegExp(`id="ref-${key}"`));
assert.match(html, /href="#ref-edelman1998geometryalgorithmsorthogonalityconstraints"/);
assert.match(html, /href="https:\/\/arxiv.org\/abs\/physics\/9806030"/);
assert.match(html, /href="#cite-edelman1998geometryalgorithmsorthogonalityconstraints-1"/);
assert.match(html, /<code>\[@edelman1998geometryalgorithmsorthogonalityconstraints\]<\/code>/);
assert.equal((html.match(/class="csl-entry"/g) || []).length, 1);
assert.match(html, /<h4 class="post-bibliography-title" id="references">/);
assert.match(html, /<a class="anchor" href="#references">/);
assert.equal((html.match(/id="references"/g) || []).length, 1);

for (const level of [1, 2]) {
  const sectionedHtml = transformPostHtml(
    `<h${level}>正文</h${level}><p>参考 [@${key}]。</p><h${level}>Appendix</h${level}><h${level + 1}>附录内容</h${level + 1}>`,
    library,
    { sourceName: "sections.md" }
  );
  assert.match(
    sectionedHtml,
    new RegExp(`<h${level} class="post-bibliography-title" id="references">`),
    "References should be a peer of the top-level sections, not a child of Appendix"
  );
}

const placedHtml = transformPostHtml(
  `<p>参考 [@${key}]。</p><!-- bibliography --><p>尾注之后。</p>`,
  library,
  { sourceName: "placed.md" }
);
assert.ok(
  placedHtml.indexOf('class="post-bibliography"') < placedHtml.lastIndexOf("<p>"),
  "The explicit bibliography marker should control placement"
);
assert.doesNotMatch(placedHtml, /<!-- bibliography -->/);
assert.match(placedHtml, /<h2 class="post-bibliography-title" id="references">/);

assert.throws(
  () => transformPostHtml("<p>Missing [@unknown2026].</p>", library, { sourceName: "bad.md" }),
  /bad\.md.*unknown2026/
);
