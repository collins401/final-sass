CREATE TABLE `post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`category_id` integer,
	`author_id` text,
	`cover_image` text,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_slug_unique` ON `post` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_slug_idx` ON `post` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `post` (`status`);--> statement-breakpoint
CREATE INDEX `posts_category_id_idx` ON `post` (`category_id`);--> statement-breakpoint
CREATE INDEX `posts_author_id_idx` ON `post` (`author_id`);--> statement-breakpoint
CREATE INDEX `posts_published_at_idx` ON `post` (`published_at`);