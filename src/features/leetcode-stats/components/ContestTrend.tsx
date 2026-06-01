import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ExternalLink, Trophy, Globe, User } from "lucide-react";

interface ContestTrendProps {
  attendedCount: number;
  rating: number;
  globalRanking: number;
  localRanking: number;
  topPercentage: number;
  rankingHistory: Array<{
    rating: number;
    ranking: number;
    score: number;
    startTime: Date;
    title: string;
  }>;
}

const userUrl = "https://leetcode.cn/u/abeltomato/";

const chartConfig = {
  rating: {
    label: "Rating",
    color: "hsl(var(--amber-500, 24.5 95% 53%))",
  },
  ranking: {
    label: "排名",
  },
  score: {
    label: "得分",
  },
} satisfies ChartConfig;

export default function ContestTrend({
  attendedCount,
  rating,
  globalRanking,
  localRanking,
  topPercentage,
  rankingHistory,
}: ContestTrendProps) {
  const formattedData = rankingHistory.map((item) => ({
    ...item,
    rating: Math.round(item.rating),
    dateStr: `${item.startTime.getFullYear()}.${item.startTime.getMonth() + 1}.${item.startTime.getDate()}`,
  }));

  const minRating = Math.min(...formattedData.map((d) => d.rating)) - 50;
  const maxRating = Math.max(...formattedData.map((d) => d.rating)) + 50;

  return (
    <Card className="w-full mx-auto transition-all duration-300 border bg-white border-zinc-200 text-zinc-900 shadow-xl shadow-zinc-200/80 dark:shadow-none dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2 text-amber-500">
            <Trophy className="h-5 w-5" />
            CONTEST PROFILE
          </CardTitle>
          <CardDescription className="font-medium text-zinc-500 dark:text-zinc-400">
            已参赛 {attendedCount} 场
          </CardDescription>
        </div>

        <a
          href={userUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all group border text-zinc-700 bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <span>主页</span>
          <ExternalLink className="h-3 w-3 transition-colors text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300" />
        </a>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Rating", value: Math.round(rating), isAmber: false },
            {
              label: "Global Rank",
              value: `#${globalRanking}`,
              icon: (
                <Globe className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              ),
            },
            {
              label: "Local Rank",
              value: `#${localRanking}`,
              icon: (
                <User className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              ),
            },
            { label: "Top", value: `${topPercentage}%`, isAmber: true },
          ].map((grid, idx) => (
            <div
              key={idx}
              className="p-3 border rounded-lg transition-colors bg-zinc-50/50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-900"
            >
              <div className="text-xs font-medium mb-1 flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                {grid.icon} {grid.label}
              </div>
              <div
                className={`text-xl font-black ${grid.isAmber ? "text-amber-500" : "text-zinc-900 dark:text-zinc-100"}`}
              >
                {grid.value}
              </div>
            </div>
          ))}
        </div>

        <div className="h-55 w-full pt-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="ratingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="dateStr"
                  stroke="currentColor"
                  className="text-zinc-400 dark:text-zinc-600"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  domain={[minRating, maxRating]}
                  stroke="currentColor"
                  className="text-zinc-400 dark:text-zinc-600"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={{
                    stroke: "currentColor",
                    className: "text-zinc-200 dark:text-zinc-800",
                    strokeWidth: 1,
                  }}
                  content={
                    <ChartTooltipContent
                      className="bg-white border-zinc-200 text-zinc-800 shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 min-w-45 p-3"
                      formatter={(value, name, item) => {
                        if (name === "rating") {
                          const { ranking, score, title, dateStr } =
                            item.payload;
                          return (
                            <div className="flex flex-col gap-1.5 text-xs w-full">
                              <div className="font-black text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-1 mb-1 max-w-50 truncate">
                                {title}
                              </div>
                              <div className="flex justify-between gap-4 text-zinc-400 dark:text-zinc-500">
                                <span>Date</span>
                                <span className="font-mono">{dateStr}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-zinc-500">Rating</span>
                                <span className="font-black text-amber-500">
                                  {value}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-zinc-500">Rank</span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                  #{ranking}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-zinc-500">Score</span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                  {score}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ratingGradient)"
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#f59e0b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
