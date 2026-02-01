CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`customer_id` int,
	`line_user_id` varchar(255) NOT NULL,
	`session_id` varchar(255) NOT NULL,
	`user_message` text NOT NULL,
	`ai_response` text NOT NULL,
	`intent` varchar(100),
	`confidence` decimal(5,2),
	`context` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_intents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`keywords` json NOT NULL,
	`training_examples` json,
	`response_template` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_intents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`keywords` json,
	`priority` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_knowledge_base_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`message_type` varchar(50) NOT NULL,
	`message_content` json NOT NULL,
	`target_audience` json NOT NULL,
	`scheduled_at` timestamp,
	`status` varchar(50) DEFAULT 'draft',
	`total_recipients` int DEFAULT 0,
	`sent_count` int DEFAULT 0,
	`delivered_count` int DEFAULT 0,
	`clicked_count` int DEFAULT 0,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`line_user_id` varchar(255) NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`sent_at` timestamp,
	`delivered_at` timestamp,
	`clicked_at` timestamp,
	`error_message` text,
	CONSTRAINT `broadcast_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rich_menu_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`line_user_id` varchar(255) NOT NULL,
	`assigned_at` timestamp DEFAULT (now()),
	CONSTRAINT `rich_menu_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rich_menu_click_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_id` int NOT NULL,
	`customer_id` int,
	`line_user_id` varchar(255) NOT NULL,
	`area_index` int NOT NULL,
	`clicked_at` timestamp DEFAULT (now()),
	CONSTRAINT `rich_menu_click_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rich_menu_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`rich_menu_id` varchar(255),
	`image_url` text,
	`chat_bar_text` varchar(14) NOT NULL,
	`areas` json NOT NULL,
	`is_active` boolean DEFAULT true,
	`target_audience` varchar(50),
	`ab_test_group` varchar(50),
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rich_menu_templates_id` PRIMARY KEY(`id`)
);
