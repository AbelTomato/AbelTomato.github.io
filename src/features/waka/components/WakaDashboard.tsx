import React, { useMemo, useState } from "react";
import { useWakaData } from "../hooks/useWakaData";
import { CodeReport } from "./CodeReport";
import { CodeStats } from "./CodeStats";
import { LanguageStats } from "./LanguageStats";
import { ActiveTrend } from "./ActiveTrend";
import { HeatMap } from "./HeatMap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingStatus from "@components/ui/LoadingStatus";
import ErrorStatus from "@components/ui/ErrorStatus";

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
    return <LoadingStatus loadingSource="WakaTime" />;
  }

  if (error || !dashboardState.hasData) {
    return <ErrorStatus error={error} />;
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
    <div className="w-full mx-auto p-4 md:p-6 space-y-6 antialiased selection:bg-primary/10">
      <CodeReport lastUpdate={lastUpdate} />

      <CodeStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <LanguageStats
          languages={languages}
          totalLangSeconds={totalLangSeconds}
        />

        <ActiveTrend weeklyTotalHours={weeklyTotalHours} weekly={weekly} />
      </div>

      <HeatMap heatmap={heatmap} />
    </div>
  );
}
