import { describe, expect, it } from "vitest";
import {
  createGithubStatsCache,
  parseGithubContributionCalendar,
} from "./githubStats";

describe("parseGithubContributionCalendar", () => {
  it("扁平化 GraphQL 周数据、映射贡献等级并计算范围与总数", () => {
    expect(
      parseGithubContributionCalendar({
        totalContributions: 14,
        weeks: [
          {
            contributionDays: [
              { date: "2026-09-20", contributionCount: 3, contributionLevel: "SECOND_QUARTILE" },
              { date: "2026-09-18", contributionCount: 0, contributionLevel: "NONE" },
            ],
          },
          {
            contributionDays: [
              { date: "2026-09-19", contributionCount: 11, contributionLevel: "FOURTH_QUARTILE" },
            ],
          },
        ],
      }),
    ).toEqual({
      total: 14,
      startDate: "2026-09-18",
      endDate: "2026-09-20",
      days: [
        { date: "2026-09-18", count: 0, level: 0 },
        { date: "2026-09-19", count: 11, level: 4 },
        { date: "2026-09-20", count: 3, level: 2 },
      ],
    });
  });

  it("未知贡献等级安全降级为零级", () => {
    expect(
      parseGithubContributionCalendar({
        totalContributions: 0,
        weeks: [{
          contributionDays: [{
            date: "2026-09-20",
            contributionCount: 0,
            contributionLevel: "UNKNOWN",
          }],
        }],
      }),
    ).toEqual({
      total: 0,
      startDate: "2026-09-20",
      endDate: "2026-09-20",
      days: [{ date: "2026-09-20", count: 0, level: 0 }],
    });
  });
});

describe("createGithubStatsCache", () => {
  it("聚合公开仓库数据、保留最近六项并选择最新活动时间", () => {
    const repositories = Array.from({ length: 7 }, (_, index) => ({
      name: `repository-${index}`,
      html_url: `https://github.com/AbelTomato/repository-${index}`,
      description: `Repository ${index}`,
      language: index === 0 ? null : "TypeScript",
      stargazers_count: index + 1,
      forks_count: index + 2,
      updated_at: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
      pushed_at: `2026-09-${String(index + 1).padStart(2, "0")}T01:00:00Z`,
      fork: false,
      archived: false,
    }));

    const cache = createGithubStatsCache({
      generatedAt: "2026-09-20T12:00:00.000Z",
      profile: {
        login: "AbelTomato",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/AbelTomato",
        public_repos: 7,
        followers: 8,
        following: 9,
        created_at: "2020-01-01T00:00:00Z",
      },
      repositories,
      blogRepository: {
        name: "AbelTomato.github.io",
        html_url: "https://github.com/AbelTomato/AbelTomato.github.io",
        default_branch: "main",
      },
      blogCommit: {
        commit: {
          committer: {
            date: "2026-09-20T10:00:00Z",
          },
        },
      },
      contributions: {
        total: 14,
        startDate: "2026-09-18",
        endDate: "2026-09-20",
        days: [],
      },
    });

    expect(cache.aggregates).toEqual({
      totalStars: 28,
      totalForks: 35,
      latestActivityAt: "2026-09-20T10:00:00Z",
    });
    expect(cache.recentRepositories).toHaveLength(6);
    expect(cache.recentRepositories[0]).toMatchObject({
      name: "repository-6",
      language: "TypeScript",
    });
    expect(cache.recentRepositories.at(-1)?.name).toBe("repository-1");
    expect(cache.blogRepository).toEqual({
      name: "AbelTomato.github.io",
      url: "https://github.com/AbelTomato/AbelTomato.github.io",
      defaultBranch: "main",
      lastCommitAt: "2026-09-20T10:00:00Z",
    });
  });

  it("排除 fork 与归档仓库，且在没有提交记录时安全降级", () => {
    const cache = createGithubStatsCache({
      generatedAt: "2026-09-20T12:00:00.000Z",
      profile: {
        login: "AbelTomato",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/AbelTomato",
        public_repos: 3,
        followers: 0,
        following: 0,
        created_at: "2020-01-01T00:00:00Z",
      },
      repositories: [
        {
          name: "active",
          html_url: "https://github.com/AbelTomato/active",
          description: null,
          language: null,
          stargazers_count: 3,
          forks_count: 4,
          updated_at: "2026-09-01T00:00:00Z",
          pushed_at: null,
          fork: false,
          archived: false,
        },
        {
          name: "forked",
          html_url: "https://github.com/AbelTomato/forked",
          description: "excluded",
          language: "TypeScript",
          stargazers_count: 99,
          forks_count: 99,
          updated_at: "2026-09-10T00:00:00Z",
          pushed_at: "2026-09-10T00:00:00Z",
          fork: true,
          archived: false,
        },
        {
          name: "archived",
          html_url: "https://github.com/AbelTomato/archived",
          description: "excluded",
          language: "TypeScript",
          stargazers_count: 88,
          forks_count: 88,
          updated_at: "2026-09-11T00:00:00Z",
          pushed_at: "2026-09-11T00:00:00Z",
          fork: false,
          archived: true,
        },
      ],
      blogRepository: {
        name: "AbelTomato.github.io",
        html_url: "https://github.com/AbelTomato/AbelTomato.github.io",
        default_branch: "main",
      },
      blogCommit: null,
      contributions: {
        total: 0,
        startDate: null,
        endDate: null,
        days: [],
      },
    });

    expect(cache.aggregates).toEqual({
      totalStars: 3,
      totalForks: 4,
      latestActivityAt: "2026-09-01T00:00:00Z",
    });
    expect(cache.recentRepositories).toEqual([
      {
        name: "active",
        url: "https://github.com/AbelTomato/active",
        description: null,
        language: null,
        stars: 3,
        forks: 4,
        updatedAt: "2026-09-01T00:00:00Z",
      },
    ]);
    expect(cache.blogRepository.lastCommitAt).toBeNull();
    expect(cache.contributions.days).toEqual([]);
  });
});