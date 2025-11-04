import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/page/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/page/"!</div>
}
