# scripts 目录说明

`scripts/` 存放项目维护脚本、数据同步脚本和 Git 发布辅助脚本。脚本默认在项目根目录执行，统一使用 `pnpm` 管理 TypeScript 脚本。

## 脚本索引

| 文件 | 用途 | 常用命令 |
| --- | --- | --- |
| `publish-git.ts` | 通用 Git 发布流程：创建或复用工作分支、检查、提交、同步 `main`、合并、推送和清理本地分支 | `pnpm git:publish [分支名]` |
| `sync-wakatime.js` | 从 WakaTime API 同步编码统计数据到 `src/features/waka/data/wakatime.json` | 由 GitHub Actions 自动执行 |
| `fetch-leetcode.ts` | 从 LeetCode 获取用户数据并写入 `src/features/leetcode-stats/data/leetcode.json` | `pnpm exec tsx scripts/fetch-leetcode.ts` |
| `generate-blog-changelog.ts` | 根据文章 Git 历史生成文章变更记录草稿，不修改文章 frontmatter | `pnpm changelog:dry-run` |
| `sort-blog-changelog.ts` | 按日期排序文章 frontmatter 中的 `changelog` 条目 | `pnpm changelog:sort` |
| `backfill-pubdate-time.ts` | 根据文章首次 Git 提交时间补全 `pubDate` 的时分 | `pnpm pubdate:backfill` |
| `migrate.js` | 旧版博客文件结构迁移脚本，将文章和配图迁移到文章目录结构 | 仅在确认迁移范围后手动执行 |

## 通用 Git 发布流程

项目通过 GitHub Actions 监听 `main` 分支。向 `main` 推送后，Actions 会执行数据同步、类型检查、构建和 GitHub Pages 部署。

### 推荐用法

在 `main` 上有修改时，指定一个工作分支：

```powershell
pnpm git:publish docs/upload-blog
```

分支名不限于 `docs/*`，也可以使用：

```powershell
pnpm git:publish feat/new-feature
pnpm git:publish fix/build-error
pnpm git:publish chore/update-dependencies
```

不传分支名时，脚本会交互询问：

```powershell
pnpm git:publish
```

如果当前已经在非 `main` 分支上，脚本会复用当前分支：

```powershell
pnpm git:publish
```

### 自动执行步骤

```text
检查当前分支和工作区
→ 在 main 上创建工作分支，或复用当前分支
→ pnpm run check
→ 显示待提交文件并确认
→ git add -A
→ git commit
→ 切回 main
→ git pull --rebase origin main
→ git merge --no-ff -m "Merge branch '工作分支'" 工作分支
→ git push origin main
→ 删除本地工作分支
```

脚本帮助信息：

```powershell
pnpm git:publish -- --help
```

### 提交信息

脚本会交互询问提交信息。直接回车使用默认值：

```text
chore: update project
```

建议根据修改内容填写更具体的提交信息，例如：

```text
docs: upload the blog "文章标题"
feat: add comment refresh interaction
fix: resolve mobile layout overflow
chore: sync project metrics
```

### 分支和推送失败处理

以下步骤失败时，脚本不会自动删除工作分支：

- `pnpm run check` 失败；
- `git pull --rebase` 产生冲突；
- `git merge --no-ff` 产生冲突；合并提交信息由脚本自动生成，不会打开 Git 编辑器；
- `git push` 失败；
- GitHub Actions 自动提交导致远程分支发生变化。

处理冲突后，先确认当前 Git 状态，再继续完成提交、合并或推送。不要在状态未确认的情况下强制删除工作分支。

## WakaTime 和 LeetCode 自动同步

`.github/workflows/deploy.yml` 在每次 `main` 推送，以及定时任务触发时执行：

1. 运行 `scripts/sync-wakatime.js`；
2. 运行 `scripts/fetch-leetcode.ts`；
3. 将发生变化的数据文件提交并推送到 `main`；
4. 执行 `pnpm run ci`；
5. 部署 GitHub Pages。

相关环境变量由 GitHub Actions Secrets 提供：

```text
WAKATIME_API_KEY
LEETCODE_SESSION
```

本地手动运行数据同步脚本前，需要在 `.env` 中配置相应变量。不要将 `.env` 或任何 API Key、Session 提交到 Git。

由于 Actions 可能在远程自动提交数据，`publish-git.ts` 在合并工作分支前会执行：

```powershell
git pull --rebase origin main
```

这一步不要跳过，否则本地 `main` 可能落后于远程，导致推送被拒绝。

## 文章变更记录工具

### 生成草稿

```powershell
pnpm changelog:dry-run
```

输出文件为：

```text
docs/文章变更记录草稿.md
```

也可以只处理标题或路径中包含指定文本的文章：

```powershell
pnpm exec tsx scripts/generate-blog-changelog.ts --only 文章标题
```

该脚本只生成建议，不会自动写入文章 frontmatter。审核草稿后，再手动修改文章内容。

### 排序 frontmatter 中的 changelog

```powershell
pnpm changelog:sort
```

该脚本会直接修改文章文件，将已有 `changelog` 条目按日期排序。执行前应先确认工作区状态，并在执行后检查 diff。

## 发布前检查清单

```powershell
git status
pnpm run check
pnpm git:publish <工作分支名>
```

发布完成后，可在 GitHub Actions 页面确认构建部署状态，并访问：

```text
https://abeltomato.github.io
```

## 新增脚本约定

- TypeScript 脚本使用 `.ts`，JavaScript 脚本使用 `.js`；
- 需要项目依赖时优先通过 `package.json` scripts 暴露命令；
- 脚本中的路径应基于项目根目录计算，避免依赖执行时的当前目录；
- 会修改文件的脚本必须在文档中明确说明修改范围；
- 涉及远程 API 的脚本必须说明所需环境变量，禁止输出敏感凭据；
- 修改脚本后至少运行对应的帮助命令、类型检查或 dry-run，并检查 `git diff`。