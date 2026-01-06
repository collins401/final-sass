import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      {/* <header className="sticky top-0 bg-background px-4 py-3 text-gray-800 shadow-lg">
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
      </header> */}

      <header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span>TanStack CMS</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 font-medium text-sm md:flex">
            <Link className="transition-colors hover:text-primary" to="/">
              Features
            </Link>
            <Link className="transition-colors hover:text-primary" to="/">
              Solutions
            </Link>
            <Link className="transition-colors hover:text-primary" to="/">
              Pricing
            </Link>
            <Link className="transition-colors hover:text-primary" to="/">
              Docs
            </Link>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
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

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} size="icon" variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="border-t bg-background p-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <Link
                className="font-medium text-sm hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
                to="/"
              >
                Features
              </Link>
              <Link
                className="font-medium text-sm hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
                to="/"
              >
                Solutions
              </Link>
              <Link
                className="font-medium text-sm hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
                to="/"
              >
                Pricing
              </Link>
              <div className="mt-2 flex flex-col gap-2">
                <Link onClick={() => setIsMenuOpen(false)} to="/sign-in">
                  <Button className="w-full" variant="outline">
                    Log in
                  </Button>
                </Link>
                <Link onClick={() => setIsMenuOpen(false)} to="/sign-up">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
