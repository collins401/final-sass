import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Globe, Image as ImageIcon, Loader2, Sparkles, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
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

// Define the schema locally for the form, matching the server schema
const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  categoryId: z.string().optional(), // We handle number conversion on submit
  coverImage: z.string().optional(),
  publishedAt: z.string().optional(), // For date picker
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostFormProps {
  initialData?: Partial<PostFormValues> & {
    id?: number;
    categoryId?: number | null;
    publishedAt?: Date | null;
  };
  categories: { id: number; name: string }[];
  onSubmit: (data: PostFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function PostForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}: PostFormProps) {
  const navigate = useNavigate();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      status: (initialData?.status as "draft" | "published" | "archived") || "draft",
      categoryId:
        initialData?.categoryId !== undefined && initialData?.categoryId !== null
          ? String(initialData.categoryId)
          : "",
      coverImage: initialData?.coverImage || "",
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const title = e.target.value;
    form.setValue("title", title);

    if (!(initialData || form.getValues("slug"))) {
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
              onClick={() => navigate({ to: "/admin/posts" })}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Posts</span>
              <span>/</span>
              <span className="font-medium text-foreground">{initialData ? "Edit" : "New"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate({ to: "/admin/posts" })} type="button" variant="ghost">
              Discard
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content - Left Column */}
          <div className="min-h-[calc(100vh-200px)] rounded-xl border bg-card p-8 shadow-sm">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="min-h-[60px] w-full resize-none border-0 bg-transparent p-0 font-bold text-4xl leading-tight placeholder:text-muted-foreground/50 focus-visible:ring-0"
                      placeholder="Article Title..."
                      {...field}
                      onChange={handleTitleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-8">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="min-h-[500px] w-full resize-none border-0 bg-transparent p-0 font-serif text-lg leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-0"
                        placeholder="Start writing your story..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Publishing Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="font-medium text-base">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Status</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Publish Date</FormLabel>
                      <div className="relative">
                        <Input type="date" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Smart Metadata Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <CardTitle className="font-medium text-base">Smart Metadata</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs">Summary / SEO Description</FormLabel>
                        <Button
                          className="h-auto p-0 text-[10px] text-blue-500 hover:text-blue-600"
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          AUTO-GENERATE ✨
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px] resize-none text-sm"
                          placeholder="Short summary for search engines..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Placeholder for Tags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Tags
                    </span>
                    <Button
                      className="h-auto p-0 text-[10px] text-blue-500 hover:text-blue-600"
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      AUTO-TAG 🏷️
                    </Button>
                  </div>
                  <Input className="text-sm" disabled placeholder="Add tags..." />
                </div>
              </CardContent>
            </Card>

            {/* Organization Card */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="font-medium text-base">Organization</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Category</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Uncategorized</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
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
                      <FormLabel className="text-xs">URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="post-url-slug"
                          {...field}
                          className="font-mono text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Cover Image</FormLabel>
                      <div className="cursor-pointer rounded-lg border border-dashed p-8 text-center transition-colors hover:bg-muted/50">
                        <div className="mx-auto flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <ImageIcon className="h-8 w-8 opacity-50" />
                          <span className="text-xs">Click to upload image</span>
                        </div>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="hidden" />
                        </FormControl>
                      </div>
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
