import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export interface ColumnReference {
  slug: string;
  order: number;
}

export interface ColumnDefinition {
  slug: string;
  title: string;
  description: string;
  order: number;
}

export interface ColumnSummary {
  definition: ColumnDefinition;
  posts: BlogPost[];
  postCount: number;
}