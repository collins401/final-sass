import { Link, useRouteContext } from "@tanstack/react-router";
import {
	Bell,
	ChevronDown,
	LogOut,
	MessageSquare,
	Sparkles,
	User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth.client";

export const Header = () => {
	const { session } = useRouteContext({ from: "__root__" });

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			toast.success("已成功退出登录");
			window.location.href = "/";
		} catch {
			toast.error("退出登录失败");
		}
	};

	// 导航菜单项
	const navItems = [
		{ label: "个人信息", path: "/" },
		{ label: "个人设置", path: "/my-learning" },
		{ label: "我的收藏", path: "/catalog" },
		{ label: "我的反馈", path: "/favorites", badge: "1" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* 左侧：Logo + Ask AI + 搜索框 */}
				<div className="flex flex-1 items-center gap-4">
					{/* Logo */}
					<Link className="flex items-center gap-2" to="/">
						<div className="flex items-center gap-1">
							<div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
								<span className="font-bold text-white text-xl">V</span>
							</div>
							<span className="font-bold text-primary text-xl">trenning</span>
						</div>
					</Link>

					{/* Ask AI 按钮 */}
					<Button
						className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
						size="sm"
						variant="outline"
					>
						<Sparkles className="h-4 w-4" />
						Ask AI
					</Button>
				</div>

				{/* 中间：导航菜单 */}
				<nav className="mx-6 hidden items-center gap-1 lg:flex">
					{navItems.map((item) => (
						<Link
							activeProps={{
								className:
									"relative px-4 py-2 text-sm font-medium text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary",
							}}
							className="relative px-4 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
							key={item.path}
							to={item.path}
						>
							{item.label}
							{item.badge && (
								<span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
									{item.badge}
								</span>
							)}
						</Link>
					))}
				</nav>

				{/* 右侧：消息、通知、用户菜单 */}
				<div className="flex items-center gap-3">
					{/* 消息图标 */}
					<Button className="relative" size="icon" variant="ghost">
						<MessageSquare className="h-5 w-5" />
					</Button>

					{/* 通知图标 */}
					<Button className="relative" size="icon" variant="ghost">
						<Bell className="h-5 w-5" />
					</Button>

					{/* 用户菜单 */}
					{session?.user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="gap-2 px-2" variant="ghost">
									<div className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-white">
											{session.user.name?.charAt(0).toUpperCase() || "A"}
										</div>
										<div className="hidden flex-col items-start md:flex">
											<span className="font-semibold text-sm">
												{session.user.name}
											</span>
											<span className="text-muted-foreground text-xs">
												Jr UI/UX Designer
											</span>
										</div>
										<ChevronDown className="h-4 w-4 text-muted-foreground" />
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem asChild>
									<Link className="cursor-pointer" to="/profile">
										<User className="mr-2 h-4 w-4" />
										个人资料
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link className="cursor-pointer" to="/dashboard">
										<User className="mr-2 h-4 w-4" />
										仪表板
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={handleSignOut}
								>
									<LogOut className="mr-2 h-4 w-4" />
									退出登录
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="flex items-center gap-2">
							<Link to="/sign-in">
								<Button size="sm" variant="ghost">
									登录
								</Button>
							</Link>
							<Link to="/sign-up">
								<Button size="sm">注册</Button>
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};
