import { createFileRoute } from "@tanstack/react-router";
import { Loading } from "@/components/loading";

export const Route = createFileRoute("/admin/products/list/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello "/admin/products/list/"!
      <Loading />
    </div>
  );
}
