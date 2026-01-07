import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { category, jobs, post } from "@/db/schema/content";

export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const [userCount] = await db.select({ count: count() }).from(user);
  const [postCount] = await db
    .select({ count: count() })
    .from(post)
    .where(eq(post.type, "article"));
  const [pageCount] = await db.select({ count: count() }).from(post).where(eq(post.type, "page"));
  const [productCount] = await db
    .select({ count: count() })
    .from(post)
    .where(eq(post.type, "product"));
  const [jobCount] = await db.select({ count: count() }).from(jobs);
  const [categoryCount] = await db.select({ count: count() }).from(category);

  // Get recent posts
  const recentPosts = await db
    .select({
      id: post.id,
      title: post.title,
      type: post.type,
      status: post.status,
      updatedAt: post.updatedAt,
      authorName: user.name,
    })
    .from(post)
    .leftJoin(user, eq(post.authorId, user.id))
    .orderBy(desc(post.updatedAt))
    .limit(5);

  // Get recent jobs
  const recentJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      status: jobs.status,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(5);

  return {
    counts: {
      users: userCount.count,
      posts: postCount.count,
      pages: pageCount.count,
      products: productCount.count,
      jobs: jobCount.count,
      categories: categoryCount.count,
    },
    recentPosts,
    recentJobs,
  };
});
