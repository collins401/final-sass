import { createServerFn } from "@tanstack/react-start";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { option } from "@/db/schema";

export const getOptions = createServerFn({ method: "GET" })
  .inputValidator(z.array(z.string()).optional())
  .handler(async ({ data: keys }) => {
    try {
      const query = db.select().from(option);

      if (keys && keys.length > 0) {
        query.where(inArray(option.key, keys));
      }

      const results = await query;

      // Convert array to object for easier consumption { key: value }
      const optionsMap: Record<string, string> = {};
      for (const opt of results) {
        optionsMap[opt.key] = opt.value || "";
      }

      return optionsMap;
    } catch (error) {
      throw new Error(`Failed to fetch options: ${(error as Error).message}`);
    }
  });

export const updateOption = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  )
  .handler(async ({ data }) => {
    try {
      await db
        .insert(option)
        .values({
          key: data.key,
          value: data.value,
        })
        .onConflictDoUpdate({
          target: option.key,
          set: {
            value: data.value,
            updatedAt: new Date(),
          },
        });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update option: ${(error as Error).message}`);
    }
  });

export const updateOptions = createServerFn({ method: "POST" })
  .inputValidator((input: { data: string }) => input)
  .handler(async ({ data }) => {
    try {
      const updates: Promise<any>[] = [];
      const entries = Object.entries(data);
      for (const [key, value] of entries) {
        updates.push(
          db
            .insert(option)
            .values({
              key,
              value,
            } as any)
            .onConflictDoUpdate({
              target: option.key,
              set: {
                value,
              },
            })
        );
      }

      await Promise.all(updates);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update options: ${(error as Error).message}`);
    }
  });
