CREATE TABLE `commissionRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`productId` int,
	`productCategory` varchar(100),
	`commissionType` enum('percentage','fixed') DEFAULT 'percentage',
	`commissionValue` decimal(10,2) NOT NULL,
	`minSalesAmount` decimal(10,2),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissionRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int,
	`prospectName` varchar(255),
	`prospectPhone` varchar(20),
	`prospectEmail` varchar(320),
	`consultationDate` timestamp NOT NULL,
	`consultationType` enum('walk_in','phone','online','referral') DEFAULT 'walk_in',
	`staffId` int,
	`interestedProducts` json,
	`concerns` text,
	`recommendations` text,
	`status` enum('new','contacted','scheduled','converted','lost') DEFAULT 'new',
	`conversionDate` timestamp,
	`convertedOrderId` int,
	`source` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerPackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`productId` int NOT NULL,
	`packageName` varchar(255) NOT NULL,
	`totalSessions` int NOT NULL,
	`usedSessions` int NOT NULL DEFAULT 0,
	`remainingSessions` int NOT NULL,
	`purchasePrice` decimal(10,2) NOT NULL,
	`purchaseDate` timestamp NOT NULL,
	`expiryDate` timestamp,
	`status` enum('active','expired','completed','cancelled') DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerPackages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerRfmScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`recencyScore` int NOT NULL,
	`frequencyScore` int NOT NULL,
	`monetaryScore` int NOT NULL,
	`totalScore` int NOT NULL,
	`segment` varchar(50),
	`lastPurchaseDate` timestamp,
	`purchaseCount` int DEFAULT 0,
	`totalSpent` decimal(12,2) DEFAULT '0',
	`churnRisk` int DEFAULT 0,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerRfmScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`campaignId` int,
	`sourceType` varchar(100),
	`sourceName` varchar(255),
	`referralCode` varchar(100),
	`referredByCustomerId` int,
	`firstVisitDate` timestamp,
	`firstPurchaseDate` timestamp,
	`firstPurchaseAmount` decimal(10,2),
	`lifetimeValue` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followUps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`consultationId` int,
	`customerId` int,
	`staffId` int,
	`followUpDate` timestamp NOT NULL,
	`followUpType` enum('call','sms','line','email','visit') DEFAULT 'call',
	`status` enum('pending','completed','cancelled','rescheduled') DEFAULT 'pending',
	`outcome` varchar(255),
	`notes` text,
	`nextFollowUpDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `followUps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`productId` int NOT NULL,
	`transactionType` enum('purchase','sale','adjustment','return','transfer','waste') NOT NULL,
	`quantity` int NOT NULL,
	`unitCost` decimal(10,2),
	`totalCost` decimal(10,2),
	`referenceId` int,
	`referenceType` varchar(50),
	`batchNumber` varchar(100),
	`expiryDate` date,
	`notes` text,
	`staffId` int,
	`transactionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketingCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`campaignType` enum('facebook','google','line','instagram','referral','event','other') DEFAULT 'other',
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` decimal(10,2),
	`actualSpend` decimal(10,2) DEFAULT '0',
	`targetAudience` text,
	`description` text,
	`trackingCode` varchar(100),
	`status` enum('draft','active','paused','completed') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketingCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packageUsageRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`packageId` int NOT NULL,
	`customerId` int NOT NULL,
	`appointmentId` int,
	`treatmentRecordId` int,
	`sessionsUsed` int NOT NULL DEFAULT 1,
	`usageDate` timestamp NOT NULL,
	`staffId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `packageUsageRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenueTargets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`targetType` enum('monthly','quarterly','yearly') DEFAULT 'monthly',
	`targetYear` int NOT NULL,
	`targetMonth` int,
	`targetQuarter` int,
	`targetAmount` decimal(12,2) NOT NULL,
	`actualAmount` decimal(12,2) DEFAULT '0',
	`achievementRate` decimal(5,2) DEFAULT '0',
	`staffId` int,
	`productCategory` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenueTargets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `satisfactionSurveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`appointmentId` int,
	`treatmentRecordId` int,
	`surveyType` enum('post_treatment','post_purchase','general','nps') DEFAULT 'post_treatment',
	`overallScore` int,
	`serviceScore` int,
	`staffScore` int,
	`facilityScore` int,
	`valueScore` int,
	`npsScore` int,
	`wouldRecommend` boolean,
	`feedback` text,
	`improvementSuggestions` text,
	`staffId` int,
	`sentAt` timestamp,
	`completedAt` timestamp,
	`status` enum('pending','sent','completed','expired') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `satisfactionSurveys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staffCommissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`staffId` int NOT NULL,
	`orderId` int,
	`orderItemId` int,
	`appointmentId` int,
	`commissionRuleId` int,
	`salesAmount` decimal(10,2) NOT NULL,
	`commissionAmount` decimal(10,2) NOT NULL,
	`commissionDate` timestamp NOT NULL,
	`status` enum('pending','approved','paid','cancelled') DEFAULT 'pending',
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staffCommissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treatmentPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`treatmentRecordId` int,
	`photoType` enum('before','after','during','other') DEFAULT 'before',
	`photoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`photoDate` timestamp NOT NULL,
	`angle` varchar(50),
	`notes` text,
	`isPublic` boolean DEFAULT false,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `treatmentPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treatmentRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`appointmentId` int,
	`staffId` int,
	`productId` int,
	`treatmentDate` timestamp NOT NULL,
	`treatmentType` varchar(100),
	`treatmentArea` varchar(100),
	`dosage` varchar(100),
	`notes` text,
	`internalNotes` text,
	`satisfactionScore` int,
	`nextFollowUpDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `treatmentRecords_id` PRIMARY KEY(`id`)
);
