ALTER TABLE `attendanceRecords` ADD `isManualEntry` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `manualReason` text;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `approvedBy` int;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD `approvalStatus` enum('pending','approved','rejected') DEFAULT 'approved';