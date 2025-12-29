import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { Sliders } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { navigationGroups } from "@/components/admin/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authQueryOptions } from "@/lib/auth/auth.queries";
export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    // 检查是否已登录
    if (!session?.user) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.pathname },
      });
    }

    // 检查是否为管理员
    if (session.user.role !== "admin") {
      throw redirect({
        to: "/",
        statusCode: 403,
      });
    }

    // 返回用户数据供子路由使用
    return session;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const pathname = location.pathname;
  const [contentWidth, setContentWidth] = useState("max-w-[1000px]");
  const getCurPageMenu = () => {
    for (const group of navigationGroups) {
      for (const item of group.items) {
        // Check if it's a link matching the URL
        if (item.url === pathname) {
          return [item];
        }
        // Check if it has sub-items
        if (item.items) {
          const subItem = item.items.find((sub) => sub.url === pathname);
          if (subItem) {
            return [item, subItem];
          }
        }
      }
    }
    return [];
  };

  const breadcrumbs = getCurPageMenu();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.length > 0 ? (
                  breadcrumbs.map((item, index) => (
                    <div className="flex items-center gap-2" key={item.url}>
                      <BreadcrumbItem className="hidden md:block">
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </div>
                  ))
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            <div>
              <Sliders
                onClick={() =>
                  setContentWidth(contentWidth === "max-w-[1000px]" ? "w-full" : "max-w-[1000px]")
                }
              />
            </div>
          </div>
        </header>
        <div>
          <div className={`${contentWidth}`} style={{ margin: "0 auto" }}>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
