import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

export async function GET(context) {
  // 1. 获取所有非草稿文章
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  // 2. 按日期排序（可选，但推荐）
  posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // 核心：添加 categories 字段，映射你的 tags
      categories: post.data.tags || [],
      link: `/blog/${post.id}/`,
      author: post.data.author || "AbelTomato",
    })),
  });
}
