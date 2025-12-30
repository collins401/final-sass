import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getOptions, updateOptions } from "@/lib/api/option";

const profileFormSchema = z.object({
  site_title: z
    .string()
    .min(1, "请输入网站标题")
    .min(2, "网站标题至少 2 个字符")
    .max(30, "网站标题最多 30 个字符"),
  site_url: z.string().url("请输入有效的 URL"),
  site_description: z.string().max(160, "描述最多 160 个字符").optional(),
  seo_keywords: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function BaseSettings() {
  const router = useRouter();

  const { data: options } = useSuspenseQuery({
    queryKey: ["options"],
    queryFn: () => getOptions(),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      site_title: options?.site_title || "",
      site_url: options?.site_url || "",
      site_description: options?.site_description || "",
      seo_keywords: options?.seo_keywords || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateOptions,
    onSuccess: () => {
      toast.success("设置已更新");
      router.invalidate();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  function onSubmit(data: ProfileFormValues) {
    // Filter out undefined values to avoid type issues, though schema handles it
    const updates: Record<string, string> = {
      site_title: data.site_title,
      site_url: data.site_url,
      site_description: data.site_description || "",
      seo_keywords: data.seo_keywords || "",
    };
    mutate({ data: updates });
  }

  return (
    <Form {...form}>
      <form className="max-w-2xl space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="site_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站标题</FormLabel>
              <FormControl>
                <Input placeholder="输入网站标题" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="site_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站首页 URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="site_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站描述</FormLabel>
              <FormControl>
                <Textarea className="resize-none" placeholder="输入网站描述..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo_keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO 关键词</FormLabel>
              <FormControl>
                <Input placeholder="react, typescript, ui..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit">
          {isPending ? "保存中..." : "保存设置"}
        </Button>
      </form>
    </Form>
  );
}
