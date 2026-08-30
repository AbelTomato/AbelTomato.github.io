# Railway 评论系统部署指南

本文档用于将博客评论系统部署为：

```txt
GitHub Pages 静态博客
  └─ PUBLIC_COMMENT_API_URL
       └─ Railway comment-api（Hono + Drizzle）
            └─ Railway PostgreSQL
```

当前方案以可执行和低维护为优先级。API 保持 Node 运行时，不改写为 Cloudflare Workers。

## 1. 部署前检查

本地先确认以下命令通过：

```bash
pnpm --filter comment-api test
pnpm --filter comment-api build
pnpm --filter comment-api db:check
pnpm build
```

确认不要提交以下内容：

- `.env`、`.env.local`、`.env.production`
- 数据库连接串
- `COMMENT_HASH_SALT`
- `COMMENT_ADMIN_PASSWORD_HASH`
- `COMMENT_JWT_SECRET`
- Turnstile Secret Key
- `dist/`

## 2. 生成生产密钥

在本地生成随机 salt 和 JWT secret：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

执行两次，分别作为：

- `COMMENT_HASH_SALT`
- `COMMENT_JWT_SECRET`

生成管理员密码 hash：

```bash
node -e "console.log(require('crypto').createHash('sha256').update('替换成你的管理员密码').digest('hex'))"
```

只保存输出的 64 位 hex 到 Railway 环境变量。不要把管理员明文密码或 hash 写入仓库。

## 3. 配置 Cloudflare Turnstile

1. 打开 Cloudflare Dashboard。
2. 进入 Turnstile，创建一个新站点。
3. 域名至少填写：
   - `abeltomato.github.io`
   - 如需本地调试，可额外添加 `localhost`
4. 保存：
   - Site Key：给前端构建变量 `PUBLIC_TURNSTILE_SITE_KEY`
   - Secret Key：给 API 环境变量 `TURNSTILE_SECRET_KEY`

如果暂时不想启用 Turnstile，可以不配置 `TURNSTILE_SECRET_KEY` 和 `PUBLIC_TURNSTILE_SITE_KEY`。生产环境不建议长期关闭。

## 4. 创建 Railway PostgreSQL

1. 登录 Railway。
2. New Project。
3. Add Service → Database → PostgreSQL。
4. 等待数据库创建完成。
5. 记住数据库服务暴露的变量：`DATABASE_URL`。

后续 API 服务中使用 Railway 的变量引用，例如：

```txt
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

实际名称取决于 Railway 中 PostgreSQL 服务名；如果服务名不是 `Postgres`，按 Railway Variables 面板中的提示选择。

## 5. 部署 comment-api 服务

在同一个 Railway Project 中：

1. Add Service → GitHub Repo。
2. 选择当前博客仓库。
3. 服务 Root Directory 保持仓库根目录，不要设置为 `apps/comment-api`。

推荐留空，或明确设置为：

```txt
.
```

4. 设置构建和启动命令：

```bash
pnpm install --frozen-lockfile
pnpm --filter comment-api build
pnpm --filter comment-api start
```

说明：

- 本仓库是 pnpm workspace，根目录有 `pnpm-lock.yaml` 和 `pnpm-workspace.yaml`。
- Railway 从仓库根目录执行更稳妥，能正确安装 workspace 依赖。
- 不建议把 Railway Root Directory 设置为 `apps/comment-api`；否则可能无法正确使用根目录 lockfile 和 workspace 配置。

## 6. 配置 Railway API 环境变量

在 Railway 的 comment-api 服务中配置：

```env
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
COMMENT_ALLOWED_ORIGINS=https://abeltomato.github.io
COMMENT_HASH_SALT=<第2步生成的随机字符串>
COMMENT_ADMIN_PASSWORD_HASH=<第2步生成的管理员密码sha256>
COMMENT_JWT_SECRET=<第2步生成的随机字符串>
TURNSTILE_SECRET_KEY=<Cloudflare Turnstile Secret Key>
```

如果需要本地或预览环境访问 API，可临时追加来源：

```env
COMMENT_ALLOWED_ORIGINS=https://abeltomato.github.io,http://localhost:4321
```

生产环境不要长期允许不必要的 Origin。

## 7. 首次执行数据库迁移

API 服务部署成功后，在 Railway 的 comment-api 服务中打开 Shell，执行：

```bash
pnpm --filter comment-api db:migrate
```

迁移成功后，可执行：

```bash
pnpm --filter comment-api db:check
```

如果你没有按本文推荐配置，而是手动进入了 `apps/comment-api` 目录，才使用：

```bash
pnpm db:migrate
pnpm db:check
```

## 8. 获取 API 公网地址

在 Railway comment-api 服务中生成 Public Networking 域名，例如：

```txt
https://comment-api-production-xxxx.up.railway.app
```

访问以下地址做基本检查：

```txt
https://comment-api-production-xxxx.up.railway.app/api/comments?postSlug=health-check
```

期望返回：

```json
{ "comments": [] }
```

如果返回 500，优先检查：

- `DATABASE_URL` 是否存在
- 是否已经执行 `pnpm db:migrate`
- Railway 日志中的数据库连接错误

## 9. 配置 GitHub Pages 前端构建变量

前端静态站点需要两个公开变量：

```env
PUBLIC_COMMENT_API_URL=https://comment-api-production-xxxx.up.railway.app
PUBLIC_TURNSTILE_SITE_KEY=<Cloudflare Turnstile Site Key>
```

如果当前 GitHub Pages 通过 GitHub Actions 构建，需要在仓库 Settings → Secrets and variables → Actions 中配置变量，并确保 workflow 把变量传给 `pnpm build`。

如果当前是本地构建后推送 `dist`，则在本地 `.env.production` 中配置上述变量再构建。不要提交 `.env.production`。

## 10. 上线验收流程

部署完成后按顺序检查：

1. 打开任意文章页，确认评论区出现。
2. 提交一条测试评论。
3. 评论提交后应提示：`评论已提交，审核后展示`。
4. 未审核评论不应立即显示在公开文章页。
5. 打开 `https://abeltomato.github.io/comment-admin/`，使用生成 `COMMENT_ADMIN_PASSWORD_HASH` 时对应的管理员密码登录；在“待审核”中通过测试评论。
6. 刷新文章页，确认评论显示。

