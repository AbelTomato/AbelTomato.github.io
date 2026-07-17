import { useEffect, useRef, useState } from "react";
import { Copy, MessageCircle, RefreshCw, Send } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { fetchComments, submitComment } from "../api";
import type { PublicComment } from "../types";
import {
  formatCommentTimestamp,
  getCommentAnchorId,
  getCommentAvatarClassName,
  getCommentAvatarInitial,
} from "../utils/commentPresentation";

interface CommentSectionProps {
  postSlug: string;
}

type LoadState = "idle" | "loading" | "loaded" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";
type TurnstileState = "idle" | "loading" | "ready" | "error";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as
  | string
  | undefined;

let turnstileLoader: Promise<void> | undefined;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (turnstileLoader) return turnstileLoader;

  turnstileLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.turnstile ? resolve() : reject(new Error("人机验证服务加载失败"));
    script.onerror = () => reject(new Error("人机验证服务加载失败"));
    document.head.append(script);
  });

  return turnstileLoader;
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [turnstileState, setTurnstileState] = useState<TurnstileState>(
    turnstileSiteKey ? "loading" : "idle",
  );
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | undefined>(undefined);

  async function loadComments(signal?: AbortSignal) {
    setLoadState("loading");

    try {
      const nextComments = await fetchComments(postSlug, signal);
      if (signal?.aborted) return;
      setComments(nextComments);
      setLoadState("loaded");
    } catch {
      if (signal?.aborted) return;
      setLoadState("error");
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadComments(controller.signal);
    return () => controller.abort();
  }, [postSlug]);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return;
    let cancelled = false;

    void loadTurnstile()
      .then(() => {
        if (cancelled || !window.turnstile || !turnstileContainerRef.current)
          return;
        turnstileWidgetIdRef.current = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: turnstileSiteKey,
            callback: (token) => {
              setTurnstileToken(token);
              setTurnstileState("ready");
            },
            "expired-callback": () => setTurnstileToken(null),
            "error-callback": () => setTurnstileState("error"),
          },
        );
        setTurnstileState("ready");
      })
      .catch(() => {
        if (!cancelled) setTurnstileState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (turnstileState === "error") {
      setSubmitState("error");
      setMessage("人机验证服务加载失败，请刷新页面后重试");
      return;
    }

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

      form.reset();
      window.turnstile?.reset(turnstileWidgetIdRef.current);
      setTurnstileToken(null);
      setSubmitState("success");
      setMessage(result.message);
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "评论提交失败");
    }
  }

  function handleCommentCopy(content: string) {
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(content);
    }
  }

  return (
    <section className="mx-auto mt-14 max-w-none border-t pt-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <MessageCircle className="size-5" aria-hidden="true" />
            评论
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            评论会在审核后展示
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
          <RefreshCw
            className={loadState === "loading" ? "animate-spin" : ""}
          />
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
            评论加载失败，请稍后重试
          </div>
        ) : null}

        {loadState === "loaded" && comments.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            暂无评论
          </p>
        ) : null}

        {comments.map((comment) => {
          const anchorId = getCommentAnchorId(comment.id);

          return (
            <Card
              key={comment.id}
              id={anchorId}
              size="sm"
              className="group/card scroll-mt-6 border border-foreground/10 bg-card/70 py-0 backdrop-blur-sm transition-[transform,background-color,box-shadow] duration-200 motion-reduce:transition-none hover:-translate-y-px hover:bg-card/90 hover:shadow-lg hover:shadow-black/10 focus-within:-translate-y-px focus-within:bg-card/90 focus-within:shadow-lg focus-within:shadow-black/10"
            >
              <CardContent className="flex gap-3 p-4 sm:gap-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-sm font-semibold text-white shadow-inner shadow-white/10 ${getCommentAvatarClassName(comment.authorName)}`}
                  aria-hidden="true"
                >
                  {getCommentAvatarInitial(comment.authorName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-bold text-foreground">
                      {comment.authorName}
                    </span>
                    <time
                      className="ml-auto shrink-0 font-mono text-[10px] font-normal text-muted-foreground"
                      dateTime={comment.createdAt}
                    >
                      {formatCommentTimestamp(comment.createdAt)}
                    </time>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleCommentCopy(comment.content)}
                      className="shrink-0 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 sm:group-focus-within/card:opacity-100"
                      aria-label={`复制 ${comment.authorName} 的评论内容`}
                      title="复制评论"
                    >
                      <Copy className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                    {comment.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            <span>
              昵称 <span className="text-destructive">（必填）</span>
            </span>
            <input
              name="authorName"
              required
              maxLength={64}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors duration-200 focus:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>
              邮箱{" "}
              <span className="font-normal text-muted-foreground">
                （选填）
              </span>
            </span>
            <input
              name="authorEmail"
              type="email"
              maxLength={254}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-colors duration-200 focus:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>
            内容 <span className="text-destructive">（必填）</span>
          </span>
          <textarea
            name="content"
            required
            maxLength={2000}
            rows={5}
            className="resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </label>

        {turnstileSiteKey ? (
          <div className="space-y-2">
            <div ref={turnstileContainerRef} />
            {turnstileState === "loading" ? (
              <p className="text-sm text-muted-foreground">
                正在加载人机验证...
              </p>
            ) : null}
            {turnstileState === "error" ? (
              <p className="text-sm text-destructive">
                人机验证服务加载失败，请刷新页面后重试
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            className="rounded-md bg-blue-700 px-4 text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            disabled={submitState === "submitting"}
          >
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
