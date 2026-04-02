const htmlBlocks = new Map();
let htmlBlockCounter = 0;

hexo.extend.tag.register("htmlblock", function(args, content) {
  const key = `HTMLBLOCK_PLACEHOLDER_${htmlBlockCounter++}`;
  htmlBlocks.set(key, content ? content.trim() : "");
  return key;
}, { ends: true });

hexo.extend.filter.register("after_post_render", function(data) {
  if (!data || !data.content) {
    return data;
  }

  let content = data.content;
  for (const [key, html] of htmlBlocks) {
    content = content.replaceAll(`<p>${key}</p>`, html);
    content = content.replaceAll(key, html);
  }
  data.content = content;
  return data;
});
