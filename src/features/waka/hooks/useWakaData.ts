import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import wakaDataurl from "../data/wakatime.json?url";

interface DailyLanguageStats {
  [name: string]: number;
}

export interface WakaData {
  lastUpdate: string;
  total: string;
  daily_average: string;
  stats: {
    last_7_days: {
      total_seconds: number;
      total_text: string;
      days_active: number;
    };
    last_30_days: {
      total_seconds: number;
      total_text: string;
      days_active: number;
    };
    last_365_days: {
      total_seconds: number;
      total_text: string;
      days_active: number;
    };
    all_time: {
      total_seconds: number;
      total_text: string;
      days_active: number;
    };
  };
  weekly: Array<{
    date: string;
    seconds: number;
    text: string;
  }>;
  heatmap: Array<{
    date: string;
    seconds: number;
  }>;
  languages: Array<{
    name: string;
    total_seconds: number;
  }>;
  daily_languages: Record<string, DailyLanguageStats>;
}

export const useWakaData = (): UseQueryResult<WakaData, Error> => {
  return useQuery({
    queryKey: ["wakaData"],
    queryFn: async () => {
      try {
        const response = await fetch(wakaDataurl);
        if (!response.ok) throw new Error(`状态码: ${response.status}`);
        return response.json();
      } catch (err) {
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
};
