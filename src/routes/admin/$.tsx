import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
export const Route = createFileRoute("/admin/$")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">404</EmptyMedia>
        <EmptyTitle>Page Not Found</EmptyTitle>
        <EmptyDescription>
          The page you are looking for doesn&apos;t exist or has been moved.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Back home</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
