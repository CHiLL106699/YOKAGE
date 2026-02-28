CREATE TYPE "public"."api_key_status_enum" AS ENUM('active', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."domain_status_enum" AS ENUM('pending', 'active', 'error');--> statement-breakpoint
CREATE TYPE "public"."invoice_status_enum" AS ENUM('paid', 'pending', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."plan_type_enum" AS ENUM('yokage_starter', 'yokage_pro', 'yyq_basic', 'yyq_advanced');--> statement-breakpoint
CREATE TYPE "public"."source_product_enum" AS ENUM('yokage', 'yaoyouqian');--> statement-breakpoint
CREATE TYPE "public"."white_label_plan_enum" AS ENUM('basic', 'professional', 'enterprise');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"user_id" integer,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aftercare_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"appointment_id" integer,
	"product_id" integer,
	"staff_id" integer,
	"treatment_date" date NOT NULL,
	"follow_up_date" date,
	"status" text DEFAULT 'pending',
	"notes" text,
	"customer_feedback" text,
	"photos" jsonb,
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer,
	"line_user_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_message" text NOT NULL,
	"ai_response" text NOT NULL,
	"intent" varchar(100),
	"confidence" numeric(5, 2),
	"context" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_intents" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"keywords" jsonb NOT NULL,
	"training_examples" jsonb,
	"response_template" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"category" varchar(100) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"keywords" jsonb,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_knowledge_base_vectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"knowledge_base_id" integer NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"embedding_model" varchar(100) DEFAULT 'text-embedding-3-small',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"key_hash" varchar(128) NOT NULL,
	"status" "api_key_status_enum" DEFAULT 'active',
	"scopes" jsonb,
	"last_used_at" timestamp,
	"request_count" integer DEFAULT 0,
	"rate_limit" integer DEFAULT 1000,
	"expires_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_key_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"endpoint" varchar(500),
	"method" varchar(10),
	"status_code" integer,
	"response_time_ms" integer,
	"called_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"staff_id" integer,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"slot_duration" integer DEFAULT 30,
	"max_bookings" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"staff_id" integer,
	"product_id" integer,
	"appointment_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time,
	"status" text DEFAULT 'pending',
	"notes" text,
	"internal_notes" text,
	"source" varchar(50) DEFAULT 'web',
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"record_date" date NOT NULL,
	"clock_in" timestamp,
	"clock_out" timestamp,
	"clock_in_location" jsonb,
	"clock_out_location" jsonb,
	"check_in_latitude" numeric(10, 7),
	"check_in_longitude" numeric(10, 7),
	"check_in_accuracy" numeric(8, 2),
	"check_in_address" text,
	"check_out_latitude" numeric(10, 7),
	"check_out_longitude" numeric(10, 7),
	"check_out_accuracy" numeric(8, 2),
	"check_out_address" text,
	"is_within_geofence" boolean DEFAULT true,
	"distance_from_clinic" numeric(8, 2),
	"status" text DEFAULT 'normal',
	"notes" text,
	"is_manual_entry" boolean DEFAULT false,
	"manual_reason" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"approval_status" text DEFAULT 'approved',
	"staff_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"clinic_latitude" numeric(10, 7),
	"clinic_longitude" numeric(10, 7),
	"clinic_address" text,
	"valid_distance" integer DEFAULT 100,
	"enable_geofence" boolean DEFAULT false,
	"allow_offline_clock_in" boolean DEFAULT true,
	"auto_clock_out_hours" integer DEFAULT 12,
	"require_photo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_settings_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "auto_reply_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"trigger_type" text NOT NULL,
	"trigger_value" text,
	"reply_type" text NOT NULL,
	"reply_content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auto_settlement_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"auto_settle_time" varchar(10) DEFAULT '23:00',
	"timezone" varchar(50) DEFAULT 'Asia/Taipei',
	"auto_generate_report" boolean DEFAULT true,
	"report_recipients" jsonb,
	"report_format" text DEFAULT 'pdf',
	"send_line_notification" boolean DEFAULT false,
	"line_notify_recipients" jsonb,
	"last_executed_at" timestamp,
	"last_execution_status" text,
	"last_execution_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auto_settlement_settings_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"job_type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"total_items" integer DEFAULT 0,
	"processed_items" integer DEFAULT 0,
	"result" jsonb,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broadcast_campaign_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"variant_name" varchar(100) NOT NULL,
	"message_content" text NOT NULL,
	"message_type" varchar(50) NOT NULL,
	"flex_message_json" jsonb,
	"traffic_percentage" integer NOT NULL,
	"sent_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"converted_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "broadcast_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"message_type" varchar(50) NOT NULL,
	"message_content" jsonb NOT NULL,
	"target_audience" jsonb NOT NULL,
	"scheduled_at" timestamp,
	"status" varchar(50) DEFAULT 'draft',
	"total_recipients" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "broadcast_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"line_user_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"clicked_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "cash_drawer_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"settlement_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"operation_type" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"balance_before" numeric(12, 2),
	"balance_after" numeric(12, 2),
	"operated_by" integer NOT NULL,
	"operator_name" varchar(255),
	"reason" text,
	"operated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"product_id" integer,
	"product_category" varchar(100),
	"commission_type" text DEFAULT 'percentage',
	"commission_value" numeric(10, 2) NOT NULL,
	"min_sales_amount" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_form_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" text DEFAULT 'treatment',
	"content" text NOT NULL,
	"required_fields" jsonb,
	"version" varchar(20) DEFAULT '1.0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"appointment_id" integer,
	"treatment_record_id" integer,
	"signature_image_url" text NOT NULL,
	"signed_content" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	"witness_name" varchar(255),
	"witness_signature_url" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultation_recordings" (
	"id" serial PRIMARY KEY NOT NULL,
	"tele_consultation_id" integer NOT NULL,
	"recording_url" text NOT NULL,
	"duration" integer,
	"file_size" integer,
	"format" varchar(20),
	"transcription" text,
	"consent_given" boolean DEFAULT false,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer,
	"prospect_name" varchar(255),
	"prospect_phone" varchar(20),
	"prospect_email" varchar(320),
	"consultation_date" timestamp NOT NULL,
	"consultation_type" text DEFAULT 'walk_in',
	"staff_id" integer,
	"interested_products" jsonb,
	"concerns" text,
	"recommendations" text,
	"status" text DEFAULT 'new',
	"conversion_date" timestamp,
	"converted_order_id" integer,
	"source" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"discount_type" text DEFAULT 'percentage',
	"discount_value" numeric(10, 2) NOT NULL,
	"min_purchase" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"usage_limit" integer,
	"used_count" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_tags_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT '#000000',
	"category" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_allergies" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"allergy_type" text DEFAULT 'medication',
	"allergen" varchar(255) NOT NULL,
	"severity" text DEFAULT 'moderate',
	"reaction" text,
	"diagnosed_date" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"package_name" varchar(255) NOT NULL,
	"total_sessions" integer NOT NULL,
	"used_sessions" integer DEFAULT 0 NOT NULL,
	"remaining_sessions" integer NOT NULL,
	"purchase_price" numeric(10, 2) NOT NULL,
	"purchase_date" timestamp NOT NULL,
	"expiry_date" timestamp,
	"status" text DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_rfm_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"recency_score" integer NOT NULL,
	"frequency_score" integer NOT NULL,
	"monetary_score" integer NOT NULL,
	"total_score" integer NOT NULL,
	"segment" varchar(50),
	"last_purchase_date" timestamp,
	"purchase_count" integer DEFAULT 0,
	"total_spent" numeric(12, 2) DEFAULT '0',
	"churn_risk" integer DEFAULT 0,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"campaign_id" integer,
	"source_type" varchar(100),
	"source_name" varchar(255),
	"referral_code" varchar(100),
	"referred_by_customer_id" integer,
	"first_visit_date" timestamp,
	"first_purchase_date" timestamp,
	"first_purchase_amount" numeric(10, 2),
	"lifetime_value" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_tag_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20) DEFAULT '#6366f1',
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_tags_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(320),
	"gender" text,
	"birthday" date,
	"address" text,
	"avatar" text,
	"line_user_id" varchar(64),
	"member_level" text DEFAULT 'bronze',
	"total_spent" numeric(12, 2) DEFAULT '0',
	"visit_count" integer DEFAULT 0,
	"notes" text,
	"source" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_settlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"settlement_date" date NOT NULL,
	"opening_cash" numeric(12, 2) DEFAULT '0',
	"opened_by" integer,
	"opened_at" timestamp,
	"closing_cash" numeric(12, 2),
	"closed_by" integer,
	"closed_at" timestamp,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"cash_revenue" numeric(12, 2) DEFAULT '0',
	"card_revenue" numeric(12, 2) DEFAULT '0',
	"line_pay_revenue" numeric(12, 2) DEFAULT '0',
	"other_revenue" numeric(12, 2) DEFAULT '0',
	"total_orders" integer DEFAULT 0,
	"completed_orders" integer DEFAULT 0,
	"cancelled_orders" integer DEFAULT 0,
	"refunded_orders" integer DEFAULT 0,
	"total_appointments" integer DEFAULT 0,
	"completed_appointments" integer DEFAULT 0,
	"no_show_appointments" integer DEFAULT 0,
	"cash_difference" numeric(12, 2) DEFAULT '0',
	"cash_difference_note" text,
	"status" text DEFAULT 'open',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"consultation_id" integer,
	"customer_id" integer,
	"staff_id" integer,
	"follow_up_date" timestamp NOT NULL,
	"follow_up_type" text DEFAULT 'call',
	"status" text DEFAULT 'pending',
	"outcome" varchar(255),
	"notes" text,
	"next_follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_participations_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"prize_id" integer,
	"played_at" timestamp DEFAULT now() NOT NULL,
	"is_claimed" boolean DEFAULT false,
	"claimed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "game_plays" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"played_at" timestamp DEFAULT now() NOT NULL,
	"result" text NOT NULL,
	"prize_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"max_plays_per_day" integer DEFAULT -1,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"game_type_b" text NOT NULL,
	"game_status_b" text DEFAULT 'draft',
	"start_date" timestamp,
	"end_date" timestamp,
	"description" text,
	"rules" jsonb,
	"image_url" text,
	"cost_points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"import_type" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" text,
	"total_rows" integer DEFAULT 0,
	"success_rows" integer DEFAULT 0,
	"failed_rows" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"error_log" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "injection_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"injection_record_id" integer NOT NULL,
	"position_x" numeric(5, 2) NOT NULL,
	"position_y" numeric(5, 2) NOT NULL,
	"units" numeric(6, 2) NOT NULL,
	"depth" varchar(50),
	"technique" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "injection_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"appointment_id" integer,
	"treatment_record_id" integer,
	"staff_id" integer NOT NULL,
	"template_type" text DEFAULT 'face_front',
	"product_used" varchar(255),
	"total_units" numeric(8, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"batch_number" varchar(100),
	"quantity" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 10,
	"expiry_date" date,
	"location" varchar(100),
	"supplier" varchar(255),
	"inventory_status_b" text DEFAULT 'in_stock',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"reference_id" integer,
	"reference_type" varchar(50),
	"batch_number" varchar(100),
	"expiry_date" date,
	"notes" text,
	"staff_id" integer,
	"transaction_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transfers_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_org_id" integer NOT NULL,
	"to_org_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"transfer_status_b" text DEFAULT 'pending',
	"requested_by" integer,
	"approved_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'TWD',
	"status" "invoice_status_enum" DEFAULT 'pending',
	"plan_name" varchar(100),
	"line_items" jsonb,
	"due_date" timestamp,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "line_channel_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"is_platform_level" boolean DEFAULT false,
	"channel_id" varchar(100) NOT NULL,
	"channel_secret" text NOT NULL,
	"channel_access_token" text NOT NULL,
	"liff_id" varchar(100),
	"is_active" boolean DEFAULT true,
	"last_verified_at" timestamp,
	"verification_status" text DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "line_channel_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"channel_id" varchar(100),
	"channel_secret" varchar(100),
	"channel_access_token" text,
	"liff_id" varchar(100),
	"webhook_url" text,
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"bot_basic_id" varchar(100),
	"bot_display_name" varchar(255),
	"bot_picture_url" text,
	"rich_menu_id" varchar(100),
	"notification_enabled" boolean DEFAULT true,
	"appointment_reminder_enabled" boolean DEFAULT true,
	"marketing_message_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "line_channel_settings_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "line_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"channel_name" varchar(255) NOT NULL,
	"channel_id" varchar(100) NOT NULL,
	"channel_secret" varchar(255),
	"access_token" text,
	"liff_id" varchar(100),
	"webhook_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "line_messaging_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"channel_access_token" text NOT NULL,
	"channel_secret" varchar(255) NOT NULL,
	"webhook_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "line_messaging_settings_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "line_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"source_type" varchar(20) NOT NULL,
	"source_id" varchar(100) NOT NULL,
	"message_type" varchar(20),
	"message_text" text,
	"message_id" varchar(100),
	"reply_token" varchar(100),
	"raw_payload" jsonb NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"campaign_type" text DEFAULT 'other',
	"start_date" timestamp,
	"end_date" timestamp,
	"budget" numeric(10, 2),
	"actual_spend" numeric(10, 2) DEFAULT '0',
	"target_audience" text,
	"description" text,
	"tracking_code" varchar(100),
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"generic_name" varchar(255),
	"category" text DEFAULT 'oral',
	"dosage_form" varchar(100),
	"strength" varchar(100),
	"unit" varchar(50),
	"manufacturer" varchar(255),
	"contraindications" text,
	"side_effects" text,
	"instructions" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"billing_cycle" text DEFAULT 'monthly',
	"status" text DEFAULT 'active',
	"start_date" date NOT NULL,
	"end_date" date,
	"next_billing_date" date,
	"auto_renew" boolean DEFAULT true,
	"payment_method" varchar(50),
	"last_payment_date" date,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"annual_price" numeric(10, 2),
	"benefits" jsonb,
	"included_services" jsonb,
	"discount_percentage" integer DEFAULT 0,
	"priority_booking" boolean DEFAULT false,
	"free_consultations" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"status" text DEFAULT 'pending',
	"subtotal" numeric(12, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"tax" numeric(10, 2) DEFAULT '0',
	"total" numeric(12, 2) NOT NULL,
	"coupon_id" integer,
	"payment_method" varchar(50),
	"payment_status" text DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"provider" text DEFAULT 'lemonsqueezy',
	"external_subscription_id" varchar(255),
	"external_customer_id" varchar(255),
	"status" text DEFAULT 'trialing',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"cancelled_at" timestamp,
	"trial_ends_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'staff' NOT NULL,
	"permissions" jsonb,
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo" text,
	"address" text,
	"phone" varchar(20),
	"email" varchar(320),
	"timezone" varchar(50) DEFAULT 'Asia/Taipei',
	"currency" varchar(10) DEFAULT 'TWD',
	"business_hours" jsonb,
	"settings" jsonb,
	"plan_type" "plan_type_enum" DEFAULT 'yokage_starter',
	"enabled_modules" jsonb,
	"source_product" "source_product_enum" DEFAULT 'yokage',
	"subscription_plan" text DEFAULT 'free',
	"subscription_status" text DEFAULT 'active',
	"trial_ends_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "package_usage_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"appointment_id" integer,
	"treatment_record_id" integer,
	"sessions_used" integer DEFAULT 1 NOT NULL,
	"usage_date" timestamp NOT NULL,
	"staff_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"order_id" integer,
	"appointment_id" integer,
	"customer_id" integer,
	"payment_method" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'TWD',
	"status" text DEFAULT 'pending',
	"transaction_id" varchar(255),
	"reference_number" varchar(100),
	"paid_at" timestamp,
	"refunded_amount" numeric(12, 2) DEFAULT '0',
	"refunded_at" timestamp,
	"refund_reason" text,
	"processed_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"provider" text NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"is_test_mode" boolean DEFAULT true,
	"ls_api_key" text,
	"ls_store_id" varchar(100),
	"ls_webhook_secret" text,
	"ecpay_merchant_id" varchar(50),
	"ecpay_hash_key" varchar(100),
	"ecpay_hash_iv" varchar(100),
	"stripe_publishable_key" text,
	"stripe_secret_key" text,
	"stripe_webhook_secret" text,
	"line_pay_channel_id" varchar(100),
	"line_pay_channel_secret" text,
	"jkopay_merchant_id" varchar(100),
	"jkopay_api_key" text,
	"default_currency" varchar(10) DEFAULT 'TWD',
	"webhook_url" text,
	"return_url" text,
	"cancel_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"order_id" integer,
	"customer_id" integer,
	"provider" text NOT NULL,
	"transaction_id" varchar(255),
	"external_transaction_id" varchar(255),
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'TWD',
	"status" text DEFAULT 'pending',
	"payment_method" varchar(100),
	"card_last4" varchar(4),
	"receipt_url" text,
	"refund_amount" numeric(12, 2),
	"refund_reason" text,
	"refunded_at" timestamp,
	"metadata" jsonb,
	"error_message" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_records" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"clinic_id" varchar(191) NOT NULL,
	"staff_id" varchar(191) NOT NULL,
	"record_date" timestamp NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"type" varchar(50) NOT NULL,
	"related_id" varchar(191),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_targets" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"clinic_id" varchar(191) NOT NULL,
	"staff_id" varchar(191) NOT NULL,
	"period_type" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"period" integer NOT NULL,
	"target_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"prescriber_id" integer NOT NULL,
	"appointment_id" integer,
	"treatment_record_id" integer,
	"medication_id" integer NOT NULL,
	"dosage" varchar(100) NOT NULL,
	"frequency" varchar(100) NOT NULL,
	"duration" varchar(100),
	"quantity" integer NOT NULL,
	"refills_allowed" integer DEFAULT 0,
	"refills_used" integer DEFAULT 0,
	"instructions" text,
	"warnings" text,
	"status" text DEFAULT 'active',
	"prescribed_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"type" text DEFAULT 'gift',
	"value" numeric(10, 2),
	"quantity" integer DEFAULT -1,
	"remaining_quantity" integer DEFAULT -1,
	"probability" numeric(5, 4) NOT NULL,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prizes_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"prize_type_b" text DEFAULT 'physical',
	"quantity" integer DEFAULT 0 NOT NULL,
	"remaining_quantity" integer DEFAULT 0 NOT NULL,
	"probability" numeric(5, 2) DEFAULT '0',
	"image_url" text,
	"value" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"type" text DEFAULT 'service',
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2),
	"duration" integer,
	"stock" integer,
	"images" jsonb,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"referrer_reward_type" text DEFAULT 'points',
	"referrer_reward_value" numeric(10, 2) DEFAULT '0',
	"referee_reward_type" text DEFAULT 'discount',
	"referee_reward_value" numeric(10, 2) DEFAULT '0',
	"max_uses" integer,
	"used_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"referral_code_id" integer NOT NULL,
	"referrer_id" integer NOT NULL,
	"referee_id" integer NOT NULL,
	"referee_order_id" integer,
	"status" text DEFAULT 'pending',
	"qualified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_record_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"recipient_type" text NOT NULL,
	"reward_type" text NOT NULL,
	"reward_value" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"issued_at" timestamp,
	"used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"target_type" text DEFAULT 'monthly',
	"target_year" integer NOT NULL,
	"target_month" integer,
	"target_quarter" integer,
	"target_amount" numeric(12, 2) NOT NULL,
	"actual_amount" numeric(12, 2) DEFAULT '0',
	"achievement_rate" numeric(5, 2) DEFAULT '0',
	"staff_id" integer,
	"product_category" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_trend_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"snapshot_date" date NOT NULL,
	"period_type" text DEFAULT 'daily',
	"total_revenue" numeric(14, 2) DEFAULT '0',
	"cash_revenue" numeric(14, 2) DEFAULT '0',
	"card_revenue" numeric(14, 2) DEFAULT '0',
	"line_pay_revenue" numeric(14, 2) DEFAULT '0',
	"other_revenue" numeric(14, 2) DEFAULT '0',
	"total_orders" integer DEFAULT 0,
	"average_order_value" numeric(10, 2) DEFAULT '0',
	"total_appointments" integer DEFAULT 0,
	"completed_appointments" integer DEFAULT 0,
	"new_customers" integer DEFAULT 0,
	"returning_customers" integer DEFAULT 0,
	"hourly_revenue" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rich_menu_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"line_user_id" varchar(255) NOT NULL,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rich_menu_click_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"customer_id" integer,
	"line_user_id" varchar(255) NOT NULL,
	"area_index" integer NOT NULL,
	"clicked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rich_menu_template_market" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(500) NOT NULL,
	"image_width" integer NOT NULL,
	"image_height" integer NOT NULL,
	"areas" jsonb NOT NULL,
	"tags" jsonb,
	"usage_count" integer DEFAULT 0,
	"rating" numeric(3, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rich_menu_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"rich_menu_id" varchar(255),
	"image_url" text,
	"chat_bar_text" varchar(14) NOT NULL,
	"areas" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"target_audience" varchar(50),
	"ab_test_group" varchar(50),
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "satisfaction_surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"appointment_id" integer,
	"treatment_record_id" integer,
	"survey_type" text DEFAULT 'post_treatment',
	"overall_score" integer,
	"service_score" integer,
	"staff_score" integer,
	"facility_score" integer,
	"value_score" integer,
	"nps_score" integer,
	"would_recommend" boolean,
	"feedback" text,
	"improvement_suggestions" text,
	"staff_id" integer,
	"sent_at" timestamp,
	"completed_at" timestamp,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"social_account_id" integer NOT NULL,
	"content" text NOT NULL,
	"media_urls" jsonb,
	"hashtags" jsonb,
	"scheduled_at" timestamp NOT NULL,
	"published_at" timestamp,
	"status" text DEFAULT 'draft',
	"post_type" text DEFAULT 'image',
	"external_post_id" varchar(255),
	"error_message" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"schedule_date" date NOT NULL,
	"shift_type" text DEFAULT 'full',
	"start_time" time,
	"end_time" time,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlement_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"settlement_id" integer NOT NULL,
	"order_id" integer,
	"appointment_id" integer,
	"item_type" text NOT NULL,
	"payment_method" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"customer_id" integer,
	"customer_name" varchar(255),
	"staff_id" integer,
	"staff_name" varchar(255),
	"transaction_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlement_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"settlement_id" integer,
	"report_type" text DEFAULT 'daily',
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"title" varchar(255) NOT NULL,
	"report_data" jsonb,
	"total_revenue" numeric(14, 2) DEFAULT '0',
	"cash_revenue" numeric(14, 2) DEFAULT '0',
	"card_revenue" numeric(14, 2) DEFAULT '0',
	"line_pay_revenue" numeric(14, 2) DEFAULT '0',
	"other_revenue" numeric(14, 2) DEFAULT '0',
	"total_orders" integer DEFAULT 0,
	"average_order_value" numeric(10, 2) DEFAULT '0',
	"total_appointments" integer DEFAULT 0,
	"completed_appointments" integer DEFAULT 0,
	"pdf_url" text,
	"excel_url" text,
	"generated_by" text DEFAULT 'manual',
	"generated_by_user_id" integer,
	"status" text DEFAULT 'generating',
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skin_analysis_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"appointment_id" integer,
	"photo_url" text NOT NULL,
	"analysis_type" text DEFAULT 'full_face',
	"overall_score" integer,
	"skin_age" integer,
	"analyzed_at" timestamp DEFAULT now() NOT NULL,
	"ai_model" varchar(100),
	"raw_results" jsonb,
	"recommendations" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skin_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_record_id" integer NOT NULL,
	"metric_type" text NOT NULL,
	"score" integer NOT NULL,
	"severity" text DEFAULT 'none',
	"affected_area" varchar(100),
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"platform" text NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"account_id" varchar(255),
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"follower_count" integer DEFAULT 0,
	"is_connected" boolean DEFAULT false,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"social_account_id" integer NOT NULL,
	"post_id" integer,
	"date" date NOT NULL,
	"impressions" integer DEFAULT 0,
	"reach" integer DEFAULT 0,
	"engagement" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"saves" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"follower_growth" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer,
	"employee_id" varchar(50),
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(320),
	"position" varchar(100),
	"department" varchar(100),
	"hire_date" date,
	"salary" numeric(10, 2),
	"salary_type" text DEFAULT 'monthly',
	"avatar" text,
	"skills" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"order_id" integer,
	"order_item_id" integer,
	"appointment_id" integer,
	"commission_rule_id" integer,
	"sales_amount" numeric(10, 2) NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"commission_date" timestamp NOT NULL,
	"status" text DEFAULT 'pending',
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_commissions_system_b" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"period" varchar(7) NOT NULL,
	"total_sales" numeric(12, 2) DEFAULT '0',
	"commission_amount" numeric(10, 2) DEFAULT '0',
	"commission_status_b" text DEFAULT 'calculated',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'TWD',
	"payment_method" varchar(50),
	"transaction_id" varchar(255),
	"status" text DEFAULT 'pending',
	"billing_period_start" date,
	"billing_period_end" date,
	"paid_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"provider" text DEFAULT 'lemonsqueezy',
	"external_product_id" varchar(100),
	"external_variant_id" varchar(100),
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'TWD',
	"billing_interval" text DEFAULT 'monthly',
	"features" jsonb,
	"max_users" integer DEFAULT 5,
	"max_customers" integer DEFAULT 500,
	"max_appointments" integer DEFAULT 1000,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" text,
	"category" text DEFAULT 'platform',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tag_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"rule_type" text NOT NULL,
	"condition" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tele_consultations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"appointment_id" integer,
	"scheduled_at" timestamp NOT NULL,
	"duration" integer DEFAULT 30,
	"room_id" varchar(255),
	"room_url" text,
	"status" text DEFAULT 'scheduled',
	"consultation_type" text DEFAULT 'initial',
	"notes" text,
	"summary" text,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"treatment_record_id" integer,
	"photo_type" text DEFAULT 'before',
	"photo_url" text NOT NULL,
	"thumbnail_url" text,
	"photo_date" timestamp NOT NULL,
	"angle" varchar(50),
	"notes" text,
	"is_public" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"appointment_id" integer,
	"staff_id" integer,
	"product_id" integer,
	"treatment_date" timestamp NOT NULL,
	"treatment_type" varchar(100),
	"treatment_area" varchar(100),
	"dosage" varchar(100),
	"notes" text,
	"internal_notes" text,
	"satisfaction_score" integer,
	"next_follow_up_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_prizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prize_id" integer NOT NULL,
	"game_play_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"won_at" timestamp DEFAULT now() NOT NULL,
	"is_redeemed" boolean DEFAULT false,
	"redeemed_at" timestamp,
	"redeemed_by" integer,
	"expires_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(20),
	"avatar" text,
	"login_method" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"line_user_id" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
CREATE TABLE "voucher_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"batch_name" varchar(255) NOT NULL,
	"batch_type" text DEFAULT 'manual',
	"total_recipients" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"target_criteria" jsonb,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"voucher_code" varchar(50) NOT NULL,
	"qr_code_url" text,
	"status" text DEFAULT 'active',
	"remaining_uses" integer DEFAULT 1,
	"used_count" integer DEFAULT 0,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"issued_by" integer,
	"issue_reason" varchar(255),
	"issue_channel" text DEFAULT 'manual',
	"line_push_status" text DEFAULT 'pending',
	"line_push_at" timestamp,
	"line_push_error" text,
	"original_owner_id" integer,
	"transferred_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voucher_instances_voucher_code_unique" UNIQUE("voucher_code")
);
--> statement-breakpoint
CREATE TABLE "voucher_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"voucher_instance_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"redemption_method" text DEFAULT 'qr_scan',
	"redeemed_by" integer,
	"order_id" integer,
	"appointment_id" integer,
	"treatment_record_id" integer,
	"discount_applied" numeric(10, 2),
	"original_amount" numeric(10, 2),
	"final_amount" numeric(10, 2),
	"redemption_location" varchar(255),
	"notes" text,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_reminder_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"voucher_instance_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"reminder_type" text DEFAULT 'expiry_warning',
	"days_before_expiry" integer,
	"status" text DEFAULT 'pending',
	"channel" text DEFAULT 'line',
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"error_message" text,
	"line_message_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" text DEFAULT 'treatment',
	"value" numeric(10, 2),
	"value_type" text DEFAULT 'fixed_amount',
	"applicable_products" jsonb,
	"applicable_categories" jsonb,
	"applicable_services" jsonb,
	"min_purchase" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"usage_limit" integer,
	"validity_type" text DEFAULT 'days_from_issue',
	"valid_days" integer DEFAULT 30,
	"fixed_start_date" date,
	"fixed_end_date" date,
	"image_url" text,
	"background_color" varchar(20) DEFAULT '#D4AF37',
	"text_color" varchar(20) DEFAULT '#0A1628',
	"is_active" boolean DEFAULT true,
	"is_transferable" boolean DEFAULT false,
	"total_issued" integer DEFAULT 0,
	"total_redeemed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"voucher_instance_id" integer NOT NULL,
	"from_customer_id" integer NOT NULL,
	"from_customer_name" varchar(100),
	"from_customer_phone" varchar(20),
	"to_customer_id" integer,
	"to_customer_name" varchar(100),
	"to_customer_phone" varchar(20) NOT NULL,
	"to_customer_email" varchar(320),
	"status" text DEFAULT 'pending',
	"gift_message" text,
	"claim_code" varchar(50) NOT NULL,
	"claimed_at" timestamp,
	"notification_sent" boolean DEFAULT false,
	"notification_channel" text DEFAULT 'line',
	"notification_sent_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voucher_transfers_claim_code_unique" UNIQUE("claim_code")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"preferred_date" date NOT NULL,
	"preferred_time_slot" varchar(50),
	"product_id" integer,
	"status" text DEFAULT 'waiting',
	"notes" text,
	"notified_at" timestamp,
	"booked_appointment_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "white_label_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"plan" "white_label_plan_enum" DEFAULT 'basic',
	"custom_domain" varchar(255),
	"domain_status" "domain_status_enum" DEFAULT 'pending',
	"primary_color" varchar(20) DEFAULT '#6366f1',
	"logo_url" varchar(500),
	"brand_name" varchar(200),
	"custom_css" text,
	"favicon_url" varchar(500),
	"is_active" boolean DEFAULT false,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lemonsqueezy_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" integer,
	"lemonsqueezy_order_id" varchar(255) NOT NULL,
	"lemonsqueezy_customer_id" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'TWD' NOT NULL,
	"status" text NOT NULL,
	"refund_amount" numeric(10, 2),
	"refunded_at" timestamp,
	"receipt_url" varchar(500),
	"invoice_url" varchar(500),
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lemonsqueezy_payments_lemonsqueezy_order_id_unique" UNIQUE("lemonsqueezy_order_id")
);
--> statement-breakpoint
CREATE TABLE "lemonsqueezy_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"lemonsqueezy_product_id" varchar(255) NOT NULL,
	"lemonsqueezy_variant_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'TWD' NOT NULL,
	"interval" text NOT NULL,
	"interval_count" integer DEFAULT 1 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lemonsqueezy_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"lemonsqueezy_subscription_id" varchar(255) NOT NULL,
	"lemonsqueezy_customer_id" varchar(255) NOT NULL,
	"lemonsqueezy_order_id" varchar(255),
	"status" text NOT NULL,
	"trial_ends_at" timestamp,
	"renews_at" timestamp,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lemonsqueezy_subscriptions_lemonsqueezy_subscription_id_unique" UNIQUE("lemonsqueezy_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "lemonsqueezy_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lemonsqueezy_event_id" varchar(255) NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"payload" text NOT NULL,
	"processed" integer DEFAULT 0 NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lemonsqueezy_webhook_events_lemonsqueezy_event_id_unique" UNIQUE("lemonsqueezy_event_id")
);
--> statement-breakpoint
CREATE TABLE "line_rich_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"rich_menu_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"chat_bar_text" varchar(14) NOT NULL,
	"image_url" text NOT NULL,
	"image_key" text,
	"size" jsonb NOT NULL,
	"areas" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "line_rich_menus_rich_menu_id_unique" UNIQUE("rich_menu_id")
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"clinic_id" varchar(36) NOT NULL,
	"staff_id" varchar(36) NOT NULL,
	"leave_type" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewer_id" varchar(36),
	"reviewed_at" timestamp,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_image" text,
	"specs" varchar(255),
	"price" integer NOT NULL,
	"original_price" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"selected" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"staff_id" integer NOT NULL,
	"type" varchar(50) DEFAULT 'general' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"due_date" timestamp,
	"due_time" varchar(10),
	"related_customer_id" integer,
	"related_customer_name" varchar(255),
	"related_customer_phone" varchar(20),
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
