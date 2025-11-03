import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { authQueryOptions } from "@/lib/auth/auth.queries";
import appCss from "../styles.css?url";

// Better Auth session 类型
type AuthSession = {
	session: {
		id: string;
		userId: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image?: string | null;
		createdAt: Date;
		updatedAt: Date;
		role?: string | null;
		banned?: boolean | null;
		banReason?: string | null;
		banExpires?: Date | null;
	};
} | null;

interface MyRouterContext {
	queryClient: QueryClient;
	session: AuthSession;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	beforeLoad: async ({ context }) => {
		// 使用 ensureQueryData 而不是 prefetchQuery，这样可以返回实际的数据
		const session = await context.queryClient.ensureQueryData(
			authQueryOptions()
		);
		return {
			session,
		};
	},
	shellComponent: RootDocument,
});
const NOT_SITE_PAGE_GROUP = ["/dashboard/", "/admin/", "/(sign)/"];
function RootDocument({ children }: { children: React.ReactNode }) {
	const matches = useMatches();
	const currentRouteId = matches?.[matches.length - 1].routeId;
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="bg-theme">
				{NOT_SITE_PAGE_GROUP.some((s) =>
					currentRouteId.startsWith(s)
				) ? null : (
					<Header />
				)}
				{children}
				<Toaster position="bottom-right" richColors />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						{
							name: "Tanstack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
