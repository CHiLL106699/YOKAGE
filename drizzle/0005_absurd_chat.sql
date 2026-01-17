CREATE TABLE `backgroundJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jobType` enum('rfm_calculation','report_generation','data_export','bulk_notification','data_import') NOT NULL,
	`status` enum('pending','running','completed','failed','cancelled') DEFAULT 'pending',
	`progress` int DEFAULT 0,
	`totalItems` int DEFAULT 0,
	`processedItems` int DEFAULT 0,
	`result` json,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `backgroundJobs_id` PRIMARY KEY(`id`)
);
