import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, like } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { post } from "@/db/schema/content";

const PAGE_SIZE = 10;

// Zod schemas for validation
const pageSearchSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(PAGE_SIZE),
  title: z.string().optional(),
  status: z.enum(["draft", "published", "archived", "all"]).default("all"),
});

const createPageSchema = z.object({
  title: z.string().min(1, "请输入页面标题"),
  slug: z.string().min(1, "请输入页面别名"),
  content: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  excerpt: z.string().optional(),
});

const updatePageSchema = createPageSchema.partial();

// Get Pages (List)
export const getPages = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof pageSearchSchema>) => data)
  .handler(async ({ data }) => {
    const { page, pageSize, title, status } = data;
    const offset = (page - 1) * pageSize;

    const filters = [eq(post.type, "page")];

    if (title) {
      filters.push(like(post.title, `%${title}%`));
    }
    if (status !== "all") {
      filters.push(eq(post.status, status as any));
    }

    const whereClause = and(...filters);

    const [total] = await db.select({ count: count() }).from(post).where(whereClause);

    const pages = await db
      .select()
      .from(post)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(post.updatedAt));

    return {
      data: pages,
      pagination: {
        page,
        pageSize,
        total: total.count,
        totalPages: Math.ceil(total.count / pageSize),
      },
    };
  });

// Get Single Page
export const getPage = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const [page] = await db
      .select()
      .from(post)
      .where(and(eq(post.id, data.id), eq(post.type, "page")))
      .limit(1);

    if (!page) {
      throw new Error("Page not found");
    }

    return page;
  });

// Create Page
export const createPage = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof createPageSchema>) => data)
  .handler(async ({ data }) => {
    // Check for duplicate slug
    const [existing] = await db
      .select()
      .from(post)
      .where(and(eq(post.slug, data.slug), eq(post.type, "page")));

    if (existing) {
      throw new Error("别名已存在，请使用其他别名");
    }

    await db.insert(post).values({
      ...data,
      type: "page",
      updatedAt: new Date(),
    });
  });

// Update Page
export const updatePage = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; data: z.infer<typeof updatePageSchema> }) => data)
  .handler(async ({ data }) => {
    const { id, data: updateData } = data;

    if (updateData.slug) {
      const [existing] = await db
        .select()
        .from(post)
        .where(and(eq(post.slug, updateData.slug), eq(post.type, "page")));

      if (existing && existing.id !== id) {
        throw new Error("别名已存在，请使用其他别名");
      }
    }

    await db
      .update(post)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(post.id, id), eq(post.type, "page")));
  });

// Delete Page
export const deletePage = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await db.delete(post).where(and(eq(post.id, data.id), eq(post.type, "page")));
  });
