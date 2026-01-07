import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { category, post } from "@/db/schema";
import { authMiddleware } from "../auth/auth.middleware";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.number().default(0),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const getCategories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.number().optional())
  .handler(async ({ data: parentId }) => {
    // 首先获取所有分类
    const allCategories = await db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        count:
          sql<number>`(SELECT COUNT(*) FROM ${post} WHERE ${post.categoryId} = ${category.id})`.mapWith(
            Number
          ),
      })
      .from(category);

    // 如果没有指定 parentId，返回所有分类
    if (parentId === undefined) {
      return allCategories;
    }

    // 递归函数：获取指定 ID 下的所有子孙分类
    const getDescendants = (id: number): typeof allCategories => {
      const children = allCategories.filter((cat) => cat.parentId === id);
      const descendants = [...children];

      for (const child of children) {
        descendants.push(...getDescendants(child.id));
      }

      return descendants;
    };

    // 获取指定 parentId 的所有子孙分类
    const descendants = getDescendants(parentId);

    return descendants;
  });

export const createCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof categorySchema>) => categorySchema.parse(data))
  .handler(async ({ data }) => {
    const [newCategory] = await db.insert(category).values(data).returning();
    return newCategory;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; data: Partial<z.infer<typeof categorySchema>> }) => data)
  .handler(async ({ data }) => {
    const [updatedCategory] = await db
      .update(category)
      .set({ ...data.data, updatedAt: new Date() })
      .where(eq(category.id, data.id))
      .returning();
    return updatedCategory;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    // Note: This does not recursively delete children unless the DB is set up with CASCADE
    // or we implement recursive deletion here.
    // For now, we'll assume the user handles children or we add logic later.
    // Based on the schema, there is no foreign key constraint on parentId pointing to id with cascade.
    // So we might want to delete children manually or just delete the node.
    // Let's just delete the node for now.
    await db.delete(category).where(eq(category.id, id));
    // Also delete children?
    // await db.delete(category).where(eq(category.parentId, id));
    return id;
  });
