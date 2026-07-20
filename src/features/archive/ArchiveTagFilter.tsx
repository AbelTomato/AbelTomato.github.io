import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";

interface ArchiveTagFilterProps {
  postCount: number;
  filteredPostCount: number;
  selectedTag: string | null;
  searchQuery: string;
  tagCountsMap: Record<string, number>;
  onSelectTag: (tag: string | null) => void;
  onSearchQueryChange: (query: string) => void;
}

export function ArchiveTagFilter({
  postCount,
  filteredPostCount,
  selectedTag,
  searchQuery,
  tagCountsMap,
  onSelectTag,
  onSearchQueryChange,
}: ArchiveTagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sortedTags = useMemo(
    () =>
      Object.entries(tagCountsMap).sort(
        ([firstTag, firstCount], [secondTag, secondCount]) =>
          secondCount - firstCount || firstTag.localeCompare(secondTag, "zh-CN"),
      ),
    [tagCountsMap],
  );
  const primaryTags = sortedTags.slice(0, 10);
  const extraTags = sortedTags.slice(10);

  const renderTag = ([tag, count]: [string, number]) => {
    const isSelected = tag === selectedTag;

    return (
      <Button
        key={tag}
        size="sm"
        variant="ghost"
        onClick={() => onSelectTag(isSelected ? null : tag)}
        className={`relative h-7 rounded-none px-2 font-normal transition-colors after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:origin-bottom-right after:scale-x-0 after:bg-cyan-400 after:transition-transform after:duration-[250ms] after:ease-out ${
          isSelected
            ? "text-cyan-300 after:origin-bottom-left after:scale-x-100"
            : "text-muted-foreground hover:bg-transparent hover:text-foreground"
        } text-[11px]`}
      >
        #{tag} ({count})
      </Button>
    );
  };

  return (
    <Card className="rounded-xl border-white/10 bg-card/65 shadow-lg shadow-cyan-950/5 backdrop-blur-md transition-colors">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            标签检索
          </h3>
          <span className="font-mono text-xs text-cyan-400">
            {filteredPostCount} / {postCount} 篇
          </span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="搜索文章标题或标签"
            aria-label="搜索文章标题或标签"
            className="h-10 border-white/10 bg-background/35 pl-9 pr-9 placeholder:text-muted-foreground/70 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSearchQueryChange("")}
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-cyan-300"
              aria-label="清除搜索"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelectTag(null)}
            className={`relative h-7 rounded-none px-2 text-[11px] font-normal transition-colors after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:origin-bottom-right after:scale-x-0 after:bg-cyan-400 after:transition-transform after:duration-[250ms] after:ease-out ${
              selectedTag === null
                ? "text-cyan-300 after:origin-bottom-left after:scale-x-100"
                : "text-muted-foreground hover:bg-transparent hover:text-foreground"
            }`}
          >
            全部文章 ({postCount})
          </Button>
          {primaryTags.map(renderTag)}
        </div>
        {extraTags.length > 0 && (
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
              isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
            aria-hidden={!isExpanded}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-2 pt-2">{extraTags.map(renderTag)}</div>
            </div>
          </div>
        )}
        {sortedTags.length > 10 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="h-auto px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-cyan-300"
          >
            {isExpanded ? "收起标签" : `展开更多标签（${sortedTags.length - 10}）`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
