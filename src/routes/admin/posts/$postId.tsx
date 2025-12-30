import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PostForm } from "@/components/admin/posts/post-form";
import { getCategories } from "@/lib/api/category";
import { getPost, updatePost } from "@/lib/api/posts";

export const Route = createFileRoute("/admin/posts/$postId")({
  component: EditPostPage,
  loader: async ({ params }) => {
    const postId = Number(params.postId);
    if (Number.isNaN(postId)) {
      throw notFound();
    }

    const [post, categories] = await Promise.all([
      getPost({ data: postId }),
      getCategories({ data: 1 }),
    ]);

    if (!post) {
      throw notFound();
    }

    return { post, categories };
  },
});

function EditPostPage() {
  const { post, categories } = Route.useLoaderData();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      await updatePost({
        data: {
          id: post.id,
          data: {
            ...data,
            categoryId: data.categoryId ? Number(data.categoryId) : null,
          },
        },
      });
      toast.success("Post updated successfully");
      navigate({ to: "/admin/posts/list" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update post");
    }
  };

  return (
    <div className="p-6">
      <PostForm categories={categories} initialData={post} onSubmit={handleSubmit} />
    </div>
  );
}
