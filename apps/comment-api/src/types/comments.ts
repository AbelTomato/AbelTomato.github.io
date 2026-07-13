export interface PublicComment {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  postSlug: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string | null;
  content: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface CreateCommentResult {
  status: "pending";
  message: string;
}

export type AdminCommentStatus = "pending" | "approved" | "rejected" | "deleted";

export interface AdminComment extends PublicComment {
  status: AdminCommentStatus;
  authorEmailHash: string | null;
  ipHash: string | null;
  userAgentHash: string | null;
  updatedAt: string;
}