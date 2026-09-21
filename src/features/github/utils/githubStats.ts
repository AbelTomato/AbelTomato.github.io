import type {
  CreateGithubStatsCacheInput,
  GithubRepositoryResponse,
  GithubRepositorySummary,
  GithubContributionCalendarResponse,
  GithubContributions,
  GithubContributionDay,
  GithubStatsCache,
} from "../types";

const RECENT_REPOSITORY_LIMIT = 6;

const contributionLevelMap: Record<string, GithubContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export const parseGithubContributionCalendar = (
  calendar: GithubContributionCalendarResponse,
): GithubContributions => {
  const days = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => ({
      date: day.date,
      count: Number.isFinite(day.contributionCount) ? day.contributionCount : 0,
      level: contributionLevelMap[day.contributionLevel] ?? 0,
    }))
    .toSorted((left, right) => left.date.localeCompare(right.date));

  return {
    total: calendar.totalContributions,
    startDate: days[0]?.date ?? null,
    endDate: days.at(-1)?.date ?? null,
    days,
  };
};

const toTimestamp = (value: string | null | undefined) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

const isActiveOwnedRepository = (repository: GithubRepositoryResponse) =>
  !repository.fork && !repository.archived;

const toRepositorySummary = (
  repository: GithubRepositoryResponse,
): GithubRepositorySummary => ({
  name: repository.name,
  url: repository.html_url,
  description: repository.description,
  language: repository.language,
  stars: repository.stargazers_count,
  forks: repository.forks_count,
  updatedAt: repository.updated_at,
});

const findLatestActivity = (
  repositories: GithubRepositoryResponse[],
  blogCommitAt: string | null,
) => {
  const dates = [
    blogCommitAt,
    ...repositories.flatMap((repository) => [
      repository.updated_at,
      repository.pushed_at,
    ]),
  ].filter((date): date is string => toTimestamp(date) > Number.NEGATIVE_INFINITY);

  if (dates.length === 0) return null;

  return dates.reduce((latest, date) =>
    toTimestamp(date) > toTimestamp(latest) ? date : latest,
  );
};

export const createGithubStatsCache = ({
  generatedAt,
  profile,
  repositories,
  blogRepository,
  blogCommit,
  contributions,
}: CreateGithubStatsCacheInput): GithubStatsCache => {
  const activeRepositories = repositories.filter(isActiveOwnedRepository);
  const blogCommitAt = blogCommit?.commit?.committer?.date ?? null;

  return {
    generatedAt,
    profile: {
      login: profile.login,
      avatarUrl: profile.avatar_url,
      profileUrl: profile.html_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      joinedAt: profile.created_at,
    },
    aggregates: {
      totalStars: activeRepositories.reduce(
        (total, repository) => total + repository.stargazers_count,
        0,
      ),
      totalForks: activeRepositories.reduce(
        (total, repository) => total + repository.forks_count,
        0,
      ),
      latestActivityAt: findLatestActivity(activeRepositories, blogCommitAt),
    },
    blogRepository: {
      name: blogRepository.name,
      url: blogRepository.html_url,
      defaultBranch: blogRepository.default_branch,
      lastCommitAt: blogCommitAt,
    },
    recentRepositories: activeRepositories
      .toSorted((left, right) =>
        toTimestamp(right.updated_at) - toTimestamp(left.updated_at),
      )
      .slice(0, RECENT_REPOSITORY_LIMIT)
      .map(toRepositorySummary),
    contributions,
  };
};