import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { authClient } from '@/auth/auth.client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/(sign)/sign-in')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || '/dashboard',
    }
  },
})

interface SignInFormData {
  email: string
  password: string
}

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const search = useSearch({ from: '/(sign)/sign-in' })
  
  const emailId = useId()
  const passwordId = useId()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>()

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        toast.error(result.error.message || '登录失败，请检查您的邮箱和密码')
        return
      }

      toast.success('登录成功！正在跳转...')
      // 跳转到之前的页面，或者首页
      window.location.href = search.redirect
    } catch (error) {
      console.error('登录错误:', error)
      toast.error('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
          <CardDescription>
            输入您的邮箱和密码以登录账户
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={emailId}>邮箱</Label>
              <Input
                id={emailId}
                type="email"
                placeholder="example@email.com"
                {...register('email', {
                  required: '请输入邮箱',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '请输入有效的邮箱地址',
                  },
                })}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={passwordId}>密码</Label>
                <Link
                  to="/"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  忘记密码？
                </Link>
              </div>
              <Input
                id={passwordId}
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: '请输入密码',
                })}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              还没有账户？{' '}
              <Link
                to="/sign-up"
                className="text-primary hover:underline font-medium"
              >
                立即注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
