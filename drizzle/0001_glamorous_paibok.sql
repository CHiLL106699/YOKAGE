CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aftercareRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`appointmentId` int,
	`productId` int,
	`staffId` int,
	`treatmentDate` date NOT NULL,
	`followUpDate` date,
	`status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
	`notes` text,
	`customerFeedback` text,
	`photos` json,
	`reminderSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aftercareRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointmentSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`staffId` int,
	`dayOfWeek` int NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`slotDuration` int DEFAULT 30,
	`maxBookings` int DEFAULT 1,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointmentSlots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`staffId` int,
	`productId` int,
	`appointmentDate` date NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time,
	`status` enum('pending','confirmed','arrived','in_progress','completed','cancelled','no_show') DEFAULT 'pending',
	`notes` text,
	`internalNotes` text,
	`source` varchar(50) DEFAULT 'web',
	`reminderSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendanceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`staffId` int NOT NULL,
	`recordDate` date NOT NULL,
	`clockIn` timestamp,
	`clockOut` timestamp,
	`clockInLocation` json,
	`clockOutLocation` json,
	`status` enum('normal','late','early_leave','absent','leave') DEFAULT 'normal',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed') DEFAULT 'percentage',
	`discountValue` decimal(10,2) NOT NULL,
	`minPurchase` decimal(10,2),
	`maxDiscount` decimal(10,2),
	`usageLimit` int,
	`usedCount` int DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerTagRelations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerTagRelations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20) DEFAULT '#6366f1',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerTags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`gender` enum('male','female','other'),
	`birthday` date,
	`address` text,
	`avatar` text,
	`lineUserId` varchar(64),
	`memberLevel` enum('bronze','silver','gold','platinum','diamond') DEFAULT 'bronze',
	`totalSpent` decimal(12,2) DEFAULT '0',
	`visitCount` int DEFAULT 0,
	`notes` text,
	`source` varchar(100),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lineChannels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`channelName` varchar(255) NOT NULL,
	`channelId` varchar(100) NOT NULL,
	`channelSecret` varchar(255),
	`accessToken` text,
	`liffId` varchar(100),
	`webhookUrl` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lineChannels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`status` enum('pending','paid','processing','completed','cancelled','refunded') DEFAULT 'pending',
	`subtotal` decimal(12,2) NOT NULL,
	`discount` decimal(10,2) DEFAULT '0',
	`tax` decimal(10,2) DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`couponId` int,
	`paymentMethod` varchar(50),
	`paymentStatus` enum('pending','paid','failed','refunded') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','manager','staff') NOT NULL DEFAULT 'staff',
	`permissions` json,
	`isActive` boolean DEFAULT true,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationUsers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`logo` text,
	`address` text,
	`phone` varchar(20),
	`email` varchar(320),
	`timezone` varchar(50) DEFAULT 'Asia/Taipei',
	`currency` varchar(10) DEFAULT 'TWD',
	`businessHours` json,
	`settings` json,
	`subscriptionPlan` enum('free','basic','pro','enterprise') DEFAULT 'free',
	`subscriptionStatus` enum('active','suspended','cancelled') DEFAULT 'active',
	`trialEndsAt` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`type` enum('service','product','package') DEFAULT 'service',
	`price` decimal(10,2) NOT NULL,
	`costPrice` decimal(10,2),
	`duration` int,
	`stock` int,
	`images` json,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`staffId` int NOT NULL,
	`scheduleDate` date NOT NULL,
	`shiftType` enum('morning','afternoon','evening','full','off','custom') DEFAULT 'full',
	`startTime` time,
	`endTime` time,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int,
	`employeeId` varchar(50),
	`name` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`position` varchar(100),
	`department` varchar(100),
	`hireDate` date,
	`salary` decimal(10,2),
	`salaryType` enum('monthly','hourly','commission') DEFAULT 'monthly',
	`avatar` text,
	`skills` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','clinic_admin','staff','customer','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `lineUserId` varchar(64);