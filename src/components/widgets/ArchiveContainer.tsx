import React, { useState, useMemo } from "react";
import type { CollectionEntry } from "astro:content";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Car } from "lucide-react";
import { object } from "astro:schema";

interface ArchiveContainerProps {
  posts: CollectionEntry<"blog">[];
  tagCountsMap: Record<string, number>;
}

export const ArchiveContainer: React.FC<ArchiveContainerProps> = ({
  posts,
  tagCountsMap,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter((post) => post.data.tags?.includes(selectedTag));
  }, [selectedTag, posts]);

  const postsByYear = useMemo(() => {
    return filteredPosts.reduce(
      (acc, post) => {
        const year = new Date(post.data.pubDate).getFullYear().toString();
        if (!acc[year]) acc[year] = [];
        acc[year].push(post);
        return acc;
      },
      {} as Record<string, CollectionEntry<"blog">[]>,
    );
  }, [filteredPosts]);

  const sortedYears = useMemo(() => {
    return Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));
  }, [postsByYear]);

  return (
    <div className="space-y-8">
      <Card className="rounded-xl shadow-xs transition-colors">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            标签检索{" "}
            {selectedTag && (
              <span className="text-primary font-normal">
                (当前：{selectedTag})
              </span>
            )}
          </h3>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedTag === null ? "default" : "secondary"}
              onClick={() => setSelectedTag(null)}
              className="text-xs h-7 px-3 rounded-md"
            >
              全部文章 ({posts.length})
            </Button>
            {Object.entries(tagCountsMap).map(([tag, count]) => {
              const isSelected = tag === selectedTag;
              return (
                <Button
                  key={tag}
                  size="sm"
                  variant={isSelected ? "default" : "secondary"}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className="text-xs h-7 px-3 rounded-md font-normal"
                >
                  #{tag} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-xs relative overflow-hidden transition-colors">
        <CardContent className="p-6">
          {sortedYears.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              这里一片空白
            </p>
          ) : (
            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-border">
              {sortedYears.map((year) => (
                <div key={year} className="space-y-4 relative">
                  <div className="flex items-center gap-4 pl-10 relative">
                    <span className="absolute left-2.75 w-3 h-3 rounded-full bg-primary border-4 border-card shadow-xs"></span>
                    <h2 className="text-xl font-bold text-foreground tracking-wide font-mono">
                      {year}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      ({postsByYear[year].length} 篇)
                    </span>
                  </div>

                  <ul className="space-y-2 pl-10">
                    {postsByYear[year].map((post) => (
                      <li
                        key={post.id}
                        className="group relative py-2 px-3 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border/40 transition-all"
                      >
                        <a
                          href={`/blog/${post.id}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                              {new Date(post.data.pubDate).toLocaleDateString(
                                "zh-CN",
                                { month: "2-digit", day: "2-digit" },
                              )}
                            </span>
                            <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">
                              {post.data.title}
                            </span>
                          </div>

                          <div className="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                            {post.data.tags?.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
