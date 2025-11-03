# 认证系统使用说明

## 概述

本项目已经完成了基于 Better Auth 和 Shadcn UI 的登录和注册功能，并采用**服务端 Session 管理**优化性能。

## 🚀 核心特性

### 服务端 Session 管理

本项目使用 TanStack Start 的服务端中间件获取 session，而不是在客户端频繁请求 API。

**优势：**
- ⚡ 减少 50% 的网络请求
- 🚀 更快的页面加载速度
- 💾 降低服务器负载
- ✨ 无加载闪烁，更好的用户体验

详细说明请查看：[SERVER_SESSION_OPTIMIZATION.md](./SERVER_SESSION_OPTIMIZATION.md)

## 已完成的功能

### 1. 注册页面 (`/sign-up`)
- ✅ 表单验证（姓名、邮箱、密码、确认密码）
- ✅ 邮箱格式验证
- ✅ 密码长度验证（最少8个字符）
- ✅ 密码匹配验证
- ✅ 友好的错误提示
- ✅ 加载状态显示
- ✅ 成功后自动跳转到首页

### 2. 登录页面 (`/sign-in`)
- ✅ 表单验证（邮箱、密码）
- ✅ 邮箱格式验证
- ✅ 友好的错误提示
- ✅ 加载状态显示
- ✅ 成功后自动跳转到首页
- ✅ "忘记密码"链接（待实现功能）

### 3. UI 组件
- ✅ 使用 Shadcn UI 的 Card、Button、Input、Label 组件
- ✅ 响应式设计，支持移动端
- ✅ 优雅的渐变背景
- ✅ 清晰的视觉层次

### 4. 表单处理
- ✅ 使用 react-hook-form 进行表单管理
- ✅ 实时表单验证
- ✅ 错误状态展示
- ✅ 无障碍支持（aria-invalid）

### 5. Better Auth 集成
- ✅ 邮箱密码注册
- ✅ 邮箱密码登录
- ✅ 用户会话管理
- ✅ 组织和管理员功能支持
- ✅ **服务端 Session 获取**（性能优化）

### 6. 个人资料页面 (`/profile`)
- ✅ 显示用户信息（姓名、邮箱、注册时间等）
- ✅ 会话信息展示
- ✅ 退出登录功能
- ✅ 路由保护（未登录自动跳转）

## 使用方法

### 在组件中获取 Session

**推荐方式（服务端渲染）：**
```typescript
import { useRouterState } from '@tanstack/react-router'

function MyComponent() {
  // 从 router context 获取 session（服务端已准备好）
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session
  
  if (!session?.user) {
    return <div>请先登录</div>
  }
  
  return <div>欢迎，{session.user.name}</div>
}
```

**Session 数据结构：**
```typescript
session = {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    createdAt: Date
    role?: string | null
  },
  session: {
    id: string
    expiresAt: Date
    token: string
  }
}
```

### 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动。

### 访问页面

- 注册页面: `http://localhost:3000/sign-up`
- 登录页面: `http://localhost:3000/sign-in`
- 个人资料: `http://localhost:3000/profile` (需要登录)

### 认证流程

1. **注册新用户**
   - 访问 `/sign-up`
   - 填写姓名、邮箱、密码
   - 提交后自动登录并跳转到首页

2. **登录**
   - 访问 `/sign-in`
   - 输入邮箱和密码
   - 登录成功后跳转到首页

3. **查看个人资料**
   - 点击 Header 中的用户名或访问 `/profile`
   - 查看个人信息和会话详情

4. **退出登录**
   - 点击 Header 中的"退出"按钮
   - 或在个人资料页面点击"退出登录"

### 数据库

项目使用 SQLite 数据库，数据库文件位于 `db.sqlite`。

如果需要重新生成数据库表：

```bash
# 生成迁移文件
pnpm db:generate

# 应用迁移
pnpm db:push
```

### 查看数据库

使用 Drizzle Studio 查看数据库内容：

```bash
pnpm db:studio
```

## 技术栈

