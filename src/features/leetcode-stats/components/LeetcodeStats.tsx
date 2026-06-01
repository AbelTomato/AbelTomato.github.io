import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useLeetcodeData } from "../hooks/useLeetcodeData";
import ContestTrend from "./ContestTrend";
import QuestionStats from "./QuestionStats";
import LoadingStatus from "@components/ui/LoadingStatus";
import ErrorStatus from "@components/ui/ErrorStatus";

export default function LeetcodeStats() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LeetcodeStatsContent />
    </QueryClientProvider>
  );
}

function LeetcodeStatsContent() {
  const { data, isLoading, error, dataUpdatedAt } = useLeetcodeData();

  if (isLoading) {
    return <LoadingStatus loadingSource="LeetCode" />;
  }

  if (error || !data) {
    return <ErrorStatus error={error} fallbackMessage="Data is empty." />;
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
    <div className="w-full mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      <LeetcodeReport lastUpdated={dataUpdatedAt} />

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

function LeetcodeReport({ lastUpdated }: { lastUpdated: number }) {
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1 border-b pb-4 border-border">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          算法训练报告
        </h2>
        <p className="text-sm text-muted-foreground">
          基于 leetcode-query API 的自动化数据面板
        </p>
      </div>

      {lastUpdated > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Last synced:</span>
          <time
            dateTime={new Date(lastUpdated).toISOString()}
            className="font-semibold"
          >
            {new Date(lastUpdated).toLocaleString("zh-CN", {
              timeZone: "Asia/Shanghai",
              hour12: false,
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
      )}
    </div>
  );
}
