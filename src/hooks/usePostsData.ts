import { getCollection } from "astro:content";
import { getReadingStats } from "@utils/readingTime";
import type { CollectionEntry } from "astro:content";

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

export async function getPostsData(): Promise<PostsData> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  posts.sort(
    (a, b) =>
      (b.data.updatedDate || b.data.pubDate).valueOf() -
      (a.data.updatedDate || a.data.pubDate).valueOf(),
  );

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
