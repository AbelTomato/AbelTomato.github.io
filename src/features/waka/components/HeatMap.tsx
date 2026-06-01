import React, { useMemo } from "react";
import { type WakaData } from "../hooks/useWakaData";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@components/ui/card";

interface HeatMapProps {
  heatmap?: WakaData["heatmap"];
}

export const HeatMap = ({ heatmap }: HeatMapProps) => {
  const localMaxSeconds = useMemo(() => {
    if (!Array.isArray(heatmap) || heatmap.length === 0) return 3600;
    const secondsArray = heatmap.map((d) => d.seconds ?? 0);
    return Math.max(...secondsArray, 3600);
  }, [heatmap]);

  const getColor = (sec: number) => {
    if (sec === 0) {
      return {
        backgroundColor: "hsl(220, 15%, 15%)",
        opacity: 0.3,
      };
    }

    const baseIntensity = Math.min(sec / localMaxSeconds, 1);
    const visualIntensity = Math.pow(baseIntensity, 1.2);

    const saturation = 30 + visualIntensity * 65;
    const lightness = 18 + visualIntensity * 50;

    return {
      backgroundColor: `hsl(224, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`,
      opacity: 1,
    };
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-foreground">
          # Coding Heatmap
        </CardTitle>
        <CardDescription className="italic">
          {heatmap?.length || 0} DAYS RECORDED
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          {(heatmap || []).map((day) => {
            const color = getColor(day.seconds);
            const hours = (day.seconds / 3600).toFixed(1);

            return (
              <div className="group relative" key={day.date}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-30 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[10px] font-mono text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-border">
                  <span className="font-semibold">{day.date}</span>
                  <span className="ml-1.5 text-muted-foreground">{hours}h</span>
                </div>

                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-[3px] transition-all group-hover:scale-110 group-hover:ring-2 group-hover:ring-ring"
                  style={color} // 👈 必须挂载到 style 上！千万别再塞进 className 里了！
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
