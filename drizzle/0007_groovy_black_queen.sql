ALTER TABLE `post` ADD `type` text DEFAULT 'article' NOT NULL;--> statement-breakpoint
CREATE INDEX `posts_type_idx` ON `post` (`type`);