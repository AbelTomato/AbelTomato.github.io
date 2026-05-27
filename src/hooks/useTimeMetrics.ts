import { useState, useEffect, useCallback } from "react";

export interface UseTimeMetricsOptions {
  targetDate: string | number | Date;
  refreshInterval?: number;
}

export const useTimeMetrics = ({
  targetDate,
  refreshInterval = 1000 * 60 * 60 * 12,
}: UseTimeMetricsOptions) => {
  const [daysDiff, setDaysDiff] = useState<number>(0);

  useEffect(() => {
    const calculateDays = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();

      if (isNaN(target)) {
        console.error(`[useTimeMetrics]: 无效的时间格式 -> ${targetDate}`);
        return;
      }

      const difference = Math.abs(now - target);
      setDaysDiff(Math.floor(difference / (1000 * 60 * 60 * 24)));
    };

    calculateDays();
    const timer = setInterval(calculateDays, refreshInterval);

    return () => clearInterval(timer);
  }, [targetDate, refreshInterval]);

  const formatDate = useCallback(
    (
      dateInput: string | number | Date,
      options: Intl.DateTimeFormatOptions = {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
      locale: "zh-CN",
    ): string => {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString(locale, options);
    },
    [],
  );

  return {
    daysDiff,
    formatDate,
  };
};
