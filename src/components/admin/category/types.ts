export interface Category {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  parentId: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  count: number;
}

export interface CategoryTreeItem extends Category {
  children?: CategoryTreeItem[];
}
