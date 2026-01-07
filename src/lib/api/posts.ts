import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { category, post, user } from "@/db/schema";
import { authMiddleware } from "../auth/auth.middleware";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  categoryId: z.number().optional().nullable(),
  coverImage: z.string().optional(),
});

export const getPosts = createServerFn({ method: "GET" })
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

    const whereConditions = [];
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

    const posts = await db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
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

    return { posts, total, page, pageSize };
  });

export const getPost = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const [foundPost] = await db.select().from(post).where(eq(post.id, id)).limit(1);
    return foundPost;
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof postSchema>) => postSchema.parse(data))
  .handler(async ({ data }) => {
    // In a real app, you'd get the current user ID from the session
    // For now, we'll try to find a user or leave it null
    const users = await db.select().from(user).limit(1);
    const authorId = users[0]?.id;

    const [newPost] = await db
      .insert(post)
      .values({
        ...data,
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning();
    return newPost;
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { id: number; data: Partial<z.infer<typeof postSchema>> }) => data)
  .handler(async ({ data }) => {
    const [updatedPost] = await db
      .update(post)
      .set({
        ...data.data,
        updatedAt: new Date(),
        // Update publishedAt if status changes to published and it wasn't set before?
        // For simplicity, let's just update it if provided or handle logic in UI
      })
      .where(eq(post.id, data.id))
      .returning();
    return updatedPost;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(post).where(eq(post.id, id));
    return id;
  });
