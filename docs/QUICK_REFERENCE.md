# 快速参考 - 认证系统 API

## 🔑 在组件中获取 Session

```typescript
import { useRouterState } from '@tanstack/react-router'

function MyComponent() {
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session
  
  // session 数据结构
  if (session?.user) {
    console.log(session.user.name)       // 用户名
    console.log(session.user.email)      // 邮箱
    console.log(session.user.id)         // 用户 ID
    console.log(session.user.role)       // 角色
    console.log(session.session.expiresAt) // 过期时间
  }
}
```

## 🔐 认证操作

### 登录

```typescript
import { authClient } from '@/auth/auth.client'
import { toast } from 'sonner'

const handleLogin = async (email: string, password: string) => {
  const result = await authClient.signIn.email({ email, password })
  
  if (result.error) {
    toast.error('登录失败')
    return
  }
  
  toast.success('登录成功')
  window.location.href = '/' // 刷新以更新 session
}
```

### 注册

```typescript
import { authClient } from '@/auth/auth.client'

const handleSignUp = async (name: string, email: string, password: string) => {
  const result = await authClient.signUp.email({ name, email, password })
  
  if (result.error) {
    toast.error('注册失败')
    return
  }
  
  toast.success('注册成功')
  window.location.href = '/'
}
```

### 退出登录

```typescript
import { authClient } from '@/auth/auth.client'

const handleSignOut = async () => {
  await authClient.signOut()
  window.location.href = '/sign-in'
}
```

## 🛡️ 路由保护

### 方式 1: 在组件中检查

```typescript
import { Navigate, useRouterState } from '@tanstack/react-router'

function ProtectedPage() {
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session
  
  if (!session?.user) {
    return <Navigate to="/sign-in" />
  }
  
  return <div>受保护的内容</div>
}
```

### 方式 2: 使用 beforeLoad

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/protected')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: ProtectedPage,
})
```

### 方式 3: 检查角色

```typescript
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: '/sign-in' })
    }
    
    if (context.session.user.role !== 'admin') {
      throw redirect({ to: '/' })
    }
  },
  component: AdminPage,
})
```

## 🎨 UI 模式

### 显示用户信息

```typescript
function UserProfile() {
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session
  
  if (!session?.user) return null
  
  return (
    <div>
      <img src={session.user.image || '/default-avatar.png'} alt={session.user.name} />
      <h2>{session.user.name}</h2>
      <p>{session.user.email}</p>
      {session.user.emailVerified && <span>✓ 已验证</span>}
    </div>
  )
}
```

### 条件渲染

```typescript
function Navbar() {
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session
  
  return (
    <nav>
      {session?.user ? (
        <>
          <Link to="/profile">个人资料</Link>
          <Link to="/dashboard">控制台</Link>
          <button onClick={handleSignOut}>退出</button>
        </>
      ) : (
        <>
          <Link to="/sign-in">登录</Link>
          <Link to="/sign-up">注册</Link>
        </>
      )}
    </nav>
  )
}
```

### 基于角色的渲染

```typescript
function AdminPanel() {
  const routerState = useRouterState()
  const session = routerState.matches[0]?.context?.session
  
  if (session?.user?.role !== 'admin') {
    return <div>无权访问</div>
  }
  
  return <div>管理面板</div>
}
```

## 📝 表单处理

### 使用 React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { useId } from 'react'

function LoginForm() {
  const emailId = useId()
  const passwordId = useId()
  
  const { register, handleSubmit, formState: { errors } } = useForm()
  
  const onSubmit = async (data) => {
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })
    
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    
    window.location.href = '/'
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label htmlFor={emailId}>邮箱</Label>
      <Input
        id={emailId}
        type="email"
        {...register('email', {
          required: '请输入邮箱',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '请输入有效的邮箱地址',
          },
        })}
        aria-invalid={!!errors.email}
      />
      {errors.email && <p>{errors.email.message}</p>}
      
      <Button type="submit">登录</Button>
    </form>
  )
}
```

## 🔍 Session 类型定义

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
```

## 🚨 常见问题

### Q: Session 更新后没有立即生效？
**A:** 使用 `window.location.href` 而不是 `navigate()`

```typescript
// ✅ 正确
window.location.href = '/'

// ❌ 错误 - session 不会更新
navigate({ to: '/' })
```

### Q: 如何检查 session 是否过期？

```typescript
function isSessionExpired(session: AuthSession) {
  if (!session) return true
  return new Date() > new Date(session.session.expiresAt)
}
```

### Q: 如何在服务端函数中获取 session？

```typescript
import { auth } from '@/auth/auth.server'

export const serverFn = createServerFn('GET', async (_, { request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  
  if (!session?.user) {
    throw new Error('未授权')
  }
  
  return { userId: session.user.id }
})
```

## 📦 常用代码片段

### 加载状态处理

```typescript
function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleAction = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      window.location.href = '/sign-in'
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  return <Button disabled={isLoading}>
    {isLoading ? '处理中...' : '退出'}
  </Button>
}
```

### 日期格式化

```typescript
function formatDate(date: Date | string | null | undefined) {
  if (!date) return '未知'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 使用
<p>注册时间: {formatDate(session.user.createdAt)}</p>
```

### 邮箱验证状态

```typescript
function EmailStatus({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="text-green-600">✓ 已验证</span>
  ) : (
    <span className="text-yellow-600">⚠ 未验证</span>
  )
}
```

## 🎯 最佳实践

1. **始终使用 `window.location.href` 进行认证后跳转**
2. **使用 `useId()` 生成表单元素 ID**
3. **添加适当的错误处理和 Toast 通知**
4. **使用 `aria-invalid` 提升无障碍性**
5. **在路由层面进行权限保护**
6. **验证用户输入（邮箱格式、密码长度等）**

## 📚 相关文档

- [AUTH_USAGE.md](./AUTH_USAGE.md) - 完整使用指南
- [SERVER_SESSION_OPTIMIZATION.md](./SERVER_SESSION_OPTIMIZATION.md) - 性能优化详解
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - 优化总结
