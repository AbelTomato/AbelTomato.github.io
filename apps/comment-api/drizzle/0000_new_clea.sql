CREATE TYPE "public"."comment_status" AS ENUM('pending', 'approved', 'rejected', 'deleted');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_slug" text NOT NULL,
	"parent_id" uuid,
	"author_name" varchar(64) NOT NULL,
	"author_email_hash" varchar(64),
	"author_website" text,
	"content" text NOT NULL,
	"status" "comment_status" DEFAULT 'pending' NOT NULL,
	"ip_hash" varchar(64),
	"user_agent_hash" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "comments_post_status_created_idx" ON "comments" USING btree ("post_slug","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "comments_status_created_idx" ON "comments" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "comments" USING btree ("parent_id");