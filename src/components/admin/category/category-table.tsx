import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Folder, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory } from "@/lib/api/category";
import { CategoryDialog } from "./category-dialog";
import type { CategoryTreeItem } from "./types";

interface CategoryTableProps {
  categories: CategoryTreeItem[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [editingCategory, setEditingCategory] = useState<CategoryTreeItem | null>(null);
  const [addingToParentId, setAddingToParentId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory({ data: deletingId });
      toast.success("分类已删除");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.invalidate();
    } catch (error) {
      toast.error(`删除分类失败: ${(error as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const renderRow = (item: CategoryTreeItem, level = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.id];

    return (
      <>
        <TableRow key={item.id}>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button
                  className="rounded p-1 hover:bg-muted"
                  onClick={() => toggleExpand(item.id)}
                  type="button"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <Folder className="h-4 w-4 fill-blue-100 text-blue-500" />
              <span className="font-medium">{item.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge className="font-mono text-xs" variant="secondary">
              /{item.slug}
            </Badge>
          </TableCell>
          <TableCell className="max-w-xs truncate text-muted-foreground">
            {item.description}
          </TableCell>
          <TableCell>
            <Badge variant="outline">{item.count} 篇文章</Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setAddingToParentId(item.id)}
                size="icon"
                title="添加子分类"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setEditingCategory(item)}
                size="icon"
                title="编辑"
                variant="ghost"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                className="text-red-500 hover:text-red-600"
                onClick={() => setDeletingId(item.id)}
                size="icon"
                title="删除"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {isExpanded && item.children?.map((child) => renderRow(child, level + 1))}
      </>
    );
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">名称</TableHead>
              <TableHead>别名</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>文章数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={5}>
                  暂无分类。
                </TableCell>
              </TableRow>
            ) : (
              categories.map((item) => renderRow(item))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryDialog
        category={editingCategory || undefined}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        open={!!editingCategory}
      />

      <CategoryDialog
        onOpenChange={(open) => !open && setAddingToParentId(null)}
        open={addingToParentId !== null}
        parentId={addingToParentId || 0}
      />

      <AlertDialog onOpenChange={(open) => !open && setDeletingId(null)} open={!!deletingId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>此操作无法撤销。这将永久删除该分类。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
