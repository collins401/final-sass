import { createFileRoute } from "@tanstack/react-router";
import { CategoryManager } from "@/components/admin/category";

export const Route = createFileRoute("/admin/products/category")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      {/* id=1 为产品分类的总 ID，下面的所有的产品分类都是 1 的字类  */}
      <CategoryManager id={2} />
    </div>
  );
}
