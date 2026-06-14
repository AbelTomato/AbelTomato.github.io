import { Card, CardContent } from "@components/ui/card";
import {
  getSortedMonths,
  getYearPostCount,
} from "@features/archive/archiveUtils";
import type { BlogPost, PostsByYearMonth } from "./types";

interface ArchiveTimelineProps {
  postsByYearMonth: PostsByYearMonth;
  sortedYears: string[];
}

export function ArchiveTimeline({
  postsByYearMonth,
  sortedYears,
}: ArchiveTimelineProps) {
  return (
    <Card className="rounded-xl shadow-xs relative overflow-hidden transition-colors">
      <CardContent className="p-6">
        {sortedYears.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            这里一片空白
          </p>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-border">
            {sortedYears.map((year) => (
              <ArchiveYearGroup
                key={year}
                postsByYearMonth={postsByYearMonth}
                year={year}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ArchiveYearGroupProps {
  postsByYearMonth: PostsByYearMonth;
  year: string;
}

function ArchiveYearGroup({ postsByYearMonth, year }: ArchiveYearGroupProps) {
  return (
    <div className="space-y-4 relative">
      <div className="flex items-center gap-4 pl-10 relative">
        <span className="absolute left-2.75 w-3 h-3 rounded-full bg-primary border-4 border-card shadow-xs"></span>
        <h2 className="text-xl font-bold text-foreground tracking-wide font-mono">
          {year}
        </h2>
        <span className="text-xs text-muted-foreground">
          ({getYearPostCount(postsByYearMonth, year)} 篇)
        </span>
      </div>

      <div className="space-y-6 pl-10">
        {getSortedMonths(postsByYearMonth, year).map((month) => (
          <ArchiveMonthGroup
            key={month}
            month={month}
            posts={postsByYearMonth[year][month]}
          />
        ))}
      </div>
    </div>
  );
}

interface ArchiveMonthGroupProps {
  month: string;
  posts: BlogPost[];
}

function ArchiveMonthGroup({ month, posts }: ArchiveMonthGroupProps) {
  return (
    <div className="space-y-3 relative">
      <div className="flex items-center gap-3 relative">
        <span className="absolute left-[-1.65rem] w-2.5 h-2.5 rounded-full bg-muted-foreground/70 border-4 border-card shadow-xs"></span>
        <h3 className="text-sm font-semibold text-foreground/90 font-mono">
          {month} 月
        </h3>
        <span className="text-xs text-muted-foreground">
          ({posts.length} 篇)
        </span>
      </div>

      <ul className="space-y-2 pl-0 sm:pl-2">
        {posts.map((post) => (
          <ArchivePostItem key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}

interface ArchivePostItemProps {
  post: BlogPost;
}

function ArchivePostItem({ post }: ArchivePostItemProps) {
  return (
    <li className="group relative py-2 px-3 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border/40 transition-all">
      <a
        href={`/blog/${post.id}`}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
            {new Date(post.data.pubDate).toLocaleDateString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
          <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">
            {post.data.title}
          </span>
        </div>

        <div className="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
          {post.data.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </a>
    </li>
  );
}
