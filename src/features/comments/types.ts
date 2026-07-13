export interface PublicComment {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface SubmitCommentInput {
  postSlug: string;
  authorName: FormDataEntryValue | null;
  authorEmail: FormDataEntryValue | null;
  content: FormDataEntryValue | null;
  turnstileToken?: string;
}

export interface SubmitCommentResult {
  status: "pending";
  message: string;
}