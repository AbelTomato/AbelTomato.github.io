# GitHub Actions 自动同步推送冲突问题

## 状态

- 已定位
- 暂缓修复
- 不影响评论 API 已部署状态

## 问题现象

在 `Deploy to GitHub Pages` 工作流中，`Commit and Push changes` 步骤失败，随后 `Build Astro`、`Upload artifact` 和 `Deploy` 都没有执行。

失败日志核心信息如下：

```text
! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'https://github.com/AbelTomato/AbelTomato.github.io'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart.
```

## 已确认事实

- 工作流检出时的提交是 `55c089e`。
- 失败时远端 `main` 已推进到 `b3f2de3`。
- 远端新增提交同样是自动生成的指标同步提交：

```text
chore: automated metrics sync (wakatime & leetcode) [skip ci]
```

- 这次失败发生在 Astro 构建之前，因此 `PUBLIC_COMMENT_API_URL` 还没有进入这次失败运行的构建产物。
- Cloudflare Worker、Hyperdrive、Supabase 评论链路本身已经验证成功，和本次失败不是同一个问题。

## 根因

当前工作流同时负责三件事：

1. 同步 WakaTime 数据。
2. 同步 LeetCode 数据。
3. 将生成的 JSON 直接提交回 `main`，然后继续构建并部署 GitHub Pages。

问题在于它没有并发控制，也没有在推送前重放远端最新提交。工作流检出后，如果另一个 Actions 运行已经把 `main` 往前推进，再执行普通的 `git push origin main`，就会触发 non-fast-forward 拒绝。

这不是代码生成失败，也不是 Pages 部署失败，而是自动同步步骤与仓库主分支之间出现了提交竞态。

## 影响范围

- 会中断 GitHub Pages 的构建和部署。
- 会阻止本次运行把新的 `PUBLIC_COMMENT_API_URL` 等前端环境变量带入构建产物。
- 会让定时任务和手动触发的工作流在高频运行时互相干扰。

## 已验证的无关项

- `apps/comment-api` 已成功部署到 Cloudflare Workers。
- `/health` 返回 `200`。
- `GET /api/comments?postSlug=deployment-smoke-test` 返回 `200`，并能正确返回空数组。
- CORS 已对 `https://abeltomato.github.io` 生效。

## 临时规避

如果只是想让这次部署继续往下跑，可以在 GitHub Actions 页面重新运行失败任务，前提是没有新的自动同步提交再次插入。

这个办法只能缓解，不能消除竞态。

## 推荐最小修复

先做最小修改，而不是立刻重构整个发布链路：

1. 给工作流增加并发控制。

```yaml
concurrency:
  group: pages-deploy
  cancel-in-progress: false
```

2. 在提交前先拉取远端最新 `main`，用 rebase 重放本次自动同步提交。

```bash
git pull --rebase origin main
git push origin HEAD:main
```

3. 维持 `[skip ci]`，避免自动同步提交再次反向触发同一条流水线。

## 长期方案

更稳妥的结构是把职责拆开：

- `sync-metrics.yml` 只负责拉取 WakaTime / LeetCode 数据并提交变更。
- `deploy.yml` 只负责构建和部署 GitHub Pages。

这样可以降低单个工作流同时修改仓库和部署页面带来的竞态风险。

不过拆分后还需要重新设计触发关系，因为默认的 `GITHUB_TOKEN` 推送通常不会再触发新的 `push` 工作流。

## 验证标准

- 自动同步提交不会再因为 non-fast-forward 失败。
- 数据变更时能够安全提交并继续执行构建。
- 数据无变化时不会产生空提交。
- GitHub Pages 构建能够正常完成。
- 前端构建能读取到 `PUBLIC_COMMENT_API_URL`。

## 当前处理状态

此问题已记录，工作流修改暂缓，等待后续单独处理。