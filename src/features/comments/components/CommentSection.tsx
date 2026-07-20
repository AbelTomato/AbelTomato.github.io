import { useEffect, useRef, useState } from "react";
import { Copy, MessageCircle, RefreshCw, Send } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { HamsterLoader } from "@components/ui/HamsterLoader";
import { fetchComments, submitComment } from "../api";
import type { PublicComment } from "../types";
import {
  formatCommentTimestamp,
  getCommentAnchorId,
  getCommentAvatarClassName,
  getCommentAvatarInitial,
} from "../utils/commentPresentation";

interface CommentSectionProps {
  resourceId: string;
  title?: string;
  description?: string;
  emptyText?: string;
  submitLabel?: string;
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

export default function CommentSection({
  resourceId,
  title = "评论",
  description = "评论会在审核后展示",
  emptyText = "暂无评论",
  submitLabel = "提交评论",
}: CommentSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);
  const [refreshAnimationId, setRefreshAnimationId] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [turnstileState, setTurnstileState] = useState<TurnstileState>(
    turnstileSiteKey ? "loading" : "idle",
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | undefined>(undefined);
  const refreshInFlightRef = useRef(false);

  async function loadComments(signal?: AbortSignal) {
    setLoadState("loading");

    try {
      const nextComments = await fetchComments(resourceId, signal);
      if (signal?.aborted) return;
      setComments(nextComments);
      setLoadState("loaded");
    } catch {
      if (signal?.aborted) return;
      setLoadState("error");
      toast.error("评论加载失败，请稍后重试");
    } finally {
      if (!signal?.aborted) setHasCompletedInitialLoad(true);
    }
  }

  async function handleRefresh() {
    if (refreshInFlightRef.current || loadState === "loading") return;
    refreshInFlightRef.current = true;
    setRefreshAnimationId((currentId) => currentId + 1);
    try {
      await loadComments();
    } finally {
      refreshInFlightRef.current = false;
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadComments(controller.signal);
    return () => controller.abort();
  }, [resourceId]);

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
      toast.error("人机验证服务加载失败，请刷新页面后重试");
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      setSubmitState("error");
      toast.error("请先完成人机验证");
      return;
    }

    setSubmitState("submitting");

    try {
      const payload = {
        postSlug: resourceId,
        authorName: formData.get("authorName"),
        content: formData.get("content"),
        ...(turnstileToken ? { turnstileToken } : {}),
      };

      const result = await submitComment(payload);

      form.reset();
      window.turnstile?.reset(turnstileWidgetIdRef.current);
      setTurnstileToken(null);
      setSubmitState("success");
      toast.success(result.message);
    } catch (error) {
      setSubmitState("error");
      toast.error(error instanceof Error ? error.message : "评论提交失败");
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
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={loadState === "loading"}
          className="group size-9 rounded-full border-cyan-300/20 bg-slate-950/35 text-cyan-100 shadow-[inset_0_1px_rgb(255_255_255_/_0.08),0_4px_16px_rgb(8_145_178_/_0.12)] backdrop-blur-md transition-[border-color,background-color,box-shadow,color] duration-300 hover:border-cyan-200/50 hover:bg-cyan-950/40 hover:shadow-[inset_0_1px_rgb(255_255_255_/_0.12),0_8px_22px_rgb(8_145_178_/_0.28)] active:translate-y-0 active:border-cyan-200/70 active:bg-cyan-900/50 focus-visible:border-cyan-200/60 focus-visible:ring-cyan-300/40 motion-reduce:transition-none"
          aria-label="刷新评论"
          title="刷新评论"
        >
          <RefreshCw
            key={refreshAnimationId}
            className={`size-4 ${
              refreshAnimationId > 0
                ? "motion-safe:animate-[spin_500ms_ease-out_1]"
                : ""
            }`}
          />
        </Button>
      </div>

      <div className="space-y-4">
        {loadState === "loading" && !hasCompletedInitialLoad ? (
          <HamsterLoader label="正在加载评论..." />
        ) : null}

        {loadState === "loaded" && comments.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {emptyText}
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

      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-foreground/90">
          <span className="tracking-wide">
            昵称 <span className="text-destructive/70">*</span>
          </span>
          <input
            name="authorName"
            required
            maxLength={64}
            placeholder="留下你的称呼"
            className="h-11 rounded-xl border border-cyan-300/15 bg-slate-950/35 px-3.5 text-sm text-foreground shadow-inner shadow-white/[0.025] outline-none backdrop-blur-md transition-all duration-300 placeholder:text-muted-foreground/85 hover:border-cyan-200/30 hover:bg-slate-950/45 focus:border-cyan-300/55 focus:bg-slate-950/55 focus:shadow-[0_0_0_3px_rgb(34_211_238_/_0.10),0_0_24px_rgb(45_212_191_/_0.10)] focus-visible:ring-0"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground/90">
          <span className="tracking-wide">
            内容 <span className="text-destructive/70">*</span>
          </span>
          <textarea
            name="content"
            required
            maxLength={2000}
            rows={5}
            placeholder="写下想说的话..."
            className="resize-y rounded-xl border border-cyan-300/15 bg-slate-950/35 px-3.5 py-3 text-sm leading-6 text-foreground shadow-inner shadow-white/[0.025] outline-none backdrop-blur-md transition-all duration-300 placeholder:text-muted-foreground/85 hover:border-cyan-200/30 hover:bg-slate-950/45 focus:border-cyan-300/55 focus:bg-slate-950/55 focus:shadow-[0_0_0_3px_rgb(34_211_238_/_0.10),0_0_24px_rgb(45_212_191_/_0.10)] focus-visible:ring-0"
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

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="submit"
            className="h-10 rounded-full border border-cyan-200/25 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-5 text-white shadow-[0_8px_24px_rgb(8_145_178_/_0.22),inset_0_1px_rgb(255_255_255_/_0.22)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_30px_rgb(8_145_178_/_0.32),inset_0_1px_rgb(255_255_255_/_0.28)] focus-visible:ring-cyan-300/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            disabled={submitState === "submitting"}
          >
            <Send className="transition-transform duration-300 ease-out group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5 group-focus-visible/button:-translate-y-0.5 group-focus-visible/button:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/button:translate-x-0 motion-reduce:group-hover/button:translate-y-0" />
            {submitState === "submitting" ? "提交中" : submitLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}
