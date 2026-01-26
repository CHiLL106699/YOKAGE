CREATE TABLE `attendanceSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`clinicLatitude` decimal(10,7),
	`clinicLongitude` decimal(10,7),
	`clinicAddress` text,
	`validDistance` int DEFAULT 100,
	`enableGeofence` boolean DEFAULT false,
	`allowOfflineClockIn` boolean DEFAULT true,
	`autoClockOutHours` int DEFAULT 12,
	`requirePhoto` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendanceSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendanceSettings_organizationId_unique` UNIQUE(`organizationId`)
);
--> statement-breakpoint
CREATE TABLE `gamePlays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameId` int NOT NULL,
	`userId` int NOT NULL,
	`organizationId` int NOT NULL,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	`result` enum('win','lose') NOT NULL,
	`prizeId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gamePlays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`isActive` boolean DEFAULT true,
	`maxPlaysPerDay` int DEFAULT -1,
	`settings` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prizes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameId` int NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`type` enum('coupon','gift','points','service') DEFAULT 'gift',
	`value` decimal(10,2),
	`quantity` int DEFAULT -1,
	`remainingQuantity` int DEFAULT -1,
	`probability` decimal(5,4) NOT NULL,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prizes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPrizes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prizeId` int NOT NULL,
	`gamePlayId` int NOT NULL,
	`organizationId` int NOT NULL,
	`wonAt` timestamp NOT NULL DEFAULT (now()),
	`isRedeemed` boolean DEFAULT false,
	`redeemedAt` timestamp,
	`redeemedBy` int,
	`expiresAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPrizes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkInLatitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkInLongitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkInAccuracy` decimal(8,2);--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkInAddress` text;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkOutLatitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkOutLongitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkOutAccuracy` decimal(8,2);--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `checkOutAddress` text;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `isWithinGeofence` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `distanceFromClinic` decimal(8,2);