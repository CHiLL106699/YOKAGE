-- ============================================================
-- YOChiLL SaaS Platform - Complete PostgreSQL Schema
-- ============================================================
-- Total Tables: 120
-- Source: Drizzle ORM MySQL Schema (auto-converted)
-- Target: Supabase PostgreSQL (YOKAGE)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE INDEX (資料表索引)
-- ============================================================
--   1. users (12 columns)
--   2. organizations (17 columns)
--   3. organizationUsers (9 columns)
--   4. customers (19 columns)
--   5. customerTags (6 columns)
--   6. customerTagRelations (4 columns)
--   7. products (15 columns)
--   8. staff (17 columns)
--   9. appointmentSlots (10 columns)
--  10. appointments (15 columns)
--  11. schedules (10 columns)
--  12. attendanceRecords (28 columns)
--  13. coupons (16 columns)
--  14. orders (15 columns)
--  15. orderItems (8 columns)
--  16. aftercareRecords (15 columns)
--  17. lineChannels (11 columns)
--  18. activityLogs (10 columns)
--  19. treatmentRecords (16 columns)
--  20. treatmentPhotos (13 columns)
--  21. customerPackages (15 columns)
--  22. packageUsageRecords (10 columns)
--  23. consultations (19 columns)
--  24. followUps (13 columns)
--  25. customerRfmScores (15 columns)
--  26. commissionRules (11 columns)
--  27. staffCommissions (15 columns)
--  28. inventoryTransactions (15 columns)
--  29. revenueTargets (14 columns)
--  30. marketingCampaigns (14 columns)
--  31. customerSources (14 columns)
--  32. satisfactionSurveys (21 columns)
--  33. waitlist (12 columns)
--  34. injectionRecords (12 columns)
--  35. injectionPoints (9 columns)
--  36. consentFormTemplates (10 columns)
--  37. consentSignatures (16 columns)
--  38. medications (15 columns)
--  39. prescriptions (20 columns)
--  40. customerAllergies (11 columns)
--  41. skinAnalysisRecords (14 columns)
--  42. skinMetrics (8 columns)
--  43. membershipPlans (15 columns)
--  44. memberSubscriptions (16 columns)
--  45. subscriptionPayments (13 columns)
--  46. teleConsultations (17 columns)
--  47. consultationRecordings (10 columns)
--  48. referralCodes (14 columns)
--  49. referralRecords (10 columns)
--  50. referralRewards (12 columns)
--  51. socialAccounts (13 columns)
--  52. scheduledPosts (15 columns)
--  53. socialAnalytics (14 columns)
--  54. backgroundJobs (14 columns)
--  55. voucherTemplates (26 columns)
--  56. voucherInstances (22 columns)
--  57. voucherRedemptions (16 columns)
--  58. voucherBatches (17 columns)
--  59. voucherTransfers (21 columns)
--  60. systemSettings (7 columns)
--  61. voucherReminderLogs (14 columns)
--  62. dailySettlements (27 columns)
--  63. settlementItems (14 columns)
--  64. cashDrawerRecords (12 columns)
--  65. paymentRecords (19 columns)
--  66. lineChannelConfigs (13 columns)
--  67. autoSettlementSettings (15 columns)
--  68. settlementReports (25 columns)
--  69. revenueTrendSnapshots (17 columns)
--  70. lineChannelSettings (18 columns)
--  71. importRecords (14 columns)
--  72. paymentSettings (24 columns)
--  73. paymentTransactions (21 columns)
--  74. subscriptionPlans (17 columns)
--  75. organizationSubscriptions (15 columns)
--  76. attendanceSettings (12 columns)
--  77. games (11 columns)
--  78. prizes (16 columns)
--  79. gamePlays (9 columns)
--  80. userPrizes (13 columns)
--  81. performanceRecords (10 columns)
--  82. performanceTargets (10 columns)
--  83. inventory_system_b (12 columns)
--  84. crm_tags_system_b (7 columns)
--  85. customer_tags_system_b (4 columns)
--  86. games_system_b (13 columns)
--  87. prizes_system_b (11 columns)
--  88. game_participations_system_b (7 columns)
--  89. staff_commissions_system_b (9 columns)
--  90. inventory_transfers_system_b (11 columns)
--  91. interactions (9 columns)
--  92. tag_rules (10 columns)
--  93. line_messaging_settings (8 columns)
--  94. line_webhook_events (13 columns)
--  95. auto_reply_rules (12 columns)
--  96. rich_menu_templates (14 columns)
--  97. rich_menu_assignments (5 columns)
--  98. rich_menu_click_stats (6 columns)
--  99. broadcast_campaigns (16 columns)
-- 100. broadcast_recipients (9 columns)
-- 101. ai_conversations (11 columns)
-- 102. ai_intents (10 columns)
-- 103. ai_knowledge_base (11 columns)
-- 104. rich_menu_template_market (13 columns)
-- 105. broadcast_campaign_variants (13 columns)
-- 106. ai_knowledge_base_vectors (6 columns)
-- 107. inventory (12 columns)
-- 108. crm_tags (6 columns)
-- 109. customer_tags (4 columns)
-- 110. games_system_b (13 columns)
-- 111. prizes_system_b (11 columns)
-- 112. game_participations_system_b (7 columns)
-- 113. staff_commissions (9 columns)
-- 114. inventory_transfers_system_b (11 columns)
-- 115. lemonsqueezy_plans (13 columns)
-- 116. lemonsqueezy_subscriptions (13 columns)
-- 117. lemonsqueezy_payments (16 columns)
-- 118. lemonsqueezy_webhook_events (7 columns)
-- 119. line_rich_menus (13 columns)
-- 120. leave_requests (13 columns)
-- 121. attendance_records (3 columns)
-- 122. attendance_settings (3 columns)
-- 123. performance_records (7 columns)
-- 124. performance_targets (8 columns)
-- ============================================================

-- [1/124] Table: users
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  "name" TEXT,
  "email" VARCHAR(320),
  "phone" VARCHAR(20),
  "avatar" TEXT,
  "loginMethod" VARCHAR(64),
  "role" TEXT CHECK ("role" IN ('super_admin', 'clinic_admin', 'staff', 'customer', 'user')) NOT NULL DEFAULT 'user',
  "lineUserId" VARCHAR(64),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [2/124] Table: organizations
CREATE TABLE IF NOT EXISTS "organizations" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(100) NOT NULL UNIQUE,
  "logo" TEXT,
  "address" TEXT,
  "phone" VARCHAR(20),
  "email" VARCHAR(320),
  "timezone" VARCHAR(50) DEFAULT 'Asia/Taipei',
  "currency" VARCHAR(10) DEFAULT 'TWD',
  "businessHours" JSONB,
  "settings" JSONB,
  "subscriptionPlan" TEXT CHECK ("subscriptionPlan" IN ('free', 'basic', 'pro', 'enterprise')) DEFAULT 'free',
  "subscriptionStatus" TEXT CHECK ("subscriptionStatus" IN ('active', 'suspended', 'cancelled')) DEFAULT 'active',
  "trialEndsAt" TIMESTAMPTZ,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [3/124] Table: organizationUsers
