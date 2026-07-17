import { useState, useEffect, useCallback, useRef } from "react";
import { navigate } from "astro:transitions/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { HamsterLoader } from "@components/ui/HamsterLoader";
import { useMomentsData } from "@features/moments-section/hooks/useMomentsData";

const momentsImages = import.meta.glob<{ default: string }>(
  "../../features/moments-section/assets/*.{jpeg,jpg,png,gif,webp}",
  { eager: true, query: "?url" },
);

const AUTO_PLAY_INTERVAL = 4000;

const requestIdle = (callback: () => void) => {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }

  window.setTimeout(callback, 250);
};

function getMomentImageSrc(image: string) {
  const imagePath = `../../features/moments-section/assets/${image}`;
  return momentsImages[imagePath]?.default || "";
}

function preloadImage(src: string) {
  if (!src || typeof window === "undefined") return;

  const image = new Image();
  image.src = src;
  void image.decode?.().catch(() => undefined);
}

function MomentsCarouselContent() {
  const { data: moments, isLoading, error } = useMomentsData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = moments?.length ?? 0;

  // 重置自动轮播计时器
  const resetAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!isPaused && isInView && !document.hidden && total > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
      }, AUTO_PLAY_INTERVAL);
    }
  }, [isInView, isPaused, total]);

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrentIndex(((index % total) + total) % total);
    },
    [total],
  );

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrevRaw = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 手动导航 + 重置计时器
  const handlePrev = useCallback(() => {
    goPrevRaw();
    resetAutoPlay();
  }, [goPrevRaw, resetAutoPlay]);

  const handleNext = useCallback(() => {
    goNext();
    resetAutoPlay();
  }, [goNext, resetAutoPlay]);

  const handleGoTo = useCallback(
    (index: number) => {
      goTo(index);
      resetAutoPlay();
    },
    [goTo, resetAutoPlay],
  );

  // 自动轮播 + 暂停/恢复
  useEffect(() => {
    if (isPaused || !isInView || total <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    resetAutoPlay();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isInView, isPaused, total, resetAutoPlay]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? true),
      { rootMargin: "160px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      } else {
        resetAutoPlay();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resetAutoPlay]);

  useEffect(() => {
    if (!moments || total === 0) return;

    const indexesToPreload = new Set([(currentIndex + 1) % total]);

    requestIdle(() => {
      indexesToPreload.forEach((index) => {
        preloadImage(getMomentImageSrc(moments[index]!.image));
      });
    });
  }, [currentIndex, moments, total]);

  // Loading
  if (isLoading) {
    return (
      <Card className="w-full max-w-sm p-5 shadow-sm">
        <div className="flex h-40 items-center justify-center">
          <HamsterLoader label="正在加载瞬间..." />
        </div>
      </Card>
    );
  }

  // Error / Empty
  if (error || !moments || total === 0) {
    return (
      <Card className="w-full max-w-sm p-5 shadow-sm">
        <div className="mx-auto p-4 text-center border rounded-xl bg-destructive/5 border-destructive/20">
          <p className="text-sm font-semibold text-destructive">获取数据失败</p>
        </div>
      </Card>
    );
  }

  const current = moments[currentIndex]!;
  const resolvedImageSrc = getMomentImageSrc(current.image);

  return (
    <Card
      ref={rootRef}
      role="link"
      tabIndex={0}
      className="w-full max-w-sm gap-0 py-0 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => {
        void navigate("/echo");
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void navigate("/echo");
        }
      }}
    >
      <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-5 pt-5 pb-3">
        # 语录
      </h3>

      <CardContent className="relative aspect-4/3 overflow-hidden bg-muted p-0">
        <img
          src={resolvedImageSrc}
          alt={current.source}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />

        {total > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 size-7 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
              aria-label="上一条"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 size-7 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
              aria-label="下一条"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </CardContent>

      <div className="p-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic mb-3 min-h-[3em]">
          "{current.text}"
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-blue-500">#{current.author}</span>
          <span className="text-zinc-400">《{current.source}》</span>
        </div>
      </div>

      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {moments.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                handleGoTo(idx);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-blue-500 w-4"
                  : "bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400"
              }`}
              aria-label={`第 ${idx + 1} 条`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default function MomentsCarousel() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MomentsCarouselContent />
    </QueryClientProvider>
  );
}
