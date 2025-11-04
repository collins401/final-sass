import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/posts/category')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/posts/category"!</div>
}
