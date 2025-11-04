CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text,
	`description` text,
	`parent_id` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `category` (`parent_id`);--> statement-breakpoint
CREATE INDEX `categories_slug_idx` ON `category` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_sort_order_idx` ON `category` (`sort_order`);--> statement-breakpoint
CREATE INDEX `categories_is_active_idx` ON `category` (`is_active`);