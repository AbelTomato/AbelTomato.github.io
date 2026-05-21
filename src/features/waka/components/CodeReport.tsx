import React from "react";
import { type WakaData } from "../hooks/useWakaData";

interface CodeReportProps {
  lastUpdate?: WakaData["lastUpdate"];
}

export const CodeReport = ({ lastUpdate }: CodeReportProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1 border-b pb-4 border-border">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          编码报告
        </h1>
        <p className="text-sm text-muted-foreground">
          基于 WakaTime 的自动化数据面板
        </p>
      </div>

      {lastUpdate && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Last synced:</span>
          <time
            dateTime={new Date(lastUpdate ?? "1145-1-4").toISOString()}
            className="font-semibold"
          >
            {new Date(lastUpdate ?? "1145-1-4").toLocaleString("zh-CN", {
              timeZone: "Asia/Shanghai",
              hour12: false,
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
      )}
    </div>
  );
};
