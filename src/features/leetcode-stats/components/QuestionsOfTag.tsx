import type { Question } from "./QuestionStats";
import { Button } from "@components/ui/button";
import { ArrowRight, X } from "lucide-react";

interface QuestionsOfTagProps {
  selectedTag: string;
  setSelectedTag: Function;
  activeQuestions: Array<Question>;
}

export default function QuestionsOfTag({
  selectedTag,
  setSelectedTag,
  activeQuestions,
}: QuestionsOfTagProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 bg-zinc-900/40 dark:bg-black/80"
      onClick={() => setSelectedTag(null)}
    >
      <div
        className="w-full max-w-xl border rounded-2xl flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150 bg-white border-zinc-200 shadow-2xl shadow-zinc-400/50 dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-2xl dark:shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex items-center justify-between border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-wider text-zinc-500">
              <span className="px-2 py-0.5 rounded font-mono border bg-amber-50 border-amber-200 text-amber-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-amber-500">
                {selectedTag.toUpperCase()}
              </span>
              <span>{activeQuestions.length} FILTERS MATCHED</span>
            </div>
            <h3 className="text-base font-black mt-1 text-zinc-900 dark:text-zinc-100">
              Questions
            </h3>
          </div>
          <button
            onClick={() => setSelectedTag(null)}
            className="p-1.5 rounded-lg border transition-colors cursor-pointer bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin">
          {activeQuestions.map((q) => (
            <Button
              asChild
              key={q.id}
              className="w-full h-auto p-3 border rounded-xl flex items-center justify-between group transition-colors bg-zinc-50/40 border-zinc-100 hover:border-zinc-200 shadow-sm dark:bg-zinc-900/30 dark:border-zinc-900 dark:hover:border-zinc-800 dark:shadow-none"
            >
              <a
                href={`https://leetcode.cn/problems/${q.titleSlug}/description/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2 pr-4 min-w-0 text-left">
                  <span className="text-xs font-mono font-bold text-zinc-400 shrink-0">
                    #{q.id}
                  </span>
                  <h4 className="text-sm font-bold truncate transition-colors text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100">
                    {q.title}
                  </h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 font-black rounded tracking-wide font-mono ${
                      q.difficulty === "HARD"
                        ? "bg-rose-950/40 text-rose-400 border border-rose-900/40"
                        : q.difficulty === "MEDIUM"
                          ? "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                          : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-all group-hover:translate-x-0.5 text-zinc-400 group-hover:text-amber-600 dark:text-zinc-600 dark:group-hover:text-amber-500" />
                </div>
              </a>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
