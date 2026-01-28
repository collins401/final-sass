import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Package, Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { deleteProduct, getProducts } from "@/lib/api/products";

const productsSearchSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(10),
  title: z.string().optional(),
  status: z.enum(["draft", "published", "archived", "all"]).default("all"),
});

const productsQueryOptions = (search: z.infer<typeof productsSearchSchema>) =>
  queryOptions({
    queryKey: ["products", search],
    queryFn: () => getProducts({ data: search }),
  });

export const Route = createFileRoute("/admin/products/list/")({
  component: ProductsPage,
  validateSearch: productsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(productsQueryOptions(deps)),
});

function ProductsPage() {
  const search = useSearch({ from: "/admin/products/list/" });
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const productsQuery = useSuspenseQuery(productsQueryOptions(search));
  const { products, total, page, pageSize } = productsQuery.data;

  // Local state for search input
  const [searchValue, setSearchValue] = useState(search.title || "");

  // Sync local state with URL search param when it changes externally
  useEffect(() => {
    setSearchValue(search.title || "");
  }, [search.title]);

  const handleSearch = useCallback(
    (key: keyof typeof search, value: string | number) => {
      navigate({
        search: (prev) => ({ ...prev, [key]: value, page: 1 }),
      });
    },
    [navigate]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (search.title || "")) {
        handleSearch("title", searchValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, search.title, handleSearch]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("产品已删除");
    },
    onError: () => {
      toast.error("删除失败");
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("确定要删除这个产品吗？")) {
      deleteMutation.mutate(id);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const statusMap: Record<string, string> = {
    published: "已上架",
    draft: "库中",
    archived: "已下架",
  };

  return (
    <div className="space-y-6">
      <PageTitle
        description="在此管理您的产品目录。"
        extra={
          <Button asChild>
            <Link to="/admin/products/create">
              <Plus className="h-4 w-4" />
              新建产品
            </Link>
          </Button>
        }
        title="产品管理"
      />
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Input
            className="max-w-sm"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="按产品名称搜索..."
            value={searchValue}
          />
          <Select onValueChange={(value) => handleSearch("status", value)} value={search.status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="published">已上架</SelectItem>
              <SelectItem value="draft">库中</SelectItem>
              <SelectItem value="archived">已下架</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">图片</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>发布日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={6}>
                    暂无产品。
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.thumbnail ? (
                        <img
                          alt={product.title}
                          className="h-10 w-10 rounded border object-cover"
                          src={product.thumbnail}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded border bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <Link
                          className="text-blue-500 hover:underline"
                          params={{ id: String(product.id) }}
                          to="/admin/products/$id"
                        >
                          {product.title}
                        </Link>
                        <span className="text-muted-foreground text-xs">SKU: {product.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
                          product.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : product.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {statusMap[product.status] || product.status}
                      </span>
                    </TableCell>
                    <TableCell>{product.categoryName || "-"}</TableCell>
                    <TableCell>
                      {product.publishedAt
                        ? format(new Date(product.publishedAt), "yyyy-MM-dd")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(product.id)}
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
