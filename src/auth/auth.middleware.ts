import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "./auth.server";

// https://tanstack.com/start/latest/docs/framework/react/guide/middleware
// 认证中间件 - 用于保护需要登录才能访问的路由

/**
 * 认证中间件 - 检查用户是否已登录
 * 如果未登录，重定向到登录页
 * 如果已登录，将 user 和 session 添加到 context 中
 */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  
  const session = await auth.api.getSession({
    headers: request.headers,
    query: {
      // 确保 session 是最新的
      // https://www.better-auth.com/docs/concepts/session-management#session-caching
      disableCookieCache: true,
    },
  });

  // 如果没有 session，重定向到登录页
  if (!session?.user) {
    // 保存当前路径，登录后可以跳转回来
    const currentPath = new URL(request.url).pathname;
    
    throw redirect({
      to: '/sign-in',
      search: { redirect: currentPath },
      statusCode: 302,
    });
  }

  // 将用户信息和 session 添加到 context
  return next({ 
    context: { 
      user: session.user,
      session: session.session,
    } 
  });
});

/**
 * 可选的认证中间件 - 获取 session 但不强制登录
 * 适用于既可以登录也可以不登录的页面
 */
export const optionalAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
    query: {
      disableCookieCache: true,
    },
  });

  // 不管是否登录，都继续执行，但将 session 信息传递下去
  return next({ 
    context: { 
      user: session?.user ?? null,
      session: session?.session ?? null,
    } 
  });
});

/**
 * 角色检查中间件 - 检查用户是否有特定角色
 * @param requiredRole 需要的角色
 */
export const roleMiddleware = (requiredRole: string) => {
  return createMiddleware().server(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
      query: {
        disableCookieCache: true,
      },
    });

    if (!session?.user) {
      const request = getRequest();
      const currentPath = new URL(request.url).pathname;
      throw redirect({
        to: '/sign-in',
        search: { redirect: currentPath },
        statusCode: 302,
      });
    }

    // 检查用户角色
    if (session.user.role !== requiredRole) {
        console.log(`User ${session.user.id} attempted to access ${getRequest().url} without the required role: ${requiredRole}`);
      throw redirect({
        to: '/',
        statusCode: 403,
      });
    }

    return next({ 
      context: { 
        user: session.user,
        session: session.session,
      } 
    });
  });
};

/**
 * 管理员中间件 - 仅允许管理员访问
 */
export const adminMiddleware = roleMiddleware('admin');