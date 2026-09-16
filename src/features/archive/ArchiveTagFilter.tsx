import { useId, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

const PRIMARY_TAG_COUNT = 10;
const PREVIEW_TAG_COUNT = 5;

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
  const tagListId = useId();
  const prefersReducedMotion = useReducedMotion();
  const layoutTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.8 };
  const revealTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };
  const sortedTags = useMemo(
    () =>
      Object.entries(tagCountsMap).sort(
        ([firstTag, firstCount], [secondTag, secondCount]) =>
          secondCount - firstCount || firstTag.localeCompare(secondTag, "zh-CN"),
      ),
    [tagCountsMap],
  );
  const collapsedTags = useMemo(() => {
    const previewEnd = PRIMARY_TAG_COUNT + PREVIEW_TAG_COUNT;
    const tags = sortedTags.slice(0, previewEnd);

    if (
      selectedTag &&
      !tags.some(([tag]) => tag === selectedTag)
    ) {
      const selectedTagEntry = sortedTags.find(([tag]) => tag === selectedTag);

      if (selectedTagEntry) {
        tags.push(selectedTagEntry);
      }
    }

    return tags;
  }, [selectedTag, sortedTags]);
  const displayedTags = isExpanded ? sortedTags : collapsedTags;

  const renderTag = ([tag, count]: [string, number], index: number) => {
    const isSelected = tag === selectedTag;
    const isBlurredPreview =
      !isExpanded && index >= PRIMARY_TAG_COUNT && !isSelected;

    return (
      <motion.div
        key={tag}
        layout="position"
        initial={
          prefersReducedMotion
            ? false
            : { opacity: 0, y: -6, scale: 0.96, filter: "blur(3px)" }
        }
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -4, scale: 0.96, filter: "blur(3px)" }
        }
        transition={revealTransition}
      >
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isBlurredPreview}
          aria-hidden={isBlurredPreview}
          tabIndex={isBlurredPreview ? -1 : undefined}
          onClick={() => onSelectTag(isSelected ? null : tag)}
          className={`relative h-7 rounded-none px-2 font-normal transition-[color,filter,opacity] duration-300 motion-reduce:transition-none after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:origin-bottom-right after:scale-x-0 after:bg-cyan-400 after:transition-transform after:duration-[250ms] after:ease-out ${
            isBlurredPreview
              ? "pointer-events-none select-none blur-[2px] opacity-35"
              : isSelected
              ? "text-cyan-300 after:origin-bottom-left after:scale-x-100"
              : "text-muted-foreground hover:bg-transparent hover:text-foreground"
          } text-[11px]`}
        >
          #{tag} ({count})
        </Button>
      </motion.div>
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

        <motion.div layout transition={layoutTransition} className="space-y-4">
          <motion.div
            layout
            transition={layoutTransition}
            id={tagListId}
            className="flex flex-wrap gap-2"
          >
            <motion.div layout="position" transition={layoutTransition}>
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
            </motion.div>
            <AnimatePresence initial={false} mode="popLayout">
              {displayedTags.map(renderTag)}
            </AnimatePresence>
          </motion.div>
          {sortedTags.length > PRIMARY_TAG_COUNT && (
            <motion.div layout="position" transition={layoutTransition}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                aria-expanded={isExpanded}
                aria-controls={tagListId}
                className="h-auto gap-1 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-cyan-300"
              >
                {isExpanded
                  ? "收起标签"
                  : `展开更多标签（${sortedTags.length - PRIMARY_TAG_COUNT}）`}
                <ChevronDown
                  className={`size-3.5 transition-transform duration-300 motion-reduce:transition-none ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
