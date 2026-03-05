// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
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
