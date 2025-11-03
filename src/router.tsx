// Import the generated route tree
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";
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
