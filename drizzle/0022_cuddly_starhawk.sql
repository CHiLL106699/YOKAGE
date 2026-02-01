CREATE TABLE `interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`type` enum('phone','meeting','line','appointment','treatment','note') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `line_messaging_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`channel_access_token` text NOT NULL,
	`channel_secret` varchar(255) NOT NULL,
	`webhook_url` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `line_messaging_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `line_messaging_settings_organization_id_unique` UNIQUE(`organization_id`)
);
--> statement-breakpoint
CREATE TABLE `tag_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`tag_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`rule_type` enum('spending','visit_count','last_visit','member_level') NOT NULL,
	`condition` json NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tag_rules_id` PRIMARY KEY(`id`)
);
