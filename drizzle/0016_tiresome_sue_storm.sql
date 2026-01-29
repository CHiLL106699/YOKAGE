CREATE TABLE `leave_requests` (
	`id` varchar(36) NOT NULL,
	`clinic_id` varchar(36) NOT NULL,
	`staff_id` varchar(36) NOT NULL,
	`leave_type` enum('病假','事假','特休','育嬰假','喪假','婚假','產假','陪產假','其他') NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewer_id` varchar(36),
	`reviewed_at` timestamp,
	`review_note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
