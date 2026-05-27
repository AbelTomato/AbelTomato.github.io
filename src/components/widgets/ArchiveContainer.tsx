import React, { useState, useMemo } from "react";
import type { CollectionEntry } from "astro:content";

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          标签检索{" "}
          {selectedTag && (
            <span className="text-indigo-400 font-normal">
              （当前：{selectedTag}）
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
              selectedTag === null
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                : "bg-slate-800 text-slate-300 border-slate-700/50 hover:border-indigo-500/30 hover:text-indigo-300"
            }`}
          >
            全部文章 ({posts.length})
          </button>
          {Object.entries(tagCountsMap).map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
                tag === selectedTag
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                  : "bg-slate-800 text-slate-300 border-slate-700/50 hover:border-indigo-500/30 hover:text-indigo-300"
              }`}
            >
              #{tag} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        {sortedYears.length === 0 ? (
          <p className="text-center text-slate-500 py-8">这里一片空白</p>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-800">
            {sortedYears.map((year) => (
              <div key={year} className="space-y-4 relative">
                <div className="flex items-center gap-4 pl-10 relative">
                  <span className="absolute left-2.75 w-3 h-3 rounded-full bg-indigo-500 border-4 border-slate-900 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-wide font-mono">
                    {year}
                  </h2>
                  <span className="text-xs text-slate-500">
                    ({postsByYear[year].length} 篇)
                  </span>
                </div>

                <ul className="space-y-3 pl-10">
                  {postsByYear[year].map((post) => (
                    <li
                      key={post.id}
                      className="group relative py-2 pl-4 rounded-xl hover:bg-slate-800/30 border border-transparent hover:border-slate-800/50 transition-all"
                    >
                      <a
                        href={`/blog/${post.id}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-400 transition-colors">
                            {new Date(post.data.pubDate).toLocaleDateString(
                              "zh-CN",
                              { month: "2-digit", day: "2-digit" },
                            )}
                          </span>
                          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-1">
                            {post.data.title}
                          </span>
                        </div>

                        <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          {post.data.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
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
      </div>
    </div>
  );
};
