import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";

const categorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	slug: z.string().optional(),
	description: z.string().optional(),
	parentId: z.number().default(0),
	sortOrder: z.number().default(0),
	isActive: z.boolean().default(true),
});

export const getCategories = createServerFn({ method: "GET" }).handler(
	async () => {
		const categories = await db.select().from(category);
		return categories;
	}
);

export const createCategory = createServerFn({ method: "POST" })
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