CREATE TABLE IF NOT EXISTS "organizationUsers" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "role" TEXT CHECK ("role" IN ('owner', 'admin', 'manager', 'staff')) NOT NULL DEFAULT 'staff',
  "permissions" JSONB,
  "isActive" BOOLEAN DEFAULT true,
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [4/124] Table: customers
CREATE TABLE IF NOT EXISTS "customers" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "userId" INTEGER,
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "email" VARCHAR(320),
  "gender" TEXT CHECK ("gender" IN ('male', 'female', 'other')),
  "birthday" DATE,
  "address" TEXT,
  "avatar" TEXT,
  "lineUserId" VARCHAR(64),
  "memberLevel" TEXT CHECK ("memberLevel" IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')) DEFAULT 'bronze',
  "totalSpent" NUMERIC(12, 2) DEFAULT '0',
  "visitCount" INTEGER DEFAULT 0,
  "notes" TEXT,
  "source" VARCHAR(100),
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [5/124] Table: customerTags
CREATE TABLE IF NOT EXISTS "customerTags" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "color" VARCHAR(20) DEFAULT '#6366f1',
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [6/124] Table: customerTagRelations
CREATE TABLE IF NOT EXISTS "customerTagRelations" (
  "id" SERIAL PRIMARY KEY,
  "customerId" INTEGER NOT NULL,
  "tagId" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [7/124] Table: products
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100),
  "type" TEXT CHECK ("type" IN ('service', 'product', 'package')) DEFAULT 'service',
  "price" NUMERIC(10, 2) NOT NULL,
  "costPrice" NUMERIC(10, 2),
  "duration" INTEGER,
  "stock" INTEGER,
  "images" JSONB,
  "isActive" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [8/124] Table: staff
CREATE TABLE IF NOT EXISTS "staff" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "userId" INTEGER,
  "employeeId" VARCHAR(50),
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "email" VARCHAR(320),
  "position" VARCHAR(100),
  "department" VARCHAR(100),
  "hireDate" DATE,
  "salary" NUMERIC(10, 2),
  "salaryType" TEXT CHECK ("salaryType" IN ('monthly', 'hourly', 'commission')) DEFAULT 'monthly',
  "avatar" TEXT,
  "skills" JSONB,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [9/124] Table: appointmentSlots
CREATE TABLE IF NOT EXISTS "appointmentSlots" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "staffId" INTEGER,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME NOT NULL,
  "slotDuration" INTEGER DEFAULT 30,
  "maxBookings" INTEGER DEFAULT 1,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [10/124] Table: appointments
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "staffId" INTEGER,
  "productId" INTEGER,
  "appointmentDate" DATE NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME,
  "status" TEXT CHECK ("status" IN ('pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  "notes" TEXT,
  "internalNotes" TEXT,
  "source" VARCHAR(50) DEFAULT 'web',
  "reminderSent" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [11/124] Table: schedules
CREATE TABLE IF NOT EXISTS "schedules" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "staffId" INTEGER NOT NULL,
  "scheduleDate" DATE NOT NULL,
  "shiftType" TEXT CHECK ("shiftType" IN ('morning', 'afternoon', 'evening', 'full', 'off', 'custom')) DEFAULT 'full',
  "startTime" TIME,
  "endTime" TIME,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [12/124] Table: attendanceRecords
CREATE TABLE IF NOT EXISTS "attendanceRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "staffId" INTEGER NOT NULL,
  "recordDate" DATE NOT NULL,
  "clockIn" TIMESTAMPTZ,
  "clockOut" TIMESTAMPTZ,
  "clockInLocation" JSONB,
  "clockOutLocation" JSONB,
  "checkInLatitude" NUMERIC(10, 7),
  "checkInLongitude" NUMERIC(10, 7),
  "checkInAccuracy" NUMERIC(8, 2),
  "checkInAddress" TEXT,
  "checkOutLatitude" NUMERIC(10, 7),
  "checkOutLongitude" NUMERIC(10, 7),
  "checkOutAccuracy" NUMERIC(8, 2),
  "checkOutAddress" TEXT,
  "isWithinGeofence" BOOLEAN DEFAULT true,
  "distanceFromClinic" NUMERIC(8, 2),
  "status" TEXT CHECK ("status" IN ('normal', 'late', 'early_leave', 'absent', 'leave')) DEFAULT 'normal',
  "notes" TEXT,
  "isManualEntry" BOOLEAN DEFAULT false,
  "manualReason" TEXT,
  "approvedBy" INTEGER,
  "approvedAt" TIMESTAMPTZ,
  "approvalStatus" TEXT CHECK ("approvalStatus" IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
  "staffNote" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [13/124] Table: coupons
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "discountType" TEXT CHECK ("discountType" IN ('percentage', 'fixed')) DEFAULT 'percentage',
  "discountValue" NUMERIC(10, 2) NOT NULL,
  "minPurchase" NUMERIC(10, 2),
  "maxDiscount" NUMERIC(10, 2),
  "usageLimit" INTEGER,
  "usedCount" INTEGER DEFAULT 0,
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [14/124] Table: orders
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "orderNumber" VARCHAR(50) NOT NULL,
  "status" TEXT CHECK ("status" IN ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded')) DEFAULT 'pending',
  "subtotal" NUMERIC(12, 2) NOT NULL,
  "discount" NUMERIC(10, 2) DEFAULT '0',
  "tax" NUMERIC(10, 2) DEFAULT '0',
  "total" NUMERIC(12, 2) NOT NULL,
  "couponId" INTEGER,
  "paymentMethod" VARCHAR(50),
  "paymentStatus" TEXT CHECK ("paymentStatus" IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [15/124] Table: orderItems
CREATE TABLE IF NOT EXISTS "orderItems" (
  "id" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "productName" VARCHAR(255) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" NUMERIC(10, 2) NOT NULL,
  "subtotal" NUMERIC(10, 2) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [16/124] Table: aftercareRecords
CREATE TABLE IF NOT EXISTS "aftercareRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "productId" INTEGER,
  "staffId" INTEGER,
  "treatmentDate" DATE NOT NULL,
  "followUpDate" DATE,
  "status" TEXT CHECK ("status" IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  "notes" TEXT,
  "customerFeedback" TEXT,
  "photos" JSONB,
  "reminderSent" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [17/124] Table: lineChannels
CREATE TABLE IF NOT EXISTS "lineChannels" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "channelName" VARCHAR(255) NOT NULL,
  "channelId" VARCHAR(100) NOT NULL,
  "channelSecret" VARCHAR(255),
  "accessToken" TEXT,
  "liffId" VARCHAR(100),
  "webhookUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [18/124] Table: activityLogs
CREATE TABLE IF NOT EXISTS "activityLogs" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER,
  "userId" INTEGER,
  "action" VARCHAR(100) NOT NULL,
  "entityType" VARCHAR(50),
  "entityId" INTEGER,
  "details" JSONB,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [19/124] Table: treatmentRecords
CREATE TABLE IF NOT EXISTS "treatmentRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "staffId" INTEGER,
  "productId" INTEGER,
  "treatmentDate" TIMESTAMPTZ NOT NULL,
  "treatmentType" VARCHAR(100),
  "treatmentArea" VARCHAR(100),
  "dosage" VARCHAR(100),
  "notes" TEXT,
  "internalNotes" TEXT,
  "satisfactionScore" INTEGER,
  "nextFollowUpDate" DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [20/124] Table: treatmentPhotos
CREATE TABLE IF NOT EXISTS "treatmentPhotos" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "treatmentRecordId" INTEGER,
  "photoType" TEXT CHECK ("photoType" IN ('before', 'after', 'during', 'other')) DEFAULT 'before',
  "photoUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "photoDate" TIMESTAMPTZ NOT NULL,
  "angle" VARCHAR(50),
  "notes" TEXT,
  "isPublic" BOOLEAN DEFAULT false,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [21/124] Table: customerPackages
CREATE TABLE IF NOT EXISTS "customerPackages" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "packageName" VARCHAR(255) NOT NULL,
  "totalSessions" INTEGER NOT NULL,
  "usedSessions" INTEGER NOT NULL DEFAULT 0,
  "remainingSessions" INTEGER NOT NULL,
  "purchasePrice" NUMERIC(10, 2) NOT NULL,
  "purchaseDate" TIMESTAMPTZ NOT NULL,
  "expiryDate" TIMESTAMPTZ,
  "status" TEXT CHECK ("status" IN ('active', 'expired', 'completed', 'cancelled')) DEFAULT 'active',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [22/124] Table: packageUsageRecords
CREATE TABLE IF NOT EXISTS "packageUsageRecords" (
  "id" SERIAL PRIMARY KEY,
  "packageId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "treatmentRecordId" INTEGER,
  "sessionsUsed" INTEGER NOT NULL DEFAULT 1,
  "usageDate" TIMESTAMPTZ NOT NULL,
  "staffId" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [23/124] Table: consultations
CREATE TABLE IF NOT EXISTS "consultations" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER,
  "prospectName" VARCHAR(255),
  "prospectPhone" VARCHAR(20),
  "prospectEmail" VARCHAR(320),
  "consultationDate" TIMESTAMPTZ NOT NULL,
  "consultationType" TEXT CHECK ("consultationType" IN ('walk_in', 'phone', 'online', 'referral')) DEFAULT 'walk_in',
  "staffId" INTEGER,
  "interestedProducts" JSONB,
  "concerns" TEXT,
  "recommendations" TEXT,
  "status" TEXT CHECK ("status" IN ('new', 'contacted', 'scheduled', 'converted', 'lost')) DEFAULT 'new',
  "conversionDate" TIMESTAMPTZ,
  "convertedOrderId" INTEGER,
  "source" VARCHAR(100),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [24/124] Table: followUps
CREATE TABLE IF NOT EXISTS "followUps" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "consultationId" INTEGER,
  "customerId" INTEGER,
  "staffId" INTEGER,
  "followUpDate" TIMESTAMPTZ NOT NULL,
  "followUpType" TEXT CHECK ("followUpType" IN ('call', 'sms', 'line', 'email', 'visit')) DEFAULT 'call',
  "status" TEXT CHECK ("status" IN ('pending', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'pending',
  "outcome" VARCHAR(255),
  "notes" TEXT,
  "nextFollowUpDate" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [25/124] Table: customerRfmScores
CREATE TABLE IF NOT EXISTS "customerRfmScores" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "recencyScore" INTEGER NOT NULL,
  "frequencyScore" INTEGER NOT NULL,
  "monetaryScore" INTEGER NOT NULL,
  "totalScore" INTEGER NOT NULL,
  "segment" VARCHAR(50),
  "lastPurchaseDate" TIMESTAMPTZ,
  "purchaseCount" INTEGER DEFAULT 0,
  "totalSpent" NUMERIC(12, 2) DEFAULT '0',
  "churnRisk" INTEGER DEFAULT 0,
  "calculatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [26/124] Table: commissionRules
CREATE TABLE IF NOT EXISTS "commissionRules" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "productId" INTEGER,
  "productCategory" VARCHAR(100),
  "commissionType" TEXT CHECK ("commissionType" IN ('percentage', 'fixed')) DEFAULT 'percentage',
  "commissionValue" NUMERIC(10, 2) NOT NULL,
  "minSalesAmount" NUMERIC(10, 2),
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [27/124] Table: staffCommissions
CREATE TABLE IF NOT EXISTS "staffCommissions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "staffId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "orderItemId" INTEGER,
  "appointmentId" INTEGER,
  "commissionRuleId" INTEGER,
  "salesAmount" NUMERIC(10, 2) NOT NULL,
  "commissionAmount" NUMERIC(10, 2) NOT NULL,
  "commissionDate" TIMESTAMPTZ NOT NULL,
  "status" TEXT CHECK ("status" IN ('pending', 'approved', 'paid', 'cancelled')) DEFAULT 'pending',
  "paidAt" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [28/124] Table: inventoryTransactions
CREATE TABLE IF NOT EXISTS "inventoryTransactions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "transactionType" TEXT CHECK ("transactionType" IN ('purchase', 'sale', 'adjustment', 'return', 'transfer', 'waste')) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitCost" NUMERIC(10, 2),
  "totalCost" NUMERIC(10, 2),
  "referenceId" INTEGER,
  "referenceType" VARCHAR(50),
  "batchNumber" VARCHAR(100),
  "expiryDate" DATE,
  "notes" TEXT,
  "staffId" INTEGER,
  "transactionDate" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [29/124] Table: revenueTargets
CREATE TABLE IF NOT EXISTS "revenueTargets" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "targetType" TEXT CHECK ("targetType" IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  "targetYear" INTEGER NOT NULL,
  "targetMonth" INTEGER,
  "targetQuarter" INTEGER,
  "targetAmount" NUMERIC(12, 2) NOT NULL,
  "actualAmount" NUMERIC(12, 2) DEFAULT '0',
  "achievementRate" NUMERIC(5, 2) DEFAULT '0',
  "staffId" INTEGER,
  "productCategory" VARCHAR(100),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [30/124] Table: marketingCampaigns
CREATE TABLE IF NOT EXISTS "marketingCampaigns" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "campaignType" TEXT CHECK ("campaignType" IN ('facebook', 'google', 'line', 'instagram', 'referral', 'event', 'other')) DEFAULT 'other',
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "budget" NUMERIC(10, 2),
  "actualSpend" NUMERIC(10, 2) DEFAULT '0',
  "targetAudience" TEXT,
  "description" TEXT,
  "trackingCode" VARCHAR(100),
  "status" TEXT CHECK ("status" IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [31/124] Table: customerSources
CREATE TABLE IF NOT EXISTS "customerSources" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "campaignId" INTEGER,
  "sourceType" VARCHAR(100),
  "sourceName" VARCHAR(255),
  "referralCode" VARCHAR(100),
  "referredByCustomerId" INTEGER,
  "firstVisitDate" TIMESTAMPTZ,
  "firstPurchaseDate" TIMESTAMPTZ,
  "firstPurchaseAmount" NUMERIC(10, 2),
  "lifetimeValue" NUMERIC(12, 2) DEFAULT '0',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [32/124] Table: satisfactionSurveys
CREATE TABLE IF NOT EXISTS "satisfactionSurveys" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "treatmentRecordId" INTEGER,
  "surveyType" TEXT CHECK ("surveyType" IN ('post_treatment', 'post_purchase', 'general', 'nps')) DEFAULT 'post_treatment',
  "overallScore" INTEGER,
  "serviceScore" INTEGER,
  "staffScore" INTEGER,
  "facilityScore" INTEGER,
  "valueScore" INTEGER,
  "npsScore" INTEGER,
  "wouldRecommend" BOOLEAN,
  "feedback" TEXT,
  "improvementSuggestions" TEXT,
  "staffId" INTEGER,
  "sentAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "status" TEXT CHECK ("status" IN ('pending', 'sent', 'completed', 'expired')) DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [33/124] Table: waitlist
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "preferredDate" DATE NOT NULL,
  "preferredTimeSlot" VARCHAR(50),
  "productId" INTEGER,
  "status" TEXT CHECK ("status" IN ('waiting', 'notified', 'booked', 'cancelled')) DEFAULT 'waiting',
  "notes" TEXT,
  "notifiedAt" TIMESTAMPTZ,
  "bookedAppointmentId" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [34/124] Table: injectionRecords
CREATE TABLE IF NOT EXISTS "injectionRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "treatmentRecordId" INTEGER,
  "staffId" INTEGER NOT NULL,
  "templateType" TEXT CHECK ("templateType" IN ('face_front', 'face_side_left', 'face_side_right', 'body_front', 'body_back')) DEFAULT 'face_front',
  "productUsed" VARCHAR(255),
  "totalUnits" NUMERIC(8, 2),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [35/124] Table: injectionPoints
CREATE TABLE IF NOT EXISTS "injectionPoints" (
  "id" SERIAL PRIMARY KEY,
  "injectionRecordId" INTEGER NOT NULL,
  "positionX" NUMERIC(5, 2) NOT NULL,
  "positionY" NUMERIC(5, 2) NOT NULL,
  "units" NUMERIC(6, 2) NOT NULL,
  "depth" VARCHAR(50),
  "technique" VARCHAR(100),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [36/124] Table: consentFormTemplates
CREATE TABLE IF NOT EXISTS "consentFormTemplates" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "category" TEXT CHECK ("category" IN ('treatment', 'surgery', 'anesthesia', 'photography', 'general')) DEFAULT 'treatment',
  "content" TEXT NOT NULL,
  "requiredFields" JSONB,
  "version" VARCHAR(20) DEFAULT '1.0',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [37/124] Table: consentSignatures
CREATE TABLE IF NOT EXISTS "consentSignatures" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "templateId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "treatmentRecordId" INTEGER,
  "signatureImageUrl" TEXT NOT NULL,
  "signedContent" TEXT,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "signedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "witnessName" VARCHAR(255),
  "witnessSignatureUrl" TEXT,
  "status" TEXT CHECK ("status" IN ('pending', 'signed', 'revoked')) DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [38/124] Table: medications
CREATE TABLE IF NOT EXISTS "medications" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "genericName" VARCHAR(255),
  "category" TEXT CHECK ("category" IN ('oral', 'topical', 'injection', 'supplement', 'other')) DEFAULT 'oral',
  "dosageForm" VARCHAR(100),
  "strength" VARCHAR(100),
  "unit" VARCHAR(50),
  "manufacturer" VARCHAR(255),
  "contraindications" TEXT,
  "sideEffects" TEXT,
  "instructions" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [39/124] Table: prescriptions
CREATE TABLE IF NOT EXISTS "prescriptions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "prescriberId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "treatmentRecordId" INTEGER,
  "medicationId" INTEGER NOT NULL,
  "dosage" VARCHAR(100) NOT NULL,
  "frequency" VARCHAR(100) NOT NULL,
  "duration" VARCHAR(100),
  "quantity" INTEGER NOT NULL,
  "refillsAllowed" INTEGER DEFAULT 0,
  "refillsUsed" INTEGER DEFAULT 0,
  "instructions" TEXT,
  "warnings" TEXT,
  "status" TEXT CHECK ("status" IN ('active', 'completed', 'cancelled', 'expired')) DEFAULT 'active',
  "prescribedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [40/124] Table: customerAllergies
CREATE TABLE IF NOT EXISTS "customerAllergies" (
  "id" SERIAL PRIMARY KEY,
  "customerId" INTEGER NOT NULL,
  "allergyType" TEXT CHECK ("allergyType" IN ('medication', 'food', 'environmental', 'other')) DEFAULT 'medication',
  "allergen" VARCHAR(255) NOT NULL,
  "severity" TEXT CHECK ("severity" IN ('mild', 'moderate', 'severe', 'life_threatening')) DEFAULT 'moderate',
  "reaction" TEXT,
  "diagnosedDate" DATE,
  "notes" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [41/124] Table: skinAnalysisRecords
CREATE TABLE IF NOT EXISTS "skinAnalysisRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "photoUrl" TEXT NOT NULL,
  "analysisType" TEXT CHECK ("analysisType" IN ('full_face', 'forehead', 'cheeks', 'chin', 'nose', 'eyes')) DEFAULT 'full_face',
  "overallScore" INTEGER,
  "skinAge" INTEGER,
  "analyzedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "aiModel" VARCHAR(100),
  "rawResults" JSONB,
  "recommendations" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [42/124] Table: skinMetrics
CREATE TABLE IF NOT EXISTS "skinMetrics" (
  "id" SERIAL PRIMARY KEY,
  "analysisRecordId" INTEGER NOT NULL,
  "metricType" TEXT CHECK ("metricType" IN ('wrinkles', 'spots', 'pores', 'texture', 'hydration', 'oiliness', 'redness', 'elasticity')) NOT NULL,
  "score" INTEGER NOT NULL,
  "severity" TEXT CHECK ("severity" IN ('none', 'mild', 'moderate', 'severe')) DEFAULT 'none',
  "affectedArea" VARCHAR(100),
  "details" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [43/124] Table: membershipPlans
CREATE TABLE IF NOT EXISTS "membershipPlans" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "monthlyPrice" NUMERIC(10, 2) NOT NULL,
  "annualPrice" NUMERIC(10, 2),
  "benefits" JSONB,
  "includedServices" JSONB,
  "discountPercentage" INTEGER DEFAULT 0,
  "priorityBooking" BOOLEAN DEFAULT false,
  "freeConsultations" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [44/124] Table: memberSubscriptions
CREATE TABLE IF NOT EXISTS "memberSubscriptions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "planId" INTEGER NOT NULL,
  "billingCycle" TEXT CHECK ("billingCycle" IN ('monthly', 'annual')) DEFAULT 'monthly',
  "status" TEXT CHECK ("status" IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "nextBillingDate" DATE,
  "autoRenew" BOOLEAN DEFAULT true,
  "paymentMethod" VARCHAR(50),
  "lastPaymentDate" DATE,
  "cancelledAt" TIMESTAMPTZ,
  "cancelReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [45/124] Table: subscriptionPayments
CREATE TABLE IF NOT EXISTS "subscriptionPayments" (
  "id" SERIAL PRIMARY KEY,
  "subscriptionId" INTEGER NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL,
  "currency" VARCHAR(10) DEFAULT 'TWD',
  "paymentMethod" VARCHAR(50),
  "transactionId" VARCHAR(255),
  "status" TEXT CHECK ("status" IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  "billingPeriodStart" DATE,
  "billingPeriodEnd" DATE,
  "paidAt" TIMESTAMPTZ,
  "failureReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [46/124] Table: teleConsultations
CREATE TABLE IF NOT EXISTS "teleConsultations" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "staffId" INTEGER NOT NULL,
  "appointmentId" INTEGER,
  "scheduledAt" TIMESTAMPTZ NOT NULL,
  "duration" INTEGER DEFAULT 30,
  "roomId" VARCHAR(255),
  "roomUrl" TEXT,
  "status" TEXT CHECK ("status" IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  "consultationType" TEXT CHECK ("consultationType" IN ('initial', 'follow_up', 'pre_treatment', 'post_treatment')) DEFAULT 'initial',
  "notes" TEXT,
  "summary" TEXT,
  "startedAt" TIMESTAMPTZ,
  "endedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [47/124] Table: consultationRecordings
CREATE TABLE IF NOT EXISTS "consultationRecordings" (
  "id" SERIAL PRIMARY KEY,
  "teleConsultationId" INTEGER NOT NULL,
  "recordingUrl" TEXT NOT NULL,
  "duration" INTEGER,
  "fileSize" INTEGER,
  "format" VARCHAR(20),
  "transcription" TEXT,
  "consentGiven" BOOLEAN DEFAULT false,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [48/124] Table: referralCodes
CREATE TABLE IF NOT EXISTS "referralCodes" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "code" VARCHAR(20) NOT NULL UNIQUE,
  "referrerRewardType" TEXT CHECK ("referrerRewardType" IN ('points', 'credit', 'discount', 'free_service')) DEFAULT 'points',
  "referrerRewardValue" NUMERIC(10, 2) DEFAULT '0',
  "refereeRewardType" TEXT CHECK ("refereeRewardType" IN ('points', 'credit', 'discount', 'free_service')) DEFAULT 'discount',
  "refereeRewardValue" NUMERIC(10, 2) DEFAULT '0',
  "maxUses" INTEGER,
  "usedCount" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [49/124] Table: referralRecords
CREATE TABLE IF NOT EXISTS "referralRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "referralCodeId" INTEGER NOT NULL,
  "referrerId" INTEGER NOT NULL,
  "refereeId" INTEGER NOT NULL,
  "refereeOrderId" INTEGER,
  "status" TEXT CHECK ("status" IN ('pending', 'qualified', 'rewarded', 'expired')) DEFAULT 'pending',
  "qualifiedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [50/124] Table: referralRewards
CREATE TABLE IF NOT EXISTS "referralRewards" (
  "id" SERIAL PRIMARY KEY,
  "referralRecordId" INTEGER NOT NULL,
  "recipientId" INTEGER NOT NULL,
  "recipientType" TEXT CHECK ("recipientType" IN ('referrer', 'referee')) NOT NULL,
  "rewardType" TEXT CHECK ("rewardType" IN ('points', 'credit', 'discount', 'free_service')) NOT NULL,
  "rewardValue" NUMERIC(10, 2) NOT NULL,
  "status" TEXT CHECK ("status" IN ('pending', 'issued', 'used', 'expired')) DEFAULT 'pending',
  "issuedAt" TIMESTAMPTZ,
  "usedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [51/124] Table: socialAccounts
CREATE TABLE IF NOT EXISTS "socialAccounts" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "platform" TEXT CHECK ("platform" IN ('facebook', 'instagram', 'line', 'tiktok', 'youtube', 'xiaohongshu')) NOT NULL,
  "accountName" VARCHAR(255) NOT NULL,
  "accountId" VARCHAR(255),
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "tokenExpiresAt" TIMESTAMPTZ,
  "followerCount" INTEGER DEFAULT 0,
  "isConnected" BOOLEAN DEFAULT false,
  "lastSyncAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [52/124] Table: scheduledPosts
CREATE TABLE IF NOT EXISTS "scheduledPosts" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "socialAccountId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "mediaUrls" JSONB,
  "hashtags" JSONB,
  "scheduledAt" TIMESTAMPTZ NOT NULL,
  "publishedAt" TIMESTAMPTZ,
  "status" TEXT CHECK ("status" IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')) DEFAULT 'draft',
  "postType" TEXT CHECK ("postType" IN ('image', 'video', 'carousel', 'story', 'reel')) DEFAULT 'image',
  "externalPostId" VARCHAR(255),
  "errorMessage" TEXT,
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [53/124] Table: socialAnalytics
CREATE TABLE IF NOT EXISTS "socialAnalytics" (
  "id" SERIAL PRIMARY KEY,
  "socialAccountId" INTEGER NOT NULL,
  "postId" INTEGER,
  "date" DATE NOT NULL,
  "impressions" INTEGER DEFAULT 0,
  "reach" INTEGER DEFAULT 0,
  "engagement" INTEGER DEFAULT 0,
  "likes" INTEGER DEFAULT 0,
  "comments" INTEGER DEFAULT 0,
  "shares" INTEGER DEFAULT 0,
  "saves" INTEGER DEFAULT 0,
  "clicks" INTEGER DEFAULT 0,
  "followerGrowth" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [54/124] Table: backgroundJobs
CREATE TABLE IF NOT EXISTS "backgroundJobs" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "jobType" TEXT CHECK ("jobType" IN ('rfm_calculation', 'report_generation', 'data_export', 'bulk_notification', 'data_import')) NOT NULL,
  "status" TEXT CHECK ("status" IN ('pending', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  "progress" INTEGER DEFAULT 0,
  "totalItems" INTEGER DEFAULT 0,
  "processedItems" INTEGER DEFAULT 0,
  "result" JSONB,
  "errorMessage" TEXT,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [55/124] Table: voucherTemplates
CREATE TABLE IF NOT EXISTS "voucherTemplates" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" TEXT CHECK ("type" IN ('treatment', 'discount', 'gift_card', 'stored_value', 'free_item')) DEFAULT 'treatment',
  "value" NUMERIC(10, 2),
  "valueType" TEXT CHECK ("valueType" IN ('fixed_amount', 'percentage', 'treatment_count')) DEFAULT 'fixed_amount',
  "applicableProducts" JSONB,
  "applicableCategories" JSONB,
  "applicableServices" JSONB,
  "minPurchase" NUMERIC(10, 2),
  "maxDiscount" NUMERIC(10, 2),
  "usageLimit" INTEGER,
  "validityType" TEXT CHECK ("validityType" IN ('fixed_date', 'days_from_issue', 'no_expiry')) DEFAULT 'days_from_issue',
  "validDays" INTEGER DEFAULT 30,
  "fixedStartDate" DATE,
  "fixedEndDate" DATE,
  "imageUrl" TEXT,
  "backgroundColor" VARCHAR(20) DEFAULT '#D4AF37',
  "textColor" VARCHAR(20) DEFAULT '#0A1628',
  "isActive" BOOLEAN DEFAULT true,
  "isTransferable" BOOLEAN DEFAULT false,
  "totalIssued" INTEGER DEFAULT 0,
  "totalRedeemed" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [56/124] Table: voucherInstances
CREATE TABLE IF NOT EXISTS "voucherInstances" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "templateId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "voucherCode" VARCHAR(50) NOT NULL UNIQUE,
  "qrCodeUrl" TEXT,
  "status" TEXT CHECK ("status" IN ('active', 'used', 'expired', 'cancelled', 'transferred')) DEFAULT 'active',
  "remainingUses" INTEGER DEFAULT 1,
  "usedCount" INTEGER DEFAULT 0,
  "validFrom" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMPTZ,
  "issuedBy" INTEGER,
  "issueReason" VARCHAR(255),
  "issueChannel" TEXT CHECK ("issueChannel" IN ('manual', 'campaign', 'birthday', 'referral', 'purchase', 'line')) DEFAULT 'manual',
  "linePushStatus" TEXT CHECK ("linePushStatus" IN ('pending', 'sent', 'failed', 'not_applicable')) DEFAULT 'pending',
  "linePushAt" TIMESTAMPTZ,
  "linePushError" TEXT,
  "originalOwnerId" INTEGER,
  "transferredAt" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [57/124] Table: voucherRedemptions
CREATE TABLE IF NOT EXISTS "voucherRedemptions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "voucherInstanceId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "redemptionMethod" TEXT CHECK ("redemptionMethod" IN ('qr_scan', 'manual_code', 'auto_apply')) DEFAULT 'qr_scan',
  "redeemedBy" INTEGER,
  "orderId" INTEGER,
  "appointmentId" INTEGER,
  "treatmentRecordId" INTEGER,
  "discountApplied" NUMERIC(10, 2),
  "originalAmount" NUMERIC(10, 2),
  "finalAmount" NUMERIC(10, 2),
  "redemptionLocation" VARCHAR(255),
  "notes" TEXT,
  "redeemedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [58/124] Table: voucherBatches
CREATE TABLE IF NOT EXISTS "voucherBatches" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "templateId" INTEGER NOT NULL,
  "batchName" VARCHAR(255) NOT NULL,
  "batchType" TEXT CHECK ("batchType" IN ('manual', 'campaign', 'birthday', 'rfm_segment', 'all_customers')) DEFAULT 'manual',
  "totalRecipients" INTEGER DEFAULT 0,
  "successCount" INTEGER DEFAULT 0,
  "failedCount" INTEGER DEFAULT 0,
  "status" TEXT CHECK ("status" IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  "targetCriteria" JSONB,
  "scheduledAt" TIMESTAMPTZ,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "errorMessage" TEXT,
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [59/124] Table: voucherTransfers
CREATE TABLE IF NOT EXISTS "voucherTransfers" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "voucherInstanceId" INTEGER NOT NULL,
  "fromCustomerId" INTEGER NOT NULL,
  "fromCustomerName" VARCHAR(100),
  "fromCustomerPhone" VARCHAR(20),
  "toCustomerId" INTEGER,
  "toCustomerName" VARCHAR(100),
  "toCustomerPhone" VARCHAR(20) NOT NULL,
  "toCustomerEmail" VARCHAR(320),
  "status" TEXT CHECK ("status" IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')) DEFAULT 'pending',
  "giftMessage" TEXT,
  "claimCode" VARCHAR(50) NOT NULL UNIQUE,
  "claimedAt" TIMESTAMPTZ,
  "notificationSent" BOOLEAN DEFAULT false,
  "notificationChannel" TEXT CHECK ("notificationChannel" IN ('line', 'sms', 'email')) DEFAULT 'line',
  "notificationSentAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [60/124] Table: systemSettings
CREATE TABLE IF NOT EXISTS "systemSettings" (
  "id" SERIAL PRIMARY KEY,
  "key" VARCHAR(100) NOT NULL UNIQUE,
  "value" TEXT,
  "description" TEXT,
  "category" TEXT CHECK ("category" IN ('platform', 'voucher', 'notification', 'system')) DEFAULT 'platform',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [61/124] Table: voucherReminderLogs
CREATE TABLE IF NOT EXISTS "voucherReminderLogs" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "voucherInstanceId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "reminderType" TEXT CHECK ("reminderType" IN ('expiry_warning', 'expiry_final', 'promotion')) DEFAULT 'expiry_warning',
  "daysBeforeExpiry" INTEGER,
  "status" TEXT CHECK ("status" IN ('pending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
  "channel" TEXT CHECK ("channel" IN ('line', 'sms', 'email')) DEFAULT 'line',
  "scheduledAt" TIMESTAMPTZ,
  "sentAt" TIMESTAMPTZ,
  "errorMessage" TEXT,
  "lineMessageId" VARCHAR(100),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [62/124] Table: dailySettlements
CREATE TABLE IF NOT EXISTS "dailySettlements" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "settlementDate" DATE NOT NULL,
  "openingCash" NUMERIC(12, 2) DEFAULT '0',
  "openedBy" INTEGER,
  "openedAt" TIMESTAMPTZ,
  "closingCash" NUMERIC(12, 2),
  "closedBy" INTEGER,
  "closedAt" TIMESTAMPTZ,
  "totalRevenue" NUMERIC(12, 2) DEFAULT '0',
  "cashRevenue" NUMERIC(12, 2) DEFAULT '0',
  "cardRevenue" NUMERIC(12, 2) DEFAULT '0',
  "linePayRevenue" NUMERIC(12, 2) DEFAULT '0',
  "otherRevenue" NUMERIC(12, 2) DEFAULT '0',
  "totalOrders" INTEGER DEFAULT 0,
  "completedOrders" INTEGER DEFAULT 0,
  "cancelledOrders" INTEGER DEFAULT 0,
  "refundedOrders" INTEGER DEFAULT 0,
  "totalAppointments" INTEGER DEFAULT 0,
  "completedAppointments" INTEGER DEFAULT 0,
  "noShowAppointments" INTEGER DEFAULT 0,
  "cashDifference" NUMERIC(12, 2) DEFAULT '0',
  "cashDifferenceNote" TEXT,
  "status" TEXT CHECK ("status" IN ('open', 'closed', 'reconciled')) DEFAULT 'open',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [63/124] Table: settlementItems
CREATE TABLE IF NOT EXISTS "settlementItems" (
  "id" SERIAL PRIMARY KEY,
  "settlementId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "appointmentId" INTEGER,
  "itemType" TEXT CHECK ("itemType" IN ('sale', 'refund', 'deposit', 'withdrawal', 'adjustment')) NOT NULL,
  "paymentMethod" TEXT CHECK ("paymentMethod" IN ('cash', 'credit_card', 'debit_card', 'line_pay', 'transfer', 'other')) NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "description" TEXT,
  "customerId" INTEGER,
  "customerName" VARCHAR(255),
  "staffId" INTEGER,
  "staffName" VARCHAR(255),
  "transactionAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [64/124] Table: cashDrawerRecords
CREATE TABLE IF NOT EXISTS "cashDrawerRecords" (
  "id" SERIAL PRIMARY KEY,
  "settlementId" INTEGER NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "operationType" TEXT CHECK ("operationType" IN ('open', 'close', 'deposit', 'withdrawal', 'count')) NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "balanceBefore" NUMERIC(12, 2),
  "balanceAfter" NUMERIC(12, 2),
  "operatedBy" INTEGER NOT NULL,
  "operatorName" VARCHAR(255),
  "reason" TEXT,
  "operatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [65/124] Table: paymentRecords
CREATE TABLE IF NOT EXISTS "paymentRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "appointmentId" INTEGER,
  "customerId" INTEGER,
  "paymentMethod" TEXT CHECK ("paymentMethod" IN ('cash', 'credit_card', 'debit_card', 'line_pay', 'transfer', 'other')) NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "currency" VARCHAR(10) DEFAULT 'TWD',
  "status" TEXT CHECK ("status" IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  "transactionId" VARCHAR(255),
  "referenceNumber" VARCHAR(100),
  "paidAt" TIMESTAMPTZ,
  "refundedAmount" NUMERIC(12, 2) DEFAULT '0',
  "refundedAt" TIMESTAMPTZ,
  "refundReason" TEXT,
  "processedBy" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [66/124] Table: lineChannelConfigs
CREATE TABLE IF NOT EXISTS "lineChannelConfigs" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER,
  "isPlatformLevel" BOOLEAN DEFAULT false,
  "channelId" VARCHAR(100) NOT NULL,
  "channelSecret" TEXT NOT NULL,
  "channelAccessToken" TEXT NOT NULL,
  "liffId" VARCHAR(100),
  "isActive" BOOLEAN DEFAULT true,
  "lastVerifiedAt" TIMESTAMPTZ,
  "verificationStatus" TEXT CHECK ("verificationStatus" IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [67/124] Table: autoSettlementSettings
CREATE TABLE IF NOT EXISTS "autoSettlementSettings" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL UNIQUE,
  "isEnabled" BOOLEAN DEFAULT false,
  "autoSettleTime" VARCHAR(10) DEFAULT '23:00',
  "timezone" VARCHAR(50) DEFAULT 'Asia/Taipei',
  "autoGenerateReport" BOOLEAN DEFAULT true,
  "reportRecipients" JSONB,
  "reportFormat" TEXT CHECK ("reportFormat" IN ('pdf', 'excel', 'both')) DEFAULT 'pdf',
  "sendLineNotification" BOOLEAN DEFAULT false,
  "lineNotifyRecipients" JSONB,
  "lastExecutedAt" TIMESTAMPTZ,
  "lastExecutionStatus" TEXT CHECK ("lastExecutionStatus" IN ('success', 'failed', 'skipped')),
  "lastExecutionError" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [68/124] Table: settlementReports
CREATE TABLE IF NOT EXISTS "settlementReports" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "settlementId" INTEGER,
  "reportType" TEXT CHECK ("reportType" IN ('daily', 'weekly', 'monthly', 'custom')) DEFAULT 'daily',
  "periodStart" DATE NOT NULL,
  "periodEnd" DATE NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "reportData" JSONB,
  "totalRevenue" NUMERIC(14, 2) DEFAULT '0',
  "cashRevenue" NUMERIC(14, 2) DEFAULT '0',
  "cardRevenue" NUMERIC(14, 2) DEFAULT '0',
  "linePayRevenue" NUMERIC(14, 2) DEFAULT '0',
  "otherRevenue" NUMERIC(14, 2) DEFAULT '0',
  "totalOrders" INTEGER DEFAULT 0,
  "averageOrderValue" NUMERIC(10, 2) DEFAULT '0',
  "totalAppointments" INTEGER DEFAULT 0,
  "completedAppointments" INTEGER DEFAULT 0,
  "pdfUrl" TEXT,
  "excelUrl" TEXT,
  "generatedBy" TEXT CHECK ("generatedBy" IN ('auto', 'manual')) DEFAULT 'manual',
  "generatedByUserId" INTEGER,
  "status" TEXT CHECK ("status" IN ('generating', 'completed', 'failed')) DEFAULT 'generating',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [69/124] Table: revenueTrendSnapshots
CREATE TABLE IF NOT EXISTS "revenueTrendSnapshots" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "snapshotDate" DATE NOT NULL,
  "periodType" TEXT CHECK ("periodType" IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  "totalRevenue" NUMERIC(14, 2) DEFAULT '0',
  "cashRevenue" NUMERIC(14, 2) DEFAULT '0',
  "cardRevenue" NUMERIC(14, 2) DEFAULT '0',
  "linePayRevenue" NUMERIC(14, 2) DEFAULT '0',
  "otherRevenue" NUMERIC(14, 2) DEFAULT '0',
  "totalOrders" INTEGER DEFAULT 0,
  "averageOrderValue" NUMERIC(10, 2) DEFAULT '0',
  "totalAppointments" INTEGER DEFAULT 0,
  "completedAppointments" INTEGER DEFAULT 0,
  "newCustomers" INTEGER DEFAULT 0,
  "returningCustomers" INTEGER DEFAULT 0,
  "hourlyRevenue" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [70/124] Table: lineChannelSettings
CREATE TABLE IF NOT EXISTS "lineChannelSettings" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL UNIQUE,
  "channelId" VARCHAR(100),
  "channelSecret" VARCHAR(100),
  "channelAccessToken" TEXT,
  "liffId" VARCHAR(100),
  "webhookUrl" TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "verifiedAt" TIMESTAMPTZ,
  "botBasicId" VARCHAR(100),
  "botDisplayName" VARCHAR(255),
  "botPictureUrl" TEXT,
  "richMenuId" VARCHAR(100),
  "notificationEnabled" BOOLEAN DEFAULT true,
  "appointmentReminderEnabled" BOOLEAN DEFAULT true,
  "marketingMessageEnabled" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [71/124] Table: importRecords
CREATE TABLE IF NOT EXISTS "importRecords" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "importType" TEXT CHECK ("importType" IN ('customer', 'product', 'staff', 'appointment', 'order')) NOT NULL,
  "fileName" VARCHAR(255) NOT NULL,
  "fileUrl" TEXT,
  "totalRows" INTEGER DEFAULT 0,
  "successRows" INTEGER DEFAULT 0,
  "failedRows" INTEGER DEFAULT 0,
  "status" TEXT CHECK ("status" IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  "errorLog" JSONB,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [72/124] Table: paymentSettings
CREATE TABLE IF NOT EXISTS "paymentSettings" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "provider" TEXT CHECK ("provider" IN ('lemonsqueezy', 'ecpay', 'stripe', 'linepay', 'jkopay')) NOT NULL,
  "isEnabled" BOOLEAN DEFAULT false,
  "isTestMode" BOOLEAN DEFAULT true,
  "lsApiKey" TEXT,
  "lsStoreId" VARCHAR(100),
  "lsWebhookSecret" TEXT,
  "ecpayMerchantId" VARCHAR(50),
  "ecpayHashKey" VARCHAR(100),
  "ecpayHashIv" VARCHAR(100),
  "stripePublishableKey" TEXT,
  "stripeSecretKey" TEXT,
  "stripeWebhookSecret" TEXT,
  "linePayChannelId" VARCHAR(100),
  "linePayChannelSecret" TEXT,
  "jkopayMerchantId" VARCHAR(100),
  "jkopayApiKey" TEXT,
  "defaultCurrency" VARCHAR(10) DEFAULT 'TWD',
  "webhookUrl" TEXT,
  "returnUrl" TEXT,
  "cancelUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [73/124] Table: paymentTransactions
CREATE TABLE IF NOT EXISTS "paymentTransactions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "customerId" INTEGER,
  "provider" TEXT CHECK ("provider" IN ('lemonsqueezy', 'ecpay', 'stripe', 'linepay', 'jkopay', 'cash', 'transfer')) NOT NULL,
  "transactionId" VARCHAR(255),
  "externalTransactionId" VARCHAR(255),
  "amount" NUMERIC(12, 2) NOT NULL,
  "currency" VARCHAR(10) DEFAULT 'TWD',
  "status" TEXT CHECK ("status" IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  "paymentMethod" VARCHAR(100),
  "cardLast4" VARCHAR(4),
  "receiptUrl" TEXT,
  "refundAmount" NUMERIC(12, 2),
  "refundReason" TEXT,
  "refundedAt" TIMESTAMPTZ,
  "metadata" JSONB,
  "errorMessage" TEXT,
  "paidAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [74/124] Table: subscriptionPlans
CREATE TABLE IF NOT EXISTS "subscriptionPlans" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "provider" TEXT CHECK ("provider" IN ('lemonsqueezy', 'stripe')) DEFAULT 'lemonsqueezy',
  "externalProductId" VARCHAR(100),
  "externalVariantId" VARCHAR(100),
  "price" NUMERIC(10, 2) NOT NULL,
  "currency" VARCHAR(10) DEFAULT 'TWD',
  "billingInterval" TEXT CHECK ("billingInterval" IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  "features" JSONB,
  "maxUsers" INTEGER DEFAULT 5,
  "maxCustomers" INTEGER DEFAULT 500,
  "maxAppointments" INTEGER DEFAULT 1000,
  "isActive" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [75/124] Table: organizationSubscriptions
CREATE TABLE IF NOT EXISTS "organizationSubscriptions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "planId" INTEGER NOT NULL,
  "provider" TEXT CHECK ("provider" IN ('lemonsqueezy', 'stripe')) DEFAULT 'lemonsqueezy',
  "externalSubscriptionId" VARCHAR(255),
  "externalCustomerId" VARCHAR(255),
  "status" TEXT CHECK ("status" IN ('active', 'past_due', 'cancelled', 'paused', 'trialing')) DEFAULT 'trialing',
  "currentPeriodStart" TIMESTAMPTZ,
  "currentPeriodEnd" TIMESTAMPTZ,
  "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
  "cancelledAt" TIMESTAMPTZ,
  "trialEndsAt" TIMESTAMPTZ,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [76/124] Table: attendanceSettings
CREATE TABLE IF NOT EXISTS "attendanceSettings" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL UNIQUE,
  "clinicLatitude" NUMERIC(10, 7),
  "clinicLongitude" NUMERIC(10, 7),
  "clinicAddress" TEXT,
  "validDistance" INTEGER DEFAULT 100,
  "enableGeofence" BOOLEAN DEFAULT false,
  "allowOfflineClockIn" BOOLEAN DEFAULT true,
  "autoClockOutHours" INTEGER DEFAULT 12,
  "requirePhoto" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [77/124] Table: games
CREATE TABLE IF NOT EXISTS "games" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "maxPlaysPerDay" INTEGER DEFAULT -1,
  "settings" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [78/124] Table: prizes
CREATE TABLE IF NOT EXISTS "prizes" (
  "id" SERIAL PRIMARY KEY,
  "gameId" INTEGER NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "type" TEXT CHECK ("type" IN ('coupon', 'gift', 'points', 'service')) DEFAULT 'gift',
  "value" NUMERIC(10, 2),
  "quantity" INTEGER DEFAULT -1,
  "remainingQuantity" INTEGER DEFAULT -1,
  "probability" NUMERIC(5, 4) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [79/124] Table: gamePlays
CREATE TABLE IF NOT EXISTS "gamePlays" (
  "id" SERIAL PRIMARY KEY,
  "gameId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "playedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "result" TEXT CHECK ("result" IN ('win', 'lose')) NOT NULL,
  "prizeId" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [80/124] Table: userPrizes
CREATE TABLE IF NOT EXISTS "userPrizes" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "prizeId" INTEGER NOT NULL,
  "gamePlayId" INTEGER NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "wonAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isRedeemed" BOOLEAN DEFAULT false,
  "redeemedAt" TIMESTAMPTZ,
  "redeemedBy" INTEGER,
  "expiresAt" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [81/124] Table: performanceRecords
CREATE TABLE IF NOT EXISTS "performanceRecords" (
  "id" VARCHAR(191) PRIMARY KEY,
  "clinicId" VARCHAR(191) NOT NULL,
  "staffId" VARCHAR(191) NOT NULL,
  "recordDate" TIMESTAMPTZ NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL DEFAULT '0.00',
  "type" VARCHAR(50) NOT NULL,
  "relatedId" VARCHAR(191),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [82/124] Table: performanceTargets
CREATE TABLE IF NOT EXISTS "performanceTargets" (
  "id" VARCHAR(191) PRIMARY KEY,
  "clinicId" VARCHAR(191) NOT NULL,
  "staffId" VARCHAR(191) NOT NULL,
  "periodType" VARCHAR(50) NOT NULL,
  "year" INTEGER NOT NULL,
  "period" INTEGER NOT NULL,
  "targetAmount" NUMERIC(10, 2) NOT NULL DEFAULT '0.00',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [83/124] Table: inventory_system_b
CREATE TABLE IF NOT EXISTS "inventory_system_b" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "batch_number" VARCHAR(100),
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "min_stock" INTEGER DEFAULT 10,
  "expiry_date" DATE,
  "location" VARCHAR(100),
  "supplier" VARCHAR(255),
  "inventory_status_b" TEXT CHECK ("inventory_status_b" IN ('in_stock', 'low_stock', 'expired')) DEFAULT 'in_stock',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [84/124] Table: crm_tags_system_b
CREATE TABLE IF NOT EXISTS "crm_tags_system_b" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "description" TEXT,
  "color" VARCHAR(20) DEFAULT '#000000',
  "category" VARCHAR(50),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [85/124] Table: customer_tags_system_b
CREATE TABLE IF NOT EXISTS "customer_tags_system_b" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INTEGER NOT NULL,
  "tag_id" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [86/124] Table: games_system_b
CREATE TABLE IF NOT EXISTS "games_system_b" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "game_type_b" TEXT CHECK ("game_type_b" IN ('ichiban_kuji', 'slot_machine', 'wheel')) NOT NULL,
  "game_status_b" TEXT CHECK ("game_status_b" IN ('draft', 'active', 'paused', 'ended')) DEFAULT 'draft',
  "start_date" TIMESTAMPTZ,
  "end_date" TIMESTAMPTZ,
  "description" TEXT,
  "rules" JSONB,
  "image_url" TEXT,
  "cost_points" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [87/124] Table: prizes_system_b
CREATE TABLE IF NOT EXISTS "prizes_system_b" (
  "id" SERIAL PRIMARY KEY,
  "game_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "prize_type_b" TEXT CHECK ("prize_type_b" IN ('physical', 'coupon', 'points')) DEFAULT 'physical',
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "remaining_quantity" INTEGER NOT NULL DEFAULT 0,
  "probability" NUMERIC(5, 2) DEFAULT '0',
  "image_url" TEXT,
  "value" NUMERIC(10, 2),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [88/124] Table: game_participations_system_b
CREATE TABLE IF NOT EXISTS "game_participations_system_b" (
  "id" SERIAL PRIMARY KEY,
  "game_id" INTEGER NOT NULL,
  "customer_id" INTEGER NOT NULL,
  "prize_id" INTEGER,
  "played_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_claimed" BOOLEAN DEFAULT false,
  "claimed_at" TIMESTAMPTZ
);

-- [89/124] Table: staff_commissions_system_b
CREATE TABLE IF NOT EXISTS "staff_commissions_system_b" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "staff_id" INTEGER NOT NULL,
  "period" VARCHAR(7) NOT NULL,
  "total_sales" NUMERIC(12, 2) DEFAULT '0',
  "commission_amount" NUMERIC(10, 2) DEFAULT '0',
  "commission_status_b" TEXT CHECK ("commission_status_b" IN ('calculated', 'approved', 'paid')) DEFAULT 'calculated',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [90/124] Table: inventory_transfers_system_b
CREATE TABLE IF NOT EXISTS "inventory_transfers_system_b" (
  "id" SERIAL PRIMARY KEY,
  "from_org_id" INTEGER NOT NULL,
  "to_org_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "transfer_status_b" TEXT CHECK ("transfer_status_b" IN ('pending', 'approved', 'shipped', 'received', 'cancelled')) DEFAULT 'pending',
  "requested_by" INTEGER,
  "approved_by" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [91/124] Table: interactions
CREATE TABLE IF NOT EXISTS "interactions" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "customer_id" INTEGER NOT NULL,
  "type" TEXT CHECK ("type" IN ('phone', 'meeting', 'line', 'appointment', 'treatment', 'note')) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT,
  "created_by" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [92/124] Table: tag_rules
CREATE TABLE IF NOT EXISTS "tag_rules" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "tag_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "rule_type" TEXT CHECK ("rule_type" IN ('spending', 'visit_count', 'last_visit', 'member_level')) NOT NULL,
  "condition" JSONB NOT NULL,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [93/124] Table: line_messaging_settings
CREATE TABLE IF NOT EXISTS "line_messaging_settings" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL UNIQUE,
  "channel_access_token" TEXT NOT NULL,
  "channel_secret" VARCHAR(255) NOT NULL,
  "webhook_url" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [94/124] Table: line_webhook_events
CREATE TABLE IF NOT EXISTS "line_webhook_events" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "event_type" VARCHAR(50) NOT NULL,
  "source_type" VARCHAR(20) NOT NULL,
  "source_id" VARCHAR(100) NOT NULL,
  "message_type" VARCHAR(20),
  "message_text" TEXT,
  "message_id" VARCHAR(100),
  "reply_token" VARCHAR(100),
  "raw_payload" JSONB NOT NULL,
  "is_processed" BOOLEAN NOT NULL DEFAULT false,
  "processed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [95/124] Table: auto_reply_rules
CREATE TABLE IF NOT EXISTS "auto_reply_rules" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "trigger_type" TEXT CHECK ("trigger_type" IN ('keyword', 'regex', 'always')) NOT NULL,
  "trigger_value" TEXT,
  "reply_type" TEXT CHECK ("reply_type" IN ('text', 'flex', 'template')) NOT NULL,
  "reply_content" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [96/124] Table: rich_menu_templates
CREATE TABLE IF NOT EXISTS "rich_menu_templates" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "richMenuId" VARCHAR(255),
  "imageUrl" TEXT,
  "chatBarText" VARCHAR(14) NOT NULL,
  "areas" JSONB NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "targetAudience" VARCHAR(50),
  "abTestGroup" VARCHAR(50),
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [97/124] Table: rich_menu_assignments
CREATE TABLE IF NOT EXISTS "rich_menu_assignments" (
  "id" SERIAL PRIMARY KEY,
  "templateId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "lineUserId" VARCHAR(255) NOT NULL,
  "assignedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [98/124] Table: rich_menu_click_stats
CREATE TABLE IF NOT EXISTS "rich_menu_click_stats" (
  "id" SERIAL PRIMARY KEY,
  "templateId" INTEGER NOT NULL,
  "customerId" INTEGER,
  "lineUserId" VARCHAR(255) NOT NULL,
  "areaIndex" INTEGER NOT NULL,
  "clickedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [99/124] Table: broadcast_campaigns
CREATE TABLE IF NOT EXISTS "broadcast_campaigns" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "messageType" VARCHAR(50) NOT NULL,
  "messageContent" JSONB NOT NULL,
  "targetAudience" JSONB NOT NULL,
  "scheduledAt" TIMESTAMPTZ,
  "status" VARCHAR(50) DEFAULT 'draft',
  "totalRecipients" INTEGER DEFAULT 0,
  "sentCount" INTEGER DEFAULT 0,
  "deliveredCount" INTEGER DEFAULT 0,
  "clickedCount" INTEGER DEFAULT 0,
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [100/124] Table: broadcast_recipients
CREATE TABLE IF NOT EXISTS "broadcast_recipients" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "lineUserId" VARCHAR(255) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pending',
  "sentAt" TIMESTAMPTZ,
  "deliveredAt" TIMESTAMPTZ,
  "clickedAt" TIMESTAMPTZ,
  "errorMessage" TEXT
);

-- [101/124] Table: ai_conversations
CREATE TABLE IF NOT EXISTS "ai_conversations" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "customerId" INTEGER,
  "lineUserId" VARCHAR(255) NOT NULL,
  "sessionId" VARCHAR(255) NOT NULL,
  "userMessage" TEXT NOT NULL,
  "aiResponse" TEXT NOT NULL,
  "intent" VARCHAR(100),
  "confidence" NUMERIC(5, 2),
  "context" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [102/124] Table: ai_intents
CREATE TABLE IF NOT EXISTS "ai_intents" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "keywords" JSONB NOT NULL,
  "trainingExamples" JSONB,
  "responseTemplate" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [103/124] Table: ai_knowledge_base
CREATE TABLE IF NOT EXISTS "ai_knowledge_base" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "keywords" JSONB,
  "priority" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [104/124] Table: rich_menu_template_market
CREATE TABLE IF NOT EXISTS "rich_menu_template_market" (
  "id" SERIAL PRIMARY KEY,
  "category" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "imageUrl" VARCHAR(500) NOT NULL,
  "imageWidth" INTEGER NOT NULL,
  "imageHeight" INTEGER NOT NULL,
  "areas" JSONB NOT NULL,
  "tags" JSONB,
  "usageCount" INTEGER DEFAULT 0,
  "rating" NUMERIC(3, 2),
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [105/124] Table: broadcast_campaign_variants
CREATE TABLE IF NOT EXISTS "broadcast_campaign_variants" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL,
  "variantName" VARCHAR(100) NOT NULL,
  "messageContent" TEXT NOT NULL,
  "messageType" VARCHAR(50) NOT NULL,
  "flexMessageJson" JSONB,
  "trafficPercentage" INTEGER NOT NULL,
  "sentCount" INTEGER DEFAULT 0,
  "openedCount" INTEGER DEFAULT 0,
  "clickedCount" INTEGER DEFAULT 0,
  "convertedCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [106/124] Table: ai_knowledge_base_vectors
CREATE TABLE IF NOT EXISTS "ai_knowledge_base_vectors" (
  "id" SERIAL PRIMARY KEY,
  "knowledgeBaseId" INTEGER NOT NULL,
  "embedding" JSONB NOT NULL,
  "embeddingModel" VARCHAR(100) DEFAULT 'text-embedding-ada-002',
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [107/124] Table: inventory
CREATE TABLE IF NOT EXISTS "inventory" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "batch_number" VARCHAR(100),
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "min_stock" INTEGER DEFAULT 10,
  "expiry_date" DATE,
  "location" VARCHAR(100),
  "supplier" VARCHAR(255),
  "status" TEXT CHECK ("status" IN ('in_stock', 'low_stock', 'expired')) DEFAULT 'in_stock',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [108/124] Table: crm_tags
CREATE TABLE IF NOT EXISTS "crm_tags" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "color" VARCHAR(20) DEFAULT '#000000',
  "category" VARCHAR(50),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [109/124] Table: customer_tags
CREATE TABLE IF NOT EXISTS "customer_tags" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INTEGER NOT NULL,
  "tag_id" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);




-- [113/124] Table: staff_commissions
CREATE TABLE IF NOT EXISTS "staff_commissions" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" INTEGER NOT NULL,
  "staff_id" INTEGER NOT NULL,
  "period" VARCHAR(7) NOT NULL,
  "total_sales" NUMERIC(12, 2) DEFAULT '0',
  "commission_amount" NUMERIC(10, 2) DEFAULT '0',
  "status" TEXT CHECK ("status" IN ('calculated', 'approved', 'paid')) DEFAULT 'calculated',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- [115/124] Table: lemonsqueezy_plans
CREATE TABLE IF NOT EXISTS "lemonsqueezy_plans" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "lemonSqueezyProductId" VARCHAR(255) NOT NULL,
  "lemonSqueezyVariantId" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" NUMERIC(10, 2) NOT NULL,
  "currency" VARCHAR(10) NOT NULL DEFAULT 'TWD',
  "interval" TEXT CHECK ("interval" IN ('month', 'year', 'one_time')) NOT NULL,
  "intervalCount" INTEGER NOT NULL DEFAULT 1,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [116/124] Table: lemonsqueezy_subscriptions
CREATE TABLE IF NOT EXISTS "lemonsqueezy_subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "planId" INTEGER NOT NULL,
  "lemonSqueezySubscriptionId" VARCHAR(255) NOT NULL UNIQUE,
  "lemonSqueezyCustomerId" VARCHAR(255) NOT NULL,
  "lemonSqueezyOrderId" VARCHAR(255),
  "status" TEXT CHECK ("status" IN ('active', 'cancelled', 'expired', 'on_trial', 'paused', 'past_due', 'unpaid')) NOT NULL,
  "trialEndsAt" TIMESTAMPTZ,
  "renewsAt" TIMESTAMPTZ,
  "endsAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [117/124] Table: lemonsqueezy_payments
CREATE TABLE IF NOT EXISTS "lemonsqueezy_payments" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "subscriptionId" INTEGER,
  "lemonSqueezyOrderId" VARCHAR(255) NOT NULL UNIQUE,
  "lemonSqueezyCustomerId" VARCHAR(255) NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL,
  "currency" VARCHAR(10) NOT NULL DEFAULT 'TWD',
  "status" TEXT CHECK ("status" IN ('active', 'cancelled', 'expired', 'on_trial', 'paused', 'past_due', 'unpaid')) NOT NULL,
  "refundAmount" NUMERIC(10, 2),
  "refundedAt" TIMESTAMPTZ,
  "receiptUrl" VARCHAR(500),
  "invoiceUrl" VARCHAR(500),
  "paidAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [118/124] Table: lemonsqueezy_webhook_events
CREATE TABLE IF NOT EXISTS "lemonsqueezy_webhook_events" (
  "id" SERIAL PRIMARY KEY,
  "lemonSqueezyEventId" VARCHAR(255) NOT NULL UNIQUE,
  "eventName" VARCHAR(255) NOT NULL,
  "payload" TEXT NOT NULL,
  "processed" INTEGER NOT NULL DEFAULT 0,
  "processedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [119/124] Table: line_rich_menus
CREATE TABLE IF NOT EXISTS "line_rich_menus" (
  "id" SERIAL PRIMARY KEY,
  "organizationId" INTEGER NOT NULL,
  "richMenuId" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "chatBarText" VARCHAR(14) NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "imageKey" TEXT,
  "areas" JSONB NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "clickCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [120/124] Table: leave_requests
CREATE TABLE IF NOT EXISTS "leave_requests" (
  "id" VARCHAR(36) PRIMARY KEY,
  "clinicId" VARCHAR(36) NOT NULL,
  "staffId" VARCHAR(36) NOT NULL,
  "leave_type" TEXT CHECK ("leave_type" IN ('病假', '事假', '特休', '育嬰假', '喪假', '婚假', '產假', '陪產假', '其他')) NOT NULL,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ NOT NULL,
  "reason" TEXT,
  "status" TEXT CHECK ("status" IN ('active', 'cancelled', 'expired', 'on_trial', 'paused', 'past_due', 'unpaid')) NOT NULL DEFAULT 'pending',
  "reviewerId" VARCHAR(36),
  "reviewedAt" TIMESTAMPTZ,
  "reviewNote" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [121/124] Table: attendance_records
CREATE TABLE IF NOT EXISTS "attendance_records" (
  "check_in_address" TEXT,
  "check_out_address" TEXT,
  "is_within_geofence" BOOLEAN DEFAULT true
);

-- [122/124] Table: attendance_settings
CREATE TABLE IF NOT EXISTS "attendance_settings" (
  "valid_distance" INTEGER DEFAULT 100,
  "enable_geofence" BOOLEAN DEFAULT false,
  "allow_offline_clock_in" BOOLEAN DEFAULT true
);

-- [123/124] Table: performance_records
CREATE TABLE IF NOT EXISTS "performance_records" (
  "id" VARCHAR(191) PRIMARY KEY,
  "clinicId" VARCHAR(191) NOT NULL,
  "staffId" VARCHAR(191) NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL DEFAULT '0.00',
  "type" VARCHAR(50) NOT NULL,
  "relatedId" VARCHAR(191),
  "notes" TEXT
);

-- [124/124] Table: performance_targets
CREATE TABLE IF NOT EXISTS "performance_targets" (
  "id" VARCHAR(191) PRIMARY KEY,
  "clinicId" VARCHAR(191) NOT NULL,
  "staffId" VARCHAR(191) NOT NULL,
  "periodType" VARCHAR(50) NOT NULL,
  "year" INTEGER NOT NULL,
  "period" INTEGER NOT NULL,
  "targetAmount" NUMERIC(10, 2) NOT NULL DEFAULT '0.00',
  "notes" TEXT
);

-- ============================================================
-- TRIGGER: Auto-update updatedAt column
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_updated_at_users"
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_organizations"
  BEFORE UPDATE ON "organizations"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_organizationUsers"
  BEFORE UPDATE ON "organizationUsers"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_customers"
  BEFORE UPDATE ON "customers"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_products"
  BEFORE UPDATE ON "products"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_staff"
  BEFORE UPDATE ON "staff"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_appointments"
  BEFORE UPDATE ON "appointments"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_schedules"
  BEFORE UPDATE ON "schedules"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_attendanceRecords"
  BEFORE UPDATE ON "attendanceRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_coupons"
  BEFORE UPDATE ON "coupons"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_orders"
  BEFORE UPDATE ON "orders"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_aftercareRecords"
  BEFORE UPDATE ON "aftercareRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_lineChannels"
  BEFORE UPDATE ON "lineChannels"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_treatmentRecords"
  BEFORE UPDATE ON "treatmentRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_customerPackages"
  BEFORE UPDATE ON "customerPackages"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_consultations"
  BEFORE UPDATE ON "consultations"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_followUps"
  BEFORE UPDATE ON "followUps"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_customerRfmScores"
  BEFORE UPDATE ON "customerRfmScores"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_commissionRules"
  BEFORE UPDATE ON "commissionRules"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_staffCommissions"
  BEFORE UPDATE ON "staffCommissions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_revenueTargets"
  BEFORE UPDATE ON "revenueTargets"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_marketingCampaigns"
  BEFORE UPDATE ON "marketingCampaigns"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_customerSources"
  BEFORE UPDATE ON "customerSources"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_satisfactionSurveys"
  BEFORE UPDATE ON "satisfactionSurveys"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_waitlist"
  BEFORE UPDATE ON "waitlist"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_injectionRecords"
  BEFORE UPDATE ON "injectionRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_consentFormTemplates"
  BEFORE UPDATE ON "consentFormTemplates"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_consentSignatures"
  BEFORE UPDATE ON "consentSignatures"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_medications"
  BEFORE UPDATE ON "medications"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_prescriptions"
  BEFORE UPDATE ON "prescriptions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_customerAllergies"
  BEFORE UPDATE ON "customerAllergies"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_skinAnalysisRecords"
  BEFORE UPDATE ON "skinAnalysisRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_membershipPlans"
  BEFORE UPDATE ON "membershipPlans"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_memberSubscriptions"
  BEFORE UPDATE ON "memberSubscriptions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_subscriptionPayments"
  BEFORE UPDATE ON "subscriptionPayments"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_teleConsultations"
  BEFORE UPDATE ON "teleConsultations"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_referralCodes"
  BEFORE UPDATE ON "referralCodes"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_referralRecords"
  BEFORE UPDATE ON "referralRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_referralRewards"
  BEFORE UPDATE ON "referralRewards"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_socialAccounts"
  BEFORE UPDATE ON "socialAccounts"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_scheduledPosts"
  BEFORE UPDATE ON "scheduledPosts"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_backgroundJobs"
  BEFORE UPDATE ON "backgroundJobs"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_voucherTemplates"
  BEFORE UPDATE ON "voucherTemplates"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_voucherInstances"
  BEFORE UPDATE ON "voucherInstances"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_voucherBatches"
  BEFORE UPDATE ON "voucherBatches"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_voucherTransfers"
  BEFORE UPDATE ON "voucherTransfers"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_systemSettings"
  BEFORE UPDATE ON "systemSettings"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_voucherReminderLogs"
  BEFORE UPDATE ON "voucherReminderLogs"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_dailySettlements"
  BEFORE UPDATE ON "dailySettlements"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_paymentRecords"
  BEFORE UPDATE ON "paymentRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_lineChannelConfigs"
  BEFORE UPDATE ON "lineChannelConfigs"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_autoSettlementSettings"
  BEFORE UPDATE ON "autoSettlementSettings"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_settlementReports"
  BEFORE UPDATE ON "settlementReports"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_lineChannelSettings"
  BEFORE UPDATE ON "lineChannelSettings"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_paymentSettings"
  BEFORE UPDATE ON "paymentSettings"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_paymentTransactions"
  BEFORE UPDATE ON "paymentTransactions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_subscriptionPlans"
  BEFORE UPDATE ON "subscriptionPlans"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_organizationSubscriptions"
  BEFORE UPDATE ON "organizationSubscriptions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_attendanceSettings"
  BEFORE UPDATE ON "attendanceSettings"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_games"
  BEFORE UPDATE ON "games"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_prizes"
  BEFORE UPDATE ON "prizes"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_userPrizes"
  BEFORE UPDATE ON "userPrizes"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_performanceRecords"
  BEFORE UPDATE ON "performanceRecords"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_performanceTargets"
  BEFORE UPDATE ON "performanceTargets"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_inventory_system_b"
  BEFORE UPDATE ON "inventory_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_games_system_b"
  BEFORE UPDATE ON "games_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_prizes_system_b"
  BEFORE UPDATE ON "prizes_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_staff_commissions_system_b"
  BEFORE UPDATE ON "staff_commissions_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_inventory_transfers_system_b"
  BEFORE UPDATE ON "inventory_transfers_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_interactions"
  BEFORE UPDATE ON "interactions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_tag_rules"
  BEFORE UPDATE ON "tag_rules"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_line_messaging_settings"
  BEFORE UPDATE ON "line_messaging_settings"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_auto_reply_rules"
  BEFORE UPDATE ON "auto_reply_rules"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_rich_menu_templates"
  BEFORE UPDATE ON "rich_menu_templates"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_broadcast_campaigns"
  BEFORE UPDATE ON "broadcast_campaigns"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_ai_intents"
  BEFORE UPDATE ON "ai_intents"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_ai_knowledge_base"
  BEFORE UPDATE ON "ai_knowledge_base"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_rich_menu_template_market"
  BEFORE UPDATE ON "rich_menu_template_market"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_broadcast_campaign_variants"
  BEFORE UPDATE ON "broadcast_campaign_variants"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_ai_knowledge_base_vectors"
  BEFORE UPDATE ON "ai_knowledge_base_vectors"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_inventory"
  BEFORE UPDATE ON "inventory"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_games_system_b"
  BEFORE UPDATE ON "games_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_prizes_system_b"
  BEFORE UPDATE ON "prizes_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_staff_commissions"
  BEFORE UPDATE ON "staff_commissions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_inventory_transfers_system_b"
  BEFORE UPDATE ON "inventory_transfers_system_b"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_lemonsqueezy_plans"
  BEFORE UPDATE ON "lemonsqueezy_plans"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_lemonsqueezy_subscriptions"
  BEFORE UPDATE ON "lemonsqueezy_subscriptions"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_lemonsqueezy_payments"
  BEFORE UPDATE ON "lemonsqueezy_payments"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_line_rich_menus"
  BEFORE UPDATE ON "line_rich_menus"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER "set_updated_at_leave_requests"
  BEFORE UPDATE ON "leave_requests"
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizationUsers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customerTags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customerTagRelations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointmentSlots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendanceRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orderItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aftercareRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineChannels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activityLogs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "treatmentRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "treatmentPhotos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customerPackages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "packageUsageRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consultations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "followUps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customerRfmScores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commissionRules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staffCommissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventoryTransactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "revenueTargets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "marketingCampaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customerSources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "satisfactionSurveys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "waitlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "injectionRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "injectionPoints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consentFormTemplates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consentSignatures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "medications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prescriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customerAllergies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skinAnalysisRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skinMetrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "membershipPlans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberSubscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptionPayments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teleConsultations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consultationRecordings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "referralCodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "referralRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "referralRewards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "socialAccounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scheduledPosts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "socialAnalytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "backgroundJobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucherTemplates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucherInstances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucherRedemptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucherBatches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucherTransfers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "systemSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucherReminderLogs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dailySettlements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settlementItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cashDrawerRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paymentRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineChannelConfigs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "autoSettlementSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settlementReports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "revenueTrendSnapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineChannelSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "importRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paymentSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paymentTransactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptionPlans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizationSubscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendanceSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "games" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prizes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gamePlays" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "userPrizes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "performanceRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "performanceTargets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm_tags_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_tags_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "games_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prizes_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "game_participations_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_commissions_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_transfers_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tag_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "line_messaging_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "line_webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auto_reply_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rich_menu_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rich_menu_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rich_menu_click_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "broadcast_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "broadcast_recipients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_intents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_knowledge_base" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rich_menu_template_market" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "broadcast_campaign_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_knowledge_base_vectors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "games_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prizes_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "game_participations_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_commissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_transfers_system_b" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lemonsqueezy_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lemonsqueezy_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lemonsqueezy_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lemonsqueezy_webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "line_rich_menus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendance_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "performance_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "performance_targets" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: Multi-tenant isolation by organizationId
-- ============================================================

-- RLS for organizationUsers
CREATE POLICY "tenant_isolation_select_organizationUsers" ON "organizationUsers"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_organizationUsers" ON "organizationUsers"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_organizationUsers" ON "organizationUsers"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_organizationUsers" ON "organizationUsers"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for customers
CREATE POLICY "tenant_isolation_select_customers" ON "customers"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_customers" ON "customers"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_customers" ON "customers"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_customers" ON "customers"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for customerTags
CREATE POLICY "tenant_isolation_select_customerTags" ON "customerTags"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_customerTags" ON "customerTags"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_customerTags" ON "customerTags"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_customerTags" ON "customerTags"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for products
CREATE POLICY "tenant_isolation_select_products" ON "products"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_products" ON "products"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_products" ON "products"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_products" ON "products"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for staff
CREATE POLICY "tenant_isolation_select_staff" ON "staff"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_staff" ON "staff"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_staff" ON "staff"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_staff" ON "staff"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for appointmentSlots
CREATE POLICY "tenant_isolation_select_appointmentSlots" ON "appointmentSlots"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_appointmentSlots" ON "appointmentSlots"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_appointmentSlots" ON "appointmentSlots"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_appointmentSlots" ON "appointmentSlots"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for appointments
CREATE POLICY "tenant_isolation_select_appointments" ON "appointments"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_appointments" ON "appointments"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_appointments" ON "appointments"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_appointments" ON "appointments"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for schedules
CREATE POLICY "tenant_isolation_select_schedules" ON "schedules"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_schedules" ON "schedules"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_schedules" ON "schedules"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_schedules" ON "schedules"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for attendanceRecords
CREATE POLICY "tenant_isolation_select_attendanceRecords" ON "attendanceRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_attendanceRecords" ON "attendanceRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_attendanceRecords" ON "attendanceRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_attendanceRecords" ON "attendanceRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for coupons
CREATE POLICY "tenant_isolation_select_coupons" ON "coupons"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_coupons" ON "coupons"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_coupons" ON "coupons"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_coupons" ON "coupons"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for orders
CREATE POLICY "tenant_isolation_select_orders" ON "orders"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_orders" ON "orders"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_orders" ON "orders"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_orders" ON "orders"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for aftercareRecords
CREATE POLICY "tenant_isolation_select_aftercareRecords" ON "aftercareRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_aftercareRecords" ON "aftercareRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_aftercareRecords" ON "aftercareRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_aftercareRecords" ON "aftercareRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for lineChannels
CREATE POLICY "tenant_isolation_select_lineChannels" ON "lineChannels"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_lineChannels" ON "lineChannels"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_lineChannels" ON "lineChannels"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_lineChannels" ON "lineChannels"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for activityLogs
CREATE POLICY "tenant_isolation_select_activityLogs" ON "activityLogs"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_activityLogs" ON "activityLogs"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_activityLogs" ON "activityLogs"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_activityLogs" ON "activityLogs"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for treatmentRecords
CREATE POLICY "tenant_isolation_select_treatmentRecords" ON "treatmentRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_treatmentRecords" ON "treatmentRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_treatmentRecords" ON "treatmentRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_treatmentRecords" ON "treatmentRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for treatmentPhotos
CREATE POLICY "tenant_isolation_select_treatmentPhotos" ON "treatmentPhotos"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_treatmentPhotos" ON "treatmentPhotos"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_treatmentPhotos" ON "treatmentPhotos"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_treatmentPhotos" ON "treatmentPhotos"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for customerPackages
CREATE POLICY "tenant_isolation_select_customerPackages" ON "customerPackages"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_customerPackages" ON "customerPackages"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_customerPackages" ON "customerPackages"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_customerPackages" ON "customerPackages"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for consultations
CREATE POLICY "tenant_isolation_select_consultations" ON "consultations"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_consultations" ON "consultations"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_consultations" ON "consultations"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_consultations" ON "consultations"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for followUps
CREATE POLICY "tenant_isolation_select_followUps" ON "followUps"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_followUps" ON "followUps"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_followUps" ON "followUps"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_followUps" ON "followUps"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for customerRfmScores
CREATE POLICY "tenant_isolation_select_customerRfmScores" ON "customerRfmScores"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_customerRfmScores" ON "customerRfmScores"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_customerRfmScores" ON "customerRfmScores"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_customerRfmScores" ON "customerRfmScores"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for commissionRules
CREATE POLICY "tenant_isolation_select_commissionRules" ON "commissionRules"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_commissionRules" ON "commissionRules"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_commissionRules" ON "commissionRules"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_commissionRules" ON "commissionRules"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for staffCommissions
CREATE POLICY "tenant_isolation_select_staffCommissions" ON "staffCommissions"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_staffCommissions" ON "staffCommissions"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_staffCommissions" ON "staffCommissions"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_staffCommissions" ON "staffCommissions"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for inventoryTransactions
CREATE POLICY "tenant_isolation_select_inventoryTransactions" ON "inventoryTransactions"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_inventoryTransactions" ON "inventoryTransactions"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_inventoryTransactions" ON "inventoryTransactions"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_inventoryTransactions" ON "inventoryTransactions"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for revenueTargets
CREATE POLICY "tenant_isolation_select_revenueTargets" ON "revenueTargets"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_revenueTargets" ON "revenueTargets"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_revenueTargets" ON "revenueTargets"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_revenueTargets" ON "revenueTargets"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for marketingCampaigns
CREATE POLICY "tenant_isolation_select_marketingCampaigns" ON "marketingCampaigns"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_marketingCampaigns" ON "marketingCampaigns"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_marketingCampaigns" ON "marketingCampaigns"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_marketingCampaigns" ON "marketingCampaigns"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for customerSources
CREATE POLICY "tenant_isolation_select_customerSources" ON "customerSources"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_customerSources" ON "customerSources"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_customerSources" ON "customerSources"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_customerSources" ON "customerSources"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for satisfactionSurveys
CREATE POLICY "tenant_isolation_select_satisfactionSurveys" ON "satisfactionSurveys"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_satisfactionSurveys" ON "satisfactionSurveys"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_satisfactionSurveys" ON "satisfactionSurveys"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_satisfactionSurveys" ON "satisfactionSurveys"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for waitlist
CREATE POLICY "tenant_isolation_select_waitlist" ON "waitlist"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_waitlist" ON "waitlist"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_waitlist" ON "waitlist"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_waitlist" ON "waitlist"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for injectionRecords
CREATE POLICY "tenant_isolation_select_injectionRecords" ON "injectionRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_injectionRecords" ON "injectionRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_injectionRecords" ON "injectionRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_injectionRecords" ON "injectionRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for consentFormTemplates
CREATE POLICY "tenant_isolation_select_consentFormTemplates" ON "consentFormTemplates"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_consentFormTemplates" ON "consentFormTemplates"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_consentFormTemplates" ON "consentFormTemplates"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_consentFormTemplates" ON "consentFormTemplates"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for consentSignatures
CREATE POLICY "tenant_isolation_select_consentSignatures" ON "consentSignatures"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_consentSignatures" ON "consentSignatures"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_consentSignatures" ON "consentSignatures"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_consentSignatures" ON "consentSignatures"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for medications
CREATE POLICY "tenant_isolation_select_medications" ON "medications"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_medications" ON "medications"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_medications" ON "medications"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_medications" ON "medications"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for prescriptions
CREATE POLICY "tenant_isolation_select_prescriptions" ON "prescriptions"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_prescriptions" ON "prescriptions"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_prescriptions" ON "prescriptions"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_prescriptions" ON "prescriptions"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for skinAnalysisRecords
CREATE POLICY "tenant_isolation_select_skinAnalysisRecords" ON "skinAnalysisRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_skinAnalysisRecords" ON "skinAnalysisRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_skinAnalysisRecords" ON "skinAnalysisRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_skinAnalysisRecords" ON "skinAnalysisRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for membershipPlans
CREATE POLICY "tenant_isolation_select_membershipPlans" ON "membershipPlans"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_membershipPlans" ON "membershipPlans"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_membershipPlans" ON "membershipPlans"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_membershipPlans" ON "membershipPlans"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for memberSubscriptions
CREATE POLICY "tenant_isolation_select_memberSubscriptions" ON "memberSubscriptions"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_memberSubscriptions" ON "memberSubscriptions"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_memberSubscriptions" ON "memberSubscriptions"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_memberSubscriptions" ON "memberSubscriptions"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for teleConsultations
CREATE POLICY "tenant_isolation_select_teleConsultations" ON "teleConsultations"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_teleConsultations" ON "teleConsultations"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_teleConsultations" ON "teleConsultations"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_teleConsultations" ON "teleConsultations"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for referralCodes
CREATE POLICY "tenant_isolation_select_referralCodes" ON "referralCodes"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_referralCodes" ON "referralCodes"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_referralCodes" ON "referralCodes"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_referralCodes" ON "referralCodes"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for referralRecords
CREATE POLICY "tenant_isolation_select_referralRecords" ON "referralRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_referralRecords" ON "referralRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_referralRecords" ON "referralRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_referralRecords" ON "referralRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for socialAccounts
CREATE POLICY "tenant_isolation_select_socialAccounts" ON "socialAccounts"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_socialAccounts" ON "socialAccounts"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_socialAccounts" ON "socialAccounts"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_socialAccounts" ON "socialAccounts"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for scheduledPosts
CREATE POLICY "tenant_isolation_select_scheduledPosts" ON "scheduledPosts"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_scheduledPosts" ON "scheduledPosts"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_scheduledPosts" ON "scheduledPosts"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_scheduledPosts" ON "scheduledPosts"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for backgroundJobs
CREATE POLICY "tenant_isolation_select_backgroundJobs" ON "backgroundJobs"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_backgroundJobs" ON "backgroundJobs"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_backgroundJobs" ON "backgroundJobs"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_backgroundJobs" ON "backgroundJobs"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for voucherTemplates
CREATE POLICY "tenant_isolation_select_voucherTemplates" ON "voucherTemplates"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_voucherTemplates" ON "voucherTemplates"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_voucherTemplates" ON "voucherTemplates"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_voucherTemplates" ON "voucherTemplates"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for voucherInstances
CREATE POLICY "tenant_isolation_select_voucherInstances" ON "voucherInstances"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_voucherInstances" ON "voucherInstances"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_voucherInstances" ON "voucherInstances"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_voucherInstances" ON "voucherInstances"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for voucherRedemptions
CREATE POLICY "tenant_isolation_select_voucherRedemptions" ON "voucherRedemptions"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_voucherRedemptions" ON "voucherRedemptions"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_voucherRedemptions" ON "voucherRedemptions"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_voucherRedemptions" ON "voucherRedemptions"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for voucherBatches
CREATE POLICY "tenant_isolation_select_voucherBatches" ON "voucherBatches"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_voucherBatches" ON "voucherBatches"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_voucherBatches" ON "voucherBatches"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_voucherBatches" ON "voucherBatches"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for voucherTransfers
CREATE POLICY "tenant_isolation_select_voucherTransfers" ON "voucherTransfers"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_voucherTransfers" ON "voucherTransfers"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_voucherTransfers" ON "voucherTransfers"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_voucherTransfers" ON "voucherTransfers"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for voucherReminderLogs
CREATE POLICY "tenant_isolation_select_voucherReminderLogs" ON "voucherReminderLogs"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_voucherReminderLogs" ON "voucherReminderLogs"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_voucherReminderLogs" ON "voucherReminderLogs"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_voucherReminderLogs" ON "voucherReminderLogs"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for dailySettlements
CREATE POLICY "tenant_isolation_select_dailySettlements" ON "dailySettlements"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_dailySettlements" ON "dailySettlements"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_dailySettlements" ON "dailySettlements"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_dailySettlements" ON "dailySettlements"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for cashDrawerRecords
CREATE POLICY "tenant_isolation_select_cashDrawerRecords" ON "cashDrawerRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_cashDrawerRecords" ON "cashDrawerRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_cashDrawerRecords" ON "cashDrawerRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_cashDrawerRecords" ON "cashDrawerRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for paymentRecords
CREATE POLICY "tenant_isolation_select_paymentRecords" ON "paymentRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_paymentRecords" ON "paymentRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_paymentRecords" ON "paymentRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_paymentRecords" ON "paymentRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for lineChannelConfigs
CREATE POLICY "tenant_isolation_select_lineChannelConfigs" ON "lineChannelConfigs"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_lineChannelConfigs" ON "lineChannelConfigs"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_lineChannelConfigs" ON "lineChannelConfigs"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_lineChannelConfigs" ON "lineChannelConfigs"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for autoSettlementSettings
CREATE POLICY "tenant_isolation_select_autoSettlementSettings" ON "autoSettlementSettings"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_autoSettlementSettings" ON "autoSettlementSettings"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_autoSettlementSettings" ON "autoSettlementSettings"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_autoSettlementSettings" ON "autoSettlementSettings"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for settlementReports
CREATE POLICY "tenant_isolation_select_settlementReports" ON "settlementReports"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_settlementReports" ON "settlementReports"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_settlementReports" ON "settlementReports"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_settlementReports" ON "settlementReports"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for revenueTrendSnapshots
CREATE POLICY "tenant_isolation_select_revenueTrendSnapshots" ON "revenueTrendSnapshots"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_revenueTrendSnapshots" ON "revenueTrendSnapshots"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_revenueTrendSnapshots" ON "revenueTrendSnapshots"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_revenueTrendSnapshots" ON "revenueTrendSnapshots"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for lineChannelSettings
CREATE POLICY "tenant_isolation_select_lineChannelSettings" ON "lineChannelSettings"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_lineChannelSettings" ON "lineChannelSettings"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_lineChannelSettings" ON "lineChannelSettings"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_lineChannelSettings" ON "lineChannelSettings"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for importRecords
CREATE POLICY "tenant_isolation_select_importRecords" ON "importRecords"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_importRecords" ON "importRecords"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_importRecords" ON "importRecords"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_importRecords" ON "importRecords"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for paymentSettings
CREATE POLICY "tenant_isolation_select_paymentSettings" ON "paymentSettings"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_paymentSettings" ON "paymentSettings"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_paymentSettings" ON "paymentSettings"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_paymentSettings" ON "paymentSettings"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for paymentTransactions
CREATE POLICY "tenant_isolation_select_paymentTransactions" ON "paymentTransactions"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_paymentTransactions" ON "paymentTransactions"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_paymentTransactions" ON "paymentTransactions"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_paymentTransactions" ON "paymentTransactions"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for organizationSubscriptions
CREATE POLICY "tenant_isolation_select_organizationSubscriptions" ON "organizationSubscriptions"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_organizationSubscriptions" ON "organizationSubscriptions"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_organizationSubscriptions" ON "organizationSubscriptions"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_organizationSubscriptions" ON "organizationSubscriptions"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for attendanceSettings
CREATE POLICY "tenant_isolation_select_attendanceSettings" ON "attendanceSettings"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_attendanceSettings" ON "attendanceSettings"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_attendanceSettings" ON "attendanceSettings"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_attendanceSettings" ON "attendanceSettings"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for games
CREATE POLICY "tenant_isolation_select_games" ON "games"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_games" ON "games"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_games" ON "games"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_games" ON "games"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for prizes
CREATE POLICY "tenant_isolation_select_prizes" ON "prizes"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_prizes" ON "prizes"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_prizes" ON "prizes"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_prizes" ON "prizes"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for gamePlays
CREATE POLICY "tenant_isolation_select_gamePlays" ON "gamePlays"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_gamePlays" ON "gamePlays"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_gamePlays" ON "gamePlays"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_gamePlays" ON "gamePlays"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for userPrizes
CREATE POLICY "tenant_isolation_select_userPrizes" ON "userPrizes"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_userPrizes" ON "userPrizes"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_userPrizes" ON "userPrizes"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_userPrizes" ON "userPrizes"
  FOR DELETE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for inventory_system_b
CREATE POLICY "tenant_isolation_select_inventory_system_b" ON "inventory_system_b"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_inventory_system_b" ON "inventory_system_b"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_inventory_system_b" ON "inventory_system_b"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_inventory_system_b" ON "inventory_system_b"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for crm_tags_system_b
CREATE POLICY "tenant_isolation_select_crm_tags_system_b" ON "crm_tags_system_b"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_crm_tags_system_b" ON "crm_tags_system_b"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_crm_tags_system_b" ON "crm_tags_system_b"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_crm_tags_system_b" ON "crm_tags_system_b"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for games_system_b
CREATE POLICY "tenant_isolation_select_games_system_b" ON "games_system_b"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_games_system_b" ON "games_system_b"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_games_system_b" ON "games_system_b"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_games_system_b" ON "games_system_b"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for staff_commissions_system_b
CREATE POLICY "tenant_isolation_select_staff_commissions_system_b" ON "staff_commissions_system_b"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_staff_commissions_system_b" ON "staff_commissions_system_b"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_staff_commissions_system_b" ON "staff_commissions_system_b"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_staff_commissions_system_b" ON "staff_commissions_system_b"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for interactions
CREATE POLICY "tenant_isolation_select_interactions" ON "interactions"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_interactions" ON "interactions"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_interactions" ON "interactions"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_interactions" ON "interactions"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for tag_rules
CREATE POLICY "tenant_isolation_select_tag_rules" ON "tag_rules"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_tag_rules" ON "tag_rules"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_tag_rules" ON "tag_rules"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_tag_rules" ON "tag_rules"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for line_messaging_settings
CREATE POLICY "tenant_isolation_select_line_messaging_settings" ON "line_messaging_settings"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_line_messaging_settings" ON "line_messaging_settings"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_line_messaging_settings" ON "line_messaging_settings"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_line_messaging_settings" ON "line_messaging_settings"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for line_webhook_events
CREATE POLICY "tenant_isolation_select_line_webhook_events" ON "line_webhook_events"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_line_webhook_events" ON "line_webhook_events"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_line_webhook_events" ON "line_webhook_events"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_line_webhook_events" ON "line_webhook_events"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for auto_reply_rules
CREATE POLICY "tenant_isolation_select_auto_reply_rules" ON "auto_reply_rules"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_auto_reply_rules" ON "auto_reply_rules"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_auto_reply_rules" ON "auto_reply_rules"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_auto_reply_rules" ON "auto_reply_rules"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for rich_menu_templates
CREATE POLICY "tenant_isolation_select_rich_menu_templates" ON "rich_menu_templates"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_rich_menu_templates" ON "rich_menu_templates"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_rich_menu_templates" ON "rich_menu_templates"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_rich_menu_templates" ON "rich_menu_templates"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for broadcast_campaigns
CREATE POLICY "tenant_isolation_select_broadcast_campaigns" ON "broadcast_campaigns"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_broadcast_campaigns" ON "broadcast_campaigns"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_broadcast_campaigns" ON "broadcast_campaigns"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_broadcast_campaigns" ON "broadcast_campaigns"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for ai_conversations
CREATE POLICY "tenant_isolation_select_ai_conversations" ON "ai_conversations"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_ai_conversations" ON "ai_conversations"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_ai_conversations" ON "ai_conversations"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_ai_conversations" ON "ai_conversations"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for ai_intents
CREATE POLICY "tenant_isolation_select_ai_intents" ON "ai_intents"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_ai_intents" ON "ai_intents"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_ai_intents" ON "ai_intents"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_ai_intents" ON "ai_intents"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for ai_knowledge_base
CREATE POLICY "tenant_isolation_select_ai_knowledge_base" ON "ai_knowledge_base"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_ai_knowledge_base" ON "ai_knowledge_base"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_ai_knowledge_base" ON "ai_knowledge_base"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_ai_knowledge_base" ON "ai_knowledge_base"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for inventory
CREATE POLICY "tenant_isolation_select_inventory" ON "inventory"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_inventory" ON "inventory"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_inventory" ON "inventory"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_inventory" ON "inventory"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for crm_tags
CREATE POLICY "tenant_isolation_select_crm_tags" ON "crm_tags"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_crm_tags" ON "crm_tags"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_crm_tags" ON "crm_tags"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_crm_tags" ON "crm_tags"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for games_system_b
CREATE POLICY "tenant_isolation_select_games_system_b" ON "games_system_b"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_games_system_b" ON "games_system_b"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_games_system_b" ON "games_system_b"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_games_system_b" ON "games_system_b"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for staff_commissions
CREATE POLICY "tenant_isolation_select_staff_commissions" ON "staff_commissions"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_staff_commissions" ON "staff_commissions"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_staff_commissions" ON "staff_commissions"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_staff_commissions" ON "staff_commissions"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for lemonsqueezy_plans
CREATE POLICY "tenant_isolation_select_lemonsqueezy_plans" ON "lemonsqueezy_plans"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_lemonsqueezy_plans" ON "lemonsqueezy_plans"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_lemonsqueezy_plans" ON "lemonsqueezy_plans"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_lemonsqueezy_plans" ON "lemonsqueezy_plans"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for lemonsqueezy_subscriptions
CREATE POLICY "tenant_isolation_select_lemonsqueezy_subscriptions" ON "lemonsqueezy_subscriptions"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_lemonsqueezy_subscriptions" ON "lemonsqueezy_subscriptions"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_lemonsqueezy_subscriptions" ON "lemonsqueezy_subscriptions"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_lemonsqueezy_subscriptions" ON "lemonsqueezy_subscriptions"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for lemonsqueezy_payments
CREATE POLICY "tenant_isolation_select_lemonsqueezy_payments" ON "lemonsqueezy_payments"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_lemonsqueezy_payments" ON "lemonsqueezy_payments"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_lemonsqueezy_payments" ON "lemonsqueezy_payments"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_lemonsqueezy_payments" ON "lemonsqueezy_payments"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- RLS for line_rich_menus
CREATE POLICY "tenant_isolation_select_line_rich_menus" ON "line_rich_menus"
  FOR SELECT USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_insert_line_rich_menus" ON "line_rich_menus"
  FOR INSERT WITH CHECK (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_update_line_rich_menus" ON "line_rich_menus"
  FOR UPDATE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

CREATE POLICY "tenant_isolation_delete_line_rich_menus" ON "line_rich_menus"
  FOR DELETE USING (
    "organization_id" IN (
      SELECT "organizationId" FROM "organizationUsers"
      WHERE "userId" = (SELECT id FROM "users" WHERE "openId" = auth.uid()::text)
    )
  );

-- ============================================================
-- SERVICE ROLE BYPASS: Allow service_role to bypass RLS
-- ============================================================
CREATE POLICY "service_role_bypass_users" ON "users"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_organizations" ON "organizations"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_organizationUsers" ON "organizationUsers"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customers" ON "customers"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customerTags" ON "customerTags"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customerTagRelations" ON "customerTagRelations"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_products" ON "products"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_staff" ON "staff"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_appointmentSlots" ON "appointmentSlots"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_appointments" ON "appointments"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_schedules" ON "schedules"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_attendanceRecords" ON "attendanceRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_coupons" ON "coupons"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_orders" ON "orders"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_orderItems" ON "orderItems"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_aftercareRecords" ON "aftercareRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_lineChannels" ON "lineChannels"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_activityLogs" ON "activityLogs"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_treatmentRecords" ON "treatmentRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_treatmentPhotos" ON "treatmentPhotos"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customerPackages" ON "customerPackages"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_packageUsageRecords" ON "packageUsageRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_consultations" ON "consultations"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_followUps" ON "followUps"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customerRfmScores" ON "customerRfmScores"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_commissionRules" ON "commissionRules"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_staffCommissions" ON "staffCommissions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_inventoryTransactions" ON "inventoryTransactions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_revenueTargets" ON "revenueTargets"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_marketingCampaigns" ON "marketingCampaigns"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customerSources" ON "customerSources"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_satisfactionSurveys" ON "satisfactionSurveys"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_waitlist" ON "waitlist"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_injectionRecords" ON "injectionRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_injectionPoints" ON "injectionPoints"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_consentFormTemplates" ON "consentFormTemplates"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_consentSignatures" ON "consentSignatures"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_medications" ON "medications"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_prescriptions" ON "prescriptions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customerAllergies" ON "customerAllergies"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_skinAnalysisRecords" ON "skinAnalysisRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_skinMetrics" ON "skinMetrics"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_membershipPlans" ON "membershipPlans"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_memberSubscriptions" ON "memberSubscriptions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_subscriptionPayments" ON "subscriptionPayments"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_teleConsultations" ON "teleConsultations"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_consultationRecordings" ON "consultationRecordings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_referralCodes" ON "referralCodes"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_referralRecords" ON "referralRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_referralRewards" ON "referralRewards"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_socialAccounts" ON "socialAccounts"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_scheduledPosts" ON "scheduledPosts"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_socialAnalytics" ON "socialAnalytics"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_backgroundJobs" ON "backgroundJobs"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_voucherTemplates" ON "voucherTemplates"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_voucherInstances" ON "voucherInstances"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_voucherRedemptions" ON "voucherRedemptions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_voucherBatches" ON "voucherBatches"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_voucherTransfers" ON "voucherTransfers"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_systemSettings" ON "systemSettings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_voucherReminderLogs" ON "voucherReminderLogs"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_dailySettlements" ON "dailySettlements"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_settlementItems" ON "settlementItems"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_cashDrawerRecords" ON "cashDrawerRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_paymentRecords" ON "paymentRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_lineChannelConfigs" ON "lineChannelConfigs"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_autoSettlementSettings" ON "autoSettlementSettings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_settlementReports" ON "settlementReports"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_revenueTrendSnapshots" ON "revenueTrendSnapshots"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_lineChannelSettings" ON "lineChannelSettings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_importRecords" ON "importRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_paymentSettings" ON "paymentSettings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_paymentTransactions" ON "paymentTransactions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_subscriptionPlans" ON "subscriptionPlans"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_organizationSubscriptions" ON "organizationSubscriptions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_attendanceSettings" ON "attendanceSettings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_games" ON "games"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_prizes" ON "prizes"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_gamePlays" ON "gamePlays"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_userPrizes" ON "userPrizes"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_performanceRecords" ON "performanceRecords"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_performanceTargets" ON "performanceTargets"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_inventory_system_b" ON "inventory_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_crm_tags_system_b" ON "crm_tags_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customer_tags_system_b" ON "customer_tags_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_games_system_b" ON "games_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_prizes_system_b" ON "prizes_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_game_participations_system_b" ON "game_participations_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_staff_commissions_system_b" ON "staff_commissions_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_inventory_transfers_system_b" ON "inventory_transfers_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_interactions" ON "interactions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_tag_rules" ON "tag_rules"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_line_messaging_settings" ON "line_messaging_settings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_line_webhook_events" ON "line_webhook_events"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_auto_reply_rules" ON "auto_reply_rules"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_rich_menu_templates" ON "rich_menu_templates"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_rich_menu_assignments" ON "rich_menu_assignments"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_rich_menu_click_stats" ON "rich_menu_click_stats"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_broadcast_campaigns" ON "broadcast_campaigns"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_broadcast_recipients" ON "broadcast_recipients"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_ai_conversations" ON "ai_conversations"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_ai_intents" ON "ai_intents"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_ai_knowledge_base" ON "ai_knowledge_base"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_rich_menu_template_market" ON "rich_menu_template_market"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_broadcast_campaign_variants" ON "broadcast_campaign_variants"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_ai_knowledge_base_vectors" ON "ai_knowledge_base_vectors"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_inventory" ON "inventory"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_crm_tags" ON "crm_tags"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_customer_tags" ON "customer_tags"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_games_system_b" ON "games_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_prizes_system_b" ON "prizes_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_game_participations_system_b" ON "game_participations_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_staff_commissions" ON "staff_commissions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_inventory_transfers_system_b" ON "inventory_transfers_system_b"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_lemonsqueezy_plans" ON "lemonsqueezy_plans"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_lemonsqueezy_subscriptions" ON "lemonsqueezy_subscriptions"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_lemonsqueezy_payments" ON "lemonsqueezy_payments"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_lemonsqueezy_webhook_events" ON "lemonsqueezy_webhook_events"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_line_rich_menus" ON "line_rich_menus"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_leave_requests" ON "leave_requests"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_attendance_records" ON "attendance_records"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_attendance_settings" ON "attendance_settings"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_performance_records" ON "performance_records"
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass_performance_targets" ON "performance_targets"
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SCHEMA GENERATION COMPLETE
-- Total: 120 tables
-- ============================================================