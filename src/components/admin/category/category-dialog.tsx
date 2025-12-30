import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { createCategory, updateCategory } from "@/lib/api/category";
import type { Category } from "./types";

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.number().default(0),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: number;
  category?: Category; // If present, it's edit mode
}

export function CategoryDialog({
  open,
  onOpenChange,
  parentId = 0,
  category,
}: CategoryDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId,
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || "",
        slug: category?.slug || "",
        description: category?.description || "",
        parentId: category?.parentId ?? parentId,
        sortOrder: category?.sortOrder ?? 0,
        isActive: category?.isActive ?? true,
      });
    }
  }, [category, open, parentId, form]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (category) {
        await updateCategory({ data: { id: category.id, data } });
        toast.success("分类已更新");
      } else {
        await createCategory({ data });
        toast.success("分类已创建");
      }
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.invalidate();
    } catch (error) {
      toast.error(`保存分类失败: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "编辑分类" : "新建分类"}</DialogTitle>
          <DialogDescription>
            {category ? "在此修改您的分类信息。" : "为您的内容创建一个新分类。"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="分类名称" {...field} />
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
                    <Input placeholder="分类别名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请输入描述..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={isLoading} type="submit">
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
