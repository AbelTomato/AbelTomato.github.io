# 评论系统说明

本项目的评论系统由两个部分组成：

- `apps/comment-api`：Hono + Drizzle + PostgreSQL API 服务。
- `src/features/comments/components/CommentSection.tsx`：文章页评论列表和提交表单。

## 环境变量

评论 API：

```env
PORT=8787
DATABASE_URL=postgres://user:password@host:5432/database
COMMENT_ALLOWED_ORIGINS=https://abeltomato.github.io,http://localhost:4321
TURNSTILE_SECRET_KEY=cloudflare-turnstile-secret
COMMENT_ADMIN_PASSWORD_HASH=sha256-password-hex
COMMENT_JWT_SECRET=at-least-32-characters-secret
COMMENT_HASH_SALT=at-least-16-characters-random-salt
```

前端站点：

```env
PUBLIC_COMMENT_API_URL=https://comment-api.example.com
PUBLIC_TURNSTILE_SITE_KEY=cloudflare-turnstile-site-key
```

`PUBLIC_COMMENT_API_URL` 为空时，前端会请求同源 `/api/comments`。
`PUBLIC_TURNSTILE_SITE_KEY` 为空时，前端不会渲染 Turnstile；如果后端配置了 `TURNSTILE_SECRET_KEY`，前端必须同时配置站点 key。
配置站点 key 后，评论组件会在客户端按需加载 Turnstile 脚本，并在脚本加载完成后显式渲染验证码。加载期间会显示“正在加载人机验证”，加载或运行失败时会给出可见错误提示并阻止提交，避免验证码因页面 hydration 与脚本加载顺序不同而空白。
`COMMENT_HASH_SALT` 用于邮箱、IP 和 User-Agent 的不可逆哈希；配置 `DATABASE_URL` 时必须同时配置该值，生产环境不要复用示例值。

## 数据库

生成迁移：

```bash
pnpm --filter comment-api db:generate
```

应用迁移：

```bash
pnpm --filter comment-api db:migrate
```

检查迁移快照：

```bash
pnpm --filter comment-api db:check
```

如果当前目录已经是 `apps/comment-api`，则使用：

```bash
pnpm db:migrate
pnpm db:check
```

## 部署

推荐部署方式：GitHub Pages 承载静态博客，Railway 承载 `apps/comment-api` 和 PostgreSQL。

完整步骤见：[`docs/Railway评论系统部署指南.md`](./Railway评论系统部署指南.md)。

## API

公开接口：

- `GET /api/comments?postSlug=...`：获取指定文章已审核评论。
- `POST /api/comments`：提交评论，默认进入 `pending` 状态。

管理接口：

- `POST /api/admin/login`：使用管理员密码登录，返回 bearer token。
- `GET /api/admin/comments?status=pending`：按状态列出评论。
- `PATCH /api/admin/comments/:id/status`：更新评论状态，可选 `pending`、`approved`、`rejected`、`deleted`。
- `DELETE /api/admin/comments/:id`：软删除评论，等价于设置 `deleted` 状态。

管理页面支持通过、拒绝和删除评论；拒绝的评论可在“已拒绝”筛选中查看。

## 验证命令

```bash
pnpm --filter comment-api test
pnpm --filter comment-api build
pnpm --filter comment-api db:check
pnpm build
```