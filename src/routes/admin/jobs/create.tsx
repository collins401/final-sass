import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { JobForm } from "@/components/admin/jobs/job-form";
import { createJob } from "@/lib/api/jobs";

export const Route = createFileRoute("/admin/jobs/create")({
  component: CreateJobPage,
});

function CreateJobPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      await createJob({ data });
      toast.success("职位创建成功");
      navigate({ to: "/admin/jobs" });
    } catch (error) {
      toast.error("职位创建失败");
    }
  };

  return (
    <div className="p-6">
      <JobForm onSubmit={handleSubmit} />
    </div>
  );
}
