import type { BlogPost, PostsByYearMonth } from "./types";

export function groupPostsByYearMonth(posts: BlogPost[]): PostsByYearMonth {
  return posts.reduce<PostsByYearMonth>((acc, post) => {
    const date = new Date(post.data.pubDate);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(post);

    return acc;
  }, {});
}

export function getSortedYears(postsByYearMonth: PostsByYearMonth): string[] {
  return Object.keys(postsByYearMonth).sort((a, b) => Number(b) - Number(a));
}

export function getSortedMonths(
  postsByYearMonth: PostsByYearMonth,
  year: string,
): string[] {
  return Object.keys(postsByYearMonth[year]).sort(
    (a, b) => Number(b) - Number(a),
  );
}

export function getYearPostCount(
  postsByYearMonth: PostsByYearMonth,
  year: string,
): number {
  return Object.values(postsByYearMonth[year]).reduce(
    (count, monthPosts) => count + monthPosts.length,
    0,
  );
}
