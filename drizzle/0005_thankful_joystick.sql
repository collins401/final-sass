CREATE TABLE `option` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`group` text DEFAULT 'general',
	`type` text DEFAULT 'string',
	`is_public` integer DEFAULT false,
	`description` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `option_key_unique` ON `option` (`key`);