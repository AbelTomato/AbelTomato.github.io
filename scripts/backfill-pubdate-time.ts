import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const contentDir = join(root, "src/content/blog");
const dryRun = process.argv.includes("--dry-run");
const timeZone = "Asia/Shanghai";

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : /\.mdx?$/.test(entry.name) ? [file] : [];
  });
}

function getFirstCommitDates(): Map<string, Date> {
  const result = new Map<string, Date>();
  const output = execFileSync(
    "git",
    ["log", "--reverse", "--format=__COMMIT__%aI", "--name-status", "--", "src/content/blog"],
    { cwd: root, encoding: "utf8" },
  );
  let commitDate: Date | undefined;

  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith("__COMMIT__")) {
      const date = new Date(line.slice("__COMMIT__".length));
      commitDate = Number.isNaN(date.getTime()) ? undefined : date;
      continue;
    }

    const match = line.match(/^(?:[AM]\t|R\d+\t[^\t]+\t)(.+)$/);
    if (match && commitDate && !result.has(match[1])) result.set(match[1], commitDate);
  }

  return result;
}

function timeParts(date: Date): { hour: string; minute: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { hour: values.hour, minute: values.minute };
}

let scanned = 0;
let updated = 0;
let skipped = 0;
const firstCommitDates = getFirstCommitDates();

for (const file of walk(contentDir)) {
  scanned += 1;
  const original = readFileSync(file, "utf8");
  const match = original.match(
    /^(\s*pubDate:\s*).*?(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})?.*$/m,
  );

  if (!match) {
    skipped += 1;
    continue;
  }

  const existingTime = match[3];
  let nextValue: string;
  if (existingTime) {
    nextValue = `${match[2]}${existingTime}`;
  } else {
    const commitDate = firstCommitDates.get(relative(root, file).replaceAll("\\", "/"));
    if (!commitDate) {
      skipped += 1;
      console.warn(`跳过（无 git 首次提交记录）: ${relative(root, file)}`);
      continue;
    }

    const { hour, minute } = timeParts(commitDate);
    nextValue = `${match[2]}T${hour}:${minute}:00+08:00`;
  }
  const nextContent = original.replace(
    match[0],
    `${match[1]}"${nextValue}"`,
  );

  if (dryRun) {
    console.log(`${relative(root, file)}: ${match[2]} -> ${nextValue}`);
  } else if (nextContent !== original) {
    writeFileSync(file, nextContent, "utf8");
  }
  updated += 1;
}

console.log(`${dryRun ? "预览完成" : "回填完成"}：扫描 ${scanned} 篇，${dryRun ? "计划更新" : "已更新"} ${updated} 篇，跳过 ${skipped} 篇。`);