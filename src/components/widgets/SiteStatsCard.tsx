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

  const displayedWordCount = useMemo(
    () => formatWordCount(wordCount),
    [wordCount],
  );

  return (
    <div className="w-full max-w-sm rounded-xl border border-zinc-200/60 bg-white/45 p-5 font-sans shadow-sm backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/45">
      <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
        站点统计
      </h3>

      <div className="grid grid-cols-3 gap-2 text-center mb-6">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {articleCount}
          </span>
          <span className="text-xs text-zinc-400 mt-1">文章数</span>
        </div>
        <div className="flex flex-col border-x border-zinc-100 dark:border-zinc-800">
          <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {tagCount}
          </span>
          <span className="text-xs text-zinc-400 mt-1">标签数</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {formatWordCount(wordCount)}
          </span>
          <span className="text-xs text-zinc-400 mt-1">总字数</span>
        </div>
      </div>

      <hr className="border-zinc-100 dark:border-zinc-800 my-4" />

      <div className="space-y-2 mt-4 text-sm">
        <div className="flex justify-between">
          <span>运行天数：</span>
          <span className="font-bold">{runtimeDays} 天</span>
        </div>

        <div className="flex justify-between">
          <span>上次活跃：</span>
          <span className="font-mono text-xs">
            {formatDate(
              lastActiveTime,
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
              "zh-CN",
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
