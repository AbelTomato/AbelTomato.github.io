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
    <Card className="relative overflow-hidden rounded-xl border-white/10 bg-card/65 shadow-lg shadow-cyan-950/5 backdrop-blur-md transition-colors">
      <CardContent className="p-6">
        {sortedYears.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            这里一片空白
          </p>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-y-1 before:left-4 before:border-l before:border-dashed before:border-cyan-300/35">
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
        <span className="absolute left-2.75 size-3 rounded-full border-4 border-card bg-cyan-400 shadow-[0_0_14px_rgb(34_211_238_/_0.7)]"></span>
        <h2 className="font-mono text-xl font-bold tracking-wide text-cyan-200">
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
        <span className="absolute left-[-1.65rem] size-2.5 rounded-full border-4 border-card bg-cyan-300/60"></span>
        <h3 className="font-mono text-sm font-semibold text-foreground/90">
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
    <li className="group relative rounded-lg border border-transparent px-3 py-2 transition-all duration-200 hover:translate-x-1 hover:border-cyan-300/15 hover:bg-cyan-300/5">
      <a
        href={`/blog/${post.id}`}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
          <div className="flex min-w-0 items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground/80 transition-colors group-hover:text-cyan-300">
            {new Date(post.data.pubDate).toLocaleDateString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
          <span className="line-clamp-1 text-sm font-semibold text-foreground/90 transition-colors group-hover:text-cyan-200">
            {post.data.title}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap gap-x-1.5 text-[11px] text-muted-foreground/70 transition-colors group-hover:text-cyan-100/75">
          {post.data.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="after:ml-1 after:content-['·'] last:after:hidden"
            >
              {tag}
            </span>
          ))}
        </div>
      </a>
    </li>
  );
}
