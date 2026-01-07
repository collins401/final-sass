import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NavigationProgress } from "@/components/navigation-progress";
import Header from "@/components/user/header";
import { authQueryOptions } from "@/lib/auth/auth.queries";

export const Route = createFileRoute("/user")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!data) {
      throw redirect({ to: "/sign-in" });
    }
    // re-return to update type as non-null for child routes
    return data;
  },
});

function RouteComponent() {
  return (
    <>
      <NavigationProgress />
      <Header />
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <Outlet />
      </div>
    </>
  );
}
