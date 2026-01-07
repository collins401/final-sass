import { createServerFn } from "@tanstack/react-start";
import { asc, count, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { authMiddleware } from "../auth/auth.middleware";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  image: z.string().nullable(),
  createdAt: z.date(),
});

export const getUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      search: z.string().optional(),
      sort: z.enum(["createdAt", "name", "email"]).default("createdAt"),
      order: z.enum(["asc", "desc"]).default("desc"),
    })
  )
  .handler(async ({ data }) => {
    const { page, pageSize, search, sort, order } = data;
    const offset = (page - 1) * pageSize;

    const where = search
      ? or(like(user.name, `%${search}%`), like(user.email, `%${search}%`))
      : undefined;

    const [total] = await db.select({ count: count() }).from(user).where(where);

    const users = await db
      .select()
      .from(user)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(
        order === "asc"
          ? asc(sort === "name" ? user.name : sort === "email" ? user.email : user.createdAt)
          : desc(sort === "name" ? user.name : sort === "email" ? user.email : user.createdAt)
      );

    return {
      users,
      total: total.count,
      page,
      pageSize,
      totalPages: Math.ceil(total.count / pageSize),
    };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      userId: z.string(),
      role: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, role } = data;
    await db.update(user).set({ role }).where(eq(user.id, userId));
    return { success: true };
  });

export const toggleBanUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      userId: z.string(),
      banned: z.boolean(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, banned } = data;
    await db.update(user).set({ banned }).where(eq(user.id, userId));
    return { success: true };
  });
