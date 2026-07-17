import type {
  PublicComment,
  SubmitCommentInput,
  SubmitCommentResult,
} from "./types";

const apiBase = import.meta.env.PUBLIC_COMMENT_API_URL ?? "";

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

export async function fetchComments(
  postSlug: string,
  signal?: AbortSignal,
): Promise<PublicComment[]> {
  const params = new URLSearchParams({ postSlug });
  const response = await fetch(`${apiBase}/api/comments?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error("评论加载失败，请稍后重试。");
  }

  const data = (await readJson(response)) as { comments?: PublicComment[] };
  return data.comments ?? [];
}

export async function submitComment(
  input: SubmitCommentInput,
): Promise<SubmitCommentResult> {
  const response = await fetch(`${apiBase}/api/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await readJson(response)) as {
    status?: "pending";
    message?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? "评论提交失败");
  }

  return {
    status: data.status ?? "pending",
    message: data.message ?? "评论已提交，审核后展示",
  };
}