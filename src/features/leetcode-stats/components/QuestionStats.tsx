import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Layers } from "lucide-react";
import DifficultyRatio from "./DifficultyRatio";
import TagList from "./TagList";
import QuestionsOfTag from "./QuestionsOfTag";

export interface Question {
  title: string;
  id: number;
  difficulty: string;
  titleSlug: string;
  topicTags: Array<string>;
}

interface QuestionStatsProps {
  numAcQuestions: Array<{
    count: number;
    difficulty: string;
  }>;
  questionList: {
    totalNum: number;
    questions: Array<Question>;
  };
}

const chartConfig = {
  easy: { label: "简单 (EASY)", color: "hsl(var(--emerald-500, 142 70% 45%))" },
  medium: {
    label: "中等 (MEDIUM)",
    color: "hsl(var(--amber-500, 24.5 95% 53%))",
  },
  hard: {
    label: "困难 (HARD)",
    color: "hsl(var(--rose-500, 346.8 77.2% 49.8%))",
  },
};

export default function QuestionStats({
  numAcQuestions,
  questionList,
}: QuestionStatsProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tagToQuestionsMap: Record<string, Question[]> = {};
  questionList.questions.forEach((q) => {
    q.topicTags.forEach((tag) => {
      if (!tagToQuestionsMap[tag]) {
        tagToQuestionsMap[tag] = [];
      }
      tagToQuestionsMap[tag].push(q);
    });
  });

  const allTags = Object.keys(tagToQuestionsMap).sort(
    (a, b) => tagToQuestionsMap[b].length - tagToQuestionsMap[a].length,
  );

  const activeQuestions = selectedTag ? tagToQuestionsMap[selectedTag] : [];

  return (
    <div className="w-full mx-auto space-y-6">
      <Card className="w-full mx-auto transition-all duration-300 border bg-white border-zinc-200 shadow-xl text-zinc-900 shadow-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:shadow-none">
        <CardHeader className="border-b pb-6 border-zinc-100 dark:border-zinc-800/50">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2 text-amber-500">
              <Layers className="h-5 w-5" />
              LeetCode Questions Stats
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <DifficultyRatio numAcQuestions={numAcQuestions} />

          <TagList
            setSelectedTag={setSelectedTag}
            tagToQuestionsMap={tagToQuestionsMap}
            allTags={allTags}
          />
        </CardContent>
      </Card>

      {selectedTag && (
        <QuestionsOfTag
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          activeQuestions={activeQuestions}
        />
      )}
    </div>
  );
}
