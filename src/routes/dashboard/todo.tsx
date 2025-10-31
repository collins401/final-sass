import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { useState } from 'react'
import { toast } from 'sonner'
import { adminMiddleware, authMiddleware } from '@/auth/auth.middleware'
import { db } from '@/db'
import { todo } from '@/db/schema'

const getTodos = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(todo)
})

const addTodo = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: string) => data)
  .handler(async ({ data, context }) => {
    return await db.insert(todo).values({ 
      title: data, 
      userId: context.user.id 
    }).returning()
  })

const deleteTodo = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    await db.delete(todo).where(eq(todo.id, data))
  })

export const Route = createFileRoute('/dashboard/todo')({
  component: Home,
  loader: async () => await getTodos(),
})

function Home() {
  const router = useRouter()
  const todos = Route.useLoaderData()
  const [text, setText] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const addMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      setText('')
      router.invalidate()
      toast.success('添加成功')
    },
    onError: (error: Error) => {
      console.error('添加失败:', error)
      toast.error(error.message || '添加失败，请重试')
    },
  })

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
      
      // 根据错误类型显示不同的提示
      if (error.message.includes('权限')) {
        toast.error('权限不足：只有管理员可以删除')
      } else if (error.message.includes('未登录')) {
        toast.error('请先登录')
      } else {
        toast.error(error.message || '删除失败，请重试')
      }
    },
  })

  const handleSubmit = () => {
    if (text.trim()) {
      addMutation.mutate({ data: text })
    }
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    deleteMutation.mutate({ data: id })
  }
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">Start Server Functions - Todo Example</h1>
        
        <ul className="mb-4 space-y-2">
          {todos?.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{t.title}</span>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
                className="text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                {deletingId === t.id ? '删除中...' : '删除'}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="输入新的待办事项..."
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || addMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {addMutation.isPending ? '添加中...' : '添加待办'}
          </button>
        </div>
      </div>
    </div>
  )
}
