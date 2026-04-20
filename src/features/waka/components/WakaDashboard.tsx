import React, { useEffect, useState } from "react";
import { useWakaData, type WakaData } from "../hooks/useWakaData";
import { CodeReport } from "./CodeReport";
import { CodeStats } from "./CodeStats";
import { LanguageStats } from "./LanguageStats";
import { ActiveTrend } from "./ActiveTrend";
import { HeatMap } from "./HeatMap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function WakaDashBoard() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

function DashboardContent() {
  const { data, isLoading, error } = useWakaData(); // 爬取数据

  // 处理加载中和异常
  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !data)
    return <div className="p-10 text-center text-red-500">数据加载异常</div>;

  const { lastUpdate, stats, weekly = [], languages = [], heatmap = [] } = data; // 解构赋值拿到数据

  // 判断数据是否缺失
  const hadData =
    Array.isArray(weekly) &&
    weekly.length > 0 &&
    Array.isArray(languages) &&
    languages.length > 0 &&
    Array.isArray(heatmap) &&
    heatmap.length > 0;

  const maxSeconds = hadData
    ? Math.max(...weekly.map((d) => d.seconds ?? 0), 3600)
    : 3600;

  const totalLangSeconds = hadData
    ? languages.reduce((acc, l) => acc + (l.total_seconds ?? 0), 0)
    : 1;

  const weeklyTotalHours = hadData
    ? (weekly.reduce((sum, d) => sum + (d.seconds ?? 0), 0) / 3600).toFixed(1)
    : "0.0";

  const getHeatColor = (sec: number, maxSec: number = 60): string | null => {
    if (sec === 0) return null;
    const intensity = Math.min(sec / maxSec, 1);
    const lightness = 30 + intensity * 40;
    return `hsl(220, 80%, ${lightness}%)`;
  };

  return hadData ? (
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-sans">
      <CodeReport lastUpdate={lastUpdate} />

      <CodeStats stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LanguageStats
          languages={languages}
          totalLangSeconds={totalLangSeconds}
        />

        <ActiveTrend
          weeklyTotalHours={weeklyTotalHours}
          weekly={weekly}
          maxSeconds={maxSeconds}
        />
      </div>

      <HeatMap
        heatmap={heatmap}
        getHeatColor={getHeatColor}
        maxSeconds={maxSeconds}
      />
    </div>
  ) : (
    <div className="p-10 text-center text-red-500 bg-red-50 rounded-3xl border border-red-200 max-w-4xl mx-auto">
      <p className="font-bold text-2xl mb-4">数据加载异常</p>
    </div>
  );
}
