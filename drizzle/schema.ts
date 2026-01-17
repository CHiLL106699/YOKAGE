import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  date,
  time,
} from "drizzle-orm/mysql-core";

// ============================================
// 核心使用者表 - 支援多角色
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "clinic_admin", "staff", "customer", "user"]).default("user").notNull(),
  lineUserId: varchar("lineUserId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// 組織/診所表 - 多租戶核心
// ============================================
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logo: text("logo"),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Taipei"),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  businessHours: json("businessHours"),
  settings: json("settings"),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "basic", "pro", "enterprise"]).default("free"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "suspended", "cancelled"]).default("active"),
  trialEndsAt: timestamp("trialEndsAt"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// ============================================
// 組織使用者關聯表 - 多對多關係
// ============================================
export const organizationUsers = mysqlTable("organizationUsers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "manager", "staff"]).default("staff").notNull(),
  permissions: json("permissions"),
  isActive: boolean("isActive").default(true),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrganizationUser = typeof organizationUsers.$inferSelect;
export type InsertOrganizationUser = typeof organizationUsers.$inferInsert;

// ============================================
// 客戶表
// ============================================
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  birthday: date("birthday"),
  address: text("address"),
  avatar: text("avatar"),
  lineUserId: varchar("lineUserId", { length: 64 }),
  memberLevel: mysqlEnum("memberLevel", ["bronze", "silver", "gold", "platinum", "diamond"]).default("bronze"),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0"),
  visitCount: int("visitCount").default(0),
  notes: text("notes"),
  source: varchar("source", { length: 100 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ============================================
// 客戶標籤表
// ============================================
export const customerTags = mysqlTable("customerTags", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }).default("#6366f1"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerTag = typeof customerTags.$inferSelect;
export type InsertCustomerTag = typeof customerTags.$inferInsert;

// ============================================
// 客戶標籤關聯表
// ============================================
export const customerTagRelations = mysqlTable("customerTagRelations", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerTagRelation = typeof customerTagRelations.$inferSelect;
export type InsertCustomerTagRelation = typeof customerTagRelations.$inferInsert;

// ============================================
// 產品/服務表
// ============================================
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  type: mysqlEnum("type", ["service", "product", "package"]).default("service"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
  duration: int("duration"),
  stock: int("stock"),
  images: json("images"),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ============================================
// 員工表
// ============================================
export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId"),
  employeeId: varchar("employeeId", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),
  hireDate: date("hireDate"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  salaryType: mysqlEnum("salaryType", ["monthly", "hourly", "commission"]).default("monthly"),
  avatar: text("avatar"),
  skills: json("skills"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;

// ============================================
// 預約時段模板表
// ============================================
export const appointmentSlots = mysqlTable("appointmentSlots", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  staffId: int("staffId"),
  dayOfWeek: int("dayOfWeek").notNull(),
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  slotDuration: int("slotDuration").default(30),
  maxBookings: int("maxBookings").default(1),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AppointmentSlot = typeof appointmentSlots.$inferSelect;
export type InsertAppointmentSlot = typeof appointmentSlots.$inferInsert;

// ============================================
// 預約表
// ============================================
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  staffId: int("staffId"),
  productId: int("productId"),
  appointmentDate: date("appointmentDate").notNull(),
  startTime: time("startTime").notNull(),
  endTime: time("endTime"),
  status: mysqlEnum("status", ["pending", "confirmed", "arrived", "in_progress", "completed", "cancelled", "no_show"]).default("pending"),
  notes: text("notes"),
  internalNotes: text("internalNotes"),
  source: varchar("source", { length: 50 }).default("web"),
  reminderSent: boolean("reminderSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ============================================
// 排班表
// ============================================
export const schedules = mysqlTable("schedules", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  staffId: int("staffId").notNull(),
  scheduleDate: date("scheduleDate").notNull(),
  shiftType: mysqlEnum("shiftType", ["morning", "afternoon", "evening", "full", "off", "custom"]).default("full"),
  startTime: time("startTime"),
  endTime: time("endTime"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

// ============================================
// 打卡記錄表
// ============================================
export const attendanceRecords = mysqlTable("attendanceRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  staffId: int("staffId").notNull(),
  recordDate: date("recordDate").notNull(),
  clockIn: timestamp("clockIn"),
  clockOut: timestamp("clockOut"),
  clockInLocation: json("clockInLocation"),
  clockOutLocation: json("clockOutLocation"),
  status: mysqlEnum("status", ["normal", "late", "early_leave", "absent", "leave"]).default("normal"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;

// ============================================
// 優惠券表
// ============================================
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).default("percentage"),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("minPurchase", { precision: 10, scale: 2 }),
  maxDiscount: decimal("maxDiscount", { precision: 10, scale: 2 }),
  usageLimit: int("usageLimit"),
  usedCount: int("usedCount").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// ============================================
// 訂單表
// ============================================
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "processing", "completed", "cancelled", "refunded"]).default("pending"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  couponId: int("couponId"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================
// 訂單項目表
// ============================================
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ============================================
// 術後關懷記錄表
// ============================================
export const aftercareRecords = mysqlTable("aftercareRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  appointmentId: int("appointmentId"),
  productId: int("productId"),
  staffId: int("staffId"),
  treatmentDate: date("treatmentDate").notNull(),
  followUpDate: date("followUpDate"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  notes: text("notes"),
  customerFeedback: text("customerFeedback"),
  photos: json("photos"),
  reminderSent: boolean("reminderSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AftercareRecord = typeof aftercareRecords.$inferSelect;
export type InsertAftercareRecord = typeof aftercareRecords.$inferInsert;

// ============================================
// LINE Channel 設定表
// ============================================
export const lineChannels = mysqlTable("lineChannels", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  channelName: varchar("channelName", { length: 255 }).notNull(),
  channelId: varchar("channelId", { length: 100 }).notNull(),
  channelSecret: varchar("channelSecret", { length: 255 }),
  accessToken: text("accessToken"),
  liffId: varchar("liffId", { length: 100 }),
  webhookUrl: text("webhookUrl"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LineChannel = typeof lineChannels.$inferSelect;
export type InsertLineChannel = typeof lineChannels.$inferInsert;

// ============================================
// 系統活動日誌表
// ============================================
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId"),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;


// ============================================
// 療程記錄表 - 核心功能 1
// ============================================
export const treatmentRecords = mysqlTable("treatmentRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  appointmentId: int("appointmentId"),
  staffId: int("staffId"),
  productId: int("productId"),
  treatmentDate: timestamp("treatmentDate").notNull(),
  treatmentType: varchar("treatmentType", { length: 100 }),
  treatmentArea: varchar("treatmentArea", { length: 100 }),
  dosage: varchar("dosage", { length: 100 }),
  notes: text("notes"),
  internalNotes: text("internalNotes"),
  satisfactionScore: int("satisfactionScore"),
  nextFollowUpDate: date("nextFollowUpDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TreatmentRecord = typeof treatmentRecords.$inferSelect;
export type InsertTreatmentRecord = typeof treatmentRecords.$inferInsert;

// ============================================
// 療程照片表 - 核心功能 1
// ============================================
export const treatmentPhotos = mysqlTable("treatmentPhotos", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  treatmentRecordId: int("treatmentRecordId"),
  photoType: mysqlEnum("photoType", ["before", "after", "during", "other"]).default("before"),
  photoUrl: text("photoUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  photoDate: timestamp("photoDate").notNull(),
  angle: varchar("angle", { length: 50 }),
  notes: text("notes"),
  isPublic: boolean("isPublic").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TreatmentPhoto = typeof treatmentPhotos.$inferSelect;
export type InsertTreatmentPhoto = typeof treatmentPhotos.$inferInsert;

// ============================================
// 客戶套餐表 - 核心功能 2
// ============================================
export const customerPackages = mysqlTable("customerPackages", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  productId: int("productId").notNull(),
  packageName: varchar("packageName", { length: 255 }).notNull(),
  totalSessions: int("totalSessions").notNull(),
  usedSessions: int("usedSessions").default(0).notNull(),
  remainingSessions: int("remainingSessions").notNull(),
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchaseDate").notNull(),
  expiryDate: timestamp("expiryDate"),
  status: mysqlEnum("status", ["active", "expired", "completed", "cancelled"]).default("active"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerPackage = typeof customerPackages.$inferSelect;
export type InsertCustomerPackage = typeof customerPackages.$inferInsert;

// ============================================
// 套餐使用記錄表 - 核心功能 2
// ============================================
export const packageUsageRecords = mysqlTable("packageUsageRecords", {
  id: int("id").autoincrement().primaryKey(),
  packageId: int("packageId").notNull(),
  customerId: int("customerId").notNull(),
  appointmentId: int("appointmentId"),
  treatmentRecordId: int("treatmentRecordId"),
  sessionsUsed: int("sessionsUsed").default(1).notNull(),
  usageDate: timestamp("usageDate").notNull(),
  staffId: int("staffId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PackageUsageRecord = typeof packageUsageRecords.$inferSelect;
export type InsertPackageUsageRecord = typeof packageUsageRecords.$inferInsert;

// ============================================
// 諮詢記錄表 - 核心功能 3
// ============================================
export const consultations = mysqlTable("consultations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId"),
  prospectName: varchar("prospectName", { length: 255 }),
  prospectPhone: varchar("prospectPhone", { length: 20 }),
  prospectEmail: varchar("prospectEmail", { length: 320 }),
  consultationDate: timestamp("consultationDate").notNull(),
  consultationType: mysqlEnum("consultationType", ["walk_in", "phone", "online", "referral"]).default("walk_in"),
  staffId: int("staffId"),
  interestedProducts: json("interestedProducts"),
  concerns: text("concerns"),
  recommendations: text("recommendations"),
  status: mysqlEnum("status", ["new", "contacted", "scheduled", "converted", "lost"]).default("new"),
  conversionDate: timestamp("conversionDate"),
  convertedOrderId: int("convertedOrderId"),
  source: varchar("source", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

// ============================================
// 跟進記錄表 - 核心功能 3
// ============================================
export const followUps = mysqlTable("followUps", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  consultationId: int("consultationId"),
  customerId: int("customerId"),
  staffId: int("staffId"),
  followUpDate: timestamp("followUpDate").notNull(),
  followUpType: mysqlEnum("followUpType", ["call", "sms", "line", "email", "visit"]).default("call"),
  status: mysqlEnum("status", ["pending", "completed", "cancelled", "rescheduled"]).default("pending"),
  outcome: varchar("outcome", { length: 255 }),
  notes: text("notes"),
  nextFollowUpDate: timestamp("nextFollowUpDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = typeof followUps.$inferInsert;

// ============================================
// 客戶 RFM 分數表 - 核心功能 4
// ============================================
export const customerRfmScores = mysqlTable("customerRfmScores", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  recencyScore: int("recencyScore").notNull(),
  frequencyScore: int("frequencyScore").notNull(),
  monetaryScore: int("monetaryScore").notNull(),
  totalScore: int("totalScore").notNull(),
  segment: varchar("segment", { length: 50 }),
  lastPurchaseDate: timestamp("lastPurchaseDate"),
  purchaseCount: int("purchaseCount").default(0),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0"),
  churnRisk: int("churnRisk").default(0),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerRfmScore = typeof customerRfmScores.$inferSelect;
export type InsertCustomerRfmScore = typeof customerRfmScores.$inferInsert;

// ============================================
// 員工佣金規則表 - 核心功能 6
// ============================================
export const commissionRules = mysqlTable("commissionRules", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  productId: int("productId"),
  productCategory: varchar("productCategory", { length: 100 }),
  commissionType: mysqlEnum("commissionType", ["percentage", "fixed"]).default("percentage"),
  commissionValue: decimal("commissionValue", { precision: 10, scale: 2 }).notNull(),
  minSalesAmount: decimal("minSalesAmount", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommissionRule = typeof commissionRules.$inferSelect;
export type InsertCommissionRule = typeof commissionRules.$inferInsert;

// ============================================
// 員工佣金記錄表 - 核心功能 6
// ============================================
export const staffCommissions = mysqlTable("staffCommissions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  staffId: int("staffId").notNull(),
  orderId: int("orderId"),
  orderItemId: int("orderItemId"),
  appointmentId: int("appointmentId"),
  commissionRuleId: int("commissionRuleId"),
  salesAmount: decimal("salesAmount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).notNull(),
  commissionDate: timestamp("commissionDate").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled"]).default("pending"),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaffCommission = typeof staffCommissions.$inferSelect;
export type InsertStaffCommission = typeof staffCommissions.$inferInsert;

// ============================================
// 庫存異動記錄表 - 核心功能 7
// ============================================
export const inventoryTransactions = mysqlTable("inventoryTransactions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  productId: int("productId").notNull(),
  transactionType: mysqlEnum("transactionType", ["purchase", "sale", "adjustment", "return", "transfer", "waste"]).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }),
  referenceId: int("referenceId"),
  referenceType: varchar("referenceType", { length: 50 }),
  batchNumber: varchar("batchNumber", { length: 100 }),
  expiryDate: date("expiryDate"),
  notes: text("notes"),
  staffId: int("staffId"),
  transactionDate: timestamp("transactionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = typeof inventoryTransactions.$inferInsert;

// ============================================
// 營收目標表 - 核心功能 8
// ============================================
export const revenueTargets = mysqlTable("revenueTargets", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  targetType: mysqlEnum("targetType", ["monthly", "quarterly", "yearly"]).default("monthly"),
  targetYear: int("targetYear").notNull(),
  targetMonth: int("targetMonth"),
  targetQuarter: int("targetQuarter"),
  targetAmount: decimal("targetAmount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actualAmount", { precision: 12, scale: 2 }).default("0"),
  achievementRate: decimal("achievementRate", { precision: 5, scale: 2 }).default("0"),
  staffId: int("staffId"),
  productCategory: varchar("productCategory", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevenueTarget = typeof revenueTargets.$inferSelect;
export type InsertRevenueTarget = typeof revenueTargets.$inferInsert;

// ============================================
// 行銷活動表 - 核心功能 9
// ============================================
export const marketingCampaigns = mysqlTable("marketingCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  campaignType: mysqlEnum("campaignType", ["facebook", "google", "line", "instagram", "referral", "event", "other"]).default("other"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  actualSpend: decimal("actualSpend", { precision: 10, scale: 2 }).default("0"),
  targetAudience: text("targetAudience"),
  description: text("description"),
  trackingCode: varchar("trackingCode", { length: 100 }),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;

// ============================================
// 客戶來源追蹤表 - 核心功能 9
// ============================================
export const customerSources = mysqlTable("customerSources", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  campaignId: int("campaignId"),
  sourceType: varchar("sourceType", { length: 100 }),
  sourceName: varchar("sourceName", { length: 255 }),
  referralCode: varchar("referralCode", { length: 100 }),
  referredByCustomerId: int("referredByCustomerId"),
  firstVisitDate: timestamp("firstVisitDate"),
  firstPurchaseDate: timestamp("firstPurchaseDate"),
  firstPurchaseAmount: decimal("firstPurchaseAmount", { precision: 10, scale: 2 }),
  lifetimeValue: decimal("lifetimeValue", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerSource = typeof customerSources.$inferSelect;
export type InsertCustomerSource = typeof customerSources.$inferInsert;

// ============================================
// 滿意度調查表 - 核心功能 10
// ============================================
export const satisfactionSurveys = mysqlTable("satisfactionSurveys", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  appointmentId: int("appointmentId"),
  treatmentRecordId: int("treatmentRecordId"),
  surveyType: mysqlEnum("surveyType", ["post_treatment", "post_purchase", "general", "nps"]).default("post_treatment"),
  overallScore: int("overallScore"),
  serviceScore: int("serviceScore"),
  staffScore: int("staffScore"),
  facilityScore: int("facilityScore"),
  valueScore: int("valueScore"),
  npsScore: int("npsScore"),
  wouldRecommend: boolean("wouldRecommend"),
  feedback: text("feedback"),
  improvementSuggestions: text("improvementSuggestions"),
  staffId: int("staffId"),
  sentAt: timestamp("sentAt"),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["pending", "sent", "completed", "expired"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;
export type InsertSatisfactionSurvey = typeof satisfactionSurveys.$inferInsert;
