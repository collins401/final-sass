import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const OPTION_GROUPS = ["general", "seo", "ai", "system"] as const;
export type OptionGroup = (typeof OPTION_GROUPS)[keyof typeof OPTION_GROUPS];
export const option = sqliteTable("option", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
  group: text("group", { enum: OPTION_GROUPS }).default("general"),
  type: text("type").default("string"),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdateFn(() => new Date())
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});
