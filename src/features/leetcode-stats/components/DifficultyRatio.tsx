import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart";

interface DifficultyRatioProps {
  numAcQuestions: Array<{
    count: number;
    difficulty: string;
  }>;
}

const chartConfig = {
  easy: { label: "简单 (EASY)", color: "hsl(var(--emerald-500, 142 70% 45%))" },
  medium: {
    label: "中等 (MEDIUM)",
    color: "hsl(var(--amber-500, 24.5 95% 53%))",
  },
  hard: {
    label: "困难 (HARD)",
    color: "hsl(var(--rose-500, 346.8 77.2% 49.8%))",
  },
};

export default function DifficultyRatio({
  numAcQuestions,
}: DifficultyRatioProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const easyCount =
    numAcQuestions.find((q) => q.difficulty === "EASY")?.count || 0;
  const mediumCount =
    numAcQuestions.find((q) => q.difficulty === "MEDIUM")?.count || 0;
  const hardCount =
    numAcQuestions.find((q) => q.difficulty === "HARD")?.count || 0;
  const totalAc = easyCount + mediumCount + hardCount;

  const pieData = [
    { name: "简单", value: easyCount, color: chartConfig.easy.color },
    { name: "中等", value: mediumCount, color: chartConfig.medium.color },
    { name: "困难", value: hardCount, color: chartConfig.hard.color },
  ];

  return (
    <div className="md:col-span-5 flex flex-col items-center justify-center border rounded-2xl p-6 min-h-70 bg-zinc-50/50 border-zinc-100 dark:bg-zinc-900/10 dark:border-zinc-900">
      <div className="flex items-center gap-1.5 text-xs font-bold mb-4 self-start px-2 text-zinc-500 dark:text-zinc-400">
        <PieIcon className="h-3.5 w-3.5 text-emerald-500" />
        <span>Difficulty Ratio</span>
      </div>

      <div className="h-44 w-full relative">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                wrapperStyle={{ pointerEvents: "none" }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="bg-white border-zinc-200 text-zinc-800 shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={75}
                strokeWidth={4}
                stroke="currentColor"
                className="text-white dark:text-zinc-950 focus:outline-none"
                onMouseLeave={() => setActiveIndex(null)}
              >
                {pieData.map((entry, index) => {
                  const isHovered = activeIndex === index;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      style={{
                        transform: isHovered ? "scale(1.04)" : "scale(1)",
                        transformOrigin: "center",
                        transition:
                          "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black tracking-tighter font-mono text-zinc-900 dark:text-zinc-100">
            {totalAc}
          </span>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
            Solved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
        {[
          {
            label: "EASY",
            count: easyCount,
            color: "text-emerald-500",
            index: 0,
          },
          {
            label: "MIDDLE",
            count: mediumCount,
            color: "text-amber-500",
            index: 1,
          },
          {
            label: "HARD",
            count: hardCount,
            color: "text-rose-500",
            index: 2,
          },
        ].map((box, idx) => {
          const isLinked = activeIndex === box.index;
          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border shadow-sm transition-all duration-200 dark:shadow-none ${
                isLinked
                  ? "bg-zinc-100/80 border-zinc-300 scale-105 dark:bg-zinc-800 dark:border-zinc-700"
                  : "bg-white border-zinc-100 dark:bg-zinc-900/30 dark:border-zinc-900"
              }`}
            >
              <div className={`text-[10px] font-bold ${box.color}`}>
                {box.label}
              </div>
              <div className="text-sm font-black font-mono mt-0.5">
                {box.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
