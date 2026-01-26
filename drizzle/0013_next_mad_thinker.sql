CREATE TABLE `performanceRecords` (
	`id` varchar(191) NOT NULL,
	`clinicId` varchar(191) NOT NULL,
	`staffId` varchar(191) NOT NULL,
	`recordDate` timestamp NOT NULL,
	`amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`type` varchar(50) NOT NULL,
	`relatedId` varchar(191),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceTargets` (
	`id` varchar(191) NOT NULL,
	`clinicId` varchar(191) NOT NULL,
	`staffId` varchar(191) NOT NULL,
	`periodType` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`period` int NOT NULL,
	`targetAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceTargets_id` PRIMARY KEY(`id`)
);
