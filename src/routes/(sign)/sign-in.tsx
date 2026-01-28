import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Github, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth.client";

export const Route = createFileRoute("/(sign)/sign-in")({
  component: RouteComponent,
  // validateSearch: z.object({
  //   redirect: z.string().optional(),
  // }),
});

interface SignInFormData {
  email: string;
  password: string;
}
const Icons = {
  google: (props: React.ComponentProps<"svg">) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  ),
  gitHub: Github,
};
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
      window.location.href = search.redirect || "/";
    } catch (error) {
      console.error("登录错误:", error);
      toast.error("登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error) {
      console.error(`${provider} 登录错误:`, error);
      toast.error(`${provider} 登录失败，请重试`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 lg:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">欢迎回来</h1>
          <p className="text-muted-foreground text-sm">请输入您的邮箱以登录账户</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={emailId}>邮箱</Label>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                id={emailId}
                placeholder="name@example.com"
                type="email"
                {...register("email", {
                  required: "请输入邮箱",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "请输入有效的邮箱地址",
                  },
                })}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={passwordId}>密码</Label>
                <Link
                  className="font-medium text-muted-foreground text-sm hover:text-primary hover:underline"
                  to="/"
                >
                  忘记密码？
                </Link>
              </div>
              <Input
                autoCapitalize="none"
                autoComplete="current-password"
                disabled={isLoading}
                id={passwordId}
                placeholder="••••••••"
                type="password"
                {...register("password", {
                  required: "请输入密码",
                })}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登录
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">或者</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Button
            disabled={isLoading}
            onClick={() => handleSocialSignIn("github")}
            type="button"
            variant="outline"
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            Github
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => handleSocialSignIn("google")}
            type="button"
            variant="outline"
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
        <p className="px-8 text-center text-muted-foreground text-sm">
          还没有账户？{" "}
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline"
            to="/sign-up"
          >
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
