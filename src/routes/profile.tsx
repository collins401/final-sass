import { createFileRoute, redirect } from "@tanstack/react-router";
import { Calendar, Mail, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth.client";

export const Route = createFileRoute("/profile")({
	beforeLoad: ({ context, location }) => {
		// 检查用户是否已登录
		if (!context.session?.user) {
			throw redirect({
				to: "/sign-in",
				search: { redirect: location.pathname },
			});
		}

		return {
			user: context.session.user,
			sessionData: context.session.session,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	// 从 beforeLoad 返回的数据中获取用户信息
	const { user, sessionData } = Route.useRouteContext();

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			toast.success("已成功退出登录");
			// 刷新页面以更新 session
			window.location.href = "/sign-in";
		} catch (error) {
			console.error("退出登录失败:", error);
			toast.error("退出登录失败");
		}
	};

	const formatDate = (date: Date | string | null | undefined) => {
		if (!date) return "未知";
		const d = typeof date === "string" ? new Date(date) : date;
		return d.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 py-12">
			<div className="mx-auto max-w-2xl space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-3xl">个人资料</CardTitle>
								<CardDescription>查看和管理您的账户信息</CardDescription>
							</div>
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<User className="h-8 w-8 text-primary" />
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="mt-1 rounded-lg bg-primary/10 p-2">
									<User className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<p className="text-muted-foreground text-sm">姓名</p>
									<p className="font-medium text-lg">{user.name}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="mt-1 rounded-lg bg-primary/10 p-2">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<p className="text-muted-foreground text-sm">邮箱</p>
									<p className="font-medium text-lg">{user.email}</p>
									{user.emailVerified && (
										<p className="mt-1 text-green-600 text-xs dark:text-green-400">
											✓ 已验证
										</p>
									)}
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="mt-1 rounded-lg bg-primary/10 p-2">
									<Calendar className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<p className="text-muted-foreground text-sm">注册时间</p>
									<p className="font-medium text-lg">
										{formatDate(user.createdAt)}
									</p>
								</div>
							</div>

							{user.role && (
								<div className="flex items-start gap-3">
									<div className="mt-1 rounded-lg bg-primary/10 p-2">
										<Shield className="h-5 w-5 text-primary" />
									</div>
									<div className="flex-1">
										<p className="text-muted-foreground text-sm">角色</p>
										<p className="font-medium text-lg">{user.role}</p>
									</div>
								</div>
							)}
						</div>

						<div className="border-t pt-4">
							<div className="flex gap-3">
								<Button
									className="flex-1"
									onClick={handleSignOut}
									variant="destructive"
								>
									退出登录
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>会话信息</CardTitle>
						<CardDescription>当前登录会话的详细信息</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<p className="text-muted-foreground text-sm">会话 ID</p>
							<p className="mt-1 break-all rounded bg-muted p-2 font-mono text-sm">
								{sessionData.id}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm">过期时间</p>
							<p className="mt-1 text-sm">
								{formatDate(sessionData.expiresAt)}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
