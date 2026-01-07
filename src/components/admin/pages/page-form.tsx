import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, ChevronLeft, FileText, Globe, Loader2 } from "lucide-react";
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

const pageFormSchema = z.object({
  title: z.string().min(1, "请输入页面标题"),
  slug: z.string().min(1, "请输入页面别名"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

type PageFormValues = z.infer<typeof pageFormSchema>;

interface PageFormProps {
  initialData?: PageFormValues & { id?: number };
  onSubmit: (data: PageFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function PageForm({ initialData, onSubmit, isSubmitting = false }: PageFormProps) {
  const navigate = useNavigate();

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      status: (initialData?.status as any) || "draft",
    },
  });

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);

    if (!(initialData?.slug || form.getValues("slug"))) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
        .replace(/(^-|-$)+/g, ""); // Remove leading/trailing hyphens
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              className="cursor-pointer"
              onClick={() => navigate({ to: "/admin/pages" })}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>页面管理</span>
              <span>/</span>
              <span className="font-medium text-foreground">
                {initialData ? "编辑页面" : "新建页面"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="cursor-pointer"
              onClick={() => navigate({ to: "/admin/pages" })}
              type="button"
              variant="ghost"
            >
              取消
            </Button>
            <Button className="cursor-pointer" disabled={isSubmitting} type="submit">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "更新页面" : "发布页面"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content - Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>页面内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>页面标题</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例如：关于我们"
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
                      <FormLabel>URL 别名 (Slug)</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：about-us" {...field} />
                      </FormControl>
                      <FormDescription>页面的 URL 路径标识。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>正文内容</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[400px] font-mono"
                          placeholder="# 关于我们&#10;&#10;这里是正文内容..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>支持 Markdown 格式。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO 设置</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>摘要 / Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="h-24"
                          placeholder="简短描述页面内容，用于 SEO 和列表展示..."
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
                  发布状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem className="cursor-pointer" value="draft">
                            草稿
                          </SelectItem>
                          <SelectItem className="cursor-pointer" value="published">
                            已发布
                          </SelectItem>
                          <SelectItem className="cursor-pointer" value="archived">
                            归档
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-semibold text-base">
                  <FileText className="h-4 w-4" />
                  信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground text-sm">
                <div className="flex justify-between">
                  <span>创建时间</span>
                  <span>{initialData && initialData.id ? "已保存" : "未保存"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> 公开访问
                  </span>
                  <span>{form.watch("status") === "published" ? "是" : "否"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
