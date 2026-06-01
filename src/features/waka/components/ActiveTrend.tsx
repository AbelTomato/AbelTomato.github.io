import React from "react";
import { type WakaData } from "../hooks/useWakaData";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ActiveTrendProps {
  weeklyTotalHours: string;
  weekly?: WakaData["weekly"];
}

export const ActiveTrend = ({ weeklyTotalHours, weekly }: ActiveTrendProps) => {
  const chartData = (weekly || []).map((day) => ({
    dateLabel: day.date.split("-").slice(1).join("/"),
    hours: parseFloat((day.seconds / 3600).toFixed(1)),
    formattedText: day.text,
  }));

  const chartConfig = {
    hours: {
      label: "编码时长",
      theme: {
        light: "#4f46e5",
        dark: "#818cf8",
      },
    },
  };

  return (
    <Card className="w-full self-start">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-foreground">
            # Active Trend
          </CardTitle>
          <CardDescription>最近一周编码时长趋势</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tracking-tight font-mono text-foreground">
            {weeklyTotalHours}h
          </p>
          <p className="text-xs text-muted-foreground">本周总计</p>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="dateLabel"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis hide domain={[0, "auto"]} />

              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted)/0.2)", radius: 4 }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name, props) => (
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <span className="font-medium">
                          {props.payload.formattedText}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="hours"
                fill="var(--color-hours)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
