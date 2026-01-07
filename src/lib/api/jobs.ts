import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { jobs, user } from "@/db/schema";
import { authMiddleware } from "@/lib/auth/auth.middleware";

const jobSchema = z.object({
  title: z.string().min(1, "职位名称不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  description: z.string().min(1, "职位描述不能为空"),
  requirements: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]).default("full-time"),
  salaryRange: z.string().optional(),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
});

export const getJobs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z
      .object({
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(10),
        title: z.string().optional(),
        status: z.enum(["draft", "published", "closed", "all"]).optional().default("all"),
        type: z
          .enum(["full-time", "part-time", "contract", "internship", "remote", "all"])
          .optional()
          .default("all"),
      })
      .optional()
  )
  .handler(async ({ data }) => {
    const page = data?.page ?? 1;
    const pageSize = data?.pageSize ?? 10;
    const title = data?.title;
    const status = data?.status ?? "all";
    const type = data?.type ?? "all";
    const offset = (page - 1) * pageSize;

    const whereConditions = [];
    if (title) {
      whereConditions.push(like(jobs.title, `%${title}%`));
    }
    if (status !== "all") {
      whereConditions.push(eq(jobs.status, status as "draft" | "published" | "closed"));
    }
    if (type !== "all") {
      whereConditions.push(
        eq(jobs.type, type as "full-time" | "part-time" | "contract" | "internship" | "remote")
      );
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql`count(*)` })
      .from(jobs)
      .where(and(...whereConditions));

    const total = Number(countResult?.count ?? 0);
    const totalPages = Math.ceil(total / pageSize);

    const results = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        location: jobs.location,
        type: jobs.type,
        status: jobs.status,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        author: {
          name: user.name,
          email: user.email,
        },
      })
      .from(jobs)
      .leftJoin(user, eq(jobs.authorId, user.id))
      .where(and(...whereConditions))
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(jobs.createdAt));

    return {
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  });

export const createJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(jobSchema)
  .handler(async ({ data, context }) => {
    return await db
      .insert(jobs)
      .values({
        ...data,
        authorId: context.user.id,
      })
      .returning();
  });

export const updateJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      id: z.number(),
      data: jobSchema.partial(),
    })
  )
  .handler(async ({ data }) => {
    return await db
      .update(jobs)
      .set({
        ...data.data,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, data.id))
      .returning();
  });

export const deleteJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await db.delete(jobs).where(eq(jobs.id, data.id));
  });

export const getJob = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const result = await db.select().from(jobs).where(eq(jobs.id, data.id)).get();

    return result;
  });
