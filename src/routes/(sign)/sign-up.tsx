import { createFileRoute, Link } from "@tanstack/react-router";
import { Command, Github, Loader2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth/auth.client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(sign)/sign-up")({
	component: RouteComponent,
});

interface SignUpFormData {
	name: string;
	email: string;
	password: string;
}

// 密码强度检测函数
function calculatePasswordStrength(password: string): {
	strength: number; // 0-100
	level: "weak" | "medium" | "strong";
	label: string;
	color: string;
} {
	if (!password) {
		return { strength: 0, level: "weak", label: "", color: "" };
	}

	let strength = 0;
	const checks = {
		hasLower: /[a-z]/.test(password),
		hasUpper: /[A-Z]/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
		length: password.length >= 8,
	};

	// 长度检查
	if (checks.length) strength += 20;
	if (password.length >= 12) strength += 10;

	// 字符类型检查
	if (checks.hasLower) strength += 15;
	if (checks.hasUpper) strength += 15;
	if (checks.hasNumber) strength += 20;
	if (checks.hasSpecial) strength += 20;

	// 确定密码等级
	let level: "weak" | "medium" | "strong";
	let label: string;
	let color: string;

	if (strength < 40) {
		level = "weak";
		label = "弱密码";
		color = "bg-destructive"; // 红色/警告色
	} else if (strength < 70) {
		level = "medium";
		label = "中等强度";
		color = "bg-yellow-500"; // 黄色
	} else {
		level = "strong";
		label = "强密码";
		color = "bg-green-500"; // 绿色
	}

	return { strength, level, label, color };
}

function RouteComponent() {
	const [isLoading, setIsLoading] = useState(false);

	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<SignUpFormData>();

	const password = watch("password");

	// 计算密码强度
	const passwordStrength = useMemo(
		() => calculatePasswordStrength(password || ""),
		[password]
	);

	const onSubmit = async (data: SignUpFormData) => {
		setIsLoading(true);
		try {
			const result = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (result.error) {
				toast.error(result.error.message || "注册失败");
				return;
			}

			toast.success("注册成功！正在跳转...");
			// 使用完整页面导航来刷新 session
			window.location.href = "/";
		} catch (error) {
			console.error("注册错误:", error);
			toast.error("注册失败，请重试");
		} finally {
			setIsLoading(false);
		}
	};


	return (
			<div className="flex h-full items-center justify-center p-4 lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">创建账户</h1>
						<p className="text-sm text-muted-foreground">
							输入您的信息以创建新账户
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor={nameId}>姓名</Label>
								<Input
									id={nameId}
									placeholder="张三"
									type="text"
									autoCapitalize="none"
									autoCorrect="off"
									disabled={isLoading}
									{...register("name", {
										required: "请输入姓名",
										minLength: {
											value: 2,
											message: "姓名至少需要2个字符",
										},
									})}
								/>
								{errors.name && (
									<p className="text-sm text-destructive">
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor={emailId}>邮箱</Label>
								<Input
									id={emailId}
									placeholder="name@example.com"
									type="email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect="off"
									disabled={isLoading}
									{...register("email", {
										required: "请输入邮箱",
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: "请输入有效的邮箱地址",
										},
									})}
								/>
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor={passwordId}>密码</Label>
								<Input
									id={passwordId}
									placeholder="••••••••"
									type="password"
									autoCapitalize="none"
									autoComplete="new-password"
									disabled={isLoading}
									{...register("password", {
										required: "请输入密码",
										minLength: {
											value: 8,
											message: "密码至少需要8个字符",
										},
									})}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">
										{errors.password.message}
									</p>
								)}

								{/* 密码强度指示器 */}
								{password && password.length > 0 && (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground">
												密码强度
											</span>
											<span
												className={cn(
													"text-xs font-medium",
													passwordStrength.level === "weak" &&
														"text-destructive",
													passwordStrength.level === "medium" &&
														"text-yellow-500",
													passwordStrength.level === "strong" &&
														"text-green-500"
												)}
											>
												{passwordStrength.label}
											</span>
										</div>
										<Progress
											className={cn(
												"h-2",
												passwordStrength.level === "weak" &&
													"[&>div]:bg-destructive",
												passwordStrength.level === "medium" &&
													"[&>div]:bg-yellow-500",
												passwordStrength.level === "strong" &&
													"[&>div]:bg-green-500"
											)}
											value={passwordStrength.strength}
										/>
									</div>
								)}
							</div>

							<Button disabled={isLoading} className="w-full">
								{isLoading && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								注册
							</Button>
						</div>
					</form>


					<p className="px-8 text-center text-sm text-muted-foreground">
						已有账户？{" "}
						<Link
							to="/sign-in"
							className="font-semibold text-primary underline-offset-4 hover:underline"
						>
							立即登录
						</Link>
					</p>
					<p className="px-8 text-center text-sm text-muted-foreground">
						点击注册即表示您同意我们的{" "}
						<Link
							to="/"
							className="underline underline-offset-4 hover:text-primary"
						>
							服务条款
						</Link>{" "}
						和{" "}
						<Link
							to="/"
							className="underline underline-offset-4 hover:text-primary"
						>
							隐私政策
						</Link>
						.
					</p>
				</div>
			</div>
	);
}