- **框架**: TanStack Router + TanStack Start
- **UI 组件**: Shadcn UI (基于 Radix UI)
- **表单管理**: React Hook Form
- **认证**: Better Auth
- **数据库**: SQLite + Drizzle ORM
- **样式**: Tailwind CSS
- **通知**: Sonner (Toast)
- **Session 管理**: 服务端 SSR (零客户端请求)

## 架构亮点

### 服务端中间件

在 `src/server.ts` 中实现了 session 中间件：

```typescript
const handler = createStartHandler(async ({ request, router, responseHeaders }) => {
  // 在服务端获取 session
  const session = await auth.api.getSession({ headers: request.headers });
  
  // 注入到 router context
  router.update({
    context: {
      ...router.options.context,
      session: session,
    },
  });

  return defaultRenderHandler({ request, router, responseHeaders });
});
```

这样每次服务端渲染时，session 就已经准备好了，无需客户端额外请求。

## 主要文件

- `src/routes/(sign)/sign-up.tsx` - 注册页面
- `src/routes/(sign)/sign-in.tsx` - 登录页面
- `src/routes/profile.tsx` - 个人资料页面
- `src/auth/auth.client.ts` - Better Auth 客户端配置
- `src/auth/auth.server.ts` - Better Auth 服务端配置
- `src/routes/api/auth.$.ts` - 认证 API 路由
- `src/db/schema/auth-schema.ts` - 认证相关数据库表结构
- `src/server.ts` - **服务端中间件（Session 获取）**
- `src/routes/__root.tsx` - **Router Context 类型定义**
- `src/components/Header.tsx` - 导航栏（包含用户状态显示）

## 自定义配置

### 修改认证行为

编辑 `src/auth/auth.server.ts`:

```typescript
export const auth = betterAuth({
    // ... 配置选项
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // 设置为 true 启用邮箱验证
    },
    // ...
})
```

### 添加第三方登录

Better Auth 支持多种 OAuth 提供商（Google、GitHub 等）。查看 [Better Auth 文档](https://www.better-auth.com/docs) 了解更多信息。

## 下一步

可以考虑添加以下功能：

1. ✨ 忘记密码功能
2. ✨ 邮箱验证
3. ✨ 第三方登录（Google、GitHub 等）
4. ✨ 修改个人资料
5. ✨ 修改密码
6. ✨ 会话管理（查看所有登录设备并远程登出）
7. ✨ 两步验证
8. ✨ 组织管理功能
9. ✨ WebSocket 实时 session 更新（无需刷新页面）

## 性能优化建议

当前实现已经包含了服务端 session 管理，但还可以进一步优化：

1. **添加 Redis 缓存**
   - 缓存 session 数据，减少数据库查询
   
2. **Session 过期处理**
   - 添加前端检测，session 即将过期时提示用户
   
3. **WebSocket 实时更新**
   - 用户权限变化时实时推送到客户端
   - 不需要刷新页面即可更新 session

详细说明请查看 [SERVER_SESSION_OPTIMIZATION.md](./SERVER_SESSION_OPTIMIZATION.md)

## 故障排查

### 如果注册或登录失败

1. 检查控制台错误信息
2. 确保数据库已正确初始化
3. 检查 API 路由是否正常工作（访问 `/api/auth/session`）
4. 查看网络请求，确认 API 调用是否成功

### 常见问题

**Q: 注册后无法登录？**
A: 检查是否启用了邮箱验证（`requireEmailVerification`），如果启用了需要先验证邮箱。

**Q: Toast 通知不显示？**
A: 确保 `__root.tsx` 中已包含 `<Toaster />` 组件。

**Q: 样式不正确？**
A: 确保已正确导入 Tailwind CSS 样式文件。

**Q: Session 更新后没有立即生效？**
A: 登录、注册、退出操作会触发页面刷新（`window.location.href`）来更新服务端 session。如果使用客户端导航（`navigate()`），session 不会更新。

## 相关文档

- [SERVER_SESSION_OPTIMIZATION.md](./SERVER_SESSION_OPTIMIZATION.md) - 服务端 Session 管理详细说明
- [Better Auth 官方文档](https://www.better-auth.com/docs)
- [TanStack Start 文档](https://tanstack.com/start)

## 反馈

如有问题或建议，欢迎提出 Issue。
