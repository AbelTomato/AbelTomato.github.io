import React from "react";
import wakaData from "../data/wakatime.json";

const data = wakaData ?? {};
const { lastUpdate, stats, weekly = [], languages = [], heatmap = [] } = data;

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

export default function WakaDashBoard() {
  return hadData ? (
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-sans">
      <CodeReport />
      <CodeStats />
      <LangAndTrend />
      <HeatMap />
    </div>
  ) : (
    <div className="p-10 text-center text-red-500 bg-red-50 rounded-3xl border border-red-200 max-w-4xl mx-auto">
      <p className="font-bold text-2xl mb-4">数据加载异常</p>
    </div>
  );
}

function CodeReport() {
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
}

function CodeStats() {
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
}

function LangAndTrend() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LanguageStats />
      <ActiveTrend />
    </div>
  );
}

function LanguageStats() {
  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2 italic">
        # Languages
      </h3>

      <div className="space-y-4 max-h-55 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
        {languages.map((lang, index) => (
          <div className="group relative">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {lang.name}
              </span>
              <span className="text-slate-500 dark:text:slate-400 font-mono">
                {(lang.total_seconds / 3600).toFixed(1)}h
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500/80 group-hover:bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${(lang.total_seconds / totalLangSeconds) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveTrend() {
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
}

function HeatMap() {
  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
      <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest italic">
        Coding Heatmap / {heatmap.length} Days Recorded
      </h3>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {heatmap.map((day, index) => (
          <div className="group relative" key={index}>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 whitespace-nowrap shadow-lg">
              {day.date}: {(day.seconds / 3600).toFixed(1)}h
            </div>
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-all group-hover:ring-2 group-hover:ring-blue-400 bg-slate-800"
              style={{
                backgroundColor:
                  getHeatColor(day.seconds, maxSeconds) ?? undefined,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
