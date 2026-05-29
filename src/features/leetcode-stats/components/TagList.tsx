import { Tag } from "lucide-react";
import type { Question } from "./QuestionStats";

interface TagListProps {
  setSelectedTag: Function;
  tagToQuestionsMap: Record<string, Question[]>;
  allTags: Array<string>;
}

export default function TagList({
  tagToQuestionsMap,
  allTags,
  setSelectedTag,
}: TagListProps) {
  return (
    <div className="md:col-span-7 flex flex-col space-y-4">
      <div className="flex items-center gap-1.5 text-xs font-bold px-1 text-zinc-500 dark:text-zinc-400">
        <Tag className="h-3.5 w-3.5 text-amber-500" />
        <span>Tags({allTags.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-65 pr-2 flex flex-wrap gap-2 scrollbar-thin">
        {allTags.map((tag) => {
          const count = tagToQuestionsMap[tag].length;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 group cursor-pointer border bg-zinc-100/60 border-zinc-200/60 text-zinc-600 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 shadow-sm dark:bg-zinc-900/50 dark:border-zinc-900 dark:text-zinc-400 dark:hover:border-amber-500 dark:hover:bg-amber-950/20 dark:hover:text-amber-400 dark:shadow-none"
            >
              <span className="tracking-wide group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                {tag}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono border transition-colors bg-white border-zinc-200 text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-600 group-hover:border-amber-200 dark:bg-zinc-950 dark:border-zinc-900 dark:text-zinc-600 dark:group-hover:bg-amber-950 dark:group-hover:text-amber-400 dark:group-hover:border-amber-900/30">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
