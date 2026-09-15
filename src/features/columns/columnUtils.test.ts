import { describe, expect, it } from "vitest";
import type { BlogPost, ColumnDefinition } from "./types";
import {
  getColumnDefinition,
  getColumnPosts,
  getColumnSummaries,
  validateColumnReferences,
} from "./columnUtils";

function createPost(
  id: string,
  pubDate: string,
  column?: { slug: string; order: number },
): BlogPost {
  return {
    id,
    body: "",
    collection: "blog",
    data: {
      title: id,
      description: id,
      pubDate: new Date(pubDate),
      draft: false,
      author: "AbelTomato",
      comments: true,
      ...(column ? { column } : {}),
    },
  } as BlogPost;
}

const definitions: ColumnDefinition[] = [
  {
    slug: "max-flow",
    title: "最大流算法",
    description: "最大流算法系列",
    order: 1,
  },
  {
    slug: "frontend",
    title: "前端学习",
    description: "前端学习系列",
    order: 2,
  },
];

describe("columnUtils", () => {
  it("只返回指定专栏的文章，并按专栏顺序排列", () => {
    const posts = [
      createPost("second", "2025-01-02", { slug: "max-flow", order: 2 }),
      createPost("ordinary", "2025-01-01"),
      createPost("other", "2025-01-01", { slug: "frontend", order: 1 }),
      createPost("first", "2025-01-01", { slug: "max-flow", order: 1 }),
    ];

    expect(getColumnPosts(posts, "max-flow").map((post) => post.id)).toEqual([
      "first",
      "second",
    ]);
  });

  it("没有 column 的文章不会出现在专栏列表中", () => {
    const posts = [createPost("ordinary", "2025-01-01")];

    expect(getColumnPosts(posts, "max-flow")).toEqual([]);
  });

  it("相同 order 时使用发布日期和 id 保证稳定排序", () => {
    const posts = [
      createPost("z-post", "2025-01-02", { slug: "max-flow", order: 1 }),
      createPost("b-post", "2025-01-01", { slug: "max-flow", order: 1 }),
      createPost("a-post", "2025-01-01", { slug: "max-flow", order: 1 }),
    ];

    expect(getColumnPosts(posts, "max-flow").map((post) => post.id)).toEqual([
      "a-post",
      "b-post",
      "z-post",
    ]);
  });

  it("可以生成专栏摘要和文章数量", () => {
    const posts = [
      createPost("first", "2025-01-01", { slug: "max-flow", order: 1 }),
      createPost("second", "2025-01-02", { slug: "max-flow", order: 2 }),
    ];

    expect(getColumnSummaries(posts, definitions)).toEqual([
      {
        definition: definitions[0],
        posts: [posts[0], posts[1]],
        postCount: 2,
      },
      {
        definition: definitions[1],
        posts: [],
        postCount: 0,
      },
    ]);
  });

  it("可以查找专栏定义", () => {
    expect(getColumnDefinition(definitions, "max-flow")).toEqual(definitions[0]);
    expect(getColumnDefinition(definitions, "missing")).toBeUndefined();
  });

  it("未知专栏引用会抛出明确错误", () => {
    const posts = [
      createPost("unknown-column-post", "2025-01-01", {
        slug: "missing",
        order: 1,
      }),
    ];

    expect(() => validateColumnReferences(posts, definitions)).toThrow(
      'Article "unknown-column-post" references unknown column "missing"',
    );
  });

  it("同一专栏重复 order 会抛出明确错误", () => {
    const posts = [
      createPost("first", "2025-01-01", { slug: "max-flow", order: 1 }),
      createPost("duplicate", "2025-01-02", { slug: "max-flow", order: 1 }),
    ];

    expect(() => validateColumnReferences(posts, definitions)).toThrow(
      'Column "max-flow" has duplicate order 1 in articles "first" and "duplicate"',
    );
  });
});