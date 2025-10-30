import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Calendar, Mail, Shield, User } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/auth/auth.client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  // 使用 Better Auth 的 useSession hook
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      toast.success('已成功退出登录')
      // 刷新页面以更新 session
      window.location.href = '/sign-in'
    } catch (error) {
      console.error('退出登录失败:', error)
      toast.error('退出登录失败')
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return <Navigate to="/sign-in" />
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '未知'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">个人资料</CardTitle>
                <CardDescription>查看和管理您的账户信息</CardDescription>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">姓名</p>
                  <p className="text-lg font-medium">{session.user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">邮箱</p>
                  <p className="text-lg font-medium">{session.user.email}</p>
                  {session.user.emailVerified && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ 已验证
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">注册时间</p>
                  <p className="text-lg font-medium">
                    {formatDate(session.user.createdAt)}
                  </p>
                </div>
              </div>

              {session.user.role && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">角色</p>
                    <p className="text-lg font-medium">{session.user.role}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="flex-1"
                >
                  退出登录
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>会话信息</CardTitle>
            <CardDescription>当前登录会话的详细信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">会话 ID</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                {session.session.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">过期时间</p>
              <p className="text-sm mt-1">
                {formatDate(session.session.expiresAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
