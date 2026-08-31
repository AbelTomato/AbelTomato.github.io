import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ChangelogEntry = {
  date: string;
  note: string;
};

type FrontmatterResult = {
  content: string;
  sorted: boolean;
  changed: boolean;
};

const root = process.cwd();
const contentDir = join(root, "src/content/blog");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : /\.mdx?$/.test(entry.name) ? [file] : [];
  });
}

function compareChangelog(a: ChangelogEntry, b: ChangelogEntry): number {
  return a.date.localeCompare(b.date);
}

function sortFrontmatter(content: string): FrontmatterResult {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { content, sorted: false, changed: false };

  const frontmatter = match[1];
  const lines = frontmatter.split(/\r?\n/);
  const changelogStart = lines.findIndex((line) => /^changelog:\s*$/.test(line));
  if (changelogStart === -1) return { content, sorted: false, changed: false };

  const changelogLines: string[] = [];
  let index = changelogStart + 1;
  while (index < lines.length) {
    const line = lines[index];
    if (/^\s*-[\s\S]*$/.test(line) || /^\s{2,}\S/.test(line)) {
      changelogLines.push(line);
      index += 1;
      continue;
    }
    break;
  }

  const entries: ChangelogEntry[] = [];
  let current: ChangelogEntry | null = null;

  for (const line of changelogLines) {
    const itemMatch = line.match(/^\s*-\s*date:\s*["']?([^"']+)["']?\s*$/);
    if (itemMatch) {
      if (current) entries.push(current);
      current = { date: itemMatch[1], note: "" };
      continue;
    }

    const noteMatch = line.match(/^\s*note:\s*["']?(.*?)["']?\s*$/);
    if (noteMatch && current) {
      current.note = noteMatch[1];
    }
  }

  if (current) entries.push(current);
  if (entries.length <= 1) return { content, sorted: false, changed: false };

  const sortedEntries = [...entries].sort(compareChangelog);
  const isAlreadySorted = entries.every((entry, idx) => entry.date === sortedEntries[idx].date);
  if (isAlreadySorted) return { content, sorted: false, changed: false };

  const indent = changelogLines.find((line) => /^\s*-\s*date:/.test(line))?.match(/^(\s*)-/)?.[1] ?? "  ";
  const noteIndent = `${indent}  `;
  const rebuilt = [
    ...lines.slice(0, changelogStart + 1),
    ...sortedEntries.flatMap((entry) => [`${indent}- date: ${JSON.stringify(entry.date)}`, `${noteIndent}note: ${JSON.stringify(entry.note)}`]),
    ...lines.slice(index),
  ];

  const nextContent = content.replace(frontmatter, rebuilt.join("\n"));
  return { content: nextContent, sorted: true, changed: true };
}

let scanned = 0;
let updated = 0;

for (const file of walk(contentDir)) {
  const original = readFileSync(file, "utf8");
  const result = sortFrontmatter(original);
  scanned += 1;

  if (result.changed) {
    writeFileSync(file, result.content, "utf8");
    updated += 1;
    console.log(`已排序: ${file}`);
  }
}

console.log(`完成：扫描 ${scanned} 篇文章，更新 ${updated} 篇。`);