import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import { TodoItem } from '@/components/todo-item';
import { Input } from '@/components/ui/input'
import { db } from '@/db';
import { type SelectTodo, todo } from "@/db/schema";

export const getTodo = createServerFn({ method: 'GET' })
  .handler(async () => {
    const todos = await db.select().from(todo);
    return todos;
  })
  
export const Route = createFileRoute('/dashboard/todo')({
  component: RouteComponent,
  loader: async() => await getTodo()
})

function RouteComponent() {
  const todos = Route.useLoaderData()
  console.log('todos', todos)
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-base">Todo List</h1>
        <div className="font-mono text-muted-foreground text-sm">Today is</div>
      </div>

      <form method="POST" className="space-y-2" >
        <div className="flex gap-2">
          <Input placeholder="Add a todo"  />
          <input defaultValue="create"/>
        </div>
        
      </form>

      {todos.length === 0 ? (
        <p className="text-muted-foreground text-sm">No todos found</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border shadow-xs">
          {todos.map((todo: SelectTodo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </div>
}
