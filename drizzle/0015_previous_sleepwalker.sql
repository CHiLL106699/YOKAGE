CREATE TABLE `line_rich_menus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`rich_menu_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`chat_bar_text` varchar(14) NOT NULL,
	`image_url` text NOT NULL,
	`size` json NOT NULL,
	`areas` json NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`click_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `line_rich_menus_id` PRIMARY KEY(`id`),
	CONSTRAINT `line_rich_menus_rich_menu_id_unique` UNIQUE(`rich_menu_id`)
);
