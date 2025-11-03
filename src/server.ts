import {
	createStartHandler,
	defaultRenderHandler,
} from "@tanstack/react-start/server";
import { auth } from "./lib/auth/auth.server";

// Database connection is now handled with lazy initialization via db proxy
// No need to initialize on server startup as the proxy handles this automatically

const handler = createStartHandler(
	async ({ request, router, responseHeaders }) => {
		// 在服务端获取 session
		const session = await auth.api.getSession({ headers: request.headers });

		// 将 session 注入到 router context 中
		router.update({
			context: {
				...router.options.context,
				session,
			},
		});

		return defaultRenderHandler({ request, router, responseHeaders });
	}
);

export default {
	async fetch(req: Request): Promise<Response> {
		return await handler(req);
	},
};
