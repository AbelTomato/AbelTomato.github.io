import type { AdminComment, AdminCommentStatus } from "./adminTypes";

const apiBase = import.meta.env.PUBLIC_COMMENT_API_URL ?? "";

interface ApiErrorResponse {
  error?: { message?: string };
}

async function readResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "请求失败，请稍后重试");
  }

  return data;
}

export async function adminLogin(password: string): Promise<string> {
  const response = await fetch(`${apiBase}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = (await readResponse(response)) as { token?: string };

  if (!data.token) {
    throw new Error("登录响应无效");
  }

  return data.token;
}

export async function fetchAdminComments(
  token: string,
  status: AdminCommentStatus,
): Promise<AdminComment[]> {
  const response = await fetch(`${apiBase}/api/admin/comments?status=${status}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const data = (await readResponse(response)) as { comments?: AdminComment[] };
  return data.comments ?? [];
}

export async function updateAdminCommentStatus(
  token: string,
  id: string,
  status: AdminCommentStatus,
): Promise<void> {
  const response = await fetch(`${apiBase}/api/admin/comments/${id}/status`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  await readResponse(response);
}
