import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { PageTitle } from "@/components/admin/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPosts } from "@/lib/api/posts";

const postsSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
  title: z.string().optional(),
  status: z.enum(["draft", "published", "archived", "all"]).catch("all"),
});

const postsQueryOptions = (search: z.infer<typeof postsSearchSchema>) =>
  queryOptions({
    queryKey: ["posts", search],
    queryFn: () => getPosts({ data: search }),
  });

export const Route = createFileRoute("/admin/posts/list")({
  component: PostsPage,
  validateSearch: postsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(postsQueryOptions(deps)),
});

function PostsPage() {
  const search = useSearch({ from: "/admin/posts/list" });
  const navigate = Route.useNavigate();
  const postsQuery = useSuspenseQuery(postsQueryOptions(search));
  const { posts, total, page, pageSize } = postsQuery.data;

  // Local state for search input
  const [searchValue, setSearchValue] = useState(search.title || "");

  // Sync local state with URL search param when it changes externally
  useEffect(() => {
    setSearchValue(search.title || "");
  }, [search.title]);

  const handleSearch = useCallback(
    (key: keyof typeof search, value: string | number) => {
      navigate({
        search: (prev) => ({ ...prev, [key]: value, page: 1 }), // Reset to page 1 on filter change
      });
    },
    [navigate]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only navigate if the value has changed
      if (searchValue !== (search.title || "")) {
        handleSearch("title", searchValue);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchValue, search.title, handleSearch]);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const statusMap: Record<string, string> = {
    published: "已发布",
    draft: "草稿",
    archived: "已归档",
  };

  return (
    <div className="space-y-6">
      <PageTitle
        description="在此管理您的博客文章。"
        extra={
          <Button asChild>
            <Link to="/admin/posts/create">
              <Plus className="h-4 w-4" />
              新建文章
            </Link>
          </Button>
        }
        title="文章管理"
      />
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Input
            className="max-w-sm"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="按标题搜索..."
            value={searchValue}
          />
          <Select onValueChange={(value) => handleSearch("status", value)} value={search.status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="archived">已归档</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>发布日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={6}>
                    暂无文章。
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <Link
                          className="text-blue-500"
                          params={{ postId: String(post.id) }}
                          to="/admin/posts/$postId"
                        >
                          {post.title}
                        </Link>
                        <span className="text-muted-foreground text-xs">URL:/{post.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : post.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {statusMap[post.status] || post.status}
                      </span>
                    </TableCell>
                    <TableCell>{post.categoryName || "-"}</TableCell>
                    <TableCell>{post.authorName || "-"}</TableCell>
                    <TableCell>
                      {post.publishedAt ? format(new Date(post.publishedAt), "yyyy-MM-dd") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          className="text-red-500 hover:text-red-600"
                          size="icon"
                          variant="ghost"
                        >
                          {/* 删除 */}
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="text-muted-foreground text-sm">
            显示 {(page - 1) * pageSize + 1} 到 {Math.min(page * pageSize, total)} 条，共 {total}{" "}
            条结果
          </div>
          <div className="flex items-center space-x-2">
            <Button
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              size="sm"
              variant="outline"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
