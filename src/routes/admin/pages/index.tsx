import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { PageTitle } from "@/components/admin/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deletePage, getPages } from "@/lib/api/pages";

const pagesSearchSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(10),
  title: z.string().optional(),
  status: z.enum(["draft", "published", "archived", "all"]).default("all"),
});

const pagesQueryOptions = (search: z.infer<typeof pagesSearchSchema>) =>
  queryOptions({
    queryKey: ["pages", search],
    queryFn: () => getPages({ data: search }),
  });

export const Route = createFileRoute("/admin/pages/")({
  component: PagesIndexPage,
  validateSearch: pagesSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(pagesQueryOptions(deps)),
});

function PagesIndexPage() {
  const search = useSearch({ from: "/admin/pages/" });
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const { data: pages } = useSuspenseQuery(pagesQueryOptions(search));

  const [searchInput, setSearchInput] = useState(search.title || "");

  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const executeSearch = () => {
    navigate({
      search: (prev) => ({ ...prev, title: searchInput || undefined, page: 1 }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("确认要删除这个页面吗？此操作无法撤销。")) {
      await deletePageMutation.mutateAsync({ data: { id } });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-600 hover:bg-green-700" variant="default">
            已发布
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">草稿</Badge>;
      case "archived":
        return <Badge variant="outline">归档</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <Globe className="h-4 w-4 text-green-600" />;
      case "draft":
        return <EyeOff className="h-4 w-4 text-muted-foreground" />;
      case "archived":
        return <Archive className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageTitle description="管理企业介绍、关于我们等静态页面内容" title="页面管理" />
        <Button asChild className="cursor-pointer">
          <Link to="/admin/pages/create">
            <Plus className="mr-2 h-4 w-4" />
            新建页面
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="w-[256px] pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeSearch()}
            placeholder="搜索页面..."
            value={searchInput}
          />
        </div>

        <Select
          onValueChange={(val) =>
            navigate({ search: (prev) => ({ ...prev, status: val as any, page: 1 }) })
          }
          value={search.status}
        >
          <SelectTrigger className="w-48 cursor-pointer">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="all">
              所有状态
            </SelectItem>
            <SelectItem className="cursor-pointer" value="draft">
              草稿
            </SelectItem>
            <SelectItem className="cursor-pointer" value="published">
              已发布
            </SelectItem>
            <SelectItem className="cursor-pointer" value="archived">
              归档
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">页面标题</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>别名 (Slug)</TableHead>
              <TableHead>最后更新</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.data.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={5}>
                  暂无页面。
                </TableCell>
              </TableRow>
            ) : (
              pages.data.map((page) => (
                <TableRow
                  className="cursor-default transition-colors hover:bg-muted/50"
                  key={page.id}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-muted/50">
                        {getStatusIcon(page.status)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm">{page.title}</span>
                        {page.excerpt && (
                          <span
                            className="line-clamp-1 max-w-[300px] text-muted-foreground text-xs"
                            title={page.excerpt}
                          >
                            {page.excerpt}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(page.status)}</TableCell>
                  <TableCell>
                    <div className="flex w-fit items-center gap-2 rounded bg-muted/30 px-2 py-1 font-mono text-muted-foreground text-sm">
                      {page.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {page.updatedAt ? format(new Date(page.updatedAt), "yyyy-MM-dd HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 cursor-pointer p-0" variant="ghost">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link params={{ pageId: page.id.toString() }} to="/admin/pages/$pageId">
                            编辑页面
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <a href={`/pages/${page.slug}`} rel="noopener noreferrer" target="_blank">
                            预览页面
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => handleDelete(page.id)}
                        >
                          删除页面
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          第 {pages.pagination.page} 页 / 共 {pages.pagination.totalPages} 页
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="cursor-pointer"
            disabled={pages.pagination.page <= 1}
            onClick={() => handlePageChange(pages.pagination.page - 1)}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <Button
            className="cursor-pointer"
            disabled={pages.pagination.page >= pages.pagination.totalPages}
            onClick={() => handlePageChange(pages.pagination.page + 1)}
            size="sm"
            variant="outline"
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
