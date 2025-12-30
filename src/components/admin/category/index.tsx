import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/api/category";
import { PageTitle } from "../page-title";
import { CategoryDialog } from "./category-dialog";
import { CategoryTable } from "./category-table";
import type { CategoryTreeItem, Category as CategoryType } from "./types";

interface CategoryProps {
  id: number;
}

function buildTree(categories: CategoryType[], rootId: number): CategoryTreeItem[] {
  const children = categories.filter((c) => c.parentId === rootId);
  return children.map((child) => ({
    ...child,
    children: buildTree(categories, child.id),
  }));
}

export function CategoryManager({ id }: CategoryProps) {
  const categoriesQuery = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = categoriesQuery.data;
  const treeData = buildTree(categories, id);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageTitle
        description="层级化管理您的内容结构。"
        extra={
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建分类
          </Button>
        }
        title="分类管理"
      />

      <CategoryTable categories={treeData} />

      <CategoryDialog onOpenChange={setIsAddOpen} open={isAddOpen} parentId={id} />
    </div>
  );
}
