import { z } from "zod";

export const adminLoginBodySchema = z.object({
  password: z.string().min(1),
});

export const adminCommentStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "deleted",
]);

export const adminCommentsQuerySchema = z.object({
  status: adminCommentStatusSchema.default("pending"),
});

export const updateCommentStatusBodySchema = z.object({
  status: adminCommentStatusSchema,
});

export type AdminCommentStatusInput = z.infer<typeof adminCommentStatusSchema>;