const assert = require('node:assert/strict');

const {
  filterPostsByCategories,
  shouldExcludePost
} = require('../scripts/generators/reading-index-filter');

function postWithCategories(names, title = names.join(',')) {
  return {
    title,
    categories: {
      toArray() {
        return names.map((name) => ({ name, slug: name }));
      }
    }
  };
}

assert.equal(
  shouldExcludePost(postWithCategories(['Reading']), ['Reading']),
  true,
  'Reading posts should be excluded from the home index'
);

assert.equal(
  shouldExcludePost(postWithCategories(['数学']), ['Reading']),
  false,
  'Non-Reading posts should remain on the home index'
);

assert.equal(
  shouldExcludePost(postWithCategories([]), ['Reading']),
  false,
  'Uncategorized posts should remain on the home index'
);

assert.deepEqual(
  filterPostsByCategories([
    postWithCategories(['Reading'], 'book note'),
    postWithCategories(['OS'], 'os note'),
    postWithCategories(['Reading', 'Essay'], 'reading essay')
  ], ['Reading']).map((post) => post.title),
  ['book note', 'reading essay'],
  'Reading index should include only Reading posts'
);
