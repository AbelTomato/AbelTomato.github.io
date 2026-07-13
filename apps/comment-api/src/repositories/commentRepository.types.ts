import type {
  AdminComment,
  AdminCommentStatus,
  PublicComment,
} from "../types/comments";

export interface PersistedCommentInput {
  postSlug: string;
  parentId: string | null;
  authorName: string;
  authorEmailHash: string | null;
  content: string;
  ipHash: string | null;
  userAgentHash: string | null;
}

export interface CommentRepository {
  listApprovedByPostSlug(postSlug: string): Promise<PublicComment[]>;
  listByStatus(status: AdminCommentStatus): Promise<AdminComment[]>;
  createPending(input: PersistedCommentInput): Promise<void>;
  updateStatus(id: string, status: AdminCommentStatus): Promise<boolean>;
}