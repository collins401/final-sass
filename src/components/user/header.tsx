import { Link } from "@tanstack/react-router";
import { Kanban, LayoutDashboard, Menu, UserRound } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAction } from "../Header";
import { ModeToggle } from "../mode-toggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { label: "个人信息", path: "/user" },
    { label: "个人设置", path: "/my-learning" },
    { label: "我的收藏", path: "/user/todos" },
    { label: "我的反馈", path: "/favorites", badge: "1" },
  ];
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center font-bold text-xl">
          <div className="hidden items-center md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span>TanStack CMS</span>
            <div className="mx-4 h-6 border-l" />
          </div>
          <h2>用户中心</h2>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 font-medium text-sm md:flex">
          {navItems?.map((nav) => (
            <Link className="transition-colors hover:text-primary" key={nav.path} to={nav.path}>
              {nav.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <Button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            size="icon"
            variant="ghost"
          >
            {isMenuOpen ? <Kanban className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
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

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((nav) => (
              <Link
                className="font-medium text-sm hover:text-primary"
                key={nav.path}
                onClick={() => setIsMenuOpen(false)}
                to={nav.path}
              >
                {nav.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
