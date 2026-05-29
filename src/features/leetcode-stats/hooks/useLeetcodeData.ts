import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import leetcodeDataUrl from "../data/leetcode.json?url";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionStatus = "SOLVED" | "UNTOUCHED";
export type SubmissionResult = "AC" | "WA" | "TLE";

export interface QuestionCount {
  count: number;
  difficulty: Difficulty;
}

export interface TopicTag {
  slug: string;
  name: string;
  translatedName?: string;
  nameTranslated?: string;
}

export interface UserProfileQuestionProgress {
  numAcceptedQuestions: QuestionCount[];
  numFailedQuestions: QuestionCount[];
  numUntouchedQuestions: QuestionCount[];
}

export interface LangLevel {
  langName: string;
  langVerboseName: string;
  level: number;
}

export interface TopicArea {
  name: string;
  slug: string;
}

export interface TopicAreaScore {
  score: number;
  topicArea: TopicArea;
}

export interface SkillSet {
  langLevels: LangLevel[];
  topics: TopicTag[];
  topicAreaScores: TopicAreaScore[];
}

export interface UserContestRanking {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  localRanking: number;
  globalTotalParticipants: number;
  localTotalParticipants: number;
  topPercentage: number;
}

export interface Contest {
  title: string;
  titleCn: string;
  startTime: number;
}

export interface ContestHistoryItem {
  attended: boolean;
  totalProblems: number;
  trendingDirection: "UP" | "DOWN";
  finishTimeInSeconds: number;
  rating: number;
  score: number;
  ranking: number;
  contest: Contest;
}

export interface MiniQuestion {
  title: string;
  translatedTitle: string;
  titleSlug: string;
  questionFrontendId: string;
}

export interface RecentSubmission {
  submissionId: number;
  submitTime: number;
  question: MiniQuestion;
}

export interface ProgressQuestion {
  frontendId: string;
  title: string;
  translatedTitle: string;
  titleSlug: string;
  difficulty: Difficulty;
  lastSubmittedAt: string;
  numSubmitted: number;
  questionStatus: QuestionStatus;
  lastResult: SubmissionResult;
  topicTags: TopicTag[];
}

export interface UserProgressQuestionList {
  totalNum: number;
  questions: ProgressQuestion[];
}

export interface LeetcodeData {
  userProfileQuestionProgress: UserProfileQuestionProgress;
  skillSet: SkillSet;
  userContestRanking: UserContestRanking;
  userContestRankingHistory: ContestHistoryItem[];
  recentSubmission: RecentSubmission[];
  userProgressQuestionList: UserProgressQuestionList;
}

export const useLeetcodeData = (): UseQueryResult<LeetcodeData, Error> => {
  return useQuery({
    queryKey: ["leetcodeData"],
    queryFn: async () => {
      try {
        const response = await fetch(leetcodeDataUrl);
        if (!response.ok) throw new Error(`状态码: ${response.status}`);
        return response.json();
      } catch (err) {
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
};
