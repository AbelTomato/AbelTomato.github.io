import { useEffect, useState } from "react";
import { Check, LogIn, RefreshCw, Trash2, X } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import {
  adminLogin,
  fetchAdminComments,
  updateAdminCommentStatus,
} from "../adminApi";
import type { AdminComment, AdminCommentStatus } from "../adminTypes";

const tokenStorageKey = "comment-admin-token";
const statuses: Array<{ value: AdminCommentStatus; label: string }> = [
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已拒绝" },
  { value: "deleted", label: "已删除" },
];

export default function CommentAdmin() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [status, setStatus] = useState<AdminCommentStatus>("pending");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(window.localStorage.getItem(tokenStorageKey));
  }, []);

  async function loadComments(activeToken = token, activeStatus = status) {
    if (!activeToken) return;

    setLoading(true);
    setError("");
    try {
      setComments(await fetchAdminComments(activeToken, activeStatus));
    } catch (caught) {
      const text = caught instanceof Error ? caught.message : "评论加载失败";
      setError(text);
      if (text.includes("登录") || text.includes("认证") || text.includes("授权")) {
        window.localStorage.removeItem(tokenStorageKey);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadComments();
  }, [token, status]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const nextToken = await adminLogin(password);
      window.localStorage.setItem(tokenStorageKey, nextToken);
      setToken(nextToken);
      setPassword("");
      setMessage("登录成功");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: string, nextStatus: AdminCommentStatus) {
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      await updateAdminCommentStatus(token, id, nextStatus);
      setMessage(nextStatus === "approved" ? "评论已通过" : "评论已删除");
      await loadComments(token, status);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setComments([]);
    setMessage("已退出登录");
  }

  if (!token) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>评论管理登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <label className="grid gap-2 text-sm font-medium">
              管理员密码
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <Button type="submit" disabled={loading}>
              <LogIn />
              {loading ? "登录中" : "登录"}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="评论状态筛选">
          {statuses.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={status === item.value ? "default" : "outline"}
              onClick={() => setStatus(item.value)}
              disabled={loading}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => void loadComments()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            刷新
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={logout}>
            退出
          </Button>
        </div>
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <div className="max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : null}
      {loading && comments.length === 0 ? <p className="py-8 text-center font-mono text-sm text-muted-foreground animate-pulse">正在加载评论...</p> : null}
      {!loading && comments.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">没有{statuses.find((item) => item.value === status)?.label}评论。</p> : null}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span>{comment.authorName}</span>
                <time className="text-xs font-normal text-muted-foreground">
                  {new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(comment.createdAt))}
                </time>
              </CardTitle>
              <p className="break-all font-mono text-xs font-normal text-muted-foreground">/{comment.postSlug}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm leading-7">{comment.content}</p>
              {status !== "deleted" ? (
                <div className="flex flex-wrap gap-2">
                  {status !== "approved" ? (
                    <Button type="button" size="sm" onClick={() => void changeStatus(comment.id, "approved")} disabled={loading}>
                      <Check />通过
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" onClick={() => void changeStatus(comment.id, "deleted")} disabled={loading}>
                    {status === "pending" ? <X /> : <Trash2 />}删除
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
