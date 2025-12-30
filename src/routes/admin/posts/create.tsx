import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PostForm } from "@/components/admin/posts/post-form";
import { getCategories } from "@/lib/api/category";
import { createPost } from "@/lib/api/posts";

export const Route = createFileRoute("/admin/posts/create")({
  component: CreatePostPage,
  loader: () => getCategories(),
});

function CreatePostPage() {
  const categories = Route.useLoaderData();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      await createPost({
        data: {
          ...data,
          categoryId: data.categoryId ? Number.parseInt(data.categoryId) : undefined,
        },
      });
      toast.success("Post created successfully");
      navigate({ to: "/admin/posts" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post");
    }
  };

  return <PostForm categories={categories} onSubmit={handleSubmit} />;
}
