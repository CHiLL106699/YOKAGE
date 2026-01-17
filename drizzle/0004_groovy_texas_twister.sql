CREATE TABLE `consentFormTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('treatment','surgery','anesthesia','photography','general') DEFAULT 'treatment',
	`content` text NOT NULL,
	`requiredFields` json,
	`version` varchar(20) DEFAULT '1.0',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consentFormTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consentSignatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`templateId` int NOT NULL,
	`appointmentId` int,
	`treatmentRecordId` int,
	`signatureImageUrl` text NOT NULL,
	`signedContent` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`signedAt` timestamp NOT NULL DEFAULT (now()),
	`witnessName` varchar(255),
	`witnessSignatureUrl` text,
	`status` enum('pending','signed','revoked') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consentSignatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultationRecordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teleConsultationId` int NOT NULL,
	`recordingUrl` text NOT NULL,
	`duration` int,
	`fileSize` int,
	`format` varchar(20),
	`transcription` text,
	`consentGiven` boolean DEFAULT false,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultationRecordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerAllergies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`allergyType` enum('medication','food','environmental','other') DEFAULT 'medication',
	`allergen` varchar(255) NOT NULL,
	`severity` enum('mild','moderate','severe','life_threatening') DEFAULT 'moderate',
	`reaction` text,
	`diagnosedDate` date,
	`notes` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerAllergies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `injectionPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`injectionRecordId` int NOT NULL,
	`positionX` decimal(5,2) NOT NULL,
	`positionY` decimal(5,2) NOT NULL,
	`units` decimal(6,2) NOT NULL,
	`depth` varchar(50),
	`technique` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `injectionPoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `injectionRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`appointmentId` int,
	`treatmentRecordId` int,
	`staffId` int NOT NULL,
	`templateType` enum('face_front','face_side_left','face_side_right','body_front','body_back') DEFAULT 'face_front',
	`productUsed` varchar(255),
	`totalUnits` decimal(8,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `injectionRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`genericName` varchar(255),
	`category` enum('oral','topical','injection','supplement','other') DEFAULT 'oral',
	`dosageForm` varchar(100),
	`strength` varchar(100),
	`unit` varchar(50),
	`manufacturer` varchar(255),
	`contraindications` text,
	`sideEffects` text,
	`instructions` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`planId` int NOT NULL,
	`billingCycle` enum('monthly','annual') DEFAULT 'monthly',
	`status` enum('active','paused','cancelled','expired') DEFAULT 'active',
	`startDate` date NOT NULL,
	`endDate` date,
	`nextBillingDate` date,
	`autoRenew` boolean DEFAULT true,
	`paymentMethod` varchar(50),
	`lastPaymentDate` date,
	`cancelledAt` timestamp,
	`cancelReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membershipPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(10,2) NOT NULL,
	`annualPrice` decimal(10,2),
	`benefits` json,
	`includedServices` json,
	`discountPercentage` int DEFAULT 0,
	`priorityBooking` boolean DEFAULT false,
	`freeConsultations` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membershipPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`prescriberId` int NOT NULL,
	`appointmentId` int,
	`treatmentRecordId` int,
	`medicationId` int NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`frequency` varchar(100) NOT NULL,
	`duration` varchar(100),
	`quantity` int NOT NULL,
	`refillsAllowed` int DEFAULT 0,
	`refillsUsed` int DEFAULT 0,
	`instructions` text,
	`warnings` text,
	`status` enum('active','completed','cancelled','expired') DEFAULT 'active',
	`prescribedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`referrerRewardType` enum('points','credit','discount','free_service') DEFAULT 'points',
	`referrerRewardValue` decimal(10,2) DEFAULT '0',
	`refereeRewardType` enum('points','credit','discount','free_service') DEFAULT 'discount',
	`refereeRewardValue` decimal(10,2) DEFAULT '0',
	`maxUses` int,
	`usedCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referralCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referralRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`referralCodeId` int NOT NULL,
	`referrerId` int NOT NULL,
	`refereeId` int NOT NULL,
	`refereeOrderId` int,
	`status` enum('pending','qualified','rewarded','expired') DEFAULT 'pending',
	`qualifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralRecordId` int NOT NULL,
	`recipientId` int NOT NULL,
	`recipientType` enum('referrer','referee') NOT NULL,
	`rewardType` enum('points','credit','discount','free_service') NOT NULL,
	`rewardValue` decimal(10,2) NOT NULL,
	`status` enum('pending','issued','used','expired') DEFAULT 'pending',
	`issuedAt` timestamp,
	`usedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralRewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`socialAccountId` int NOT NULL,
	`content` text NOT NULL,
	`mediaUrls` json,
	`hashtags` json,
	`scheduledAt` timestamp NOT NULL,
	`publishedAt` timestamp,
	`status` enum('draft','scheduled','published','failed','cancelled') DEFAULT 'draft',
	`postType` enum('image','video','carousel','story','reel') DEFAULT 'image',
	`externalPostId` varchar(255),
	`errorMessage` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skinAnalysisRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`appointmentId` int,
	`photoUrl` text NOT NULL,
	`analysisType` enum('full_face','forehead','cheeks','chin','nose','eyes') DEFAULT 'full_face',
	`overallScore` int,
	`skinAge` int,
	`analyzedAt` timestamp NOT NULL DEFAULT (now()),
	`aiModel` varchar(100),
	`rawResults` json,
	`recommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skinAnalysisRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skinMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRecordId` int NOT NULL,
	`metricType` enum('wrinkles','spots','pores','texture','hydration','oiliness','redness','elasticity') NOT NULL,
	`score` int NOT NULL,
	`severity` enum('none','mild','moderate','severe') DEFAULT 'none',
	`affectedArea` varchar(100),
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skinMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`platform` enum('facebook','instagram','line','tiktok','youtube','xiaohongshu') NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountId` varchar(255),
	`accessToken` text,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`followerCount` int DEFAULT 0,
	`isConnected` boolean DEFAULT false,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`socialAccountId` int NOT NULL,
	`postId` int,
	`date` date NOT NULL,
	`impressions` int DEFAULT 0,
	`reach` int DEFAULT 0,
	`engagement` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`saves` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`followerGrowth` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `socialAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'TWD',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`billingPeriodStart` date,
	`billingPeriodEnd` date,
	`paidAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptionPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teleConsultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`staffId` int NOT NULL,
	`appointmentId` int,
	`scheduledAt` timestamp NOT NULL,
	`duration` int DEFAULT 30,
	`roomId` varchar(255),
	`roomUrl` text,
	`status` enum('scheduled','in_progress','completed','cancelled','no_show') DEFAULT 'scheduled',
	`consultationType` enum('initial','follow_up','pre_treatment','post_treatment') DEFAULT 'initial',
	`notes` text,
	`summary` text,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teleConsultations_id` PRIMARY KEY(`id`)
);
