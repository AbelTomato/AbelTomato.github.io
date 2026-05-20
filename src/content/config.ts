// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/index.{md,mdx}",
    base: "./src/content/blog",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date().optional(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    tags: z.string().optional(),
    count: z.number().optional(),
    minutes: z.number().optional(),
    draft: z.boolean().optional(),
    updatedDate: z.date().optional(),
  }),
});

export const collections = { blog };
