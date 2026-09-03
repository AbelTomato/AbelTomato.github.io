import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

function parseBlogDate(value: string | Date): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error("Invalid blog date");
    return value;
  }

  const source = value.trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(source)
    ? new Date(`${source}T00:00:00+08:00`)
    : new Date(source);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid blog date: ${source}`);
  }

  return date;
}

const blogDate = z.union([z.string(), z.date()]).transform(parseBlogDate);

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Parse date-only values in the blog's fixed timezone.
      pubDate: blogDate,
      updatedDate: z.coerce.date().optional(),
      changelog: z
        .array(
          z.object({
            date: z.coerce.date(),
            note: z.string().min(1),
          }),
        )
        .optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional().default(false),
      author: z.string().optional().default("AbelTomato"),
      comments: z.boolean().optional().default(true),
    }),
});

export const collections = { blog };
