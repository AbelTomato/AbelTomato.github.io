import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export type PostsByYearMonth = Record<string, Record<string, BlogPost[]>>;
