import { z } from "zod";

export const listCommentsQuerySchema = z.object({
  postSlug: z.string().trim().min(1).max(512),
});

export const createCommentBodySchema = z.object({
  postSlug: z.string().trim().min(1).max(512),
  parentId: z.uuid().optional().nullable().default(null),
  authorName: z.string().trim().min(1).max(64),
  authorEmail: z.email().max(254).optional().nullable().transform((value) => value || null),
  content: z.string().trim().min(1).max(2000),
  turnstileToken: z.string().trim().min(1).optional(),
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;