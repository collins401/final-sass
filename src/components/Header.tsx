import { Link, useRouteContext } from "@tanstack/react-router";
import {
	ChevronDown,
	ChevronRight,
	Home,
	LogIn,
	LogOut,
	Menu,
	Network,
	SquareFunction,
	StickyNote,
	User,
	UserPlus,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const [groupedExpanded, setGroupedExpanded] = useState<
		Record<string, boolean>
	>({});
	const { session } = useRouteContext({ from: "__root__" });
	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			toast.success("已成功退出登录");
			// 刷新页面以更新 session
			window.location.reload();
		} catch (error) {
			console.error("退出登录失败:", error);
			toast.error("退出登录失败");
		}
	};

	return (
		<>
			<header className="flex items-center justify-between bg-gray-800 p-4 text-white shadow-lg">
				<div className="flex items-center">
					<button
						aria-label="Open menu"
						className="rounded-lg p-2 transition-colors hover:bg-gray-700"
						onClick={() => setIsOpen(true)}
						type="button"
					>
						<Menu size={24} />
					</button>
					<h1 className="ml-4 font-semibold text-xl">
						<Link to="/">
							<img
								alt="TanStack Logo"
								className="h-10"
								src="/tanstack-word-logo-white.svg"
							/>
						</Link>
					</h1>
				</div>

				{/* 用户认证区域 */}
				<div className="flex items-center gap-2">
					{session?.user ? (
						<div className="flex items-center gap-3">
							<Link to="/dashboard">
								<div className="flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-1.5">
									<User size={18} />
									<span className="font-medium text-sm">
										{session.user?.name}
									</span>
								</div>
							</Link>
							<Button
								className="gap-2"
								onClick={handleSignOut}
								size="sm"
								variant="ghost"
							>
								<LogOut size={18} />
								退出
							</Button>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Link to="/sign-in">
								<Button className="gap-2" size="sm" variant="ghost">
									<LogIn size={18} />
									登录
								</Button>
							</Link>
							<Link to="/sign-up">
								<Button className="gap-2" size="sm" variant="default">
									<UserPlus size={18} />
									注册
								</Button>
							</Link>
						</div>
					)}
				</div>
			</header>

			<aside
				className={`fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-gray-700 border-b p-4">
					<h2 className="font-bold text-xl">Navigation</h2>
					<button
						aria-label="Close menu"
						className="rounded-lg p-2 transition-colors hover:bg-gray-800"
						onClick={() => setIsOpen(false)}
						type="button"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto p-4">
					<Link
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
						className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
						onClick={() => setIsOpen(false)}
						to="/"
					>
						<Home size={20} />
						<span className="font-medium">Home</span>
					</Link>

					{/* 用户个人资料链接 - 仅在登录时显示 */}
					{session?.user && (
						<Link
							activeProps={{
								className:
									"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
							}}
							className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
							onClick={() => setIsOpen(false)}
							to="/profile"
						>
							<User size={20} />
							<span className="font-medium">个人资料</span>
						</Link>
					)}

					{/* Demo Links Start */}

					<Link
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
						className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
						onClick={() => setIsOpen(false)}
						to="/demo/start/server-funcs"
					>
						<SquareFunction size={20} />
						<span className="font-medium">Start - Server Functions</span>
					</Link>

					<Link
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
						className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
						onClick={() => setIsOpen(false)}
						to="/demo/start/api-request"
					>
						<Network size={20} />
						<span className="font-medium">Start - API Request</span>
					</Link>

					<div className="flex flex-row justify-between">
						<Link
							activeProps={{
								className:
									"flex-1 flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
							}}
							className="mb-2 flex flex-1 items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
							onClick={() => setIsOpen(false)}
							to="/demo/start/ssr"
						>
							<StickyNote size={20} />
							<span className="font-medium">Start - SSR Demos</span>
						</Link>
						<button
							className="rounded-lg p-2 transition-colors hover:bg-gray-800"
							onClick={() =>
								setGroupedExpanded((prev) => ({
									...prev,
									StartSSRDemo: !prev.StartSSRDemo,
								}))
							}
							type="button"
						>
							{groupedExpanded.StartSSRDemo ? (
								<ChevronDown size={20} />
							) : (
								<ChevronRight size={20} />
							)}
						</button>
					</div>
					{groupedExpanded.StartSSRDemo && (
						<div className="ml-4 flex flex-col">
							<Link
								activeProps={{
									className:
										"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
								}}
								className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
								onClick={() => setIsOpen(false)}
								to="/demo/start/ssr/spa-mode"
							>
								<StickyNote size={20} />
								<span className="font-medium">SPA Mode</span>
							</Link>

							<Link
								activeProps={{
									className:
										"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
								}}
								className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
								onClick={() => setIsOpen(false)}
								to="/demo/start/ssr/full-ssr"
							>
								<StickyNote size={20} />
								<span className="font-medium">Full SSR</span>
							</Link>

							<Link
								activeProps={{
									className:
										"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
								}}
								className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
								onClick={() => setIsOpen(false)}
								to="/demo/start/ssr/data-only"
							>
								<StickyNote size={20} />
								<span className="font-medium">Data Only</span>
							</Link>
						</div>
					)}

					<Link
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
						className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
						onClick={() => setIsOpen(false)}
						to="/demo/tanstack-query"
					>
						<Network size={20} />
						<span className="font-medium">TanStack Query</span>
					</Link>

					{/* Demo Links End */}
				</nav>
			</aside>
		</>
	);
}
