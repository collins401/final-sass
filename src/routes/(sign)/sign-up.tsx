import { createFileRoute, Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { authClient } from '@/auth/auth.client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/(sign)/sign-up')({
  component: RouteComponent,
})

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>()

  const password = watch('password')

  const onSubmit = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('密码不匹配')
      return
    }

    setIsLoading(true)
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (result.error) {
        toast.error(result.error.message || '注册失败')
        return
      }

      toast.success('注册成功！正在跳转...')
      // 使用完整页面导航来刷新 session
      window.location.href = '/'
    } catch (error) {
      console.error('注册错误:', error)
      toast.error('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">创建账户</CardTitle>
          <CardDescription>
            输入您的信息以创建新账户
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={nameId}>姓名</Label>
              <Input
                id={nameId}
                type="text"
                placeholder="张三"
                {...register('name', {
                  required: '请输入姓名',
                  minLength: {
                    value: 2,
                    message: '姓名至少需要2个字符',
                  },
                })}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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
              <Label htmlFor={passwordId}>密码</Label>
              <Input
                id={passwordId}
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: '请输入密码',
                  minLength: {
                    value: 8,
                    message: '密码至少需要8个字符',
                  },
                })}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={confirmPasswordId}>确认密码</Label>
              <Input
                id={confirmPasswordId}
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: '请确认密码',
                  validate: (value) =>
                    value === password || '两次输入的密码不一致',
                })}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '注册中...' : '注册'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              已有账户？{' '}
              <Link
                to="/sign-in"
                className="text-primary hover:underline font-medium"
              >
                立即登录
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
