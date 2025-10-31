# 权限中间件使用指南

## 概述

本项目提供了强大的权限中间件系统，用于保护路由并控制用户访问。

## 方式一：在路由的 beforeLoad 中直接实现（推荐）

这是最简单、最灵活的方式，直接在路由文件中实现认证逻辑。

### 基础认证保护

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  beforeLoad: async ({ context, location }) => {
    // 检查用户是否已登录
    if (!context.session?.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    
    // 返回用户数据供组件使用
    return {
      user: context.session.user,
      sessionData: context.session.session,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  // 从 beforeLoad 返回的数据中获取用户信息
  const { user, sessionData } = Route.useLoaderData()
  
  return (
    <div>
      <h1>欢迎，{user.name}</h1>
      <p>邮箱：{user.email}</p>
    </div>
  )
}
```

### 角色检查保护

```typescript
export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async ({ context, location }) => {
    // 检查是否登录
    if (!context.session?.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    
    // 检查用户角色
    if (context.session.user.role !== 'admin') {
      throw redirect({
        to: '/',
        statusCode: 403, // Forbidden
      })
    }
    
    return {
      user: context.session.user,
    }
  },
  component: AdminDashboard,
})
```

### 可选认证（支持已登录和未登录用户）

```typescript
export const Route = createFileRoute('/products')({
  beforeLoad: async ({ context }) => {
    // 不强制要求登录，但如果已登录则返回用户信息
    return {
      user: context.session?.user ?? null,
    }
  },
  component: ProductList,
})

function ProductList() {
  const { user } = Route.useLoaderData()
  
  return (
    <div>
      {user ? (
        <p>欢迎回来，{user.name}！</p>
      ) : (
        <p>访客模式</p>
      )}
    </div>
  )
}
```

## 方式二：使用中间件函数（已废弃）

⚠️ 注意：由于 TanStack Router 的类型限制，`auth.middleware.ts` 中的中间件函数无法直接用于路由的 `beforeLoad`。建议使用方式一。

如果需要复用认证逻辑，可以创建辅助函数：

```typescript
// src/lib/auth-helpers.ts
import { redirect } from '@tanstack/react-router'
import type { RouteContext } from '@/router'

export function requireAuth(context: RouteContext, location: { pathname: string }) {
  if (!context.session?.user) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: location.pathname },
    })
  }
  return context.session.user
}

export function requireRole(context: RouteContext, role: string) {
  const user = requireAuth(context, { pathname: '/' })
  if (user.role !== role) {
    throw redirect({
      to: '/',
      statusCode: 403,
    })
  }
  return user
}

// 使用示例
export const Route = createFileRoute('/admin/settings')({
  beforeLoad: ({ context, location }) => {
    const user = requireAuth(context, location)
    if (user.role !== 'admin') {
      throw redirect({ to: '/', statusCode: 403 })
    }
    return { user }
  },
  component: AdminSettings,
})
```

## 登录后重定向

登录页面已经配置好了重定向功能：

```typescript
// src/routes/(sign)/sign-in.tsx
export const Route = createFileRoute('/(sign)/sign-in')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || '/',
    }
  },
})

function RouteComponent() {
  const search = useSearch({ from: '/(sign)/sign-in' })
  
  const onSubmit = async (data) => {
    const result = await authClient.signIn.email(data)
    if (!result.error) {
      // 跳转到之前的页面，或者首页
      window.location.href = search.redirect
    }
  }
}
```

## 工作流程

1. 用户访问受保护的页面（如 `/profile`）
2. `beforeLoad` 检测到用户未登录
3. 重定向到 `/sign-in?redirect=/profile`
4. 用户登录成功后
5. 自动跳转回 `/profile`

## 最佳实践

### 1. 将认证逻辑放在 beforeLoad 中
```typescript
// ✅ 推荐
beforeLoad: async ({ context }) => {
  if (!context.session?.user) {
    throw redirect({ to: '/sign-in' })
  }
}

// ❌ 不推荐 - 在组件中检查
function Component() {
  const { session } = useRouteContext()
  if (!session?.user) return <Navigate to="/sign-in" />
}
```

### 2. 保存重定向路径
```typescript
// ✅ 推荐 - 登录后返回原页面
beforeLoad: async ({ context, location }) => {
  if (!context.session?.user) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: location.pathname }
    })
  }
}

// ❌ 不推荐 - 丢失原始路径
beforeLoad: async ({ context }) => {
  if (!context.session?.user) {
    throw redirect({ to: '/sign-in' })
  }
}
```

### 3. 明确的错误状态码
```typescript
// ✅ 推荐
if (user.role !== 'admin') {
  throw redirect({ to: '/', statusCode: 403 })
}

// ❌ 不推荐 - 不明确
if (user.role !== 'admin') {
  throw redirect({ to: '/' })
}
```

## 常见场景示例

### 用户个人中心
```typescript
export const Route = createFileRoute('/profile')({
  beforeLoad: async ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    return {
      user: context.session.user,
      sessionData: context.session.session,
    }
  },
})
```

### 管理员后台
```typescript
export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: '/sign-in' })
    }
    if (context.session.user.role !== 'admin') {
      throw redirect({ to: '/', statusCode: 403 })
    }
    return { user: context.session.user }
  },
})
```

### 公开页面（可选登录）
```typescript
export const Route = createFileRoute('/blog/$slug')({
  beforeLoad: async ({ context }) => {
    return {
      user: context.session?.user ?? null,
    }
  },
})
```

## 总结

- ✅ 使用 `beforeLoad` 直接实现认证逻辑（最简单、最灵活）
- ✅ 使用 `redirect` 函数进行页面跳转
- ✅ 通过 `search` 参数保存重定向路径
- ✅ 使用 `Route.useLoaderData()` 获取 beforeLoad 返回的数据
- ❌ 不要在组件中使用 `<Navigate>` 进行认证检查
- ❌ 不要使用 `auth.middleware.ts` 中的中间件函数（类型不兼容）
