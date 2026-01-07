import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { media } from "@/db/schema/media";

const mediaSchema = z.object({
  id: z.number(),
  filename: z.string(),
  url: z.string(),
  mimetype: z.string(),
  size: z.number(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  uploadedBy: z.string().nullable(),
  createdAt: z.date(),
});

export const getMedia = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
    })
  )
  .handler(async ({ data }) => {
    const { page, pageSize } = data;
    const offset = (page - 1) * pageSize;

    const [total] = await db.select({ count: count() }).from(media);
    const files = await db
      .select()
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      files,
      total: total.count,
      page,
      totalPages: Math.ceil(total.count / pageSize),
    };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await db.delete(media).where(eq(media.id, data.id));
    return { success: true };
  });

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      filename: z.string(),
      size: z.number(),
      mimetype: z.string(),
      url: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    // In a real implementation:
    // 1. Validate user session
    // 2. Upload to storage provider and verify
    // 3. Save metadata to DB

    const [newMedia] = await db
      .insert(media)
      .values({
        ...data,
        uploadedBy: null, // Would get from session in future
      })
      .returning();

    return newMedia;
  });
