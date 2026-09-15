import type {
  BlogPost,
  ColumnDefinition,
  ColumnSummary,
} from "./types";

function comparePosts(a: BlogPost, b: BlogPost): number {
  const orderDifference =
    (a.data.column?.order ?? Number.MAX_SAFE_INTEGER) -
    (b.data.column?.order ?? Number.MAX_SAFE_INTEGER);

  if (orderDifference !== 0) return orderDifference;

  const dateDifference = a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
  if (dateDifference !== 0) return dateDifference;

  return a.id.localeCompare(b.id);
}

export function getColumnPosts(
  posts: BlogPost[],
  columnSlug: string,
): BlogPost[] {
  return posts
    .filter((post) => post.data.column?.slug === columnSlug)
    .sort(comparePosts);
}

export function getColumnSummaries(
  posts: BlogPost[],
  definitions: ColumnDefinition[],
): ColumnSummary[] {
  return [...definitions]
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
    .map((definition) => {
      const columnPosts = getColumnPosts(posts, definition.slug);

      return {
        definition,
        posts: columnPosts,
        postCount: columnPosts.length,
      };
    });
}

export function getColumnDefinition(
  definitions: ColumnDefinition[],
  columnSlug: string,
): ColumnDefinition | undefined {
  return definitions.find((definition) => definition.slug === columnSlug);
}

export function validateColumnReferences(
  posts: BlogPost[],
  definitions: ColumnDefinition[],
): void {
  const definitionSlugs = new Set(definitions.map((definition) => definition.slug));
  const ordersByColumn = new Map<string, Map<number, string>>();

  for (const post of posts) {
    const column = post.data.column;
    if (!column) continue;

    if (!definitionSlugs.has(column.slug)) {
      throw new Error(
        `Article "${post.id}" references unknown column "${column.slug}"`,
      );
    }

    const orders = ordersByColumn.get(column.slug) ?? new Map<number, string>();
    const duplicatePostId = orders.get(column.order);

    if (duplicatePostId) {
      throw new Error(
        `Column "${column.slug}" has duplicate order ${column.order} in articles "${duplicatePostId}" and "${post.id}"`,
      );
    }

    orders.set(column.order, post.id);
    ordersByColumn.set(column.slug, orders);
  }
}