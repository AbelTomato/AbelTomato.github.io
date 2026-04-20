import React from "react";
import { type WakaData } from "../hooks/useWakaData";

interface CodeStatsProps {
  stats: WakaData["stats"];
}

export const CodeStats = ({ stats }: CodeStatsProps) => {
  const defaultContainer =
    "bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm";
  const defaultHour =
    "text-2xl font-black text-indigo-600 dark:text-indigo-400";
  const defaultMin = "text-xs text-slate-400 dark:text-slate-500 ml-1";
  const defaultDays = "text-slate-400";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        {
          title: "总编码时长",
          data: stats?.all_time,
          containerClass:
            "col-span-2 sm:col-span-1 bg-emerald-50 dark:bg-black border-l-4 border-emerald-500 p-5 rounded-2xl shadow-inner shadow-emerald-100 dark:shadow-none text-slate-900 dark:text-white transition-colors duration-300",
          hourClass:
            "text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono", // 小时：浅绿深绿切换
          minClass:
            "text-xs text-emerald-700/80 dark:text-slate-400 ml-1 font-mono", // 分钟：微调
          daysClass: "text-emerald-800/60 dark:text-slate-500",
          isMain: true,
        },
        {
          title: "最近一周",
          data: stats?.last_7_days,
          containerClass: defaultContainer,
          hourClass: defaultHour,
          minClass: defaultMin,
          daysClass: defaultDays,
        },
        {
          title: "最近一月",
          data: stats?.last_30_days,
          containerClass: defaultContainer,
          hourClass: defaultHour,
          minClass: defaultMin,
          daysClass: defaultDays,
        },
        {
          title: "年度累计",
          data: stats?.last_365_days,
          containerClass: defaultContainer,
          hourClass: defaultHour,
          minClass: defaultMin,
          daysClass: defaultDays,
        },
      ].map((item) => {
        const timeText = item.data?.total_text || "0h 0m";
        const [h, m] = timeText.includes(" ")
          ? timeText.split(" ")
          : [timeText, "0m"];

        return (
          <div className={item.containerClass}>
            <p
              className={`text-[10px] font-bold uppercase tracking-wider ${item.isMain ? "text-slate-400" : "text-slate-500"}`}
            >
              {item.title}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={item.hourClass}>{h}</span>
              <span className={item.minClass}>{m}</span>
              <span className={`text-[10px] ml-1.5 ${item.daysClass}`}>
                / {item.data?.days_active || 0}d
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
