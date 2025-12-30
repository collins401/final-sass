import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NavigationProgress } from "@/components/navigation-progress";
import { authQueryOptions } from "@/lib/auth/auth.queries";
import { Header } from "./-header";

export const Route = createFileRoute("/_user")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: "/sign-in" });
    }

    // re-return to update type as non-null for child routes
    return { user };
  },
});

function RouteComponent() {
  return (
    <>
      <NavigationProgress />
      <Header />
      <Outlet />
    </>
  );
}
