-- ============================================
-- YOKAGE Sprint 1: Tenants Table Refactor Migration
-- Date: 2026-02-17
-- Description: Rename organizations → tenants, add plan_type, enabled_modules, source_product
-- ============================================

-- Step 1: Create ENUM types
DO $$ BEGIN
  CREATE TYPE "plan_type_enum" AS ENUM ('yokage_starter', 'yokage_pro', 'yyq_basic', 'yyq_advanced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "source_product_enum" AS ENUM ('yokage', 'yaoyouqian');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Rename organizations table to tenants
ALTER TABLE IF EXISTS "organizations" RENAME TO "tenants";

-- Step 3: Add new columns
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "planType" "plan_type_enum" DEFAULT 'yokage_starter';
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "enabledModules" jsonb;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "sourceProduct" "source_product_enum" DEFAULT 'yokage';

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS "idx_tenants_plan_type" ON "tenants" ("planType");
CREATE INDEX IF NOT EXISTS "idx_tenants_source_product" ON "tenants" ("sourceProduct");
CREATE INDEX IF NOT EXISTS "idx_tenants_slug" ON "tenants" ("slug");

-- Step 5: Update existing data (set default values for existing rows)
UPDATE "tenants" SET "planType" = 'yokage_pro' WHERE "subscriptionPlan" = 'enterprise';
UPDATE "tenants" SET "planType" = 'yokage_pro' WHERE "subscriptionPlan" = 'pro';
UPDATE "tenants" SET "planType" = 'yokage_starter' WHERE "subscriptionPlan" IN ('free', 'basic');

-- Note: organizationUsers table name is kept as-is in the database for backward compatibility.
-- The Drizzle ORM layer uses the alias `tenantUsers` which maps to the same "organizationUsers" table.
