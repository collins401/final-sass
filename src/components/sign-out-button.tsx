import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth.client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function SignOutButton({ className }: { className?: string }) {
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("已成功退出登录");
      // 刷新页面以更新 session
      window.location.reload();
    } catch (error) {
      toast.error("退出登录失败");
    }
  };
  return (
    <Button
      className={cn("flex w-full justify-start text-destructive/60!", className)}
      onClick={handleSignOut}
      variant="ghost"
    >
      <LogOut className="text-destructive/60" />
      退出登录
    </Button>
  );
}
