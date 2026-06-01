import React from "react";
import { type WakaData } from "../hooks/useWakaData";
import { Progress } from "@components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface LanguageStatsProps {
  languages?: WakaData["languages"];
  totalLangSeconds: number;
}

interface SingleLanguageProps {
  name: string;
  totalLangSeconds: number;
  second: number;
}

function SingleLanguage({
  name,
  totalLangSeconds,
  second,
}: SingleLanguageProps) {
  const percent =
    totalLangSeconds === 0 ? 0 : (second / totalLangSeconds) * 100;

  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-foreground group-hover:text-indigo-500 transition-colors">
          {name}
        </span>
        <span className="text-muted-foreground font-mono">
          {(second / 3600).toFixed(1)}h
        </span>
      </div>

      <Progress
        value={percent}
        className="h-1.5 bg-secondary transition-colors group-hover:bg-muted"
      />
    </div>
  );
}

export const LanguageStats = ({
  languages,
  totalLangSeconds,
}: LanguageStatsProps) => {
  const hasData = Array.isArray(languages) && languages.length > 0;

  return (
    <Card className="flex flex-col h-full self-start">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-foreground">
          # Languages
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 overflow-y-auto max-h-60 pr-2 scrollbar-thin">
        {hasData ? (
          languages.map((lang) => (
            <SingleLanguage
              key={lang.name}
              name={lang.name}
              totalLangSeconds={totalLangSeconds}
              second={lang.total_seconds}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            暂无语言数据
          </div>
        )}
      </CardContent>
    </Card>
  );
};
