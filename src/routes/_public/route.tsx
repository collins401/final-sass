import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import { authQueryOptions } from "@/lib/auth/auth.queries";
export const Route = createFileRoute("/_public")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { user } = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    // if (!user) {
    //   throw redirect({ to: "/sign-in" });
    // }
    // if (user.role !== "admin") {
    //   throw redirect({ to: "/user" });
    // }

    // re-return to update type as non-null for child routes
    return { user };
  },
});

function RouteComponent() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
