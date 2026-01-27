CREATE TABLE `lemonsqueezy_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`user_id` int NOT NULL,
	`subscription_id` int,
	`lemonsqueezy_order_id` varchar(255) NOT NULL,
	`lemonsqueezy_customer_id` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'TWD',
	`status` enum('pending','paid','failed','refunded') NOT NULL,
	`refund_amount` decimal(10,2),
	`refunded_at` timestamp,
	`receipt_url` varchar(500),
	`invoice_url` varchar(500),
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lemonsqueezy_payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `lemonsqueezy_payments_lemonsqueezy_order_id_unique` UNIQUE(`lemonsqueezy_order_id`)
);
--> statement-breakpoint
CREATE TABLE `lemonsqueezy_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`lemonsqueezy_product_id` varchar(255) NOT NULL,
	`lemonsqueezy_variant_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'TWD',
	`interval` enum('month','year','one_time') NOT NULL,
	`interval_count` int NOT NULL DEFAULT 1,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lemonsqueezy_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lemonsqueezy_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`user_id` int NOT NULL,
	`plan_id` int NOT NULL,
	`lemonsqueezy_subscription_id` varchar(255) NOT NULL,
	`lemonsqueezy_customer_id` varchar(255) NOT NULL,
	`lemonsqueezy_order_id` varchar(255),
	`status` enum('active','cancelled','expired','on_trial','paused','past_due','unpaid') NOT NULL,
	`trial_ends_at` timestamp,
	`renews_at` timestamp,
	`ends_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lemonsqueezy_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `lemonsqueezy_subscriptions_lemonsqueezy_subscription_id_unique` UNIQUE(`lemonsqueezy_subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `lemonsqueezy_webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lemonsqueezy_event_id` varchar(255) NOT NULL,
	`event_name` varchar(255) NOT NULL,
	`payload` text NOT NULL,
	`processed` int NOT NULL DEFAULT 0,
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lemonsqueezy_webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `lemonsqueezy_webhook_events_lemonsqueezy_event_id_unique` UNIQUE(`lemonsqueezy_event_id`)
);
