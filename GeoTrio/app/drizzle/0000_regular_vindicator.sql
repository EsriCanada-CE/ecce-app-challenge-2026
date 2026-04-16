CREATE TABLE `rides` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mode` text NOT NULL,
	`origin_label` text,
	`destination_label` text,
	`origin_lat` real NOT NULL,
	`origin_lng` real NOT NULL,
	`destination_lat` real NOT NULL,
	`destination_lng` real NOT NULL,
	`distance_meters` integer NOT NULL,
	`duration_seconds` integer NOT NULL,
	`calories` integer NOT NULL,
	`cardio_minutes` integer NOT NULL,
	`co2_kg` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `rides_user_id_created_at_idx` ON `rides` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_session_id_unique` ON `users` (`session_id`);--> statement-breakpoint
CREATE INDEX `users_session_id_idx` ON `users` (`session_id`);