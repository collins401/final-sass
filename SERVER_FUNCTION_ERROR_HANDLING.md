# Server Function 错误处理指南

## 概述

当 `createServerFn` 的 `middleware` 中发生异常时，前端可以通过 `useMutation` 的错误回调来捕获和处理。

## 中间件异常处理机制

### 1. 中间件抛出错误

```typescript
// auth.middleware.ts
export const adminMiddleware = roleMiddleware('admin');

export const roleMiddleware = (requiredRole: string) => {
  return createMiddleware().server(async ({ next }) => {
    const session = await auth.api.getSession({...});

    if (!session?.user) {
      // 情况1: 未登录 - 抛出重定向
      throw redirect({
        to: '/sign-in',
        search: { redirect: currentPath },
        statusCode: 302,
      });
    }

    if (session.user.role !== requiredRole) {
      // 情况2: 权限不足 - 抛出错误
      throw new Error('访问被拒绝：权限不足');
    }

    return next({ context: { user: session.user } });
  });
};
```

### 2. Server Function 使用中间件

```typescript
const deleteTodo = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])  // 👈 只有管理员可以删除
  .inputValidator((id: number) => id)
  .handler(async ({ data, context }) => {
    // 如果中间件抛出异常，这里不会执行
    await db.delete(todo).where(eq(todo.id, data))
  })
```

### 3. 前端捕获错误

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteTodo,
  onSuccess: () => {
    setDeletingId(null)
    router.invalidate()
    toast.success('删除成功')
  },
  onError: (error: Error) => {
    console.error('删除失败:', error)
    setDeletingId(null)
    
    // 根据错误信息显示不同提示
    if (error.message.includes('权限')) {
      toast.error('权限不足：只有管理员可以删除')
    } else if (error.message.includes('未登录')) {
      toast.error('请先登录')
    } else {
      toast.error(error.message || '删除失败，请重试')
    }
  },
})
```

## 完整示例

### 场景：只有管理员可以删除 Todo

```typescript
// 1️⃣ 定义 Server Function
const deleteTodo = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data, context }) => {
    await db.delete(todo).where(eq(todo.id, data))
  })

// 2️⃣ 在组件中使用
function TodoList() {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      setDeletingId(null)
      router.invalidate()
      toast.success('删除成功')
    },
    onError: (error: Error) => {
      setDeletingId(null)
      
      if (error.message.includes('权限')) {
        toast.error('权限不足：只有管理员可以删除')
      } else {
        toast.error(error.message || '删除失败')
      }
    },
  })

  const handleDelete = (id: number) => {
    setDeletingId(id)
    deleteMutation.mutate({ data: id })
  }

  return (
    <button
      onClick={() => handleDelete(todo.id)}
      disabled={deletingId === todo.id}
    >
      {deletingId === todo.id ? '删除中...' : '删除'}
    </button>
  )
}
```

## 错误类型处理

### 1. 重定向错误（Redirect）

```typescript
// 中间件
if (!session?.user) {
  throw redirect({ to: '/sign-in' })
}

// 前端处理
// ⚠️ 重定向不会触发 onError，而是直接跳转页面
```

### 2. 自定义错误（Error）

```typescript
// 中间件
if (session.user.role !== 'admin') {
  throw new Error('访问被拒绝：权限不足')
}

// 前端处理
onError: (error: Error) => {
  toast.error(error.message)  // ✅ 会显示 "访问被拒绝：权限不足"
}
```

### 3. 验证错误（Validation）

```typescript
// 中间件
if (!data || data.trim() === '') {
  throw new Error('数据不能为空')
}

// 前端处理
onError: (error: Error) => {
  if (error.message.includes('不能为空')) {
    toast.error('请输入内容')
  }
}
```

## 最佳实践

### ✅ 推荐做法

#### 1. 使用友好的错误消息

```typescript
// ✅ 好
throw new Error('权限不足：只有管理员可以删除')

// ❌ 不好
throw new Error('Unauthorized')
```

#### 2. 统一错误处理

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteTodo,
  onError: (error: Error) => {
    // 统一清理状态
    setDeletingId(null)
    
    // 统一日志
    console.error('操作失败:', error)
    
    // 统一提示
    toast.error(error.message || '操作失败，请重试')
  },
})
```

#### 3. 区分错误类型

```typescript
onError: (error: Error) => {
  setDeletingId(null)
  
  // 根据错误内容判断类型
  if (error.message.includes('权限')) {
    toast.error('权限不足：只有管理员可以删除')
  } else if (error.message.includes('未登录')) {
    toast.error('请先登录')
    router.navigate({ to: '/sign-in' })
  } else if (error.message.includes('不存在')) {
    toast.error('该项已被删除')
    router.invalidate()
  } else {
    toast.error(error.message || '删除失败，请重试')
  }
}
```

