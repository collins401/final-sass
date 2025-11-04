import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/category/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/category/"!</div>
}
