import { useGithubStats } from "@features/github/hooks/useGithubStats";

export const useFetchGithubStats = () => {
  const { data } = useGithubStats();
  return { lastActiveTime: data?.aggregates.latestActivityAt ?? null };
};
