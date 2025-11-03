import {
	createFileRoute,
	Outlet,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
export const Route = createFileRoute("/admin")({
	beforeLoad: ({ context, location }) => {
		// 检查是否已登录
		if (!context.session?.user) {
			throw redirect({
				to: "/sign-in",
				search: { redirect: location.pathname },
			});
		}

		// 检查是否为管理员
		if (context.session.user.role !== "admin") {
			throw redirect({
				to: "/",
				statusCode: 403,
			});
		}

		// 返回用户数据供子路由使用
		return {
			user: context.session.user,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	// 从 context 获取 session（由 __root.tsx 提供）
	const { session } = useRouteContext({ from: "__root__" });

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							className="mr-2 data-[orientation=vertical]:h-4"
							orientation="vertical"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="#">
										Building Your Application
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Data Fetching</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
