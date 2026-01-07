import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { JobForm } from "@/components/admin/jobs/job-form";
import { getJob, updateJob } from "@/lib/api/jobs";

const jobQueryOptions = (jobId: number) =>
  queryOptions({
    queryKey: ["jobs", jobId],
    queryFn: () => getJob({ data: { id: jobId } }),
  });

export const Route = createFileRoute("/admin/jobs/$jobId")({
  component: JobDetailPage,
  loader: ({ context: { queryClient }, params: { jobId } }) =>
    queryClient.ensureQueryData(jobQueryOptions(Number(jobId))),
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { data: job } = useSuspenseQuery(jobQueryOptions(Number(jobId)));

  const handleSubmit = async (data: any) => {
    try {
      await updateJob({
        data: {
          id: Number(jobId),
          data,
        },
      });
      toast.success("职位更新成功");
      navigate({ to: "/admin/jobs" });
    } catch {
      toast.error("职位更新失败");
    }
  };

  if (!job) {
    return <div>未找到该职位</div>;
  }

  return (
    <div className="p-6">
      <JobForm initialData={job as any} onSubmit={handleSubmit} />
    </div>
  );
}
