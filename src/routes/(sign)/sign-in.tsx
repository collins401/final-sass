import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth.client";
export const Route = createFileRoute("/(sign)/sign-in")({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});

interface SignInFormData {
  email: string;
  password: string;
}

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const search = useSearch({ from: "/(sign)/sign-in" });

  const emailId = useId();
  const passwordId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message || "登录失败，请检查您的邮箱和密码");
        return;
      }

      toast.success("登录成功！正在跳转...");
      // 跳转到之前的页面，或者首页
      window.location.href = search.redirect || "/";
    } catch (error) {
      console.error("登录错误:", error);
      toast.error("登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="font-bold text-2xl">欢迎回来</CardTitle>
          <CardDescription>输入您的邮箱和密码以登录账户</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={emailId}>邮箱</Label>
              <Input
                id={emailId}
                placeholder="example@email.com"
                type="email"
                {...register("email", {
                  required: "请输入邮箱",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "请输入有效的邮箱地址",
                  },
                })}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={passwordId}>密码</Label>
                <Link
                  className="text-muted-foreground text-xs hover:text-primary hover:underline"
                  to="/"
                >
                  忘记密码？
                </Link>
              </div>
              <Input
                id={passwordId}
                placeholder="••••••••"
                type="password"
                {...register("password", {
                  required: "请输入密码",
                })}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "登录中..." : "登录"}
            </Button>
            <div className="text-center text-muted-foreground text-sm">
              还没有账户？{" "}
              <Link className="font-medium text-primary hover:underline" to="/sign-up">
                立即注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
