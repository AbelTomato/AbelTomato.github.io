import React, { useMemo, useState } from "react";
import { useWakaData } from "../hooks/useWakaData";
import { CodeReport } from "./CodeReport";
import { CodeStats } from "./CodeStats";
import { LanguageStats } from "./LanguageStats";
import { ActiveTrend } from "./ActiveTrend";
import { HeatMap } from "./HeatMap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Code } from "astro:components";

export default function WakaDashboard() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

function DashboardContent() {
  const { data, isLoading, error } = useWakaData();

  const dashboardState = useMemo(() => {
    if (!data) {
      return {
        hasData: false,
        totalLangSeconds: 1,
        weeklyTotalHours: "0.0",
      };
    }

    const {
      lastUpdate,
      stats,
      weekly = [],
      languages = [],
      heatmap = [],
    } = data;

    const hasData =
      Array.isArray(weekly) &&
      weekly.length > 0 &&
      Array.isArray(languages) &&
      languages.length > 0 &&
      Array.isArray(heatmap) &&
      heatmap.length > 0;

    if (!hasData) {
      return {
        hasData: false,
        totalLangSeconds: 1,
        weeklyTotalHours: "0.0",
      };
    }

    const totalLangSeconds = languages.reduce(
      (acc, l) => acc + (l.total_seconds ?? 0),
      0,
    );

    const weeklyTotalHours = (
      weekly.reduce((sum, d) => sum + (d.seconds ?? 0), 0) / 3600
    ).toFixed(1);

    return {
      hasData,
      lastUpdate,
      stats,
      weekly,
      languages,
      heatmap,
      totalLangSeconds: totalLangSeconds > 0 ? totalLangSeconds : 1,
      weeklyTotalHours,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center text-sm text-muted-foreground font-mono animate-pulse">
        Fetching WakaTime pulses...
      </div>
    );
  }

  if (error || !dashboardState.hasData) {
    return (
      <div className="mx-auto max-w-md my-12 p-6 text-center border rounded-xl bg-destructive/5 border-destructive/20">
        <p className="font-semibold text-destructive mb-1">数据链路中断</p>
        <p className="text-xs text-muted-foreground">请检查API密钥配置</p>
      </div>
    );
  }

  const {
    lastUpdate,
    stats,
    weekly,
    languages,
    heatmap,
    totalLangSeconds,
    weeklyTotalHours,
  } = dashboardState;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 antialiased selection:bg-primary/10">
      <CodeReport lastUpdate={lastUpdate} />

      <CodeStats stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <LanguageStats
          languages={languages}
          totalLangSeconds={totalLangSeconds}
        />

        <ActiveTrend weeklyTotalHours={weeklyTotalHours} weekly={weekly} />
      </div>

      <div className="w-full">
        <HeatMap heatmap={heatmap} />
      </div>
    </div>
  );
}
