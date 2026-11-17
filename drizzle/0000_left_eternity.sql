CREATE TABLE `study_events` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`qid` text NOT NULL,
	`module_id` text NOT NULL,
	`at` integer NOT NULL,
	`correct` integer NOT NULL,
	`assisted` integer NOT NULL,
	`self` integer NOT NULL
);
