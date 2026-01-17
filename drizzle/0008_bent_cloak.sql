CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`description` text,
	`category` enum('platform','voucher','notification','system') DEFAULT 'platform',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `voucherReminderLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`voucherInstanceId` int NOT NULL,
	`customerId` int NOT NULL,
	`reminderType` enum('expiry_warning','expiry_final','promotion') DEFAULT 'expiry_warning',
	`daysBeforeExpiry` int,
	`status` enum('pending','sent','failed','cancelled') DEFAULT 'pending',
	`channel` enum('line','sms','email') DEFAULT 'line',
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`errorMessage` text,
	`lineMessageId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voucherReminderLogs_id` PRIMARY KEY(`id`)
);
