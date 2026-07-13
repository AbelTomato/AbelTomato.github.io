import { and, desc, eq } from "drizzle-orm";

import type { CommentDb } from "../db/client";
import { comments } from "../db/schema";
import type {
  CommentRepository,
  PersistedCommentInput,
} from "./commentRepository.types";
import type {
  AdminComment,
  AdminCommentStatus,
  PublicComment,
} from "../types/comments";

export function createDrizzleCommentRepository(
  db: CommentDb,
): CommentRepository {
  return {
    async listApprovedByPostSlug(postSlug) {
      const rows = await db
        .select({
          id: comments.id,
          postSlug: comments.postSlug,
          parentId: comments.parentId,
          authorName: comments.authorName,
          content: comments.content,
          createdAt: comments.createdAt,
        })
        .from(comments)
        .where(
          and(eq(comments.postSlug, postSlug), eq(comments.status, "approved")),
        )
        .orderBy(desc(comments.createdAt));

      return rows.map(toPublicComment);
    },

    async listByStatus(status) {
      const rows = await db
        .select({
          id: comments.id,
          postSlug: comments.postSlug,
          parentId: comments.parentId,
          authorName: comments.authorName,
          authorEmailHash: comments.authorEmailHash,
          content: comments.content,
          status: comments.status,
          ipHash: comments.ipHash,
          userAgentHash: comments.userAgentHash,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
        })
        .from(comments)
        .where(eq(comments.status, status))
        .orderBy(desc(comments.createdAt));

      return rows.map(toAdminComment);
    },

    async createPending(input) {
      await db.insert(comments).values({
        postSlug: input.postSlug,
        parentId: input.parentId,
        authorName: input.authorName,
        authorEmailHash: input.authorEmailHash,
        content: input.content,
        ipHash: input.ipHash,
        userAgentHash: input.userAgentHash,
        status: "pending",
      });
    },

    async updateStatus(id, status) {
      const rows = await db
        .update(comments)
        .set({ status, updatedAt: new Date() })
        .where(eq(comments.id, id))
        .returning({ id: comments.id });

      return rows.length > 0;
    },
  };
}

type PublicCommentRow = Pick<
  PersistedCommentInput,
  "postSlug" | "parentId" | "authorName" | "content"
> & {
  id: string;
  createdAt: Date;
};

function toPublicComment(row: PublicCommentRow): PublicComment {
  return {
    id: row.id,
    postSlug: row.postSlug,
    parentId: row.parentId,
    authorName: row.authorName,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

type AdminCommentRow = PublicCommentRow & {
  status: AdminCommentStatus;
  authorEmailHash: string | null;
  ipHash: string | null;
  userAgentHash: string | null;
  updatedAt: Date;
};

function toAdminComment(row: AdminCommentRow): AdminComment {
  return {
    ...toPublicComment(row),
    status: row.status,
    authorEmailHash: row.authorEmailHash,
    ipHash: row.ipHash,
    userAgentHash: row.userAgentHash,
    updatedAt: row.updatedAt.toISOString(),
  };
}