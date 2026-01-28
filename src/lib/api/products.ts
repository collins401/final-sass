import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { category, post, user } from "@/db/schema";
import { authMiddleware } from "../auth/auth.middleware";

export const productSchema = z.object({
  title: z.string().min(1, "标题是必填的"),
  slug: z.string().min(1, "路径是必填的"),
  content: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  categoryId: z.number().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  metadata: z.any().optional(),
});

export const getProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z
      .object({
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(10),
        title: z.string().optional(),
        status: z.enum(["draft", "published", "archived", "all"]).optional().default("all"),
      })
      .optional()
  )
  .handler(async ({ data }) => {
    const page = data?.page ?? 1;
    const pageSize = data?.pageSize ?? 10;
    const title = data?.title;
    const status = data?.status ?? "all";
    const offset = (page - 1) * pageSize;

    const whereConditions = [eq(post.type, "product")]; // Only products
    if (title) {
      whereConditions.push(like(post.title, `%${title}%`));
    }
    if (status !== "all") {
      whereConditions.push(eq(post.status, status as "draft" | "published" | "archived"));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql`count(*)` })
      .from(post)
      .where(and(...whereConditions));

    const total = Number(countResult?.count ?? 0);

    const products = await db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        thumbnail: post.thumbnail,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        authorName: user.name,
        categoryName: category.name,
      })
      .from(post)
      .leftJoin(user, eq(post.authorId, user.id))
      .leftJoin(category, eq(post.categoryId, category.id))
      .where(and(...whereConditions))
      .orderBy(desc(post.createdAt))
      .limit(pageSize)
      .offset(offset);

    return { products, total, page, pageSize };
  });

export const getProduct = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const [foundProduct] = await db
      .select()
      .from(post)
      .where(and(eq(post.id, id), eq(post.type, "product")))
      .limit(1);
    return foundProduct as any;
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof productSchema>) => productSchema.parse(data))
  .handler(async ({ data }) => {
    const users = await db.select().from(user).limit(1);
    const authorId = users[0]?.id;

    const [newProduct] = await db
      .insert(post)
      .values({
        ...data,
        type: "product",
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: data.status === "published" ? new Date() : null,
      } as any)
      .returning();
    return newProduct as any;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { id: number; data: Partial<z.infer<typeof productSchema>> }) => data)
  .handler(async ({ data }) => {
    const [updatedProduct] = await db
      .update(post)
      .set({
        ...data.data,
        updatedAt: new Date(),
        publishedAt:
          data.data.status === "published"
            ? (sql`COALESCE(${post.publishedAt}, unixepoch())` as any)
            : null,
      } as any)
      .where(and(eq(post.id, data.id), eq(post.type, "product")))
      .returning();
    return updatedProduct as any;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(post).where(and(eq(post.id, id), eq(post.type, "product")));
    return id;
  });
