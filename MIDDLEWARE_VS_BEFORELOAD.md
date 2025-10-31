# Server Middleware vs beforeLoad 的区别

## 问题描述

当使用 `server.middleware` 进行权限拦截时，从首页通过 `<Link>` 跳转到 `/admin` 页面时**不会触发拦截**，只有手动刷新页面才会生效。

## 原因分析

### Server Middleware 的执行时机

```typescript
export const Route = createFileRoute('/admin')({
  server: {
    middleware: [adminMiddleware]  // ❌ 只在 SSR 时执行
  },
})
```

`server.middleware` **仅在服务端渲染（SSR）时执行**，包括：
- ✅ 首次页面加载（浏览器直接访问 URL）
- ✅ 页面刷新（F5 或手动刷新）
- ❌ 客户端路由导航（`<Link>` 跳转）

### beforeLoad 的执行时机

```typescript
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {  // ✅ 每次路由导航都执行
    if (!context.session?.user) {
      throw redirect({ to: '/sign-in' })
    }
  },
})
```

`beforeLoad` **在每次路由导航时都会执行**，包括：
- ✅ 首次页面加载
- ✅ 页面刷新
- ✅ 客户端路由导航（`<Link>` 跳转）
- ✅ 编程式导航（`navigate()`）

## 对比表格

| 特性 | server.middleware | beforeLoad |
|------|-------------------|------------|
| SSR 时执行 | ✅ | ✅ |
| 客户端导航时执行 | ❌ | ✅ |
| 访问 request 对象 | ✅ | ❌ |
| 访问 context | ❌ | ✅ |
| 适用场景 | 服务端数据处理 | 路由权限控制 |
| 推荐用于权限验证 | ❌ | ✅ |

## 解决方案

### ❌ 错误做法：使用 server.middleware

```typescript
// ❌ 从首页点击链接进入 /admin 时不会拦截
export const Route = createFileRoute('/admin')({
  server: {
    middleware: [adminMiddleware]
  },
  component: RouteComponent,
})
```

**问题**：
1. 从首页通过 `<Link to="/admin">` 跳转 → ❌ 不拦截
2. 直接访问 `/admin` URL → ✅ 拦截
3. 在 `/admin` 页面刷新 → ✅ 拦截

### ✅ 正确做法：使用 beforeLoad

```typescript
// ✅ 所有情况下都会拦截
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    // 检查是否已登录
    if (!context.session?.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    
    // 检查是否为管理员
    if (context.session.user.role !== 'admin') {
      throw redirect({
        to: '/',
        statusCode: 403,
      })
    }
  },
  component: RouteComponent,
})
```

**优势**：
1. 从首页通过 `<Link to="/admin">` 跳转 → ✅ 拦截
2. 直接访问 `/admin` URL → ✅ 拦截
3. 在 `/admin` 页面刷新 → ✅ 拦截
4. 所有导航方式都能正确拦截 ✨

## 完整示例

### 管理员路由保护

```typescript
// /admin/route.tsx
import { createFileRoute, Outlet, redirect, useRouteContext } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    // 检查是否已登录
    if (!context.session?.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    
    // 检查是否为管理员
    if (context.session.user.role !== 'admin') {
      throw redirect({
        to: '/',
        statusCode: 403,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = useRouteContext({ from: '__root__' })
  
  return (
    <div>
      <div>Admin Header - 欢迎，{session?.user?.name}</div>
      <Outlet />
    </div>
  )
}
```

### 首页链接

```typescript
// 从首页点击链接跳转，会触发 beforeLoad 检查
<Link to="/admin">
  进入管理后台
</Link>
```

## 工作流程

### 使用 beforeLoad（正确）

```
用户点击 <Link to="/admin">
    ↓
TanStack Router 执行客户端导航
    ↓
触发 /admin 路由的 beforeLoad
    ↓
检查 context.session?.user
    ↓
未登录或非管理员？→ throw redirect({ to: '/sign-in' })
    ↓
已登录且是管理员？→ 渲染组件
```

### 使用 server.middleware（错误）

```
用户点击 <Link to="/admin">
    ↓
TanStack Router 执行客户端导航
    ↓
❌ 不触发 server.middleware（仅 SSR 时触发）
    ↓
直接渲染组件（绕过了权限检查！）
```

## Server Middleware 的正确用途

虽然 `server.middleware` 不适合路由权限控制，但它有其他合适的用途：

### ✅ 适合的场景

1. **服务端数据注入**
   ```typescript
   export const dataMiddleware = createMiddleware().server(async ({ next }) => {
     const request = getRequest()
     const data = await fetchServerData(request)
     return next({ context: { serverData: data } })
   })
   ```

2. **请求日志记录**
   ```typescript
   export const loggingMiddleware = createMiddleware().server(async ({ next }) => {
     const request = getRequest()
     console.log(`[SSR] ${request.method} ${request.url}`)
     return next()
   })
   ```

3. **服务端缓存控制**
   ```typescript
   export const cacheMiddleware = createMiddleware().server(async ({ next }) => {
     const response = await next()
     response.headers.set('Cache-Control', 'max-age=3600')
     return response
   })
   ```

### ❌ 不适合的场景

1. ❌ 路由权限验证（使用 `beforeLoad`）
2. ❌ 用户登录检查（使用 `beforeLoad`）
3. ❌ 角色权限控制（使用 `beforeLoad`）

## 最佳实践总结

### 权限控制
✅ 使用 `beforeLoad`
```typescript
beforeLoad: async ({ context }) => {
  if (!context.session?.user) {
    throw redirect({ to: '/sign-in' })
  }
}
```

### 服务端数据处理
✅ 使用 `server.middleware`
```typescript
server: {
  middleware: [dataMiddleware]
}
```

### 页面级别保护
✅ 在布局路由使用 `beforeLoad`
```typescript
// /admin/_layout.tsx
export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async ({ context }) => {
    if (context.session?.user?.role !== 'admin') {
      throw redirect({ to: '/' })
    }
  },
})
```

## 总结

- 🔐 **路由权限控制**：使用 `beforeLoad`（每次导航都执行）
- 🌐 **服务端处理**：使用 `server.middleware`（仅 SSR 时执行）
- ⚠️ **常见错误**：用 `server.middleware` 做权限验证会导致客户端导航时绕过检查
- ✅ **正确方案**：在 `beforeLoad` 中检查 `context.session` 并 `throw redirect()`

现在你的 `/admin` 路由已经正确配置，无论是从首页点击链接还是直接访问，都会正确拦截未授权用户！🎉
