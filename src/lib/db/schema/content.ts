import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

// Todo tables
export const todo = sqliteTable(
	"todo",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		title: text("title").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		completed: integer("completed", { mode: "boolean" })
			.notNull()
			.default(false),
		createdAt: integer("created_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.notNull(),
	},
	(table) => [index("todo_userId_idx").on(table.userId)]
);

// Categories table for hierarchical content organization
export const category = sqliteTable(
	"category",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull(),
		slug: text("slug").unique(),
		description: text("description"),
		parentId: integer("parent_id").notNull().default(0),
		sortOrder: integer("sort_order").notNull().default(0),
		isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
		createdAt: integer("created_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.$onUpdateFn(() => new Date())
			.notNull(),
	},
	(table) => [
		index("categories_parent_id_idx").on(table.parentId),
		index("categories_slug_idx").on(table.slug),
		index("categories_sort_order_idx").on(table.sortOrder),
		index("categories_is_active_idx").on(table.isActive),
	]
);

// Type exports
export type SelectTodo = typeof todo.$inferSelect;
export type InsertTodo = typeof todo.$inferInsert;
export type SelectCategory = typeof category.$inferSelect;
export type InsertCategory = typeof category.$inferInsert;
