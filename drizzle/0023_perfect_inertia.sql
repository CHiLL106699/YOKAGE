CREATE TABLE `auto_reply_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`trigger_type` enum('keyword','regex','always') NOT NULL,
	`trigger_value` text,
	`reply_type` enum('text','flex','template') NOT NULL,
	`reply_content` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_reply_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `line_webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`event_type` varchar(50) NOT NULL,
	`source_type` varchar(20) NOT NULL,
	`source_id` varchar(100) NOT NULL,
	`message_type` varchar(20),
	`message_text` text,
	`message_id` varchar(100),
	`reply_token` varchar(100),
	`raw_payload` json NOT NULL,
	`is_processed` boolean NOT NULL DEFAULT false,
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `line_webhook_events_id` PRIMARY KEY(`id`)
);
