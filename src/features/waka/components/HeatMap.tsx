import React from "react";
import { type WakaData } from "../hooks/useWakaData";

interface HeatMapProps {
  heatmap: WakaData["heatmap"];
  getHeatColor: (sec: number, maxSec: number) => string | null;
  maxSeconds: number;
}

export const HeatMap = ({
  heatmap,
  getHeatColor,
  maxSeconds,
}: HeatMapProps) => {
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
};
