import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/products/product-form";
import { getCategories } from "@/lib/api/category";
import { getProduct, updateProduct } from "@/lib/api/products";

const productQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["products", id],
    queryFn: () => getProduct({ data: id }),
  });

export const Route = createFileRoute("/admin/products/$id/")({
  component: EditProductPage,
  loader: ({ context: { queryClient }, params }) => {
    const id = Number(params.id);
    return Promise.all([
      queryClient.ensureQueryData(productQueryOptions(id)),
      getCategories({ data: 1 }), // Assuming category ID 1 for products
    ]);
  },
});

function EditProductPage() {
  const [, categories]: [any, any] = Route.useLoaderData();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Use suspense query to keep data synced
  const productQuery = useSuspenseQuery(productQueryOptions(Number(id)));
  const product = productQuery.data;

  const mutation = useMutation({
    mutationFn: (data: any) => updateProduct({ data: { id: Number(id), data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("产品更新成功");
      navigate({ to: "/admin/products/list" });
    },
    onError: () => {
      toast.error("产品更新失败");
    },
  });

  const handleSubmit = async (data: any) => {
    await mutation.mutateAsync(data);
  };

  return (
    <ProductForm
      categories={categories}
      initialData={product}
      isSubmitting={mutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
