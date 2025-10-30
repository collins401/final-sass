# 服务端 Session 管理优化

## 概述

本次优化将 Better Auth 的 session 获取从客户端移到了服务端，使用 TanStack Start 的服务端渲染能力，避免客户端频繁请求 `/api/auth/get-session` 接口。

## 架构改进

### 之前的实现

```tsx
// ❌ 客户端每次都需要请求 API
const { data: session } = authClient.useSession()
```

每次组件渲染时，都会发起一个 API 请求来获取 session，导致：
- 增加服务器负载
- 用户体验延迟（loading 状态）
- 网络开销增加

### 优化后的实现

```tsx
// ✅ 服务端在 SSR 阶段已经获取好 session
const routerState = useRouterState()
const session = routerState.matches[0]?.context?.session
```

Session 在服务端中间件中获取，通过 router context 传递到客户端，实现：
- 零额外 API 请求
- 即时可用的 session 数据
- 更好的 SEO 支持（服务端渲染）

## 实现细节

### 1. 服务端中间件 (`src/server.ts`)

```typescript
const handler = createStartHandler(async ({ request, router, responseHeaders }) => {
  // 在服务端获取 session
  const session = await auth.api.getSession({ headers: request.headers });
  
  // 将 session 注入到 router context 中
  router.update({
    context: {
      ...router.options.context,
      session: session,
    },
  });

  return defaultRenderHandler({ request, router, responseHeaders });
});
```

**工作原理：**
1. 每次服务端渲染请求到达时
2. 从请求 headers 中提取认证 cookie
3. 调用 Better Auth 的 `getSession` API 验证 session
4. 将 session 数据注入到 router context
5. 继续正常的 SSR 流程

### 2. Router Context 类型定义 (`src/routes/__root.tsx`)

```typescript
type AuthSession = {
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string | null
    userAgent?: string | null
  }
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image?: string | null
    createdAt: Date
    updatedAt: Date
    role?: string | null
    banned?: boolean | null
    banReason?: string | null
    banExpires?: Date | null
  }
} | null

interface MyRouterContext {
  queryClient: QueryClient
  session: AuthSession
}
```

### 3. 组件中使用 Session

#### Header 组件 (`src/components/Header.tsx`)

```typescript
export default function Header() {
  // 从 router context 中获取 session
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session

  return (
    <header>
      {session?.user ? (
        <div>
          <User />
          <span>{session.user.name}</span>
          <Button onClick={handleSignOut}>退出</Button>
        </div>
      ) : (
        <div>
          <Link to="/sign-in">登录</Link>
          <Link to="/sign-up">注册</Link>
        </div>
      )}
    </header>
  )
}
```

#### Profile 页面 (`src/routes/profile.tsx`)

```typescript
function RouteComponent() {
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session

  if (!session?.user) {
    return <Navigate to="/sign-in" />
  }

  return (
    <div>
      <h1>欢迎，{session.user.name}</h1>
      <p>邮箱：{session.user.email}</p>
    </div>
  )
}
```

## 性能优势

### 请求对比

| 场景 | 之前 | 优化后 |
|-----|-----|-------|
| 首次加载页面 | 2 次请求（页面 + session API） | 1 次请求（仅页面） |
| 客户端导航 | 每次导航都请求 session | 无额外请求 |
| 刷新页面 | 2 次请求 | 1 次请求 |

### 性能提升

- ⚡ **减少 50% 的网络请求**
- 🚀 **页面加载速度提升** - 无需等待 session API 响应
- 💾 **减少服务器负载** - session 只在 SSR 时获取一次
- ✨ **更好的用户体验** - 无加载闪烁

## 注意事项

### Session 更新

当用户登录、注册或退出时，需要刷新页面以更新 session：

```typescript
// 登录成功后
toast.success('登录成功！正在跳转...')
window.location.href = '/'  // 完整页面导航，触发 SSR

// 退出登录后
await authClient.signOut()
window.location.href = '/sign-in'
```

**为什么使用 `window.location.href` 而不是 `navigate()`？**

- `navigate()` 是客户端导航，不会触发服务端中间件
- `window.location.href` 触发完整的页面加载，会重新执行服务端中间件
- 这确保了 session 数据是最新的

### 实时 Session 更新（可选优化）

如果需要在不刷新页面的情况下更新 session，可以考虑：

1. **使用 React Query 配合 Server Functions**
```typescript
const { data: session } = useQuery({
  queryKey: ['session'],
  queryFn: () => serverFn.getSession(),
  staleTime: 5 * 60 * 1000, // 5 分钟
})
```

2. **WebSocket 实时推送**
   - 当 session 状态变化时，通过 WebSocket 通知客户端
   - 适合需要实时性的应用

## 与 Better Auth Client 的关系

### 保留客户端方法

虽然 session 从服务端获取，但仍保留客户端 auth 方法用于：

```typescript
import { authClient } from '@/auth/auth.client'

// ✅ 登录
await authClient.signIn.email({ email, password })

// ✅ 注册
await authClient.signUp.email({ email, password, name })

// ✅ 退出
await authClient.signOut()

// ❌ 不再需要
// const { data: session } = authClient.useSession()
```

### API 路由仍然可用

`/api/auth/*` 路由仍然正常工作，用于：
- 客户端 auth 操作（登录、注册、退出）
- 第三方 OAuth 回调
- Webhook 处理

## 迁移指南

### 从客户端 useSession 迁移

**之前：**
```typescript
import { authClient } from '@/auth/auth.client'

function MyComponent() {
  const { data: session, isPending } = authClient.useSession()
  
  if (isPending) return <Loading />
  if (!session) return <Login />
  
  return <div>Hello {session.user.name}</div>
}
```

**之后：**
```typescript
import { useRouterState } from '@tanstack/react-router'

function MyComponent() {
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session
  
  // 无需 loading 状态 - session 在 SSR 时已准备好
  if (!session) return <Login />
  
  return <div>Hello {session.user.name}</div>
}
```

## 总结

通过将 session 获取移到服务端中间件：

✅ **优点**
- 减少 API 请求数量
- 提升页面加载速度
- 改善用户体验
- 更好的 SEO 支持
- 服务端数据一致性

⚠️ **权衡**
- Session 更新需要刷新页面
- 增加服务端处理时间（但总体更快）

这种方案特别适合：
- Session 不频繁变化的应用
- 重视首屏加载性能的应用
- 需要 SEO 优化的应用

对于需要频繁更新 session 的应用（如实时聊天），可以结合使用：
- 服务端获取初始 session
- 客户端订阅 session 变化
- WebSocket 推送更新
