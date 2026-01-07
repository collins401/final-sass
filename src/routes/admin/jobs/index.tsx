import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MapPin,
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
import { deleteJob, getJobs } from "@/lib/api/jobs";

const jobsSearchSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(10),
  title: z.string().optional(),
  status: z.enum(["draft", "published", "closed", "all"]).default("all"),
  type: z
    .enum(["full-time", "part-time", "contract", "internship", "remote", "all"])
    .default("all"),
});

const jobsQueryOptions = (search: z.infer<typeof jobsSearchSchema>) =>
  queryOptions({
    queryKey: ["jobs", search],
    queryFn: () => getJobs({ data: search }),
  });

export const Route = createFileRoute("/admin/jobs/")({
  component: JobsPage,
  validateSearch: jobsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(jobsQueryOptions(deps)),
});

const JOB_TYPES: Record<string, string> = {
  "full-time": "全职",
  "part-time": "兼职",
  contract: "合同工",
  internship: "实习",
  remote: "远程",
};

function JobsPage() {
  const search = useSearch({ from: "/admin/jobs/" });
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const { data: jobs } = useSuspenseQuery(jobsQueryOptions(search));

  const [searchInput, setSearchInput] = useState(search.title || "");

  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
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
    if (window.confirm("确认要删除这个职位吗？")) {
      await deleteJobMutation.mutateAsync({ data: { id } });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageTitle description="管理您的招聘岗位信息" title="招聘管理" />
        <Button asChild>
          <Link to="/admin/jobs/create">
            <Plus className="mr-2 h-4 w-4" />
            发布新职位
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeSearch()}
            placeholder="搜索职位..."
            value={searchInput}
          />
        </div>

        <Select
          onValueChange={(val) =>
            navigate({ search: (prev) => ({ ...prev, status: val as any, page: 1 }) })
          }
          value={search.status}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="closed">已关闭</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) =>
            navigate({ search: (prev) => ({ ...prev, type: val as any, page: 1 }) })
          }
          value={search.type}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="职位类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有类型</SelectItem>
            <SelectItem value="full-time">全职</SelectItem>
            <SelectItem value="part-time">兼职</SelectItem>
            <SelectItem value="contract">合同工</SelectItem>
            <SelectItem value="internship">实习</SelectItem>
            <SelectItem value="remote">远程</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>职位名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>地点</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.data.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={6}>
                  暂无招聘职位。
                </TableCell>
              </TableRow>
            ) : (
              jobs.data.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-foreground/90">
                        {job.title}
                      </span>
                      <span className="font-mono text-muted-foreground text-xs">{job.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Briefcase className="h-3 w-3" />
                      <span>{JOB_TYPES[job.type] || job.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-3 w-3" />
                      <span>{job.location || "远程"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "published"
                          ? "default"
                          : job.status === "closed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {job.status === "draft"
                        ? "草稿"
                        : job.status === "published"
                          ? "已发布"
                          : "已关闭"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {job.createdAt ? format(new Date(job.createdAt), "yyyy-MM-dd") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0" variant="ghost">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link params={{ jobId: job.id.toString() }} to="/admin/jobs/$jobId">
                            编辑职位
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(job.id)}
                        >
                          删除职位
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
          第 {jobs.pagination.page} 页 / 共 {jobs.pagination.totalPages} 页
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={jobs.pagination.page <= 1}
            onClick={() => handlePageChange(jobs.pagination.page - 1)}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <Button
            disabled={jobs.pagination.page >= jobs.pagination.totalPages}
            onClick={() => handlePageChange(jobs.pagination.page + 1)}
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
