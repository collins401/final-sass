import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/403")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-destructive/10 blur-3xl" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-2xl border border-destructive/20 bg-background/50 shadow-2xl backdrop-blur-xl">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>
      </div>

      <div className="max-w-md">
        <h1 className="mb-2 bg-linear-to-b from-foreground to-foreground/50 bg-clip-text font-black text-7xl text-transparent tracking-tighter md:text-8xl">
          403
        </h1>
        <h2 className="mb-4 font-bold text-2xl tracking-tight md:text-3xl">访问被拒绝</h2>
        <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
          抱歉，您没有权限访问此页面。如果您认为这是一个错误，请联系管理员。
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild variant="default">
            <Link to="/">
              <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
              返回首页
            </Link>
          </Button>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </Button>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-destructive/5 blur-[120px]" />
      </div>
    </div>
  );
}
