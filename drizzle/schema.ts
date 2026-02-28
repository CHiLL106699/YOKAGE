import {
  integer,
  pgTable,
  pgEnum,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  jsonb,
  date,
  time,
  serial,
  customType,
} from "drizzle-orm/pg-core";

// ============================================
// ENUM 定義
// ============================================
export const planTypeEnum = pgEnum("plan_type_enum", [
  "yokage_starter",
  "yokage_pro",
  "yyq_basic",
  "yyq_advanced",
]);

export const sourceProductEnum = pgEnum("source_product_enum", [
  "yokage",
  "yaoyouqian",
]);

// pgvector custom type for Drizzle ORM
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    // Parse PostgreSQL vector format: [0.1,0.2,...]
    return value
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .split(',')
      .map(Number);
  },
});

// ============================================
// LemonSqueezy 金流整合
// ============================================
export * from "./lemonsqueezy-schema";

// ============================================
// LINE Rich Menu 圖文選單
// ============================================
export * from "./line-rich-menu-schema";

// ============================================
// 請假管理系統
// ============================================
export * from "./leave-schema";

// ============================================
// 核心使用者表 - 支援多角色
// ============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  loginMethod: varchar("login_method", { length: 64 }),
  role: text("role").default("user").notNull(),
  lineUserId: varchar("line_user_id", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// 租戶表 (原 organizations) - 多租戶核心
// ============================================
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logo: text("logo"),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Taipei"),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  businessHours: jsonb("business_hours"),
  settings: jsonb("settings"),
  // 新增：SaaS 方案類型
  planType: planTypeEnum("plan_type").default("yokage_starter"),
  // 新增：已啟用模組 (Feature Gating)
  enabledModules: jsonb("enabled_modules").$type<string[]>(),
  // 新增：來源產品
  sourceProduct: sourceProductEnum("source_product").default("yokage"),
  // 保留舊欄位以向後相容
  subscriptionPlan: text("subscription_plan").default("free"),
  subscriptionStatus: text("subscription_status").default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// 向後相容別名 — 避免大量重構既有 import
export const organizations = tenants;
export type Organization = Tenant;
export type InsertOrganization = InsertTenant;

// ============================================
// 租戶使用者關聯表 (原 organizationUsers) - 多對多關係
// ============================================
export const tenantUsers = pgTable("organization_users", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").default("staff").notNull(),
  permissions: jsonb("permissions"),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;

// 向後相容別名
export const organizationUsers = tenantUsers;
export type OrganizationUser = TenantUser;
export type InsertOrganizationUser = InsertTenantUser;

// ============================================
// 客戶表
// ============================================
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id"),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  gender: text("gender"),
  birthday: date("birthday"),
  address: text("address"),
  avatar: text("avatar"),
  lineUserId: varchar("line_user_id", { length: 64 }),
  memberLevel: text("member_level").default("bronze"),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0"),
  visitCount: integer("visit_count").default(0),
  notes: text("notes"),
  source: varchar("source", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ============================================
// 客戶標籤表
// ============================================
export const customerTags = pgTable("customer_tags", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }).default("#6366f1"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CustomerTag = typeof customerTags.$inferSelect;
export type InsertCustomerTag = typeof customerTags.$inferInsert;

// ============================================
// 客戶標籤關聯表
// ============================================
export const customerTagRelations = pgTable("customer_tag_relations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  tagId: integer("tag_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CustomerTagRelation = typeof customerTagRelations.$inferSelect;
export type InsertCustomerTagRelation = typeof customerTagRelations.$inferInsert;

// ============================================
// 產品/服務表
// ============================================
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  type: text("type").default("service"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  duration: integer("duration"),
  stock: integer("stock"),
  images: jsonb("images"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ============================================
// 員工表
// ============================================
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id"),
  employeeId: varchar("employee_id", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),
  hireDate: date("hire_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  salaryType: text("salary_type").default("monthly"),
  avatar: text("avatar"),
  skills: jsonb("skills"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;

// ============================================
// 預約時段模板表
// ============================================
export const appointmentSlots = pgTable("appointment_slots", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  staffId: integer("staff_id"),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  slotDuration: integer("slot_duration").default(30),
  maxBookings: integer("max_bookings").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AppointmentSlot = typeof appointmentSlots.$inferSelect;
export type InsertAppointmentSlot = typeof appointmentSlots.$inferInsert;

// ============================================
// 預約表
// ============================================
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  staffId: integer("staff_id"),
  productId: integer("product_id"),
  appointmentDate: date("appointment_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time"),
  status: text("status").default("pending"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  source: varchar("source", { length: 50 }).default("web"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ============================================
// 排班表
// ============================================
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  staffId: integer("staff_id").notNull(),
  scheduleDate: date("schedule_date").notNull(),
  shiftType: text("shift_type").default("full"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

// ============================================
// 打卡記錄表
// ============================================
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  staffId: integer("staff_id").notNull(),
  recordDate: date("record_date").notNull(),
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
  clockInLocation: jsonb("clock_in_location"),
  clockOutLocation: jsonb("clock_out_location"),
  // 地理圍欄功能擴展
  checkInLatitude: decimal("check_in_latitude", { precision: 10, scale: 7 }),
  checkInLongitude: decimal("check_in_longitude", { precision: 10, scale: 7 }),
  checkInAccuracy: decimal("check_in_accuracy", { precision: 8, scale: 2 }),
  checkInAddress: text("check_in_address"),
  checkOutLatitude: decimal("check_out_latitude", { precision: 10, scale: 7 }),
  checkOutLongitude: decimal("check_out_longitude", { precision: 10, scale: 7 }),
  checkOutAccuracy: decimal("check_out_accuracy", { precision: 8, scale: 2 }),
  checkOutAddress: text("check_out_address"),
  isWithinGeofence: boolean("is_within_geofence").default(true),
  distanceFromClinic: decimal("distance_from_clinic", { precision: 8, scale: 2 }),
  status: text("status").default("normal"),
  notes: text("notes"),
  // 補登相關欄位
  isManualEntry: boolean("is_manual_entry").default(false), // 是否為補登
  manualReason: text("manual_reason"), // 補登原因
  approvedBy: integer("approved_by"), // 審核人員 ID
  approvedAt: timestamp("approved_at"), // 審核時間
  approvalStatus: text("approval_status").default("approved"), // 審核狀態
  staffNote: text("staff_note"), // 員工備註（用於解釋異常打卡情況）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;

// ============================================
// 優惠券表
// ============================================
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountType: text("discount_type").default("percentage"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// ============================================
// 訂單表
// ============================================
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  status: text("status").default("pending"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  couponId: integer("coupon_id"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================
// 訂單項目表
// ============================================
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ============================================
// 術後關懷記錄表
// ============================================
export const aftercareRecords = pgTable("aftercare_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  appointmentId: integer("appointment_id"),
  productId: integer("product_id"),
  staffId: integer("staff_id"),
  treatmentDate: date("treatment_date").notNull(),
  followUpDate: date("follow_up_date"),
  status: text("status").default("pending"),
  notes: text("notes"),
  customerFeedback: text("customer_feedback"),
  photos: jsonb("photos"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AftercareRecord = typeof aftercareRecords.$inferSelect;
export type InsertAftercareRecord = typeof aftercareRecords.$inferInsert;

// ============================================
// LINE Channel 設定表
// ============================================
export const lineChannels = pgTable("line_channels", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  channelName: varchar("channel_name", { length: 255 }).notNull(),
  channelId: varchar("channel_id", { length: 100 }).notNull(),
  channelSecret: varchar("channel_secret", { length: 255 }),
  accessToken: text("access_token"),
  liffId: varchar("liff_id", { length: 100 }),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LineChannel = typeof lineChannels.$inferSelect;
export type InsertLineChannel = typeof lineChannels.$inferInsert;

// ============================================
// 系統活動日誌表
// ============================================
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  userId: integer("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;


// ============================================
// 療程記錄表 - 核心功能 1
// ============================================
export const treatmentRecords = pgTable("treatment_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  appointmentId: integer("appointment_id"),
  staffId: integer("staff_id"),
  productId: integer("product_id"),
  treatmentDate: timestamp("treatment_date").notNull(),
  treatmentType: varchar("treatment_type", { length: 100 }),
  treatmentArea: varchar("treatment_area", { length: 100 }),
  dosage: varchar("dosage", { length: 100 }),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  satisfactionScore: integer("satisfaction_score"),
  nextFollowUpDate: date("next_follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TreatmentRecord = typeof treatmentRecords.$inferSelect;
export type InsertTreatmentRecord = typeof treatmentRecords.$inferInsert;

// ============================================
// 療程照片表 - 核心功能 1
// ============================================
export const treatmentPhotos = pgTable("treatment_photos", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  treatmentRecordId: integer("treatment_record_id"),
  photoType: text("photo_type").default("before"),
  photoUrl: text("photo_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  photoDate: timestamp("photo_date").notNull(),
  angle: varchar("angle", { length: 50 }),
  notes: text("notes"),
  isPublic: boolean("is_public").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TreatmentPhoto = typeof treatmentPhotos.$inferSelect;
export type InsertTreatmentPhoto = typeof treatmentPhotos.$inferInsert;

// ============================================
// 客戶套餐表 - 核心功能 2
// ============================================
export const customerPackages = pgTable("customer_packages", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  packageName: varchar("package_name", { length: 255 }).notNull(),
  totalSessions: integer("total_sessions").notNull(),
  usedSessions: integer("used_sessions").default(0).notNull(),
  remainingSessions: integer("remaining_sessions").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  status: text("status").default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CustomerPackage = typeof customerPackages.$inferSelect;
export type InsertCustomerPackage = typeof customerPackages.$inferInsert;

// ============================================
// 套餐使用記錄表 - 核心功能 2
// ============================================
export const packageUsageRecords = pgTable("package_usage_records", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").notNull(),
  customerId: integer("customer_id").notNull(),
  appointmentId: integer("appointment_id"),
  treatmentRecordId: integer("treatment_record_id"),
  sessionsUsed: integer("sessions_used").default(1).notNull(),
  usageDate: timestamp("usage_date").notNull(),
  staffId: integer("staff_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PackageUsageRecord = typeof packageUsageRecords.$inferSelect;
export type InsertPackageUsageRecord = typeof packageUsageRecords.$inferInsert;

// ============================================
// 諮詢記錄表 - 核心功能 3
// ============================================
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id"),
  prospectName: varchar("prospect_name", { length: 255 }),
  prospectPhone: varchar("prospect_phone", { length: 20 }),
  prospectEmail: varchar("prospect_email", { length: 320 }),
  consultationDate: timestamp("consultation_date").notNull(),
  consultationType: text("consultation_type").default("walk_in"),
  staffId: integer("staff_id"),
  interestedProducts: jsonb("interested_products"),
  concerns: text("concerns"),
  recommendations: text("recommendations"),
  status: text("status").default("new"),
  conversionDate: timestamp("conversion_date"),
  convertedOrderId: integer("converted_order_id"),
  source: varchar("source", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

// ============================================
// 跟進記錄表 - 核心功能 3
// ============================================
export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  consultationId: integer("consultation_id"),
  customerId: integer("customer_id"),
  staffId: integer("staff_id"),
  followUpDate: timestamp("follow_up_date").notNull(),
  followUpType: text("follow_up_type").default("call"),
  status: text("status").default("pending"),
  outcome: varchar("outcome", { length: 255 }),
  notes: text("notes"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = typeof followUps.$inferInsert;

// ============================================
// 客戶 RFM 分數表 - 核心功能 4
// ============================================
export const customerRfmScores = pgTable("customer_rfm_scores", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  recencyScore: integer("recency_score").notNull(),
  frequencyScore: integer("frequency_score").notNull(),
  monetaryScore: integer("monetary_score").notNull(),
  totalScore: integer("total_score").notNull(),
  segment: varchar("segment", { length: 50 }),
  lastPurchaseDate: timestamp("last_purchase_date"),
  purchaseCount: integer("purchase_count").default(0),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0"),
  churnRisk: integer("churn_risk").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CustomerRfmScore = typeof customerRfmScores.$inferSelect;
export type InsertCustomerRfmScore = typeof customerRfmScores.$inferInsert;

// ============================================
// 員工佣金規則表 - 核心功能 6
// ============================================
export const commissionRules = pgTable("commission_rules", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  productId: integer("product_id"),
  productCategory: varchar("product_category", { length: 100 }),
  commissionType: text("commission_type").default("percentage"),
  commissionValue: decimal("commission_value", { precision: 10, scale: 2 }).notNull(),
  minSalesAmount: decimal("min_sales_amount", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CommissionRule = typeof commissionRules.$inferSelect;
export type InsertCommissionRule = typeof commissionRules.$inferInsert;

// ============================================
// 員工佣金記錄表 - 核心功能 6
// ============================================
export const staffCommissions = pgTable("staff_commissions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  staffId: integer("staff_id").notNull(),
  orderId: integer("order_id"),
  orderItemId: integer("order_item_id"),
  appointmentId: integer("appointment_id"),
  commissionRuleId: integer("commission_rule_id"),
  salesAmount: decimal("sales_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionDate: timestamp("commission_date").notNull(),
  status: text("status").default("pending"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StaffCommission = typeof staffCommissions.$inferSelect;
export type InsertStaffCommission = typeof staffCommissions.$inferInsert;

// ============================================
// 庫存異動記錄表 - 核心功能 7
// ============================================
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  productId: integer("product_id").notNull(),
  transactionType: text("transaction_type").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  referenceId: integer("reference_id"),
  referenceType: varchar("reference_type", { length: 50 }),
  batchNumber: varchar("batch_number", { length: 100 }),
  expiryDate: date("expiry_date"),
  notes: text("notes"),
  staffId: integer("staff_id"),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = typeof inventoryTransactions.$inferInsert;

// ============================================
// 營收目標表 - 核心功能 8
// ============================================
export const revenueTargets = pgTable("revenue_targets", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  targetType: text("target_type").default("monthly"),
  targetYear: integer("target_year").notNull(),
  targetMonth: integer("target_month"),
  targetQuarter: integer("target_quarter"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 12, scale: 2 }).default("0"),
  achievementRate: decimal("achievement_rate", { precision: 5, scale: 2 }).default("0"),
  staffId: integer("staff_id"),
  productCategory: varchar("product_category", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RevenueTarget = typeof revenueTargets.$inferSelect;
export type InsertRevenueTarget = typeof revenueTargets.$inferInsert;

// ============================================
// 行銷活動表 - 核心功能 9
// ============================================
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  campaignType: text("campaign_type").default("other"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  actualSpend: decimal("actual_spend", { precision: 10, scale: 2 }).default("0"),
  targetAudience: text("target_audience"),
  description: text("description"),
  trackingCode: varchar("tracking_code", { length: 100 }),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;

// ============================================
// 客戶來源追蹤表 - 核心功能 9
// ============================================
export const customerSources = pgTable("customer_sources", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  campaignId: integer("campaign_id"),
  sourceType: varchar("source_type", { length: 100 }),
  sourceName: varchar("source_name", { length: 255 }),
  referralCode: varchar("referral_code", { length: 100 }),
  referredByCustomerId: integer("referred_by_customer_id"),
  firstVisitDate: timestamp("first_visit_date"),
  firstPurchaseDate: timestamp("first_purchase_date"),
  firstPurchaseAmount: decimal("first_purchase_amount", { precision: 10, scale: 2 }),
  lifetimeValue: decimal("lifetime_value", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CustomerSource = typeof customerSources.$inferSelect;
export type InsertCustomerSource = typeof customerSources.$inferInsert;

// ============================================
// 滿意度調查表 - 核心功能 10
// ============================================
export const satisfactionSurveys = pgTable("satisfaction_surveys", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  appointmentId: integer("appointment_id"),
  treatmentRecordId: integer("treatment_record_id"),
  surveyType: text("survey_type").default("post_treatment"),
  overallScore: integer("overall_score"),
  serviceScore: integer("service_score"),
  staffScore: integer("staff_score"),
  facilityScore: integer("facility_score"),
  valueScore: integer("value_score"),
  npsScore: integer("nps_score"),
  wouldRecommend: boolean("would_recommend"),
  feedback: text("feedback"),
  improvementSuggestions: text("improvement_suggestions"),
  staffId: integer("staff_id"),
  sentAt: timestamp("sent_at"),
  completedAt: timestamp("completed_at"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;
export type InsertSatisfactionSurvey = typeof satisfactionSurveys.$inferInsert;


// ============================================
// 候補名單表 - 核心功能 5
// ============================================
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  preferredDate: date("preferred_date").notNull(),
  preferredTimeSlot: varchar("preferred_time_slot", { length: 50 }),
  productId: integer("product_id"),
  status: text("status").default("waiting"),
  notes: text("notes"),
  notifiedAt: timestamp("notified_at"),
  bookedAppointmentId: integer("booked_appointment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;


// ============================================
// Phase 41: 注射點位圖與臉部標記
// ============================================
export const injectionRecords = pgTable("injection_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  appointmentId: integer("appointment_id"),
  treatmentRecordId: integer("treatment_record_id"),
  staffId: integer("staff_id").notNull(),
  templateType: text("template_type").default("face_front"),
  productUsed: varchar("product_used", { length: 255 }),
  totalUnits: decimal("total_units", { precision: 8, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InjectionRecord = typeof injectionRecords.$inferSelect;
export type InsertInjectionRecord = typeof injectionRecords.$inferInsert;

export const injectionPoints = pgTable("injection_points", {
  id: serial("id").primaryKey(),
  injectionRecordId: integer("injection_record_id").notNull(),
  positionX: decimal("position_x", { precision: 5, scale: 2 }).notNull(),
  positionY: decimal("position_y", { precision: 5, scale: 2 }).notNull(),
  units: decimal("units", { precision: 6, scale: 2 }).notNull(),
  depth: varchar("depth", { length: 50 }),
  technique: varchar("technique", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InjectionPoint = typeof injectionPoints.$inferSelect;
export type InsertInjectionPoint = typeof injectionPoints.$inferInsert;

// ============================================
// Phase 42: 電子同意書與數位簽章
// ============================================
export const consentFormTemplates = pgTable("consent_form_templates", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: text("category").default("treatment"),
  content: text("content").notNull(),
  requiredFields: jsonb("required_fields"),
  version: varchar("version", { length: 20 }).default("1.0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ConsentFormTemplate = typeof consentFormTemplates.$inferSelect;
export type InsertConsentFormTemplate = typeof consentFormTemplates.$inferInsert;

export const consentSignatures = pgTable("consent_signatures", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  templateId: integer("template_id").notNull(),
  appointmentId: integer("appointment_id"),
  treatmentRecordId: integer("treatment_record_id"),
  signatureImageUrl: text("signature_image_url").notNull(),
  signedContent: text("signed_content"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  witnessName: varchar("witness_name", { length: 255 }),
  witnessSignatureUrl: text("witness_signature_url"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ConsentSignature = typeof consentSignatures.$inferSelect;
export type InsertConsentSignature = typeof consentSignatures.$inferInsert;

// ============================================
// Phase 43: 處方管理系統
// ============================================
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  genericName: varchar("generic_name", { length: 255 }),
  category: text("category").default("oral"),
  dosageForm: varchar("dosage_form", { length: 100 }),
  strength: varchar("strength", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  contraindications: text("contraindications"),
  sideEffects: text("side_effects"),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  prescriberId: integer("prescriber_id").notNull(),
  appointmentId: integer("appointment_id"),
  treatmentRecordId: integer("treatment_record_id"),
  medicationId: integer("medication_id").notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }),
  quantity: integer("quantity").notNull(),
  refillsAllowed: integer("refills_allowed").default(0),
  refillsUsed: integer("refills_used").default(0),
  instructions: text("instructions"),
  warnings: text("warnings"),
  status: text("status").default("active"),
  prescribedAt: timestamp("prescribed_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;

export const customerAllergies = pgTable("customer_allergies", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  allergyType: text("allergy_type").default("medication"),
  allergen: varchar("allergen", { length: 255 }).notNull(),
  severity: text("severity").default("moderate"),
  reaction: text("reaction"),
  diagnosedDate: date("diagnosed_date"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CustomerAllergy = typeof customerAllergies.$inferSelect;
export type InsertCustomerAllergy = typeof customerAllergies.$inferInsert;

// ============================================
// Phase 44: AI 膚質分析
// ============================================
export const skinAnalysisRecords = pgTable("skin_analysis_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  appointmentId: integer("appointment_id"),
  photoUrl: text("photo_url").notNull(),
  analysisType: text("analysis_type").default("full_face"),
  overallScore: integer("overall_score"),
  skinAge: integer("skin_age"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
  aiModel: varchar("ai_model", { length: 100 }),
  rawResults: jsonb("raw_results"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SkinAnalysisRecord = typeof skinAnalysisRecords.$inferSelect;
export type InsertSkinAnalysisRecord = typeof skinAnalysisRecords.$inferInsert;

export const skinMetrics = pgTable("skin_metrics", {
  id: serial("id").primaryKey(),
  analysisRecordId: integer("analysis_record_id").notNull(),
  metricType: text("metric_type").notNull(),
  score: integer("score").notNull(),
  severity: text("severity").default("none"),
  affectedArea: varchar("affected_area", { length: 100 }),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SkinMetric = typeof skinMetrics.$inferSelect;
export type InsertSkinMetric = typeof skinMetrics.$inferInsert;

// ============================================
// Phase 45: 會員訂閱制管理
// ============================================
export const membershipPlans = pgTable("membership_plans", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annual_price", { precision: 10, scale: 2 }),
  benefits: jsonb("benefits"),
  includedServices: jsonb("included_services"),
  discountPercentage: integer("discount_percentage").default(0),
  priorityBooking: boolean("priority_booking").default(false),
  freeConsultations: integer("free_consultations").default(0),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MembershipPlan = typeof membershipPlans.$inferSelect;
export type InsertMembershipPlan = typeof membershipPlans.$inferInsert;

export const memberSubscriptions = pgTable("member_subscriptions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  planId: integer("plan_id").notNull(),
  billingCycle: text("billing_cycle").default("monthly"),
  status: text("status").default("active"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextBillingDate: date("next_billing_date"),
  autoRenew: boolean("auto_renew").default(true),
  paymentMethod: varchar("payment_method", { length: 50 }),
  lastPaymentDate: date("last_payment_date"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MemberSubscription = typeof memberSubscriptions.$inferSelect;
export type InsertMemberSubscription = typeof memberSubscriptions.$inferInsert;

export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  status: text("status").default("pending"),
  billingPeriodStart: date("billing_period_start"),
  billingPeriodEnd: date("billing_period_end"),
  paidAt: timestamp("paid_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = typeof subscriptionPayments.$inferInsert;

// ============================================
// Phase 46: 遠程諮詢功能
// ============================================
export const teleConsultations = pgTable("tele_consultations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  staffId: integer("staff_id").notNull(),
  appointmentId: integer("appointment_id"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(30),
  roomId: varchar("room_id", { length: 255 }),
  roomUrl: text("room_url"),
  status: text("status").default("scheduled"),
  consultationType: text("consultation_type").default("initial"),
  notes: text("notes"),
  summary: text("summary"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TeleConsultation = typeof teleConsultations.$inferSelect;
export type InsertTeleConsultation = typeof teleConsultations.$inferInsert;

export const consultationRecordings = pgTable("consultation_recordings", {
  id: serial("id").primaryKey(),
  teleConsultationId: integer("tele_consultation_id").notNull(),
  recordingUrl: text("recording_url").notNull(),
  duration: integer("duration"),
  fileSize: integer("file_size"),
  format: varchar("format", { length: 20 }),
  transcription: text("transcription"),
  consentGiven: boolean("consent_given").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ConsultationRecording = typeof consultationRecordings.$inferSelect;
export type InsertConsultationRecording = typeof consultationRecordings.$inferInsert;

// ============================================
// Phase 47: 客戶推薦獎勵系統
// ============================================
export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  referrerRewardType: text("referrer_reward_type").default("points"),
  referrerRewardValue: decimal("referrer_reward_value", { precision: 10, scale: 2 }).default("0"),
  refereeRewardType: text("referee_reward_type").default("discount"),
  refereeRewardValue: decimal("referee_reward_value", { precision: 10, scale: 2 }).default("0"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

export const referralRecords = pgTable("referral_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  referralCodeId: integer("referral_code_id").notNull(),
  referrerId: integer("referrer_id").notNull(),
  refereeId: integer("referee_id").notNull(),
  refereeOrderId: integer("referee_order_id"),
  status: text("status").default("pending"),
  qualifiedAt: timestamp("qualified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ReferralRecord = typeof referralRecords.$inferSelect;
export type InsertReferralRecord = typeof referralRecords.$inferInsert;

export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referralRecordId: integer("referral_record_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  recipientType: text("recipient_type").notNull(),
  rewardType: text("reward_type").notNull(),
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  issuedAt: timestamp("issued_at"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

// ============================================
// Phase 48: 社群媒體整合管理
// ============================================
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  platform: text("platform").notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountId: varchar("account_id", { length: 255 }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  followerCount: integer("follower_count").default(0),
  isConnected: boolean("is_connected").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  socialAccountId: integer("social_account_id").notNull(),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls"),
  hashtags: jsonb("hashtags"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  publishedAt: timestamp("published_at"),
  status: text("status").default("draft"),
  postType: text("post_type").default("image"),
  externalPostId: varchar("external_post_id", { length: 255 }),
  errorMessage: text("error_message"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

export const socialAnalytics = pgTable("social_analytics", {
  id: serial("id").primaryKey(),
  socialAccountId: integer("social_account_id").notNull(),
  postId: integer("post_id"),
  date: date("date").notNull(),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  engagement: integer("engagement").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  clicks: integer("clicks").default(0),
  followerGrowth: integer("follower_growth").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SocialAnalytic = typeof socialAnalytics.$inferSelect;
export type InsertSocialAnalytic = typeof socialAnalytics.$inferInsert;


// ============================================
// Phase 51: 背景任務管理
// ============================================
export const backgroundJobs = pgTable("background_jobs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  jobType: text("job_type").notNull(),
  status: text("status").default("pending"),
  progress: integer("progress").default(0),
  totalItems: integer("total_items").default(0),
  processedItems: integer("processed_items").default(0),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BackgroundJob = typeof backgroundJobs.$inferSelect;
export type InsertBackgroundJob = typeof backgroundJobs.$inferInsert;


// ============================================
// Phase 56: 電子票券系統（LINE 整合）
// ============================================

// 票券模板表 - 定義票券類型
export const voucherTemplates = pgTable("voucher_templates", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: text("type").default("treatment"),
  // 票券價值設定
  value: decimal("value", { precision: 10, scale: 2 }),
  valueType: text("value_type").default("fixed_amount"),
  // 適用範圍
  applicableProducts: jsonb("applicable_products"), // 適用產品 ID 列表
  applicableCategories: jsonb("applicable_categories"), // 適用分類
  applicableServices: jsonb("applicable_services"), // 適用服務/療程
  // 使用限制
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"), // 每張票券可使用次數
  // 有效期設定
  validityType: text("validity_type").default("days_from_issue"),
  validDays: integer("valid_days").default(30), // 發送後有效天數
  fixedStartDate: date("fixed_start_date"),
  fixedEndDate: date("fixed_end_date"),
  // 外觀設定
  imageUrl: text("image_url"),
  backgroundColor: varchar("background_color", { length: 20 }).default("#D4AF37"),
  textColor: varchar("text_color", { length: 20 }).default("#0A1628"),
  // 狀態
  isActive: boolean("is_active").default(true),
  isTransferable: boolean("is_transferable").default(false), // 是否可轉贈
  // 統計
  totalIssued: integer("total_issued").default(0),
  totalRedeemed: integer("total_redeemed").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VoucherTemplate = typeof voucherTemplates.$inferSelect;
export type InsertVoucherTemplate = typeof voucherTemplates.$inferInsert;

// 票券實例表 - 已發送的票券
export const voucherInstances = pgTable("voucher_instances", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  templateId: integer("template_id").notNull(),
  customerId: integer("customer_id").notNull(),
  // 票券識別碼
  voucherCode: varchar("voucher_code", { length: 50 }).notNull().unique(),
  qrCodeUrl: text("qr_code_url"),
  // 票券狀態
  status: text("status").default("active"),
  // 使用情況
  remainingUses: integer("remaining_uses").default(1),
  usedCount: integer("used_count").default(0),
  // 有效期
  validFrom: timestamp("valid_from").defaultNow().notNull(),
  validUntil: timestamp("valid_until"),
  // 發送資訊
  issuedBy: integer("issued_by"), // 發送者 ID
  issueReason: varchar("issue_reason", { length: 255 }), // 發送原因
  issueChannel: text("issue_channel").default("manual"),
  // LINE 推送狀態
  linePushStatus: text("line_push_status").default("pending"),
  linePushAt: timestamp("line_push_at"),
  linePushError: text("line_push_error"),
  // 轉贈資訊
  originalOwnerId: integer("original_owner_id"),
  transferredAt: timestamp("transferred_at"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VoucherInstance = typeof voucherInstances.$inferSelect;
export type InsertVoucherInstance = typeof voucherInstances.$inferInsert;

// 票券核銷記錄表
export const voucherRedemptions = pgTable("voucher_redemptions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  voucherInstanceId: integer("voucher_instance_id").notNull(),
  customerId: integer("customer_id").notNull(),
  // 核銷資訊
  redemptionMethod: text("redemption_method").default("qr_scan"),
  redeemedBy: integer("redeemed_by"), // 核銷員工 ID
  // 關聯訂單/療程
  orderId: integer("order_id"),
  appointmentId: integer("appointment_id"),
  treatmentRecordId: integer("treatment_record_id"),
  // 核銷金額
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }),
  // 核銷地點
  redemptionLocation: varchar("redemption_location", { length: 255 }),
  // 備註
  notes: text("notes"),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VoucherRedemption = typeof voucherRedemptions.$inferSelect;
export type InsertVoucherRedemption = typeof voucherRedemptions.$inferInsert;

// 票券批次發送記錄表
export const voucherBatches = pgTable("voucher_batches", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  templateId: integer("template_id").notNull(),
  // 批次資訊
  batchName: varchar("batch_name", { length: 255 }).notNull(),
  batchType: text("batch_type").default("manual"),
  // 發送統計
  totalRecipients: integer("total_recipients").default(0),
  successCount: integer("success_count").default(0),
  failedCount: integer("failed_count").default(0),
  // 狀態
  status: text("status").default("pending"),
  // 目標客戶篩選條件
  targetCriteria: jsonb("target_criteria"),
  // 執行資訊
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  // 建立者
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VoucherBatch = typeof voucherBatches.$inferSelect;
export type InsertVoucherBatch = typeof voucherBatches.$inferInsert;


// 票券轉贈記錄表
export const voucherTransfers = pgTable("voucher_transfers", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  voucherInstanceId: integer("voucher_instance_id").notNull(),
  // 轉贈者資訊
  fromCustomerId: integer("from_customer_id").notNull(),
  fromCustomerName: varchar("from_customer_name", { length: 100 }),
  fromCustomerPhone: varchar("from_customer_phone", { length: 20 }),
  // 受贈者資訊
  toCustomerId: integer("to_customer_id"),
  toCustomerName: varchar("to_customer_name", { length: 100 }),
  toCustomerPhone: varchar("to_customer_phone", { length: 20 }).notNull(),
  toCustomerEmail: varchar("to_customer_email", { length: 320 }),
  // 轉贈狀態
  status: text("status").default("pending"),
  // 轉贈訊息
  giftMessage: text("gift_message"),
  // 領取資訊
  claimCode: varchar("claim_code", { length: 50 }).notNull().unique(),
  claimedAt: timestamp("claimed_at"),
  // 通知狀態
  notificationSent: boolean("notification_sent").default(false),
  notificationChannel: text("notification_channel").default("line"),
  notificationSentAt: timestamp("notification_sent_at"),
  // 有效期限（轉贈邀請的有效期）
  expiresAt: timestamp("expires_at").notNull(),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VoucherTransfer = typeof voucherTransfers.$inferSelect;
export type InsertVoucherTransfer = typeof voucherTransfers.$inferInsert;


// ============================================
// 系統設定表 - Super Admin 全域設定
// ============================================
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: text("category").default("platform"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// ============================================
// 票券到期提醒記錄表
// ============================================
export const voucherReminderLogs = pgTable("voucher_reminder_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  voucherInstanceId: integer("voucher_instance_id").notNull(),
  customerId: integer("customer_id").notNull(),
  // 提醒資訊
  reminderType: text("reminder_type").default("expiry_warning"),
  daysBeforeExpiry: integer("days_before_expiry"),
  // 發送狀態
  status: text("status").default("pending"),
  channel: text("channel").default("line"),
  // 發送時間
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  // 錯誤訊息
  errorMessage: text("error_message"),
  // LINE 訊息 ID
  lineMessageId: varchar("line_message_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type VoucherReminderLog = typeof voucherReminderLogs.$inferSelect;
export type InsertVoucherReminderLog = typeof voucherReminderLogs.$inferInsert;


// ============================================
// Phase 61: 每日結帳系統
// ============================================

// 每日結帳記錄主表
export const dailySettlements = pgTable("daily_settlements", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  // 結帳日期
  settlementDate: date("settlement_date").notNull(),
  // 開帳資訊
  openingCash: decimal("opening_cash", { precision: 12, scale: 2 }).default("0"),
  openedBy: integer("opened_by"),
  openedAt: timestamp("opened_at"),
  // 結帳資訊
  closingCash: decimal("closing_cash", { precision: 12, scale: 2 }),
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  // 營收統計
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  cashRevenue: decimal("cash_revenue", { precision: 12, scale: 2 }).default("0"),
  cardRevenue: decimal("card_revenue", { precision: 12, scale: 2 }).default("0"),
  linePayRevenue: decimal("line_pay_revenue", { precision: 12, scale: 2 }).default("0"),
  otherRevenue: decimal("other_revenue", { precision: 12, scale: 2 }).default("0"),
  // 訂單統計
  totalOrders: integer("total_orders").default(0),
  completedOrders: integer("completed_orders").default(0),
  cancelledOrders: integer("cancelled_orders").default(0),
  refundedOrders: integer("refunded_orders").default(0),
  // 預約統計
  totalAppointments: integer("total_appointments").default(0),
  completedAppointments: integer("completed_appointments").default(0),
  noShowAppointments: integer("no_show_appointments").default(0),
  // 現金差異
  cashDifference: decimal("cash_difference", { precision: 12, scale: 2 }).default("0"),
  cashDifferenceNote: text("cash_difference_note"),
  // 狀態
  status: text("status").default("open"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DailySettlement = typeof dailySettlements.$inferSelect;
export type InsertDailySettlement = typeof dailySettlements.$inferInsert;

// 結帳明細表
export const settlementItems = pgTable("settlement_items", {
  id: serial("id").primaryKey(),
  settlementId: integer("settlement_id").notNull(),
  // 關聯訂單或交易
  orderId: integer("order_id"),
  appointmentId: integer("appointment_id"),
  // 交易類型
  itemType: text("item_type").notNull(),
  // 付款方式
  paymentMethod: text("payment_method").notNull(),
  // 金額
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  // 描述
  description: text("description"),
  // 客戶資訊
  customerId: integer("customer_id"),
  customerName: varchar("customer_name", { length: 255 }),
  // 操作者
  staffId: integer("staff_id"),
  staffName: varchar("staff_name", { length: 255 }),
  // 交易時間
  transactionAt: timestamp("transaction_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SettlementItem = typeof settlementItems.$inferSelect;
export type InsertSettlementItem = typeof settlementItems.$inferInsert;

// 收銀機操作記錄
export const cashDrawerRecords = pgTable("cash_drawer_records", {
  id: serial("id").primaryKey(),
  settlementId: integer("settlement_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  // 操作類型
  operationType: text("operation_type").notNull(),
  // 金額
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  // 操作前後餘額
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }),
  // 操作者
  operatedBy: integer("operated_by").notNull(),
  operatorName: varchar("operator_name", { length: 255 }),
  // 原因/備註
  reason: text("reason"),
  // 操作時間
  operatedAt: timestamp("operated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CashDrawerRecord = typeof cashDrawerRecords.$inferSelect;
export type InsertCashDrawerRecord = typeof cashDrawerRecords.$inferInsert;

// 付款記錄表（統一管理所有付款）
export const paymentRecords = pgTable("payment_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  // 關聯
  orderId: integer("order_id"),
  appointmentId: integer("appointment_id"),
  customerId: integer("customer_id"),
  // 付款資訊
  paymentMethod: text("payment_method").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  // 交易狀態
  status: text("status").default("pending"),
  // 交易參考
  transactionId: varchar("transaction_id", { length: 255 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  // 付款時間
  paidAt: timestamp("paid_at"),
  // 退款資訊
  refundedAmount: decimal("refunded_amount", { precision: 12, scale: 2 }).default("0"),
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  // 操作者
  processedBy: integer("processed_by"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PaymentRecord = typeof paymentRecords.$inferSelect;
export type InsertPaymentRecord = typeof paymentRecords.$inferInsert;

// LINE Channel 設定表（用於儲存 LINE 憑證）
export const lineChannelConfigs = pgTable("line_channel_configs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  // 是否為平台級設定（null organizationId 表示平台級）
  isPlatformLevel: boolean("is_platform_level").default(false),
  // LINE Channel 資訊
  channelId: varchar("channel_id", { length: 100 }).notNull(),
  channelSecret: text("channel_secret").notNull(),
  channelAccessToken: text("channel_access_token").notNull(),
  // LIFF 設定
  liffId: varchar("liff_id", { length: 100 }),
  // 狀態
  isActive: boolean("is_active").default(true),
  // 最後驗證時間
  lastVerifiedAt: timestamp("last_verified_at"),
  verificationStatus: text("verification_status").default("pending"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LineChannelConfig = typeof lineChannelConfigs.$inferSelect;
export type InsertLineChannelConfig = typeof lineChannelConfigs.$inferInsert;


// ============================================
// Phase 62: 每日結帳系統強化
// ============================================

// 自動結帳設定表
export const autoSettlementSettings = pgTable("auto_settlement_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(),
  // 自動結帳開關
  isEnabled: boolean("is_enabled").default(false),
  // 自動結帳時間（24小時制，例如 "23:00"）
  autoSettleTime: varchar("auto_settle_time", { length: 10 }).default("23:00"),
  // 時區設定
  timezone: varchar("timezone", { length: 50 }).default("Asia/Taipei"),
  // 自動報表生成
  autoGenerateReport: boolean("auto_generate_report").default(true),
  // 報表接收者（Email 列表）
  reportRecipients: jsonb("report_recipients"),
  // 報表格式
  reportFormat: text("report_format").default("pdf"),
  // 是否發送 LINE 通知
  sendLineNotification: boolean("send_line_notification").default(false),
  // LINE 通知接收者（用戶 ID 列表）
  lineNotifyRecipients: jsonb("line_notify_recipients"),
  // 最後執行時間
  lastExecutedAt: timestamp("last_executed_at"),
  lastExecutionStatus: text("last_execution_status"),
  lastExecutionError: text("last_execution_error"),
  // 建立與更新時間
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AutoSettlementSetting = typeof autoSettlementSettings.$inferSelect;
export type InsertAutoSettlementSetting = typeof autoSettlementSettings.$inferInsert;

// 結帳報表表
export const settlementReports = pgTable("settlement_reports", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  settlementId: integer("settlement_id"),
  // 報表類型
  reportType: text("report_type").default("daily"),
  // 報表期間
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  // 報表標題
  title: varchar("title", { length: 255 }).notNull(),
  // 報表數據（JSON 格式儲存完整報表數據）
  reportData: jsonb("report_data"),
  // 營收摘要
  totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }).default("0"),
  cashRevenue: decimal("cash_revenue", { precision: 14, scale: 2 }).default("0"),
  cardRevenue: decimal("card_revenue", { precision: 14, scale: 2 }).default("0"),
  linePayRevenue: decimal("line_pay_revenue", { precision: 14, scale: 2 }).default("0"),
  otherRevenue: decimal("other_revenue", { precision: 14, scale: 2 }).default("0"),
  // 訂單統計
  totalOrders: integer("total_orders").default(0),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default("0"),
  // 預約統計
  totalAppointments: integer("total_appointments").default(0),
  completedAppointments: integer("completed_appointments").default(0),
  // 報表檔案
  pdfUrl: text("pdf_url"),
  excelUrl: text("excel_url"),
  // 生成方式
  generatedBy: text("generated_by").default("manual"),
  generatedByUserId: integer("generated_by_user_id"),
  // 狀態
  status: text("status").default("generating"),
  errorMessage: text("error_message"),
  // 建立時間
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SettlementReport = typeof settlementReports.$inferSelect;
export type InsertSettlementReport = typeof settlementReports.$inferInsert;

// 營收趨勢快照表（用於儀表板快速查詢）
export const revenueTrendSnapshots = pgTable("revenue_trend_snapshots", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  // 快照日期
  snapshotDate: date("snapshot_date").notNull(),
  // 週期類型
  periodType: text("period_type").default("daily"),
  // 營收數據
  totalRevenue: decimal("total_revenue", { precision: 14, scale: 2 }).default("0"),
  cashRevenue: decimal("cash_revenue", { precision: 14, scale: 2 }).default("0"),
  cardRevenue: decimal("card_revenue", { precision: 14, scale: 2 }).default("0"),
  linePayRevenue: decimal("line_pay_revenue", { precision: 14, scale: 2 }).default("0"),
  otherRevenue: decimal("other_revenue", { precision: 14, scale: 2 }).default("0"),
  // 訂單數據
  totalOrders: integer("total_orders").default(0),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default("0"),
  // 預約數據
  totalAppointments: integer("total_appointments").default(0),
  completedAppointments: integer("completed_appointments").default(0),
  // 客戶數據
  newCustomers: integer("new_customers").default(0),
  returningCustomers: integer("returning_customers").default(0),
  // 時段分布（JSON 格式：{ "09:00": 1500, "10:00": 2300, ... }）
  hourlyRevenue: jsonb("hourly_revenue"),
  // 建立時間
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RevenueTrendSnapshot = typeof revenueTrendSnapshots.$inferSelect;
export type InsertRevenueTrendSnapshot = typeof revenueTrendSnapshots.$inferInsert;


// ============================================
// LINE 整合設定表 - 診所端自行設定
// ============================================
export const lineChannelSettings = pgTable("line_channel_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(),
  channelId: varchar("channel_id", { length: 100 }),
  channelSecret: varchar("channel_secret", { length: 100 }),
  channelAccessToken: text("channel_access_token"),
  liffId: varchar("liff_id", { length: 100 }),
  webhookUrl: text("webhook_url"),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  botBasicId: varchar("bot_basic_id", { length: 100 }),
  botDisplayName: varchar("bot_display_name", { length: 255 }),
  botPictureUrl: text("bot_picture_url"),
  richMenuId: varchar("rich_menu_id", { length: 100 }),
  notificationEnabled: boolean("notification_enabled").default(true),
  appointmentReminderEnabled: boolean("appointment_reminder_enabled").default(true),
  marketingMessageEnabled: boolean("marketing_message_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LineChannelSetting = typeof lineChannelSettings.$inferSelect;
export type InsertLineChannelSetting = typeof lineChannelSettings.$inferInsert;

// ============================================
// 資料匯入記錄表
// ============================================
export const importRecords = pgTable("import_records", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id").notNull(),
  importType: text("import_type").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url"),
  totalRows: integer("total_rows").default(0),
  successRows: integer("success_rows").default(0),
  failedRows: integer("failed_rows").default(0),
  status: text("status").default("pending"),
  errorLog: jsonb("error_log"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ImportRecord = typeof importRecords.$inferSelect;
export type InsertImportRecord = typeof importRecords.$inferInsert;

// ============================================
// 支付設定表 - 支援多支付服務商
// ============================================
export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  provider: text("provider").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  isTestMode: boolean("is_test_mode").default(true),
  // LemonSqueezy 設定
  lsApiKey: text("ls_api_key"),
  lsStoreId: varchar("ls_store_id", { length: 100 }),
  lsWebhookSecret: text("ls_webhook_secret"),
  // 綠界 ECPay 設定
  ecpayMerchantId: varchar("ecpay_merchant_id", { length: 50 }),
  ecpayHashKey: varchar("ecpay_hash_key", { length: 100 }),
  ecpayHashIv: varchar("ecpay_hash_iv", { length: 100 }),
  // Stripe 設定
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  stripeWebhookSecret: text("stripe_webhook_secret"),
  // LINE Pay 設定
  linePayChannelId: varchar("line_pay_channel_id", { length: 100 }),
  linePayChannelSecret: text("line_pay_channel_secret"),
  // 街口支付設定
  jkopayMerchantId: varchar("jkopay_merchant_id", { length: 100 }),
  jkopayApiKey: text("jkopay_api_key"),
  // 通用設定
  defaultCurrency: varchar("default_currency", { length: 10 }).default("TWD"),
  webhookUrl: text("webhook_url"),
  returnUrl: text("return_url"),
  cancelUrl: text("cancel_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PaymentSetting = typeof paymentSettings.$inferSelect;
export type InsertPaymentSetting = typeof paymentSettings.$inferInsert;

// ============================================
// 支付交易記錄表
// ============================================
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  orderId: integer("order_id"),
  customerId: integer("customer_id"),
  provider: text("provider").notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  externalTransactionId: varchar("external_transaction_id", { length: 255 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  status: text("status").default("pending"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  cardLast4: varchar("card_last4", { length: 4 }),
  receiptUrl: text("receipt_url"),
  refundAmount: decimal("refund_amount", { precision: 12, scale: 2 }),
  refundReason: text("refund_reason"),
  refundedAt: timestamp("refunded_at"),
  metadata: jsonb("metadata"),
  errorMessage: text("error_message"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

// ============================================
// 訂閱方案表 - LemonSqueezy 整合
// ============================================
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  provider: text("provider").default("lemonsqueezy"),
  externalProductId: varchar("external_product_id", { length: 100 }),
  externalVariantId: varchar("external_variant_id", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  billingInterval: text("billing_interval").default("monthly"),
  features: jsonb("features"),
  maxUsers: integer("max_users").default(5),
  maxCustomers: integer("max_customers").default(500),
  maxAppointments: integer("max_appointments").default(1000),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// ============================================
// 組織訂閱記錄表
// ============================================
export const organizationSubscriptions = pgTable("organization_subscriptions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  planId: integer("plan_id").notNull(),
  provider: text("provider").default("lemonsqueezy"),
  externalSubscriptionId: varchar("external_subscription_id", { length: 255 }),
  externalCustomerId: varchar("external_customer_id", { length: 255 }),
  status: text("status").default("trialing"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  cancelledAt: timestamp("cancelled_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type OrganizationSubscription = typeof organizationSubscriptions.$inferSelect;
export type InsertOrganizationSubscription = typeof organizationSubscriptions.$inferInsert;


// ============================================
// 打卡設定表 - 地理圍欄設定
// ============================================
export const attendanceSettings = pgTable("attendance_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(),
  // 診所基準位置
  clinicLatitude: decimal("clinic_latitude", { precision: 10, scale: 7 }),
  clinicLongitude: decimal("clinic_longitude", { precision: 10, scale: 7 }),
  clinicAddress: text("clinic_address"),
  // 地理圍欄設定
  validDistance: integer("valid_distance").default(100), // 有效打卡距離 (米)
  enableGeofence: boolean("enable_geofence").default(false), // 是否啟用地理圍欄驗證
  // 降級機制設定
  allowOfflineClockIn: boolean("allow_offline_clock_in").default(true), // 允許離線打卡
  // 其他設定
  autoClockOutHours: integer("auto_clock_out_hours").default(12), // 自動下班打卡時數
  requirePhoto: boolean("require_photo").default(false), // 是否需要拍照打卡
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AttendanceSettings = typeof attendanceSettings.$inferSelect;
export type InsertAttendanceSettings = typeof attendanceSettings.$inferInsert;

// ============================================
// LINE 遊戲模組 - 遊戲設定表
// ============================================
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // 遊戲內部名稱 (ichiban_kuji, slot_machine, pachinko)
  title: varchar("title", { length: 255 }).notNull(), // 遊戲顯示標題
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  maxPlaysPerDay: integer("max_plays_per_day").default(-1), // -1 表示無限制
  settings: jsonb("settings"), // 遊戲特定設定
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

// ============================================
// LINE 遊戲模組 - 獎品資料表
// ============================================
export const prizes = pgTable("prizes", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  type: text("type").default("gift"),
  value: decimal("value", { precision: 10, scale: 2 }), // 獎品價值
  quantity: integer("quantity").default(-1), // -1 表示無限
  remainingQuantity: integer("remaining_quantity").default(-1),
  probability: decimal("probability", { precision: 5, scale: 4 }).notNull(), // 0.0000 to 1.0000
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  metadata: jsonb("metadata"), // 額外資訊 (如優惠券代碼等)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Prize = typeof prizes.$inferSelect;
export type InsertPrize = typeof prizes.$inferInsert;

// ============================================
// LINE 遊戲模組 - 遊玩記錄表
// ============================================
export const gamePlays = pgTable("game_plays", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
  result: text("result").notNull(),
  prizeId: integer("prize_id"), // NULL 表示未中獎
  metadata: jsonb("metadata"), // 遊戲過程資訊
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GamePlay = typeof gamePlays.$inferSelect;
export type InsertGamePlay = typeof gamePlays.$inferInsert;

// ============================================
// LINE 遊戲模組 - 使用者中獎記錄表
// ============================================
export const userPrizes = pgTable("user_prizes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  prizeId: integer("prize_id").notNull(),
  gamePlayId: integer("game_play_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  wonAt: timestamp("won_at").defaultNow().notNull(),
  isRedeemed: boolean("is_redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  redeemedBy: integer("redeemed_by"), // 兌換操作員 ID
  expiresAt: timestamp("expires_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserPrize = typeof userPrizes.$inferSelect;
export type InsertUserPrize = typeof userPrizes.$inferInsert;

// ============================================
// 業績管理系統 - 業績記錄表
// ============================================
export const performanceRecords = pgTable("performance_records", {
  id: varchar("id", { length: 191 }).primaryKey(),
  clinicId: varchar("clinic_id", { length: 191 }).notNull(),
  staffId: varchar("staff_id", { length: 191 }).notNull(),
  recordDate: timestamp("record_date").notNull(),
  
  // 業績金額（使用 DECIMAL 確保精確性）
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  
  // 業績類型（appointment: 預約、treatment: 療程、product: 產品銷售、manual: 手動新增）
  type: varchar("type", { length: 50 }).notNull(),
  
  // 關聯 ID（預約 ID、療程 ID、產品 ID 等）
  relatedId: varchar("related_id", { length: 191 }),
  
  // 備註
  notes: text("notes"),
  
  // 建立時間與更新時間
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PerformanceRecord = typeof performanceRecords.$inferSelect;
export type InsertPerformanceRecord = typeof performanceRecords.$inferInsert;

// ============================================
// 業績管理系統 - 業績目標表
// ============================================
export const performanceTargets = pgTable("performance_targets", {
  id: varchar("id", { length: 191 }).primaryKey(),
  clinicId: varchar("clinic_id", { length: 191 }).notNull(),
  staffId: varchar("staff_id", { length: 191 }).notNull(),
  
  // 目標期間類型（monthly: 月度、quarterly: 季度、yearly: 年度）
  periodType: varchar("period_type", { length: 50 }).notNull(),
  
  // 目標年份
  year: integer("year").notNull(),
  
  // 目標月份或季度（月度：1-12，季度：1-4，年度：0）
  period: integer("period").notNull(),
  
  // 目標金額（使用 DECIMAL 確保精確性）
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  
  // 備註
  notes: text("notes"),
  
  // 建立時間與更新時間
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PerformanceTarget = typeof performanceTargets.$inferSelect;
export type InsertPerformanceTarget = typeof performanceTargets.$inferInsert;


// ============================================
// 系統 B 整合：6 大核心模組資料表
// 整合日期：2026-01-31
// 來源：yochill-landing (PostgreSQL -> MySQL 轉換)
// ============================================

// ============================================
// 庫存管理表 (System B Integration)
// ============================================
export const inventorySystemB = pgTable("inventory_system_b", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  productId: integer("product_id").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  quantity: integer("quantity").notNull().default(0),
  minStock: integer("min_stock").default(10),
  expiryDate: date("expiry_date"),
  location: varchar("location", { length: 100 }),
  supplier: varchar("supplier", { length: 255 }),
  status: text("inventory_status_b").default("in_stock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InventorySystemB = typeof inventorySystemB.$inferSelect;
export type InsertInventorySystemB = typeof inventorySystemB.$inferInsert;

// ============================================
// CRM 標籤表 (System B Integration)
// ============================================
export const crmTagsSystemB = pgTable("crm_tags_system_b", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#000000"),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CrmTagSystemB = typeof crmTagsSystemB.$inferSelect;
export type InsertCrmTagSystemB = typeof crmTagsSystemB.$inferInsert;

export const customerTagsSystemB = pgTable("customer_tags_system_b", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  tagId: integer("tag_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CustomerTagSystemB = typeof customerTagsSystemB.$inferSelect;
export type InsertCustomerTagSystemB = typeof customerTagsSystemB.$inferInsert;

// ============================================
// 遊戲化行銷表 (System B Integration)
// ============================================
export const gamesSystemB = pgTable("games_system_b", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: text("game_type_b").notNull(),
  status: text("game_status_b").default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  description: text("description"),
  rules: jsonb("rules"),
  imageUrl: text("image_url"),
  costPoints: integer("cost_points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GameSystemB = typeof gamesSystemB.$inferSelect;
export type InsertGameSystemB = typeof gamesSystemB.$inferInsert;

export const prizesSystemB = pgTable("prizes_system_b", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: text("prize_type_b").default("physical"),
  quantity: integer("quantity").notNull().default(0),
  remainingQuantity: integer("remaining_quantity").notNull().default(0),
  probability: decimal("probability", { precision: 5, scale: 2 }).default("0"),
  imageUrl: text("image_url"),
  value: decimal("value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PrizeSystemB = typeof prizesSystemB.$inferSelect;
export type InsertPrizeSystemB = typeof prizesSystemB.$inferInsert;

export const gameParticipationsSystemB = pgTable("game_participations_system_b", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  customerId: integer("customer_id").notNull(),
  prizeId: integer("prize_id"),
  playedAt: timestamp("played_at").defaultNow().notNull(),
  isClaimed: boolean("is_claimed").default(false),
  claimedAt: timestamp("claimed_at"),
});

export type GameParticipationSystemB = typeof gameParticipationsSystemB.$inferSelect;
export type InsertGameParticipationSystemB = typeof gameParticipationsSystemB.$inferInsert;

// ============================================
// 人資薪酬表 (System B Integration)
// 注意：系統 A 已有 staffCommissions，這裡使用 staffCommissionsSystemB
// ============================================
export const staffCommissionsSystemB = pgTable("staff_commissions_system_b", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  staffId: integer("staff_id").notNull(),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).default("0"),
  status: text("commission_status_b").default("calculated"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StaffCommissionSystemB = typeof staffCommissionsSystemB.$inferSelect;
export type InsertStaffCommissionSystemB = typeof staffCommissionsSystemB.$inferInsert;

// ============================================
// 多店調撥表 (System B Integration)
// ============================================
export const inventoryTransfersSystemB = pgTable("inventory_transfers_system_b", {
  id: serial("id").primaryKey(),
  fromOrgId: integer("from_org_id").notNull(),
  toOrgId: integer("to_org_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("transfer_status_b").default("pending"),
  requestedBy: integer("requested_by"),
  approvedBy: integer("approved_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InventoryTransferSystemB = typeof inventoryTransfersSystemB.$inferSelect;
export type InsertInventoryTransferSystemB = typeof inventoryTransfersSystemB.$inferInsert;


// ============================================
// 客戶互動歷史記錄表
// ============================================
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  customerId: integer("customer_id").notNull(),
  type: text("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  createdBy: integer("created_by"), // 操作員工 ID（客戶發送的訊息為 null）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

// ============================================
// 自動化標籤規則表
// ============================================
export const tagRules = pgTable("tag_rules", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  tagId: integer("tag_id").notNull(), // 關聯到 customerTags
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ruleType: text("rule_type").notNull(),
  condition: jsonb("condition").notNull(), // 規則條件 JSON（例如：{"operator": ">=", "value": 100000}）
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TagRule = typeof tagRules.$inferSelect;
export type InsertTagRule = typeof tagRules.$inferInsert;

// ============================================
// LINE Messaging API 設定表
// ============================================
export const lineMessagingSettings = pgTable("line_messaging_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(),
  channelAccessToken: text("channel_access_token").notNull(),
  channelSecret: varchar("channel_secret", { length: 255 }).notNull(),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LineMessagingSetting = typeof lineMessagingSettings.$inferSelect;
export type InsertLineMessagingSetting = typeof lineMessagingSettings.$inferInsert;

// ============================================
// LINE Webhook 事件記錄表
// ============================================
export const lineWebhookEvents = pgTable("line_webhook_events", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // message, follow, unfollow, join, leave, postback, beacon
  sourceType: varchar("source_type", { length: 20 }).notNull(), // user, group, room
  sourceId: varchar("source_id", { length: 100 }).notNull(), // LINE User ID, Group ID, Room ID
  messageType: varchar("message_type", { length: 20 }), // text, image, video, audio, file, location, sticker
  messageText: text("message_text"), // 訊息文字內容
  messageId: varchar("message_id", { length: 100 }), // LINE Message ID
  replyToken: varchar("reply_token", { length: 100 }), // LINE Reply Token
  rawPayload: jsonb("raw_payload").notNull(), // 完整的 Webhook Payload (JSON)
  isProcessed: boolean("is_processed").notNull().default(false), // 是否已處理
  processedAt: timestamp("processed_at"), // 處理時間
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LineWebhookEvent = typeof lineWebhookEvents.$inferSelect;
export type InsertLineWebhookEvent = typeof lineWebhookEvents.$inferInsert;

// ============================================
// 自動回覆規則表
// ============================================
export const autoReplyRules = pgTable("auto_reply_rules", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // 規則名稱
  description: text("description"), // 規則說明
  triggerType: text("trigger_type").notNull(), // keyword, regex, always
  triggerValue: text("trigger_value"), // 觸發關鍵字或正則表達式
  replyType: text("reply_type").notNull(), // text, flex, template
  replyContent: text("reply_content").notNull(), // 回覆內容 (JSON for flex/template)
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(0), // 優先級（數字越大越優先）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AutoReplyRule = typeof autoReplyRules.$inferSelect;
export type InsertAutoReplyRule = typeof autoReplyRules.$inferInsert;


/**
 * ========================================
 * Rich Menu 動態管理系統
 * ========================================
 */

/**
 * Rich Menu 模板表
 */
export const richMenuTemplates = pgTable('rich_menu_templates', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  richMenuId: varchar('rich_menu_id', { length: 255 }), // LINE Rich Menu ID
  imageUrl: text('image_url'), // S3 圖片 URL
  chatBarText: varchar('chat_bar_text', { length: 14 }).notNull(), // 聊天室選單標題
  areas: jsonb('areas').notNull(), // 按鈕區域定義 (JSON)
  isActive: boolean('is_active').default(true),
  targetAudience: varchar('target_audience', { length: 50 }), // 目標受眾：all, new_customer, vip, churn_risk
  abTestGroup: varchar('ab_test_group', { length: 50 }), // A/B 測試分組：control, variant_a, variant_b
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RichMenuTemplate = typeof richMenuTemplates.$inferSelect;
export type InsertRichMenuTemplate = typeof richMenuTemplates.$inferInsert;

/**
 * Rich Menu 客戶分配記錄表
 */
export const richMenuAssignments = pgTable('rich_menu_assignments', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull(),
  customerId: integer('customer_id').notNull(),
  lineUserId: varchar('line_user_id', { length: 255 }).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
});

export type RichMenuAssignment = typeof richMenuAssignments.$inferSelect;
export type InsertRichMenuAssignment = typeof richMenuAssignments.$inferInsert;

/**
 * Rich Menu 點擊統計表
 */
export const richMenuClickStats = pgTable('rich_menu_click_stats', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull(),
  customerId: integer('customer_id'),
  lineUserId: varchar('line_user_id', { length: 255 }).notNull(),
  areaIndex: integer('area_index').notNull(), // 點擊的按鈕區域索引
  clickedAt: timestamp('clicked_at').defaultNow(),
});

export type RichMenuClickStat = typeof richMenuClickStats.$inferSelect;
export type InsertRichMenuClickStat = typeof richMenuClickStats.$inferInsert;


/**
 * ========================================
 * 客戶分群推播系統
 * ========================================
 */

/**
 * 推播活動表
 */
export const broadcastCampaigns = pgTable('broadcast_campaigns', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  messageType: varchar('message_type', { length: 50 }).notNull(), // text, flex, image
  messageContent: jsonb('message_content').notNull(), // 訊息內容 (JSON)
  targetAudience: jsonb('target_audience').notNull(), // 分群條件 (JSON)
  scheduledAt: timestamp('scheduled_at'), // 排程發送時間
  status: varchar('status', { length: 50 }).default('draft'), // draft, scheduled, sending, completed, failed
  totalRecipients: integer('total_recipients').default(0),
  sentCount: integer('sent_count').default(0),
  deliveredCount: integer('delivered_count').default(0),
  clickedCount: integer('clicked_count').default(0),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type BroadcastCampaign = typeof broadcastCampaigns.$inferSelect;
export type InsertBroadcastCampaign = typeof broadcastCampaigns.$inferInsert;

/**
 * 推播收件人記錄表
 */
export const broadcastRecipients = pgTable('broadcast_recipients', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull(),
  customerId: integer('customer_id').notNull(),
  lineUserId: varchar('line_user_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, sent, delivered, failed
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  clickedAt: timestamp('clicked_at'),
  errorMessage: text('error_message'),
});

export type BroadcastRecipient = typeof broadcastRecipients.$inferSelect;
export type InsertBroadcastRecipient = typeof broadcastRecipients.$inferInsert;


/**
 * ========================================
 * AI 對話機器人
 * ========================================
 */

/**
 * AI 對話記錄表
 */
export const aiConversations = pgTable('ai_conversations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  customerId: integer('customer_id'),
  lineUserId: varchar('line_user_id', { length: 255 }).notNull(),
  sessionId: varchar('session_id', { length: 255 }).notNull(), // 對話 Session ID
  userMessage: text('user_message').notNull(),
  aiResponse: text('ai_response').notNull(),
  intent: varchar('intent', { length: 100 }), // 識別的意圖：appointment, consultation, faq, general
  confidence: decimal('confidence', { precision: 5, scale: 2 }), // 意圖信心分數
  context: jsonb('context'), // 對話上下文 (JSON)
  createdAt: timestamp('created_at').defaultNow(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

/**
 * AI 意圖定義表
 */
export const aiIntents = pgTable('ai_intents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  keywords: jsonb('keywords').notNull(), // 關鍵字列表 (JSON)
  trainingExamples: jsonb('training_examples'), // 訓練範例 (JSON)
  responseTemplate: text('response_template'), // 回覆模板
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type AiIntent = typeof aiIntents.$inferSelect;
export type InsertAiIntent = typeof aiIntents.$inferInsert;

/**
 * AI 知識庫表
 */
export const aiKnowledgeBase = pgTable('ai_knowledge_base', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // FAQ, 產品資訊, 療程說明
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  keywords: jsonb('keywords'), // 關鍵字列表 (JSON)
  priority: integer('priority').default(0), // 優先級
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type AiKnowledgeBase = typeof aiKnowledgeBase.$inferSelect;
export type InsertAiKnowledgeBase = typeof aiKnowledgeBase.$inferInsert;

/**
 * Rich Menu 模板市集表
 */
export const richMenuTemplateMarket = pgTable('rich_menu_template_market', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 50 }).notNull(), // 'restaurant', 'beauty', 'retail', 'medical'
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  imageWidth: integer('image_width').notNull(),
  imageHeight: integer('image_height').notNull(),
  areas: jsonb('areas').notNull(), // 按鈕區域定義（JSON 格式）
  tags: jsonb('tags'), // 標籤（例如：['熱門', '新品', '優惠']）
  usageCount: integer('usage_count').default(0), // 使用次數
  rating: decimal('rating', { precision: 3, scale: 2 }), // 評分（0-5）
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RichMenuTemplateMarket = typeof richMenuTemplateMarket.$inferSelect;
export type InsertRichMenuTemplateMarket = typeof richMenuTemplateMarket.$inferInsert;

/**
 * 推播活動版本表（A/B 測試）
 */
export const broadcastCampaignVariants = pgTable('broadcast_campaign_variants', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull(),
  variantName: varchar('variant_name', { length: 100 }).notNull(), // 版本名稱（例如：A, B, C）
  messageContent: text('message_content').notNull(),
  messageType: varchar('message_type', { length: 50 }).notNull(), // text, image, flex
  flexMessageJson: jsonb('flex_message_json'), // Flex Message JSON
  trafficPercentage: integer('traffic_percentage').notNull(), // 流量分配百分比（0-100）
  sentCount: integer('sent_count').default(0), // 發送數量
  openedCount: integer('opened_count').default(0), // 開啟數量
  clickedCount: integer('clicked_count').default(0), // 點擊數量
  convertedCount: integer('converted_count').default(0), // 轉換數量
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type BroadcastCampaignVariant = typeof broadcastCampaignVariants.$inferSelect;
export type InsertBroadcastCampaignVariant = typeof broadcastCampaignVariants.$inferInsert;

/**
 * AI 知識庫向量表（pgvector 整合）
 */
export const aiKnowledgeBaseVectors = pgTable('ai_knowledge_base_vectors', {
  id: serial('id').primaryKey(),
  knowledgeBaseId: integer('knowledge_base_id').notNull(),
  embedding: vector('embedding').notNull(), // pgvector vector(1536) - OpenAI text-embedding-3-small
  embeddingModel: varchar('embedding_model', { length: 100 }).default('text-embedding-3-small'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type AiKnowledgeBaseVector = typeof aiKnowledgeBaseVectors.$inferSelect;
export type InsertAiKnowledgeBaseVector = typeof aiKnowledgeBaseVectors.$inferInsert;


// ============================================
// Sprint 6: 計費管理 — 帳單表
// ============================================
export const invoiceStatusEnum = pgEnum("invoice_status_enum", [
  "paid", "pending", "overdue", "cancelled",
]);

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  /** 帳單編號，如 INV-2026-0001 */
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  status: invoiceStatusEnum("status").default("pending"),
  /** 方案名稱快照 */
  planName: varchar("plan_name", { length: 100 }),
  /** 帳單明細 (JSON: [{item, qty, unitPrice, subtotal}]) */
  lineItems: jsonb("line_items"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================
// Sprint 6: API 金鑰管理表
// ============================================
export const apiKeyStatusEnum = pgEnum("api_key_status_enum", [
  "active", "revoked", "expired",
]);

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  /** 金鑰名稱（使用者自訂） */
  name: varchar("name", { length: 200 }).notNull(),
  /** 金鑰前綴（用於識別，如 yk_live_abc） */
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  /** 金鑰雜湊（SHA-256，不可逆） */
  keyHash: varchar("key_hash", { length: 128 }).notNull(),
  status: apiKeyStatusEnum("status").default("active"),
  /** 權限範圍 (JSON: ["read:customers","write:appointments"]) */
  scopes: jsonb("scopes").$type<string[]>(),
  lastUsedAt: timestamp("last_used_at"),
  requestCount: integer("request_count").default(0),
  /** 每日請求上限 */
  rateLimit: integer("rate_limit").default(1000),
  expiresAt: timestamp("expires_at"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// ============================================
// Sprint 6: API 使用紀錄表
// ============================================
export const apiUsageLogs = pgTable("api_usage_logs", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  endpoint: varchar("endpoint", { length: 500 }),
  method: varchar("method", { length: 10 }),
  statusCode: integer("status_code"),
  responseTimeMs: integer("response_time_ms"),
  calledAt: timestamp("called_at").defaultNow().notNull(),
});
export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;
export type InsertApiUsageLog = typeof apiUsageLogs.$inferInsert;

// ============================================
// Sprint 6: 白標方案設定表
// ============================================
export const whiteLabelPlanEnum = pgEnum("white_label_plan_enum", [
  "basic", "professional", "enterprise",
]);

export const domainStatusEnum = pgEnum("domain_status_enum", [
  "pending", "active", "error",
]);

export const whiteLabelConfigs = pgTable("white_label_configs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  /** 白標方案 */
  plan: whiteLabelPlanEnum("plan").default("basic"),
  /** 自訂網域 */
  customDomain: varchar("custom_domain", { length: 255 }),
  domainStatus: domainStatusEnum("domain_status").default("pending"),
  /** 品牌主色 */
  primaryColor: varchar("primary_color", { length: 20 }).default("#6366f1"),
  /** 品牌 Logo URL */
  logoUrl: varchar("logo_url", { length: 500 }),
  /** 品牌名稱 */
  brandName: varchar("brand_name", { length: 200 }),
  /** 自訂 CSS */
  customCss: text("custom_css"),
  /** 自訂 Favicon URL */
  faviconUrl: varchar("favicon_url", { length: 500 }),
  /** 啟用白標 */
  isActive: boolean("is_active").default(false),
  /** 額外設定 (JSON) */
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type WhiteLabelConfig = typeof whiteLabelConfigs.$inferSelect;
export type InsertWhiteLabelConfig = typeof whiteLabelConfigs.$inferInsert;
