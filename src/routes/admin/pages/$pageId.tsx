import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageForm } from "@/components/admin/pages/page-form";
import { getPage, updatePage } from "@/lib/api/pages";

const pageQueryOptions = (pageId: number) =>
  queryOptions({
    queryKey: ["pages", pageId],
    queryFn: () => getPage({ data: { id: pageId } }),
  });

export const Route = createFileRoute("/admin/pages/$pageId")({
  component: PageEditPage,
  loader: ({ context: { queryClient }, params: { pageId } }) =>
    queryClient.ensureQueryData(pageQueryOptions(Number(pageId))),
});

function PageEditPage() {
  const { pageId } = Route.useParams();
  const navigate = useNavigate();
  const { data: page } = useSuspenseQuery(pageQueryOptions(Number(pageId)));

  const handleSubmit = async (data: any) => {
    try {
      await updatePage({
        data: {
          id: Number(pageId),
          data,
        },
      });
      toast.success("页面更新成功");
      navigate({ to: "/admin/pages" });
    } catch (error: any) {
      toast.error(error.message || "页面更新失败");
    }
  };

  if (!page) {
    return <div>未找到该页面</div>;
  }

  return (
    <div className="p-6">
      <PageForm
        initialData={{
          ...page,
          status: page.status as "draft" | "published" | "archived",
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
