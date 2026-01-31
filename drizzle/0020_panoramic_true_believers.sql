CREATE TABLE `crm_tags_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`color` varchar(20) DEFAULT '#000000',
	`category` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_tags_system_b_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_tags_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`tag_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_tags_system_b_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_participations_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`prize_id` int,
	`played_at` timestamp NOT NULL DEFAULT (now()),
	`is_claimed` boolean DEFAULT false,
	`claimed_at` timestamp,
	CONSTRAINT `game_participations_system_b_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`game_type_b` enum('ichiban_kuji','slot_machine','wheel') NOT NULL,
	`game_status_b` enum('draft','active','paused','ended') DEFAULT 'draft',
	`start_date` timestamp,
	`end_date` timestamp,
	`description` text,
	`rules` json,
	`image_url` text,
	`cost_points` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_system_b_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`product_id` int NOT NULL,
	`batch_number` varchar(100),
	`quantity` int NOT NULL DEFAULT 0,
	`min_stock` int DEFAULT 10,
	`expiry_date` date,
	`location` varchar(100),
	`supplier` varchar(255),
	`inventory_status_b` enum('in_stock','low_stock','expired') DEFAULT 'in_stock',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_system_b_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_transfers_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_org_id` int NOT NULL,
	`to_org_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity` int NOT NULL,
	`transfer_status_b` enum('pending','approved','shipped','received','cancelled') DEFAULT 'pending',
	`requested_by` int,
	`approved_by` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_transfers_system_b_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prizes_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`prize_type_b` enum('physical','coupon','points') DEFAULT 'physical',
	`quantity` int NOT NULL DEFAULT 0,
	`remaining_quantity` int NOT NULL DEFAULT 0,
	`probability` decimal(5,2) DEFAULT '0',
	`image_url` text,
	`value` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prizes_system_b_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_commissions_system_b` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`staff_id` int NOT NULL,
	`period` varchar(7) NOT NULL,
	`total_sales` decimal(12,2) DEFAULT '0',
	`commission_amount` decimal(10,2) DEFAULT '0',
	`commission_status_b` enum('calculated','approved','paid') DEFAULT 'calculated',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_commissions_system_b_id` PRIMARY KEY(`id`)
);
