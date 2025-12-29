import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "./-header";

export const Route = createFileRoute("/_user")({
	component: RouteComponent,
	beforeLoad: ({ context, location }) => {
		// 检查是否已登录
		if (!context.session?.user) {
			throw redirect({
				to: "/sign-in",
				search: { redirect: location.pathname },
			});
		}
		// 返回用户数据供子路由使用
		return {
			user: context.session.user,
		};
	},
});

function RouteComponent() {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
}
