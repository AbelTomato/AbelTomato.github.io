import React, { useMemo } from "react";
import { useTimeMetrics } from "@src/hooks/useTimeMetrics";
import { useFetchGithubStats } from "@src/hooks/useFetchGithubStats";

interface SiteStatsCardProps {
  articleCount?: number;
  tagCount?: number;
  wordCount?: number;
  createTime: string;
}

const formatWordCount = (count: number) => {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
  return count.toLocaleString();
};

export const SiteStatsCard: React.FC<SiteStatsCardProps> = ({
  articleCount = 0,
  tagCount = 0,
  wordCount = 0,
  createTime,
}) => {
  const { daysDiff: runtimeDays, formatDate } = useTimeMetrics({
    targetDate: createTime,
  });

  const lastActiveTime = useFetchGithubStats().lastActiveTime;
  const formattedLastActiveTime = lastActiveTime
    ? formatDate(
        lastActiveTime,
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
        "zh-CN",
      ).replaceAll("/", ".")
    : "--";

  const displayedWordCount = useMemo(
    () => formatWordCount(wordCount),
    [wordCount],
  );

  return (
    <div className="w-full min-w-0 max-w-sm overflow-hidden rounded-xl border border-zinc-200/60 bg-white/45 p-5 font-sans shadow-sm backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/45">
      <h3 className="mb-4 min-w-0 break-words text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        站点统计
      </h3>

      <div className="mb-6 grid min-w-0 grid-cols-3 gap-2 text-center">
        <div className="flex min-w-0 flex-col">
          <span className="min-w-0 max-w-full break-all text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {articleCount}
          </span>
          <span className="mt-1 min-w-0 max-w-full break-words text-xs text-zinc-400">
            文章数
          </span>
        </div>
        <div className="flex min-w-0 flex-col border-x border-zinc-100 dark:border-zinc-800">
          <span className="min-w-0 max-w-full break-all text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {tagCount}
          </span>
          <span className="mt-1 min-w-0 max-w-full break-words text-xs text-zinc-400">
            标签数
          </span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="min-w-0 max-w-full whitespace-nowrap text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {displayedWordCount}
          </span>
          <span className="mt-1 min-w-0 max-w-full break-words text-xs text-zinc-400">
            总字数
          </span>
        </div>
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800 my-4" />

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="shrink-0 whitespace-nowrap">运行天数：</span>
          <span className="min-w-0 truncate text-right font-bold">
            {runtimeDays} 天
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="shrink-0 whitespace-nowrap">上次活跃：</span>
          <span
            className="min-w-0 flex-1 truncate text-right font-mono text-xs whitespace-nowrap"
            title={formattedLastActiveTime}
          >
            {formattedLastActiveTime}
          </span>
        </div>
      </div>
    </div>
  );
};