### ❌ 避免的做法

#### 1. 忽略错误

```typescript
// ❌ 错误被忽略，用户不知道发生了什么
const deleteMutation = useMutation({
  mutationFn: deleteTodo,
  // 没有 onError
})
```

#### 2. 不清理加载状态

```typescript
// ❌ 删除失败后按钮一直显示"删除中..."
onError: (error: Error) => {
  toast.error(error.message)
  // 忘记 setDeletingId(null)
}
```

#### 3. 泄露技术细节

```typescript
// ❌ 向用户显示技术错误
toast.error(error.stack)  // "at db.delete (/app/routes/todo.tsx:123)"

// ✅ 显示友好提示
toast.error('删除失败，请重试')
```

## 错误处理流程图

```
用户点击删除按钮
    ↓
setDeletingId(id)
    ↓
deleteMutation.mutate({ data: id })
    ↓
Server Function 执行
    ↓
middleware 检查权限
    ↓
    ├─ ✅ 有权限 → handler 执行 → onSuccess
    │                              ↓
    │                         toast.success('删除成功')
    │                              ↓
    │                         setDeletingId(null)
    │                              ↓
    │                         router.invalidate()
    │
    └─ ❌ 无权限 → throw Error → onError
                                  ↓
                            toast.error('权限不足')
                                  ↓
                            setDeletingId(null)
```

## 高级用法

### 1. 自定义错误类

```typescript
// 定义错误类
class PermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PermissionError'
  }
}

// 中间件抛出
if (session.user.role !== 'admin') {
  throw new PermissionError('需要管理员权限')
}

// 前端判断
onError: (error: Error) => {
  if (error.name === 'PermissionError') {
    toast.error('权限不足：' + error.message)
  }
}
```

### 2. 错误重试机制

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteTodo,
  retry: (failureCount, error) => {
    // 权限错误不重试
    if (error.message.includes('权限')) return false
    // 其他错误重试最多 3 次
    return failureCount < 3
  },
  onError: (error: Error) => {
    toast.error(error.message)
  },
})
```

### 3. 乐观更新回滚

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteTodo,
  onMutate: async (variables) => {
    // 乐观更新：立即从 UI 移除
    const previousTodos = todos
    setTodos(todos.filter(t => t.id !== variables.data))
    return { previousTodos }
  },
  onError: (error, variables, context) => {
    // 发生错误，回滚到之前的状态
    if (context?.previousTodos) {
      setTodos(context.previousTodos)
    }
    toast.error('删除失败：' + error.message)
  },
})
```

## 测试场景

### 场景 1：普通用户尝试删除

```
1. 普通用户登录
2. 点击"删除"按钮
3. adminMiddleware 检测到 role !== 'admin'
4. 抛出 Error('访问被拒绝：权限不足')
5. onError 触发
6. 显示 toast: "权限不足：只有管理员可以删除"
7. setDeletingId(null) 恢复按钮状态
```

### 场景 2：未登录用户尝试添加

```
1. 未登录用户访问页面
2. 输入待办事项，点击"添加"
3. authMiddleware 检测到 !session?.user
4. 抛出 redirect({ to: '/sign-in' })
5. 页面自动跳转到登录页
6. ⚠️ onError 不会触发（redirect 直接跳转）
```

### 场景 3：网络错误

```
1. 用户点击删除
2. 网络断开
3. fetch 失败
4. onError 触发，error.message = "Failed to fetch"
5. 显示通用错误提示："删除失败，请重试"
```

## 总结

### 关键点

1. ✅ **中间件错误会传递到前端** - 通过 `useMutation` 的 `onError` 捕获
2. ✅ **重定向不触发 onError** - `redirect()` 会直接跳转页面
3. ✅ **使用友好的错误消息** - 方便前端显示给用户
4. ✅ **总是清理加载状态** - 在 `onError` 中重置 `deletingId`
5. ✅ **区分错误类型** - 根据 `error.message` 显示不同提示

### 完整代码示例

```typescript
// Server Function
const deleteTodo = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    await db.delete(todo).where(eq(todo.id, data))
  })

// 组件
const deleteMutation = useMutation({
  mutationFn: deleteTodo,
  onSuccess: () => {
    setDeletingId(null)
    router.invalidate()
    toast.success('删除成功')
  },
  onError: (error: Error) => {
    console.error('删除失败:', error)
    setDeletingId(null)
    
    if (error.message.includes('权限')) {
      toast.error('权限不足：只有管理员可以删除')
    } else {
      toast.error(error.message || '删除失败，请重试')
    }
  },
})
```

现在你的应用已经有完整的错误处理机制了！🎉
