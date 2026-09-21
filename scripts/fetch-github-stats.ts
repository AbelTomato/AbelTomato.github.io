import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createGithubStatsCache,
  parseGithubContributionCalendar,
} from "../src/features/github/utils/githubStats";
import type {
  GithubBlogRepositoryResponse,
  GithubCommitResponse,
  GithubContributionCalendarResponse,
  GithubRepositoryResponse,
  GithubStatsCache,
  GithubUserResponse,
} from "../src/features/github/types";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_USERNAME = "AbelTomato";
const BLOG_REPOSITORY = "AbelTomato.github.io";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const cacheFilePath = path.resolve(
  scriptDirectory,
  "../src/features/github/data/github-stats.json",
);

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function fetchGithubJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${endpoint} 请求失败：${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

async function fetchGithubContributions(): Promise<ReturnType<typeof parseGithubContributionCalendar>> {
  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        login: GITHUB_USERNAME,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`GitHub GraphQL 请求失败：${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: GithubContributionCalendarResponse;
        };
      };
    };
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL 返回错误：${payload.errors[0]?.message ?? "未知错误"}`);
  }

  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error("GitHub GraphQL 未返回贡献日历。");
  }

  return parseGithubContributionCalendar(calendar);
}

async function hasExistingCache() {
  try {
    await readFile(cacheFilePath, "utf8");
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function writeCache(cache: GithubStatsCache) {
  await mkdir(path.dirname(cacheFilePath), { recursive: true });
  const temporaryFilePath = `${cacheFilePath}.tmp`;
  await writeFile(temporaryFilePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  await rename(temporaryFilePath, cacheFilePath);
}

export async function fetchGithubStats() {
  const profile = await fetchGithubJson<GithubUserResponse>(
    `/users/${GITHUB_USERNAME}`,
  );
  const repositories = await fetchGithubJson<GithubRepositoryResponse[]>(
    `/users/${GITHUB_USERNAME}/repos?type=owner&sort=updated&direction=desc&per_page=100`,
  );
  const blogRepository = await fetchGithubJson<GithubBlogRepositoryResponse>(
    `/repos/${GITHUB_USERNAME}/${BLOG_REPOSITORY}`,
  );
  const blogCommit = await fetchGithubJson<GithubCommitResponse>(
    `/repos/${GITHUB_USERNAME}/${BLOG_REPOSITORY}/commits/${blogRepository.default_branch}`,
  );
  const contributions = await fetchGithubContributions();

  const cache = createGithubStatsCache({
    generatedAt: new Date().toISOString(),
    profile,
    repositories,
    blogRepository,
    blogCommit,
    contributions,
  });
  await writeCache(cache);
  console.log(`GitHub 状态数据已写入 ${path.relative(process.cwd(), cacheFilePath)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchGithubStats().catch(async (error: unknown) => {
    if (await hasExistingCache()) {
      console.warn(
        `GitHub 状态数据同步失败，保留已有缓存：${error instanceof Error ? error.message : String(error)}`,
      );
      process.exitCode = 0;
      return;
    }

    console.error(
      `GitHub 状态数据首次同步失败，未生成缓存：${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  });
}