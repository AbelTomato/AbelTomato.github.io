import { useEffect, useState } from "react";
import githubStatsDataUrl from "../data/github-stats.json?url";
import type { GithubStatsCache } from "../types";

export interface GithubStatsState {
  data: GithubStatsCache | null;
  error: Error | null;
  isLoading: boolean;
}

async function fetchGithubStats(): Promise<GithubStatsCache> {
  const response = await fetch(githubStatsDataUrl);
  if (!response.ok) {
    throw new Error(`GitHub 状态数据加载失败：${response.status}`);
  }

  return response.json() as Promise<GithubStatsCache>;
}

export function useGithubStats(): GithubStatsState {
  const [state, setState] = useState<GithubStatsState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    fetchGithubStats()
      .then((data) => {
        if (!cancelled) {
          setState({ data, error: null, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            error:
              error instanceof Error
                ? error
                : new Error("GitHub 状态数据加载失败。"),
            isLoading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}