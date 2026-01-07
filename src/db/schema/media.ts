import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const media = sqliteTable(
  "media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    filename: text("filename").notNull(),
    url: text("url").notNull(),
    mimetype: text("mimetype").notNull(),
    size: integer("size").notNull(), // in bytes
    width: integer("width"),
    height: integer("height"),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  },
  (table) => [
    index("media_uploaded_by_idx").on(table.uploadedBy),
    index("media_mimetype_idx").on(table.mimetype),
  ]
);

export type SelectMedia = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;
