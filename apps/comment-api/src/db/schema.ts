import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const commentStatusEnum = pgEnum("comment_status", [
  "pending",
  "approved",
  "rejected",
  "deleted",
]);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postSlug: text("post_slug").notNull(),
    parentId: uuid("parent_id"),
    authorName: varchar("author_name", { length: 64 }).notNull(),
    authorEmailHash: varchar("author_email_hash", { length: 64 }),
    content: text("content").notNull(),
    status: commentStatusEnum("status").notNull().default("pending"),
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgentHash: varchar("user_agent_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("comments_post_status_created_idx").on(
      table.postSlug,
      table.status,
      table.createdAt.desc(),
    ),
    index("comments_status_created_idx").on(
      table.status,
      table.createdAt.desc(),
    ),
    index("comments_parent_idx").on(table.parentId),
  ],
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, {
    relationName: "commentReplies",
  }),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type CommentStatus = (typeof commentStatusEnum.enumValues)[number];