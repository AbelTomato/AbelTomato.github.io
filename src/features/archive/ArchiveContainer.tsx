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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return posts.filter((post) => {
      const matchesTag = !selectedTag || post.data.tags?.includes(selectedTag);
      const matchesSearch =
        !normalizedQuery ||
        post.data.title.toLocaleLowerCase().includes(normalizedQuery) ||
        post.data.tags?.some((tag) =>
          tag.toLocaleLowerCase().includes(normalizedQuery),
        );

      return matchesTag && matchesSearch;
    });
  }, [searchQuery, selectedTag, posts]);

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
        filteredPostCount={filteredPosts.length}
        selectedTag={selectedTag}
        searchQuery={searchQuery}
        tagCountsMap={tagCountsMap}
        onSelectTag={setSelectedTag}
        onSearchQueryChange={setSearchQuery}
      />
      <ArchiveTimeline
        postsByYearMonth={postsByYearMonth}
        sortedYears={sortedYears}
      />
    </div>
  );
}