### 管理员 API（备用）

管理员网页通过以下 API 工作；仅在界面不可用时再手动调用：

```bash
curl -X POST "https://comment-api-production-xxxx.up.railway.app/api/admin/login" ^
  -H "content-type: application/json" ^
  -d "{\"password\":\"你的管理员密码\"}"
```

Windows `cmd.exe` 使用上面的 `^` 续行；PowerShell 或 Bash 需要改为对应语法。

1. 复制返回的 token，查看 pending 评论：

```bash
curl "https://comment-api-production-xxxx.up.railway.app/api/admin/comments?status=pending" ^
  -H "authorization: Bearer <token>"
```

2. 批准评论：

```bash
curl -X PATCH "https://comment-api-production-xxxx.up.railway.app/api/admin/comments/<comment-id>/status" ^
  -H "authorization: Bearer <token>" ^
  -H "content-type: application/json" ^
  -d "{\"status\":\"approved\"}"
```

3. 刷新文章页，确认评论显示。

## 11. 常见故障

### 11.1 前端显示加载失败

检查：

- `PUBLIC_COMMENT_API_URL` 是否是 Railway API 域名。
- API 的 `COMMENT_ALLOWED_ORIGINS` 是否包含 `https://abeltomato.github.io`。
- 浏览器控制台是否有 CORS 报错。

### 11.2 提交评论返回 403

常见原因：

- Turnstile Site Key 和 Secret Key 不匹配。
- Cloudflare Turnstile 没有配置当前域名。
- 请求 Origin 不在 `COMMENT_ALLOWED_ORIGINS`。

### 11.3 API 返回 500

检查：

- `DATABASE_URL` 是否正确。
- 是否执行 `pnpm db:migrate`。
- `COMMENT_HASH_SALT` 是否存在且长度至少 16。
- Railway 日志中是否有数据库连接错误。

### 11.4 管理员无法登录

检查：

- `COMMENT_ADMIN_PASSWORD_HASH` 是否由真实管理员密码生成。
- `COMMENT_JWT_SECRET` 是否存在且长度至少 32。
- 登录请求 JSON 字段是否为 `password`。

## 12. 回滚策略

如果上线后评论系统异常：

1. GitHub Pages 暂时移除或清空 `PUBLIC_COMMENT_API_URL`，重新构建，可让前端回到同源 `/api/comments`；但静态站点没有同源 API 时仍会加载失败。
2. 更稳妥的临时处理是在文章 frontmatter 设置：

```yaml
comments: false
```

3. 或在代码中临时移除 `BlogPost.astro` 的评论组件接入，重新部署静态站点。

数据库迁移第一版只创建评论表；如果已经有真实评论数据，不要直接删除数据库服务。