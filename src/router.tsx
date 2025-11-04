// Import the generated route tree
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { NotFound } from "./components/admin/not-found";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const queryClient = new QueryClient();
	const router = createRouter({
		routeTree,
		context: {
			queryClient,
			session: null,
		},
		defaultPreload: "intent",
		defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => <NotFound />,
	});

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
};
