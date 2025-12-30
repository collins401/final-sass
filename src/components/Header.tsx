import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Network,
  Ship,
  SquareFunction,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { authQueryOptions } from "@/lib/auth/auth.queries";
import { ModeToggle } from "./mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function UserAction() {
  const {
    data: { user },
  } = useSuspenseQuery(authQueryOptions());
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
  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ml-auto" variant="ghost">
          <UserRound size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage alt={user.name} src={user.image || ""} />
            <AvatarFallback className="rounded-lg">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-muted-foreground text-xs">{user.email}</span>
          </div>
        </div>
        <DropdownMenuItem>主题设置</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/user">个人信息</Link>
        </DropdownMenuItem>
        {user?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link to="/admin">网站设置</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive!" onClick={handleSignOut}>
          <LogOut className="text-destructive" size={18} />
          退出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button asChild className="gap-2" size="icon" variant="link">
      <Link to="/sign-in">
        <UserRound size={20} />
      </Link>
    </Button>
  );
}
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupedExpanded, setGroupedExpanded] = useState<Record<string, boolean>>({});

  return (
    <>
      <header className="sticky top-0 bg-background px-4 py-3 text-gray-800 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="ml-4 font-semibold text-xl">
              <Link className="flex items-center gap-2 text-cyan-400" to="/">
                <span className="inline-block rounded-md bg-cyan-400 p-2 text-white">
                  <Ship />
                </span>
                <span>远航CMS</span>
              </Link>
            </h1>
            <button
              aria-label="Open menu"
              className="rounded-lg p-2 transition-colors hover:bg-gray-700 md:hidden"
              onClick={() => setIsOpen(true)}
              type="button"
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Suspense
              fallback={
                <Button asChild className="gap-2" size="icon" variant="link">
                  <UserRound size={20} />
                </Button>
              }
            >
              <UserAction />
            </Suspense>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-70 transform flex-col bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-gray-700 border-b p-4">
          <h2 className="font-bold text-xl">菜单导航</h2>
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
