import React from "react";
import { type WakaData } from "../hooks/useWakaData";

interface CodeReportProps {
  lastUpdate: WakaData["lastUpdate"];
}

export const CodeReport = ({ lastUpdate }: CodeReportProps) => {
  return (
    <div className="flex justify-between items-end px-2">
      <h2 className="text-2xl font-black text-slate-800 dark:text-white">
        编码报告
      </h2>

      {lastUpdate && (
        <p className="text-[10px] text-slate-400 font-mono italic">
          Last synced:{" "}
          {new Date(lastUpdate).toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour12: false,
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
};
