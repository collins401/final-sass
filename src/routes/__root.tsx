import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getOptions } from "@/lib/api/option";
import { authQueryOptions } from "@/lib/auth/auth.queries";
import appCss from "../styles.css?url";

// Better Auth session 类型
type AuthSession = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    role?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;
  };
} | null;

interface MyRouterContext {
  queryClient: QueryClient;
  session: AuthSession;
  siteConfig?: Record<string, string>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  beforeLoad: async ({ context }) => {
    // Prefetch auth
    context.queryClient.prefetchQuery(authQueryOptions());

    // Fetch site config for SEO
    const siteConfig = await getOptions({
      data: ["site_title", "site_description", "seo_keywords", "site_url"],
    });

    return {
      siteConfig,
    };
  },
  shellComponent: RootDocument,
});
function RootDocument({ children }: { children: React.ReactNode }) {
  const { siteConfig } = Route.useRouteContext();
  const title = siteConfig?.site_title || "TanStack Start Starter";
  const description = siteConfig?.site_description || "A modern full-stack starter template";
  const keywords = siteConfig?.seo_keywords || "";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{title}</title>
        <meta content={description} name="description" />
        {keywords && <meta content={keywords} name="keywords" />}
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
        <Toaster position="top-right" />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "Tanstack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
