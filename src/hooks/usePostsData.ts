import { getCollection } from "astro:content";
import { getReadingStats } from "@utils/readingTime";
import type { CollectionEntry } from "astro:content";
import { memoizeAsync } from "@utils/memoizeAsync";

interface PostsData {
  posts: CollectionEntry<"blog">[];
  allTags: string[];
  tagCountsMap: Record<string, number>;
  maxCount: number;
  minCount: number;
  recentPosts: CollectionEntry<"blog">[];
  totalTagsCounts: number;
  totalPostsCounts: number;
  totalPostsWords: number;
  avgWords: number;
}

async function collectPostsData(): Promise<PostsData> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const allTags = [...new Set(posts.flatMap((post) => post.data.tags || []))];

  const tagCountsMap = posts
    .flatMap((post) => post.data.tags || [])
    .reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const counts = Object.values(tagCountsMap);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  const recentPosts = posts.slice(0, 5);

  const totalTagsCounts = allTags.length;
  const totalPostsCounts = posts.length;
  const totalPostsWords = posts.reduce((acc, post) => {
    const { count } = getReadingStats(post.body || "");
    return acc + count;
  }, 0);
  const avgWords =
    totalPostsCounts > 0 ? Math.round(totalPostsWords / totalPostsCounts) : 0;

  return {
    posts,
    allTags,
    tagCountsMap,
    maxCount,
    minCount,
    recentPosts,
    totalTagsCounts,
    totalPostsCounts,
    totalPostsWords,
    avgWords,
  };
}

const getBuildPostsData = memoizeAsync(collectPostsData);

export async function getPostsData(): Promise<PostsData> {
  // 开发模式不缓存，确保新增/编辑文章后统计即时更新。
  const data = await (import.meta.env.DEV ? collectPostsData() : getBuildPostsData());
  // 调用方可独立排序或筛选，避免修改构建缓存中的集合。
  return {
    ...data,
    posts: [...data.posts],
    recentPosts: [...data.recentPosts],
    allTags: [...data.allTags],
    tagCountsMap: { ...data.tagCountsMap },
  };
}
