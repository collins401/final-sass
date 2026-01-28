import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Globe,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
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

const productFormSchema = z.object({
  title: z.string().min(1, "名称是必填的"),
  slug: z.string().min(1, "SKU/路径是必填的"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
  thumbnail: z.string().optional(),
  metadata: z
    .array(
      z.object({
        key: z.string().min(1, "键名不能为空"),
        value: z.string(),
      })
    )
    .optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: any;
  categories: { id: number; name: string }[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const navigate = useNavigate();

  // Convert metadata object to array for react-hook-form
  const initialMetadata = initialData?.metadata
    ? Object.entries(initialData.metadata).map(([key, value]) => ({ key, value: String(value) }))
    : [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      status: (initialData?.status as any) || "draft",
      categoryId: initialData?.categoryId ? String(initialData.categoryId) : "",
      coverImage: initialData?.coverImage || "",
      thumbnail: initialData?.thumbnail || "",
      metadata: initialMetadata,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metadata",
  });

  const handleFormSubmit = async (values: ProductFormValues) => {
    // Convert metadata array back to object
    const metadataObj = values.metadata?.reduce(
      (acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, any>
    );

    await onSubmit({
      ...values,
      metadata: metadataObj,
      categoryId:
        values.categoryId && values.categoryId !== "none" ? Number(values.categoryId) : null,
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate({ to: "/admin/products/list" })}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>产品管理</span>
              <span>/</span>
              <span className="font-medium text-foreground">
                {initialData ? "编辑产品" : "新建产品"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate({ to: "/admin/products/list" })}
              type="button"
              variant="ghost"
            >
              取消
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存产品
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>产品名称</FormLabel>
                      <FormControl>
                        <Input placeholder="输入产品名称..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>简短描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="简短的产品介绍..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>详细介绍</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[200px]"
                          placeholder="产品详细规格、特性等..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">自定义属性 (Metadata)</CardTitle>
                <Button
                  onClick={() => append({ key: "", value: "" })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加属性
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div className="flex items-end gap-4" key={field.id}>
                      <div className="grid flex-1 grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`metadata.${index}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : ""}>
                                键名 (Key)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="例: 颜色" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`metadata.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index > 0 ? "sr-only" : ""}>
                                属性值 (Value)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="例: 宝石蓝" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        className="text-red-500 hover:text-red-600"
                        onClick={() => remove(index)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      暂无自定义属性
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="font-medium text-base">发布选项</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">状态</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">库中 (草稿)</SelectItem>
                          <SelectItem value="published">已上架 (发布)</SelectItem>
                          <SelectItem value="archived">已下架 (归档)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">SKU / URL 别名</FormLabel>
                      <FormControl>
                        <Input
                          className="font-mono text-xs"
                          placeholder="product-sku-001"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">产品分类</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">未分类</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="font-medium text-base">产品图片</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">缩略图 (建议 1:1)</FormLabel>
                      <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:border-primary/50">
                        {field.value ? (
                          <>
                            <img
                              alt="Thumbnail"
                              className="h-full w-full object-cover"
                              src={field.value}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                className="h-8 w-8"
                                onClick={() => field.onChange("")}
                                size="icon"
                                type="button"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-8 w-8 opacity-50" />
                            <span className="text-[10px]">上传缩略图</span>
                          </div>
                        )}
                        <FormControl>
                          <Input
                            className="hidden"
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="URL..."
                          />
                        </FormControl>
                      </div>
                      <Input className="mt-2 text-xs" placeholder="图片 URL..." {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">封面主图 (建议 16:9)</FormLabel>
                      <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:border-primary/50">
                        {field.value ? (
                          <>
                            <img
                              alt="Cover"
                              className="h-full w-full object-cover"
                              src={field.value}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                className="h-8 w-8"
                                onClick={() => field.onChange("")}
                                size="icon"
                                type="button"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-8 w-8 opacity-50" />
                            <span className="text-[10px]">上传封面图</span>
                          </div>
                        )}
                      </div>
                      <Input className="mt-2 text-xs" placeholder="图片 URL..." {...field} />
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
