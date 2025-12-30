import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/db";
import { todo } from "@/db/schema";
import { adminMiddleware, authMiddleware } from "@/lib/auth/auth.middleware";

const getTodos = createServerFn({ method: "GET" }).handler(
  async () => await db.select().from(todo)
);

const addTodo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: string) => data)
  .handler(
    async ({ data, context }) =>
      await db
        .insert(todo)
        .values({
          title: data,
          userId: context.user.id,
        })
        .returning()
  );

const deleteTodo = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    await db.delete(todo).where(eq(todo.id, data));
  });

export const Route = createFileRoute("/_user/todos")({
  component: Home,
  loader: async () => await getTodos(),
});

function Home() {
  const router = useRouter();
  const todos = Route.useLoaderData();
  const [text, setText] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const addMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      setText("");
      router.invalidate();
      toast.success("添加成功");
    },
    onError: (error: Error) => {
      console.error("添加失败:", error);
      toast.error(error.message || "添加失败，请重试");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      setDeletingId(null);
      router.invalidate();
      toast.success("删除成功");
    },
    onError: (error: Error) => {
      console.error("删除失败:", error);
      setDeletingId(null);

      // 根据错误类型显示不同的提示
      if (error.message.includes("权限")) {
        toast.error("权限不足：只有管理员可以删除");
      } else if (error.message.includes("未登录")) {
        toast.error("请先登录");
      } else {
        toast.error(error.message || "删除失败，请重试");
      }
    },
  });

  const handleSubmit = () => {
    if (text.trim()) {
      addMutation.mutate({ data: text });
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate({ data: id });
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl border-8 border-black/10 bg-black/50 p-8 shadow-xl backdrop-blur-md">
        <h1 className="mb-4 text-2xl">Start Server Functions - Todo Example</h1>

        <ul className="mb-4 space-y-2">
          {todos?.map((t) => (
            <li
              className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 p-3 shadow-md backdrop-blur-sm"
              key={t.id}
            >
              <span className="text-lg text-white">{t.title}</span>
              <button
                className="text-red-400 hover:text-red-300 disabled:opacity-50"
                disabled={deletingId === t.id}
                onClick={() => handleDelete(t.id)}
                type="button"
              >
                {deletingId === t.id ? "删除中..." : "删除"}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <input
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="输入新的待办事项..."
            type="text"
            value={text}
          />
          <button
            className="rounded-lg bg-blue-500 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-500/50"
            disabled={!text.trim() || addMutation.isPending}
            onClick={handleSubmit}
            type="button"
          >
            {addMutation.isPending ? "添加中..." : "添加待办"}
          </button>
        </div>
      </div>
    </div>
  );
}
