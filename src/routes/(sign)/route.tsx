import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Command } from "lucide-react";

export const Route = createFileRoute("/(sign)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid md:max-w-none md:grid-cols-2 md:px-0 lg:max-w-none">
      {/* Left Panel - Background */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white md:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-700" />
        <div
          className="absolute inset-0 bg-center bg-cover mix-blend-overlay"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)",
          }}
        />
        <div className="relative z-20 flex items-center font-medium text-lg">
          <Command className="mr-2 h-6 w-6" />
          TanStack Sass
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;这个管理系统极大地提高了我们的工作效率，现代化的界面设计让使用体验变得非常愉悦。&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
