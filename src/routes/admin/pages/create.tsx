import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageForm } from "@/components/admin/pages/page-form";
import { createPage } from "@/lib/api/pages";

export const Route = createFileRoute("/admin/pages/create")({
  component: CreatePagePage,
});

function CreatePagePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      await createPage({ data });
      toast.success("页面发布成功");
      navigate({ to: "/admin/pages" });
    } catch (error: any) {
      toast.error(error.message || "页面创建失败");
    }
  };

  return (
    <div className="p-6">
      <PageForm onSubmit={handleSubmit} />
    </div>
  );
}
