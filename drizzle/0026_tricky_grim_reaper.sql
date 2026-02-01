CREATE TABLE `ai_knowledge_base_vectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`knowledge_base_id` int NOT NULL,
	`embedding` json NOT NULL,
	`embedding_model` varchar(100) DEFAULT 'text-embedding-ada-002',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_knowledge_base_vectors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_campaign_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`variant_name` varchar(100) NOT NULL,
	`message_content` text NOT NULL,
	`message_type` varchar(50) NOT NULL,
	`flex_message_json` json,
	`traffic_percentage` int NOT NULL,
	`sent_count` int DEFAULT 0,
	`opened_count` int DEFAULT 0,
	`clicked_count` int DEFAULT 0,
	`converted_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_campaign_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rich_menu_template_market` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`image_url` varchar(500) NOT NULL,
	`image_width` int NOT NULL,
	`image_height` int NOT NULL,
	`areas` json NOT NULL,
	`tags` json,
	`usage_count` int DEFAULT 0,
	`rating` decimal(3,2),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rich_menu_template_market_id` PRIMARY KEY(`id`)
);
