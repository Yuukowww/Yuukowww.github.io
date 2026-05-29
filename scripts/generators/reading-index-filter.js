"use strict";

const { readFile } = require("node:fs/promises");
const pagination = require("hexo-pagination");

function normalizeExcludedCategories(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function shouldExcludePost(post, excludedCategories) {
  if (!excludedCategories.length || !post.categories) {
    return false;
  }

  const categories = typeof post.categories.toArray === "function" ? post.categories.toArray() : post.categories;
  if (!categories.length) return false;

  const excluded = new Set(excludedCategories.map(String));
  return categories.some((category) => {
    return excluded.has(category.name) || excluded.has(category.slug);
  });
}

function getFileExtension(path) {
  const filename = path.split(/[\\/]/).pop() || "";
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex > 0 ? filename.slice(lastDotIndex + 1) : "";
}

function registerFilteredIndexGenerator(hexoInstance) {
  hexoInstance.config.index_generator = Object.assign({
    per_page: typeof hexoInstance.config.per_page === "undefined" ? 10 : hexoInstance.config.per_page,
    order_by: "-date",
    exclude_categories: []
  }, hexoInstance.config.index_generator);

  hexoInstance.extend.helper.register("getCoverExt", function(path) {
    const theme = hexoInstance.theme.config;
    if (theme.homeConfig.cateCards.length > 0) {
      const cardMap = new Map();
      theme.homeConfig.cateCards.forEach((card) => {
        cardMap.set(card.slug, card.cover);
      });
      if (cardMap.has(path)) {
        const cover = cardMap.get(path);
        return getFileExtension(cover);
      }
    }
  });

  hexoInstance.extend.generator.register("index", async function(locals) {
    const covers = [];
    const catlist = [];
    let pages;
    const config = hexoInstance.config;
    const theme = hexoInstance.theme.config;
    const excludedCategories = normalizeExcludedCategories(config.index_generator.exclude_categories);
    const shouldInclude = (post) => !shouldExcludePost(post, excludedCategories);
    const sticky = locals.posts.find({ sticky: true }).filter(shouldInclude).sort(config.index_generator.order_by);
    const posts = locals.posts.find({ sticky: { $in: [false, void 0] } }).filter(shouldInclude).sort(config.index_generator.order_by);
    const paginationDir = config.pagination_dir || "page";
    const path = config.index_generator.path || "";
    const categories = locals.categories;

    const getTopcat = function(cat) {
      if (cat.parent) {
        const pCat = categories.findOne({ _id: cat.parent });
        return getTopcat(pCat);
      }
      return cat;
    };

    if (categories && categories.length) {
      await Promise.all(
        categories.map(async (cat) => {
          if (theme.homeConfig.cateCards.length > 0) {
            const cardMap = new Map();
            theme.homeConfig.cateCards.forEach((card) => {
              cardMap.set(card.slug, card.cover);
            });
            if (cardMap.has(cat.slug)) {
              const cover = cardMap.get(cat.slug);
              const coverData = await readFile(`source/_posts/${cover}`);
              covers.push({
                path: `${cat.slug}/cover.${getFileExtension(cover)}`,
                data: coverData
              });
              const topcat = getTopcat(cat);
              if (topcat._id !== cat._id) {
                cat.top = topcat;
              }
              const child = categories.find({ parent: cat._id });
              let pl = 6;
              if (child.length !== 0) {
                cat.child = child.length;
                cat.subs = child.sort({ name: 1 }).limit(6).toArray();
                pl = Math.max(0, pl - child.length);
                if (pl > 0) {
                  cat.subs.push(...cat.posts.sort({ title: 1 }).filter((item) => {
                    return item.categories.last()._id === cat._id;
                  }).limit(pl).toArray());
                }
              } else {
                cat.subs = cat.posts.sort({ title: 1 }).limit(6).toArray();
              }
              catlist.push(cat);
            }
          }
        })
      );
    }

    if (posts.length > 0) {
      pages = pagination(path, posts, {
        perPage: config.index_generator.per_page,
        layout: ["index", "archive"],
        format: paginationDir + "/%d/",
        data: {
          __index: true,
          catlist,
          sticky
        }
      });
    } else {
      pages = [{
        path,
        layout: ["index", "archive"],
        data: {
          __index: true,
          catlist,
          sticky,
          current: 1
        }
      }];
    }

    return [...covers, ...pages];
  });
}

if (typeof hexo !== "undefined") {
  hexo.extend.filter.register("after_init", function() {
    registerFilteredIndexGenerator(hexo);
  });
}

module.exports = {
  normalizeExcludedCategories,
  shouldExcludePost,
  registerFilteredIndexGenerator
};
