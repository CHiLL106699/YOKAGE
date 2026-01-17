CREATE TABLE `waitlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`preferredDate` date NOT NULL,
	`preferredTimeSlot` varchar(50),
	`productId` int,
	`status` enum('waiting','notified','booked','cancelled') DEFAULT 'waiting',
	`notes` text,
	`notifiedAt` timestamp,
	`bookedAppointmentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `waitlist_id` PRIMARY KEY(`id`)
);
