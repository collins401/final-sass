import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/user/page-layout";

export const Route = createFileRoute("/user/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout description="Welcome to the user page" title="个人信息">
      Hello "/_user/user"!
    </PageLayout>
  );
}
