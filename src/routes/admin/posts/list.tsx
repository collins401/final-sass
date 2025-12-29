import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash } from "lucide-react";
import { z } from "zod";
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

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (key: keyof typeof search, value: string | number) => {
    navigate({
      search: (prev) => ({ ...prev, [key]: value, page: 1 }), // Reset to page 1 on filter change
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts here.</p>
        </div>
        <Button asChild>
          <Link to="/admin/posts/create">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          className="max-w-sm"
          onChange={(e) => handleSearch("title", e.target.value)}
          placeholder="Search by title..."
          value={search.title || ""}
        />
        <Select onValueChange={(value) => handleSearch("status", value)} value={search.status}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={6}>
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{post.title}</span>
                      <span className="text-muted-foreground text-xs">{post.slug}</span>
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
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell>{post.categoryName || "-"}</TableCell>
                  <TableCell>{post.authorName || "-"}</TableCell>
                  <TableCell>
                    {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="icon" variant="ghost">
                        <Link params={{ postId: post.id.toString() }} to="/admin/posts/$postId">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        className="text-red-500 hover:text-red-600"
                        size="icon"
                        variant="ghost"
                      >
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

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}{" "}
          results
        </div>
        <div className="space-x-2">
          <Button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            size="sm"
            variant="outline"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
