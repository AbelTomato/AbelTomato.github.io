import { useEffect, useRef, useState } from "react";
import { MessageCircle, RefreshCw, Send } from "lucide-react";

import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { fetchComments, submitComment } from "../api";
import type { PublicComment } from "../types";

interface CommentSectionProps {
  postSlug: string;
}

type LoadState = "idle" | "loading" | "loaded" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as
  | string
  | undefined;

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | undefined>(undefined);

  async function loadComments() {
    setLoadState("loading");

    try {
      setComments(await fetchComments(postSlug));
      setLoadState("loaded");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    void loadComments();
  }, [postSlug]);

  useEffect(() => {
    if (!turnstileSiteKey || !window.turnstile || !turnstileContainerRef.current) {
      return;
    }

    if (turnstileWidgetIdRef.current) {
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey: turnstileSiteKey,
        callback: setTurnstileToken,
      },
    );
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (turnstileSiteKey && !turnstileToken) {
      setSubmitState("error");
      setMessage("请先完成人机验证");
      return;
    }

    setSubmitState("submitting");
    setMessage("");

    try {
      const payload = {
        postSlug,
        authorName: formData.get("authorName"),
        authorEmail: formData.get("authorEmail") || null,
        content: formData.get("content"),
        ...(turnstileToken ? { turnstileToken } : {}),
      };

      const result = await submitComment(payload);

      event.currentTarget.reset();
      window.turnstile?.reset(turnstileWidgetIdRef.current);
      setTurnstileToken(null);
      setSubmitState("success");
      setMessage(result.message);
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "评论提交失败");
    }
  }

  return (
    <section className="mx-auto mt-14 max-w-none border-t pt-10">
      {turnstileSiteKey ? (
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      ) : null}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <MessageCircle className="size-5" aria-hidden="true" />
            评论
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            评论会在审核后展示。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadComments()}
          disabled={loadState === "loading"}
          aria-label="刷新评论"
        >
          <RefreshCw className={loadState === "loading" ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="space-y-4">
        {loadState === "loading" ? (
          <p className="py-6 text-center font-mono text-sm text-muted-foreground animate-pulse">
            正在加载评论...
          </p>
        ) : null}

        {loadState === "error" ? (
          <div className="mx-auto max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            评论加载失败，请稍后重试。
          </div>
        ) : null}

        {loadState === "loaded" && comments.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            暂无评论。
          </p>
        ) : null}

        {comments.map((comment) => (
          <Card key={comment.id} size="sm">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span>{comment.authorName}</span>
                <time className="text-xs font-normal text-muted-foreground">
                  {new Intl.DateTimeFormat("zh-CN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(comment.createdAt))}
                </time>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                {comment.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            昵称
            <input
              name="authorName"
              required
              maxLength={64}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            邮箱
            <input
              name="authorEmail"
              type="email"
              maxLength={254}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          内容
          <textarea
            name="content"
            required
            maxLength={2000}
            rows={5}
            className="resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>

        {turnstileSiteKey ? <div ref={turnstileContainerRef} /> : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitState === "submitting"}>
            <Send />
            {submitState === "submitting" ? "提交中" : "提交评论"}
          </Button>
          {message ? (
            <p
              className={
                submitState === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}