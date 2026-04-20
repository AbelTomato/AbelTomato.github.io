import React from "react";
import { type WakaData } from "../hooks/useWakaData";

interface LanguageStatsProps {
  languages: WakaData["languages"];
  totalLangSeconds: number;
}

export const LanguageStats = ({
  languages,
  totalLangSeconds,
}: LanguageStatsProps) => {
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
              <span className="text-slate-500 dark:text-slate-400 font-mono">
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
};
