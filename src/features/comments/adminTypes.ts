export type AdminCommentStatus = "pending" | "approved" | "rejected" | "deleted";

export interface AdminComment {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: AdminCommentStatus;
  authorEmailHash: string | null;
  ipHash: string | null;
  userAgentHash: string | null;
}
