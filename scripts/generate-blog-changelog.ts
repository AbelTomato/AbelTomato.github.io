import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

type Commit = { hash: string; date: string; subject: string };
type Change = { date: string; note: string; confidence: "high" | "medium" };

const root = process.cwd();
const contentDir = join(root, "src/content/blog");
const output = join(root, "docs/文章变更记录草稿.md");
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : undefined;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : /\.mdx?$/.test(entry.name) ? [file] : [];
  });
}

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function commitsFor(file: string): Commit[] {
  const path = relative(root, file).replaceAll("\\", "/");
  const raw = git(["log", "--follow", "--reverse", "--date=short", "--format=%H%x1f%ad%x1f%s", "--", path]);
  return raw ? raw.split("\n").map((line) => {
    const [hash, date, subject] = line.split("\x1f");
    return { hash, date, subject };
  }) : [];
}

function isIgnored(subject: string): boolean {
  return /^(chore|refactor|build|ci):/i.test(subject)
    || /(移动.*目录|重构.*文件结构|acorn parse|render Mermaid)/i.test(subject);
}

function noteFor(commit: Commit, file: string, isFirst: boolean): Change | undefined {
  if (isIgnored(commit.subject)) return undefined;
  if (isFirst) return { date: commit.date, note: "首次发布。", confidence: "high" };

  const path = relative(root, file).replaceAll("\\", "/");
  const diff = git(["show", "--format=", "--unified=0", commit.hash, "--", path]);
  const headings = [...diff.matchAll(/^\+#{1,6}\s+(.+)$/gm)]
    .map((match) => match[1].replace(/\s+#*$/, "").trim())
    .filter(Boolean)
    .slice(0, 2);
  const additions = [...diff.matchAll(/^\+(?!\+|---)(.*)$/gm)]
    .map((match) => match[1].trim())
    .filter((line) => line && !line.startsWith("---") && !/^(updatedDate|changelog):/.test(line));

  if (headings.length > 0) {
    return { date: commit.date, note: `补充“${headings.join("”、“")}”等内容。`, confidence: "high" };
  }
  if (additions.length >= 8) {
    return { date: commit.date, note: "补充并完善文章内容。", confidence: "medium" };
  }
  return undefined;
}

function titleOf(file: string): string {
  const match = readFileSync(file, "utf8").match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return match?.[1] ?? relative(contentDir, file);
}

const files = walk(contentDir).filter((file) => !only || file.includes(only));
const report = ["# 文章变更记录草稿", "", "> 此文件由 `pnpm changelog:dry-run` 自动生成，仅供审核，未修改任何文章 frontmatter。", ""];
let suggested = 0;

for (const file of files) {
  const commits = commitsFor(file);
  const changes = commits.flatMap((commit, index) => {
    const change = noteFor(commit, file, index === 0);
    return change ? [change] : [];
  }).reverse().slice(0, 6);
  suggested += changes.length;
  report.push(`## ${titleOf(file)}`, "", `- 文件：\`${relative(root, file).replaceAll("\\", "/")}\``, `- Git 提交：${commits.length}；建议记录：${changes.length}`, "");
  if (changes.length === 0) report.push("- 无可可靠归纳的文章内容变更。", "");
  else report.push(...changes.map((change) => `- [${change.confidence === "high" ? "高" : "中"}置信] ${change.date}：${change.note}`), "");
}

mkdirSync(join(root, "docs"), { recursive: true });
writeFileSync(output, `${report.join("\n")}\n`, "utf8");
console.log(`已生成 ${output}：${files.length} 篇文章，${suggested} 条建议记录。`);