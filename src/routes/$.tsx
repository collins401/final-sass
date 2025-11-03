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
export const Route = createFileRoute("/$")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">asd</EmptyMedia>
				<EmptyTitle>No Projects Yet</EmptyTitle>
				<EmptyDescription>
					You haven&apos;t created any projects yet. Get started by creating
					your first project.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<div className="flex gap-2">
					<Button>Create Project</Button>
					<Button variant="outline">Import Project</Button>
				</div>
			</EmptyContent>
			<Button
				asChild
				className="text-muted-foreground"
				size="sm"
				variant="link"
			>
				Back home
			</Button>
		</Empty>
	);
}
