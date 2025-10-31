import { createFileRoute, Outlet, redirect, useRouteContext } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    // 检查是否已登录
    if (!context.session?.user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    
    // 检查是否为管理员
    if (context.session.user.role !== 'admin') {
      throw redirect({
        to: '/',
        statusCode: 403,
      })
    }
    
    // 返回用户数据供子路由使用
    return {
      user: context.session.user,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  // 从 context 获取 session（由 __root.tsx 提供）
  const { session } = useRouteContext({ from: '__root__' })
  
  return <div>
    <div>Admin Header - 欢迎，{session?.user?.name || '管理员'}</div>
    <Outlet />
  </div>
}
