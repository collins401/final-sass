import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/menu/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/menu/"!</div>
}
