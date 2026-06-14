import { useMemo, useState } from "react";
import { ArchiveTagFilter } from "@features/archive/ArchiveTagFilter";
import { ArchiveTimeline } from "@features/archive/ArchiveTimeline";
import {
  getSortedYears,
  groupPostsByYearMonth,
} from "@features/archive/archiveUtils";
import type { BlogPost } from "./types";

interface ArchiveContainerProps {
  posts: BlogPost[];
  tagCountsMap: Record<string, number>;
}

export function ArchiveContainer({
  posts,
  tagCountsMap,
}: ArchiveContainerProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter((post) => post.data.tags?.includes(selectedTag));
  }, [selectedTag, posts]);

  const postsByYearMonth = useMemo(
    () => groupPostsByYearMonth(filteredPosts),
    [filteredPosts],
  );

  const sortedYears = useMemo(
    () => getSortedYears(postsByYearMonth),
    [postsByYearMonth],
  );

  return (
    <div className="space-y-8">
      <ArchiveTagFilter
        postCount={posts.length}
        selectedTag={selectedTag}
        tagCountsMap={tagCountsMap}
        onSelectTag={setSelectedTag}
      />
      <ArchiveTimeline
        postsByYearMonth={postsByYearMonth}
        sortedYears={sortedYears}
      />
    </div>
  );
}
