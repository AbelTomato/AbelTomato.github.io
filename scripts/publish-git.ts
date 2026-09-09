import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const root = process.cwd();
const mainBranch = "main";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

type CommandOptions = {
  allowFailure?: boolean;
  shell?: boolean;
  stdio?: "inherit" | "pipe";
};

function run(command: string, args: string[], options: CommandOptions = {}): string {
  try {
    const result = execFileSync(command, args, {
      cwd: root,
      encoding: "utf8",
      shell: options.shell,
      stdio: options.stdio ?? "pipe",
    });

    return typeof result === "string" ? result.trim() : "";
  } catch (error) {
    if (options.allowFailure) return "";
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${command} ${args.join(" ")} 执行失败：\n${message}`);
  }
}

function git(args: string[], options: CommandOptions = {}): string {
  return run("git", args, options);
}

function currentBranch(): string {
  return git(["branch", "--show-current"]);
}

function hasChanges(): boolean {
  return Boolean(git(["status", "--porcelain"]));
}

function branchArgument(): string | undefined {
  const args = process.argv.slice(2).filter((argument) => argument !== "--");
  return args.find((argument) => !argument.startsWith("-"));
}

function branchExists(branch: string): boolean {
  try {
    execFileSync("git", ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], {
      cwd: root,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function uniqueBranchName(branch: string): string {
  if (!branchExists(branch)) return branch;
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  return `${branch}-${timestamp}`;
}

async function confirm(message: string): Promise<boolean> {
  const readline = createInterface({ input, output });
  const answer = await readline.question(`${message} (Y/n) `);
  readline.close();
  return answer.trim() === "" || /^y(es)?$/i.test(answer.trim());
}

async function commitMessage(): Promise<string> {
  const readline = createInterface({ input, output });
  const answer = await readline.question("请输入提交信息（直接回车使用 chore: update project）：");
  readline.close();
  return answer.trim() || "chore: update project";
}

async function requestedBranch(): Promise<string> {
  const argument = branchArgument();
  if (argument) return argument;

  const readline = createInterface({ input, output });
  const answer = await readline.question("请输入工作分支名（例如 docs/upload-blog、feat/new-feature）：");
  readline.close();
  const branch = answer.trim();
  if (!branch) throw new Error("工作分支名不能为空。");
  return branch;
}

async function main(): Promise<void> {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`用法：\n  pnpm git:publish [工作分支名]\n\n示例：\n  pnpm git:publish docs/upload-blog\n  pnpm git:publish feat/new-feature\n\n说明：\n  在 main 上会创建指定的工作分支；未指定时交互输入分支名。\n  在其他分支上会复用当前分支，忽略分支名参数。\n  脚本会执行检查、提交、同步 main、合并、推送和删除本地工作分支。`);
    return;
  }

  const startingBranch = currentBranch();
  let workingBranch = startingBranch;

  if (startingBranch === mainBranch) {
    if (!hasChanges()) {
      throw new Error("当前 main 没有未提交的修改，无需发布。");
    }
    workingBranch = uniqueBranchName(await requestedBranch());
    git(["switch", "-c", workingBranch], { stdio: "inherit" });
    console.log(`已创建工作分支：${workingBranch}`);
  } else if (!hasChanges()) {
    throw new Error(`当前分支 ${startingBranch} 没有未提交的修改，无需发布。`);
  }

  console.log("正在运行 pnpm run check...");
  run(pnpmCommand, ["run", "check"], {
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  console.log("\n待提交文件：");
  console.log(git(["status", "--short"]));
  if (!(await confirm("确认提交并发布这些修改？"))) {
    console.log("已取消。当前工作分支和修改均保留。");
    return;
  }

  const message = await commitMessage();
  git(["add", "-A"], { stdio: "inherit" });
  git(["commit", "-m", message], { stdio: "inherit" });

  console.log("正在切回 main 并同步远程更新...");
  git(["switch", mainBranch], { stdio: "inherit" });
  git(["pull", "--rebase", "origin", mainBranch], { stdio: "inherit" });

  console.log(`正在合并 ${workingBranch}...`);
  git(["merge", "--no-ff", workingBranch], { stdio: "inherit" });
  git(["push", "origin", mainBranch], { stdio: "inherit" });
  git(["branch", "-d", workingBranch], { stdio: "inherit" });

  console.log("\n发布完成。GitHub Actions 将继续构建并部署网站。");
}

try {
  await main();
} catch (error) {
  console.error(`\n发布失败：${error instanceof Error ? error.message : String(error)}`);
  console.error("工作分支不会被自动删除，请先处理冲突或修复错误后再继续。");
  process.exitCode = 1;
}