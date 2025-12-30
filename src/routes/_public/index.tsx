import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Route as RouteIcon, Server, Shield, Sparkles, Waves, Zap } from "lucide-react";

export const Route = createFileRoute("/_public/")({
  component: App,
});

function App() {
  // 方法1: 从根路由的 context 获取 user (这是从 beforeLoad 传递下来的)
  const { session } = useRouteContext({ from: "__root__" });

  const features = [
    {
      icon: <Zap className="h-12 w-12 text-cyan-400" />,
      title: "Powerful Server Functions",
      description:
        "Write server-side code that seamlessly integrates with your client components. Type-safe, secure, and simple.",
    },
    {
      icon: <Server className="h-12 w-12 text-cyan-400" />,
      title: "Flexible Server Side Rendering",
      description:
        "Full-document SSR, streaming, and progressive enhancement out of the box. Control exactly what renders where.",
    },
    {
      icon: <RouteIcon className="h-12 w-12 text-cyan-400" />,
      title: "API Routes",
      description:
        "Build type-safe API endpoints alongside your application. No separate backend needed.",
    },
    {
      icon: <Shield className="h-12 w-12 text-cyan-400" />,
      title: "Strongly Typed Everything",
      description:
        "End-to-end type safety from server to client. Catch errors before they reach production.",
    },
    {
      icon: <Waves className="h-12 w-12 text-cyan-400" />,
      title: "Full Streaming Support",
      description:
        "Stream data from server to client progressively. Perfect for AI applications and real-time updates.",
    },
    {
      icon: <Sparkles className="h-12 w-12 text-cyan-400" />,
      title: "Next Generation Ready",
      description:
        "Built from the ground up for modern web applications. Deploy anywhere JavaScript runs.",
    },
  ];

  return <div className="">ad</div>;
}
