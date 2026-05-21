import React from "react";
import { type WakaData } from "../hooks/useWakaData";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { BarChart3, CalendarDays, Clock, History } from "lucide-react";

interface CodeStatsProps {
  stats?: WakaData["stats"];
}

interface StatItemProps {
  title: string;
  data?: {
    total_text?: string;
    days_active?: number;
  };
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ title, data, icon, highlight = false }: StatItemProps) {
  const timeText = data?.total_text || "0h 0m";
  const [hours, minutes] = timeText.includes(" ")
    ? timeText.split(" ")
    : [timeText, "0m"];
  const activeDays = data?.days_active || 0;

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
        highlight
          ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/5"
          : "border-border"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={highlight ? "text-emerald-500" : "text-muted-foreground"}
        >
          {icon}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl font-bold tracking-tight font-mono ${
              highlight
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-indigo-600 dark:text-indigo-400"
            }`}
          >
            {hours}
          </span>
          <span className="text-xs font-medium text-muted-foreground font-mono ml-0.5">
            {minutes}
          </span>
          <span className="text-xs text-muted-foreground/70 font-mono ml-2">
            / {activeDays}d
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export const CodeStats = ({ stats }: CodeStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="总编码时长"
        data={stats?.all_time}
        icon={<Clock className="h-4 w-full" />}
        highlight
      />
      <StatCard
        title="最近一周"
        data={stats?.last_7_days}
        icon={<History className="h-4 w-full" />}
      />
      <StatCard
        title="最近一月"
        data={stats?.last_30_days}
        icon={<CalendarDays className="h-4 w-full" />}
      />
      <StatCard
        title="最近一年"
        data={stats?.last_365_days}
        icon={<BarChart3 className="h-4 w-full" />}
      />
    </div>
  );
};
