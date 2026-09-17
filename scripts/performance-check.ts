import { readdir, stat } from "node:fs/promises";
import path from "node:path";

type AssetCategory = "JavaScript" | "CSS" | "HTML" | "图片" | "字体" | "音频" | "其他";

interface AssetSummary {
  bytes: number;
  files: number;
}

interface AssetEntry {
  path: string;
  bytes: number;
}

const root = process.cwd();
const distDirectory = path.join(root, "dist");

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
}

function categoryFor(filePath: string): AssetCategory {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".js" || extension === ".mjs") return "JavaScript";
  if (extension === ".css") return "CSS";
  if (extension === ".html") return "HTML";
  if ([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"].includes(extension)) return "图片";
  if ([".otf", ".ttf", ".woff", ".woff2"].includes(extension)) return "字体";
  if ([".m4a", ".mp3", ".ogg", ".wav"].includes(extension)) return "音频";
  return "其他";
}

async function collectFiles(directory: string): Promise<AssetEntry[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<AssetEntry[]> => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(absolutePath);
      const metadata = await stat(absolutePath);
      return [{ path: path.relative(root, absolutePath), bytes: metadata.size }];
    }),
  );
  return files.flat();
}

async function main() {
  try {
    await stat(distDirectory);
  } catch {
    throw new Error("未找到 dist 目录，请先运行 pnpm build。");
  }

  const files = await collectFiles(distDirectory);
  const summaries = new Map<AssetCategory, AssetSummary>();

  for (const file of files) {
    const category = categoryFor(file.path);
    const summary = summaries.get(category) ?? { bytes: 0, files: 0 };
    summary.bytes += file.bytes;
    summary.files += 1;
    summaries.set(category, summary);
  }

  const totalBytes = files.reduce((total, file) => total + file.bytes, 0);
  console.log(`构建产物：${formatBytes(totalBytes)}，共 ${files.length} 个文件`);

  for (const category of ["JavaScript", "CSS", "HTML", "图片", "字体", "音频", "其他"] as const) {
    const summary = summaries.get(category) ?? { bytes: 0, files: 0 };
    console.log(`${category.padEnd(10)} ${formatBytes(summary.bytes).padStart(12)}  ${summary.files} 个文件`);
  }

  console.log("\n体积最大的 15 个文件：");
  files
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, 15)
    .forEach((file) => console.log(`${formatBytes(file.bytes).padStart(12)}  ${file.path}`));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});