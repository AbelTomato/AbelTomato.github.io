import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useLeetcodeData } from "../hooks/useLeetcodeData";
import ContestTrend from "./ContestTrend";
import QuestionStats from "./QuestionStats";
import { Loader2, AlertCircle } from "lucide-react";

export default function LeetcodeStats() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LeetcodeStatsContent />
    </QueryClientProvider>
  );
}

function LeetcodeStatsContent() {
  const { data, isLoading, error } = useLeetcodeData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-zinc-400 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium font-mono">
          LOADING LEETCODE DATA...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 p-6 rounded-2xl max-w-md border text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-500 dark:border-rose-900/30 dark:bg-rose-950/10">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm font-bold font-mono">ERROR FETCHING DATA</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
          {error?.message || "Data is empty."}
        </p>
      </div>
    );
  }

  const {
    userContestRanking,
    userContestRankingHistory,
    userProfileQuestionProgress,
    userProgressQuestionList,
  } = data;

  const attendedHistory = userContestRankingHistory
    .filter((item) => item.attended)
    .map((item) => ({
      rating: item.rating,
      ranking: item.ranking,
      score: item.score,
      startTime: new Date(item.contest.startTime * 1000),
      title: item.contest.titleCn || item.contest.title,
    }));

  const formattedQuestionList = {
    totalNum: userProgressQuestionList.totalNum,
    questions: userProgressQuestionList.questions.map((q) => ({
      id: parseInt(q.frontendId),
      title: q.translatedTitle || q.title,
      difficulty: q.difficulty,
      titleSlug: q.titleSlug,
      topicTags: q.topicTags.map((tag) => tag.nameTranslated || tag.name),
    })),
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-6 animate-in fade-in duration-300 rounded-3xl transition-all justify-center items-center">
      {userContestRanking && (
        <ContestTrend
          attendedCount={userContestRanking.attendedContestsCount}
          rating={userContestRanking.rating}
          globalRanking={userContestRanking.globalRanking}
          localRanking={userContestRanking.localRanking}
          topPercentage={userContestRanking.topPercentage}
          rankingHistory={attendedHistory}
        />
      )}

      <QuestionStats
        numAcQuestions={userProfileQuestionProgress.numAcceptedQuestions}
        questionList={formattedQuestionList}
      />
    </div>
  );
}
