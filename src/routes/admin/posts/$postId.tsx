import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { getPost, updatePost } from '@/lib/api/posts'
import { getCategories } from '@/lib/api/category'
import { PostForm } from '@/components/admin/posts/post-form'
import { toast } from "sonner"

export const Route = createFileRoute('/admin/posts/$postId')({
  component: EditPostPage,
  loader: async ({ params }) => {
    const postId = parseInt(params.postId)
    if (isNaN(postId)) {
        throw notFound()
    }

    const [post, categories] = await Promise.all([
        getPost({ data: postId }),
        getCategories(),
    ])

    if (!post) {
        throw notFound()
    }

    return { post, categories }
  },
})

function EditPostPage() {
  const { post, categories } = Route.useLoaderData()
  const navigate = useNavigate()

  const handleSubmit = async (data: any) => {
    try {
      await updatePost({
        data: {
          id: post.id,
          data: {
            ...data,
            categoryId: data.categoryId ? parseInt(data.categoryId) : null,
          },
        },
      })
      toast.success("Post updated successfully")
      navigate({ to: '/admin/posts' })
    } catch (error) {
      console.error(error)
      toast.error("Failed to update post")
    }
  }

  return (
    <div className="p-6">
      <PostForm 
        initialData={post} 
        categories={categories} 
        onSubmit={handleSubmit} 
      />
    </div>
  )
}
