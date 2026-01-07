import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Briefcase, CheckCircle, ChevronLeft, DollarSign, Loader2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define schema for the form
const jobFormSchema = z.object({
  title: z.string().min(1, "请输入职位名称"),
  slug: z.string().min(1, "请输入别名"),
  description: z.string().min(10, "请输入职位描述（至少 10 个字符）"),
  requirements: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]),
  salaryRange: z.string().optional(),
  status: z.enum(["draft", "published", "closed"]),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: JobFormValues & { id?: number };
  onSubmit: (data: JobFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function JobForm({ initialData, onSubmit, isSubmitting = false }: JobFormProps) {
  const navigate = useNavigate();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      requirements: initialData?.requirements || "",
      location: initialData?.location || "",
      type: initialData?.type || "full-time",
      salaryRange: initialData?.salaryRange || "",
      status: initialData?.status || "draft",
    },
  });

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);

    if (!(initialData?.slug || form.getValues("slug"))) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate({ to: "/admin/jobs" })}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>招聘管理</span>
              <span>/</span>
              <span className="font-medium text-foreground">
                {initialData ? "编辑职位" : "发布职位"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate({ to: "/admin/jobs" })} type="button" variant="ghost">
              取消
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "更新职位" : "发布职位"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content - Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>职位详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>职位名称</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例如：高级前端工程师"
                          {...field}
                          onChange={handleTitleChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>别名 (Slug)</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：senior-frontend-engineer" {...field} />
                      </FormControl>
                      <FormDescription>标题的 URL 友好版本。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>职位描述</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-36"
                          placeholder="描述职位职责和团队情况..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>职位要求</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-36"
                          placeholder="- 5 年以上 React 开发经验&#10;- 熟悉 Tailwind CSS..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发布状态</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">草稿</SelectItem>
                          <SelectItem value="published">已发布</SelectItem>
                          <SelectItem value="closed">已关闭</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Employment Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-semibold text-base">招聘详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        工作性质
                      </FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择工作性质" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">全职</SelectItem>
                          <SelectItem value="part-time">兼职</SelectItem>
                          <SelectItem value="contract">合同工</SelectItem>
                          <SelectItem value="internship">实习</SelectItem>
                          <SelectItem value="remote">远程</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        工作地点
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="例如：北京，远程" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        薪资范围
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="例如：20k - 35k" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
