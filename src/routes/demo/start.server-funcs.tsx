import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { useCallback, useState } from 'react'
import { authMiddleware } from '@/auth/auth.middleware'
import { db } from '@/db'
import { todo } from '@/db/schema'

const getTodos = createServerFn({
  method: 'GET',
}).handler(async () => {
  const todos = await db.select().from(todo);
  return todos;
})

const addTodo = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((d: string) => d)
  .handler(async ({ data, context }) => {
      
      const result = await db.insert(todo).values({ title: data, userId: context.user.id }).returning()
      console.log('context session', result)
    return result
  })

export const Route = createFileRoute('/demo/start/server-funcs')({
  component: Home,
  loader: async () => await getTodos(),
})

const deleteTodo = createServerFn({method: 'POST'})
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    await db.delete(todo).where(eq(todo.id, data))
    return true
  })

function Home() {
  const router = useRouter()
  const todos = Route.useLoaderData()

  const [todo, setTodo] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const addMutation = useMutation<unknown, unknown, string>({
    mutationFn: (title: string) => addTodo({ data: title }),
    onSuccess: () => {
      setTodo('')
      router.invalidate()
    },
  })

  const deleteMutation = useMutation<unknown, unknown, number>({
    mutationFn: (id: number) => deleteTodo({ data: id }),
    onSuccess: () => {
      router.invalidate()
    },
  })

  const adding = addMutation.status === 'pending'

  const submitTodo = useCallback(async () => {
    if (!todo.trim()) return
    try {
      await addMutation.mutateAsync(todo)
      // success handled in onSuccess
    } catch (err) {
      console.error('Add todo failed', err)
      // optionally show UI feedback
    }
  }, [addMutation, todo])

  const handleDelete = useCallback(
    async (id: number) => {
      setDeletingId(id)
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err) {
        console.error('Delete todo failed', err)
      } finally {
        setDeletingId(null)
      }
    },
    [deleteMutation]
  )
  

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
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{t.title}</span>
              <button
                type="button"
                className="text-lg text-red-400"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
              >
                {deletingId === t.id ? 'deleting...' : 'del'}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitTodo()
              }
            }}
            placeholder="Enter a new todo..."
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="button"
            disabled={todo.trim().length === 0 || adding}
            onClick={submitTodo}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {adding ? 'Adding...' : 'Add todo'}
          </button>
        </div>
      </div>
    </div>
  )
}
