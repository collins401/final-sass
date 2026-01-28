import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/products/product-form";
import { getCategories } from "@/lib/api/category";
import { createProduct } from "@/lib/api/products";

export const Route = createFileRoute("/admin/products/create")({
  component: CreateProductPage,
  loader: () => getCategories({ data: 1 }), // Assuming category ID 1 is for products or just load all
});

function CreateProductPage() {
  const categories = Route.useLoaderData();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => createProduct({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("产品录入成功");
      navigate({ to: "/admin/products/list" });
    },
    onError: () => {
      toast.error("产品录入失败");
    },
  });

  const handleSubmit = async (data: any) => {
    await mutation.mutateAsync(data);
  };

  return (
    <ProductForm
      categories={categories}
      isSubmitting={mutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
