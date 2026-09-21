import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import ErrorStatus from "@components/ui/ErrorStatus";
import LoadingStatus from "@components/ui/LoadingStatus";
import { useGithubStats } from "../hooks/useGithubStats";
import type { GithubContributionDay } from "../types";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formatDate = (date: string | null) => {
  if (!date) return "--";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "--";
  return dateFormatter.format(parsedDate).replaceAll("/", ".");
};

const contributionDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const formatContributionDate = (date: string) =>
  contributionDateFormatter.format(new Date(`${date}T00:00:00Z`));

const levelClassNames: Record<GithubContributionDay["level"], string> = {
  0: "bg-foreground/10",
  1: "bg-emerald-200 dark:bg-emerald-950",
  2: "bg-emerald-400 dark:bg-emerald-800",
  3: "bg-emerald-600 dark:bg-emerald-600",
  4: "bg-emerald-800 dark:bg-emerald-400",
};

function ContributionGrid({ days }: { days: GithubContributionDay[] }) {
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="GitHub 每日贡献">
      {days.map((day) => (
        <div className="group relative" key={day.date}>
          <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 font-mono text-[10px] text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            <span className="font-semibold">{formatContributionDate(day.date)}</span>
            <span className="ml-1.5 text-muted-foreground">{day.count} 次贡献</span>
          </div>
          <div
            role="listitem"
            aria-label={`${formatContributionDate(day.date)}：${day.count} 次贡献`}
            className={`size-4 rounded-[3px] transition-all group-hover:scale-110 group-hover:ring-2 group-hover:ring-ring sm:size-5 ${levelClassNames[day.level]}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function GithubStatusPanel() {
  const { data, error, isLoading } = useGithubStats();

  if (isLoading) return <LoadingStatus loadingSource="GitHub" />;
  if (error || !data) {
    return (
      <ErrorStatus error={error} fallbackMessage="GitHub 贡献数据暂时不可用。" />
    );
  }

  const contributions = data.contributions;

  return (
    <section className="space-y-6">
      <Card className="w-full overflow-visible">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
            # GitHub Contribution Heatmap
          </CardTitle>
          <CardDescription className="italic">
            {contributions.days.length} DAYS RECORDED · {contributions.total.toLocaleString()} CONTRIBUTIONS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contributions.days.length > 0 ? (
            <ContributionGrid days={contributions.days} />
          ) : (
            <p className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              暂无可用的每日贡献数据
            </p>
          )}
        </CardContent>
      </Card>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
        <a
          href={data.profile.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          @{data.profile.login}
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
        <span>·</span>
        最近活跃：
        <time dateTime={data.aggregates.latestActivityAt ?? undefined}>
          {formatDate(data.aggregates.latestActivityAt)}
        </time>
        <span>·</span>
        数据同步于 <time dateTime={data.generatedAt}>{formatDate(data.generatedAt)}</time>
      </p>
    </section>
  );
}