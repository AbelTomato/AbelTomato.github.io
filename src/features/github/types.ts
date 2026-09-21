export interface GithubUserResponse {
  login: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GithubRepositoryResponse {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string | null;
  fork: boolean;
  archived: boolean;
}

export interface GithubBlogRepositoryResponse {
  name: string;
  html_url: string;
  default_branch: string;
}

export interface GithubCommitResponse {
  commit?: {
    committer?: {
      date?: string;
    };
  };
}

export interface GithubRepositorySummary {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
}

export interface GithubContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export type GithubContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE"
  | string;

export interface GithubContributionCalendarDayResponse {
  date: string;
  contributionCount: number;
  contributionLevel: GithubContributionLevel;
}

export interface GithubContributionCalendarResponse {
  totalContributions: number;
  weeks: Array<{
    contributionDays: GithubContributionCalendarDayResponse[];
  }>;
}

export interface GithubContributions {
  total: number;
  startDate: string | null;
  endDate: string | null;
  days: GithubContributionDay[];
}

export interface GithubStatsCache {
  generatedAt: string;
  profile: {
    login: string;
    avatarUrl: string;
    profileUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
    joinedAt: string;
  };
  aggregates: {
    totalStars: number;
    totalForks: number;
    latestActivityAt: string | null;
  };
  blogRepository: {
    name: string;
    url: string;
    defaultBranch: string;
    lastCommitAt: string | null;
  };
  recentRepositories: GithubRepositorySummary[];
  contributions: GithubContributions;
}

export interface CreateGithubStatsCacheInput {
  generatedAt: string;
  profile: GithubUserResponse;
  repositories: GithubRepositoryResponse[];
  blogRepository: GithubBlogRepositoryResponse;
  blogCommit: GithubCommitResponse | null;
  contributions: GithubContributions;
}