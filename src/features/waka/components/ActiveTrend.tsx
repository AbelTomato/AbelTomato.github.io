import React from "react";
import { type WakaData } from "../hooks/useWakaData";

interface ActiveTrendProps {
  weeklyTotalHours: string;
  weekly: WakaData["weekly"];
  maxSeconds: number;
}

export const ActiveTrend = ({
  weeklyTotalHours,
  weekly,
  maxSeconds,
}: ActiveTrendProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm dark:-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-blue-400">
            活跃趋势
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            最近一周编码时长
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-black dark:text-white">
            {weeklyTotalHours}h
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">本周总计</p>
        </div>
      </div>

      <div className="flex items-end justify-between h-40 gap-3 relative z-10">
        {weekly.map((day, index) => (
          <div className="flex-1 flex flex-col items-center group/bar relative h-full">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] py-1 px-2 rounded shadow-xl opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-2 transition-all pointer-events-none z-20 whitespace-nowrap border border-slate-200 dark:border-slate-700">
              {day.text}
            </div>

            <div className="w-full bg-slate-900/50 rounded-t-xl relative flex-1 flex flex-col justify-end overflow-hidden border border-white/5">
              <div
                className="w-full bg-linear-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 transition-all duration-1000 ease-out min-h-1"
                style={{ height: `${(day.seconds / maxSeconds) * 100}%` }}
              />
            </div>
            <span className="text-[10px] mt-3 font-medium text-slate-500">
              {day.date.split("-").slice(1).join("/")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
