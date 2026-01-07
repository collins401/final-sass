import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Activity,
  BookOpen,
  Briefcase,
  FileText,
  Layers,
  Layout,
  Palette,
  Plus,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { PageTitle } from "@/components/admin/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/api/dashboard";

const dashboardStatsQueryOptions = queryOptions({
  queryKey: ["admin", "dashboard", "stats"],
  queryFn: () => getDashboardStats(),
});

export const Route = createFileRoute("/admin/_index/")({
  component: DashboardPage,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(dashboardStatsQueryOptions),
});

function DashboardPage() {
  const { data: stats } = useSuspenseQuery(dashboardStatsQueryOptions);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageTitle description="系统运行状态概览与关键指标监控" title="Dashboard" />
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/admin/posts">
              <Plus className="mr-2 h-4 w-4" />
              发布文章
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Stats Grid - Expanded to include Products and simplified view */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          description="总注册用户"
          icon={Users}
          title="用户总量"
          trend={{ value: 12.5, label: "较上月", positive: true }}
          value={stats.counts.users}
        />
        <StatsCard
          description="已发布文章"
          icon={FileText}
          title="文章总量"
          trend={{ value: 5.2, label: "较上月", positive: true }}
          value={stats.counts.posts}
        />
        <StatsCard
          description="在线产品"
          icon={ShoppingBag}
          title="产品展示"
          trend={{ value: 2.1, label: "较上月", positive: true }}
          value={stats.counts.products}
        />
        <StatsCard
          description="活跃招聘中"
          icon={Activity}
          title="招聘职位"
          trend={{ value: 8.4, label: "较上月", positive: true }}
          value={stats.counts.jobs}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column: Recent Posts */}
        <Card className="col-span-1 border-l-4 border-l-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-medium text-base">最新文章</CardTitle>
              <CardDescription>近期发布的内容动态</CardDescription>
            </div>
            <Link className="text-muted-foreground text-sm hover:underline" to="/admin/posts">
              查看全部
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPosts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">暂无数据</div>
              ) : (
                stats.recentPosts.map((post) => (
                  <div
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    key={post.id}
                  >
                    <div className="space-y-1">
                      <p className="line-clamp-1 font-medium text-sm hover:underline">
                        <Link to={"/admin/posts"}>{post.title}</Link>
                      </p>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <span>{post.authorName}</span>
                        <span>•</span>
                        <span>
                          {post.updatedAt ? format(new Date(post.updatedAt), "MM-dd") : ""}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {post.status === "published" ? (
                        <div className="h-2 w-2 rounded-full bg-green-500" title="已发布" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-yellow-500" title="草稿" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Middle Column: Recent Jobs */}
        <Card className="col-span-1 border-l-4 border-l-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-medium text-base">招聘动态</CardTitle>
              <CardDescription>最新的职位发布信息</CardDescription>
            </div>
            <Link className="text-muted-foreground text-sm hover:underline" to="/admin/jobs">
              查看全部
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentJobs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">暂无数据</div>
              ) : (
                stats.recentJobs.map((job) => (
                  <div
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    key={job.id}
                  >
                    <div className="space-y-1">
                      <p className="line-clamp-1 font-medium text-sm hover:underline">
                        <Link to={"/admin/jobs"}>{job.title}</Link>
                      </p>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <span>{job.location || "远程"}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {job.status === "published" ? (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-[10px] text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          招聘中
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-[10px] text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          储备
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Quick Actions & Inventory */}
        <div className="col-span-1 grid gap-4">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-medium text-base">
                <Layout className="h-4 w-4" />
                快捷操作
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button asChild className="justify-start border-dashed" size="sm" variant="outline">
                <Link to="/admin/posts">
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  管理文章
                </Link>
              </Button>
              <Button asChild className="justify-start border-dashed" size="sm" variant="outline">
                <Link to="/admin/jobs">
                  <Briefcase className="mr-2 h-4 w-4 text-green-500" />
                  管理职位
                </Link>
              </Button>
              <Button asChild className="justify-start border-dashed" size="sm" variant="outline">
                <Link to="/admin/pages">
                  <BookOpen className="mr-2 h-4 w-4 text-orange-500" />
                  单页管理
                </Link>
              </Button>
              <Button asChild className="justify-start border-dashed" size="sm" variant="outline">
                <Link to="/">
                  <Palette className="mr-2 h-4 w-4 text-purple-500" />
                  主题设置
                </Link>
              </Button>
              <Button
                asChild
                className="col-span-2 justify-start bg-secondary/50 hover:bg-secondary"
                size="sm"
                variant="ghost"
              >
                <Link to="/admin/users">
                  <Settings className="mr-2 h-4 w-4" />
                  系统设置与用户管理
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Mini Stats for Other Modules */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-base">资源统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/20">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-sm">独立页面</span>
                  </div>
                  <span className="font-semibold">{stats.counts.pages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-sm">分类标签</span>
                  </div>
                  <span className="font-semibold">{stats.counts.categories}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
