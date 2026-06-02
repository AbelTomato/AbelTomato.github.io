import { useState, useEffect, useCallback, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMomentsData } from "@features/moments-section/hooks/useMomentsData";

const momentsImages = import.meta.glob<{ default: string }>(
  "../../features/moments-section/assets/*.{jpeg,jpg,png,gif,webp}",
  { eager: true, query: "?url" },
);

const AUTO_PLAY_INTERVAL = 4000;

function MomentsCarouselContent() {
  const { data: moments, isLoading, error } = useMomentsData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = moments?.length ?? 0;

  // 重置自动轮播计时器
  const resetAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!isPaused && total > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
      }, AUTO_PLAY_INTERVAL);
    }
  }, [isPaused, total]);

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
    if (isPaused || total <= 1) {
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
  }, [isPaused, total, resetAutoPlay]);

  // Loading
  if (isLoading) {
    return (
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground font-mono animate-pulse">
          加载中...
        </div>
      </div>
    );
  }

  // Error / Empty
  if (error || !moments || total === 0) {
    return (
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="mx-auto p-4 text-center border rounded-xl bg-destructive/5 border-destructive/20">
          <p className="text-sm font-semibold text-destructive">获取数据失败</p>
        </div>
      </div>
    );
  }

  const current = moments[currentIndex]!;
  const imagePath = `../../features/moments-section/assets/${current.image}`;
  const resolvedImageSrc = momentsImages[imagePath]?.default || "";

  return (
    <div
      className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => {
        window.location.href = "/hobbies";
      }}
    >
      {/* 标题 */}
      <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-5 pt-5 pb-3">
        # 语录
      </h3>

      {/* 图片区 */}
      <div className="relative aspect-4/3 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          key={currentIndex}
          src={resolvedImageSrc}
          alt={current.source}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover animate-in fade-in duration-700"
        />

        {/* 左右箭头 */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              aria-label="上一条"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              aria-label="下一条"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* 文字区 */}
      <div
        key={currentIndex}
        className="p-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic mb-3 min-h-[3em]">
          "{current.text}"
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-blue-500">#{current.author}</span>
          <span className="text-zinc-400">《{current.source}》</span>
        </div>
      </div>

      {/* 圆点指示器 */}
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
    </div>
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
