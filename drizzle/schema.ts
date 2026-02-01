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
  // 地理圍欄功能擴展
  checkInLatitude: decimal("checkInLatitude", { precision: 10, scale: 7 }),
  checkInLongitude: decimal("checkInLongitude", { precision: 10, scale: 7 }),
  checkInAccuracy: decimal("checkInAccuracy", { precision: 8, scale: 2 }),
  checkInAddress: text("checkInAddress"),
  checkOutLatitude: decimal("checkOutLatitude", { precision: 10, scale: 7 }),
  checkOutLongitude: decimal("checkOutLongitude", { precision: 10, scale: 7 }),
  checkOutAccuracy: decimal("checkOutAccuracy", { precision: 8, scale: 2 }),
  checkOutAddress: text("checkOutAddress"),
  isWithinGeofence: boolean("isWithinGeofence").default(true),
  distanceFromClinic: decimal("distanceFromClinic", { precision: 8, scale: 2 }),
  status: mysqlEnum("status", ["normal", "late", "early_leave", "absent", "leave"]).default("normal"),
  notes: text("notes"),
  // 補登相關欄位
  isManualEntry: boolean("isManualEntry").default(false), // 是否為補登
  manualReason: text("manualReason"), // 補登原因
  approvedBy: int("approvedBy"), // 審核人員 ID
  approvedAt: timestamp("approvedAt"), // 審核時間
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("approved"), // 審核狀態
  staffNote: text("staffNote"), // 員工備註（用於解釋異常打卡情況）
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


// ============================================
// 候補名單表 - 核心功能 5
// ============================================
export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  preferredDate: date("preferredDate").notNull(),
  preferredTimeSlot: varchar("preferredTimeSlot", { length: 50 }),
  productId: int("productId"),
  status: mysqlEnum("status", ["waiting", "notified", "booked", "cancelled"]).default("waiting"),
  notes: text("notes"),
  notifiedAt: timestamp("notifiedAt"),
  bookedAppointmentId: int("bookedAppointmentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;


// ============================================
// Phase 41: 注射點位圖與臉部標記
// ============================================
export const injectionRecords = mysqlTable("injectionRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  appointmentId: int("appointmentId"),
  treatmentRecordId: int("treatmentRecordId"),
  staffId: int("staffId").notNull(),
  templateType: mysqlEnum("templateType", ["face_front", "face_side_left", "face_side_right", "body_front", "body_back"]).default("face_front"),
  productUsed: varchar("productUsed", { length: 255 }),
  totalUnits: decimal("totalUnits", { precision: 8, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InjectionRecord = typeof injectionRecords.$inferSelect;
export type InsertInjectionRecord = typeof injectionRecords.$inferInsert;

export const injectionPoints = mysqlTable("injectionPoints", {
  id: int("id").autoincrement().primaryKey(),
  injectionRecordId: int("injectionRecordId").notNull(),
  positionX: decimal("positionX", { precision: 5, scale: 2 }).notNull(),
  positionY: decimal("positionY", { precision: 5, scale: 2 }).notNull(),
  units: decimal("units", { precision: 6, scale: 2 }).notNull(),
  depth: varchar("depth", { length: 50 }),
  technique: varchar("technique", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InjectionPoint = typeof injectionPoints.$inferSelect;
export type InsertInjectionPoint = typeof injectionPoints.$inferInsert;

// ============================================
// Phase 42: 電子同意書與數位簽章
// ============================================
export const consentFormTemplates = mysqlTable("consentFormTemplates", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["treatment", "surgery", "anesthesia", "photography", "general"]).default("treatment"),
  content: text("content").notNull(),
  requiredFields: json("requiredFields"),
  version: varchar("version", { length: 20 }).default("1.0"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConsentFormTemplate = typeof consentFormTemplates.$inferSelect;
export type InsertConsentFormTemplate = typeof consentFormTemplates.$inferInsert;

export const consentSignatures = mysqlTable("consentSignatures", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  templateId: int("templateId").notNull(),
  appointmentId: int("appointmentId"),
  treatmentRecordId: int("treatmentRecordId"),
  signatureImageUrl: text("signatureImageUrl").notNull(),
  signedContent: text("signedContent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  signedAt: timestamp("signedAt").defaultNow().notNull(),
  witnessName: varchar("witnessName", { length: 255 }),
  witnessSignatureUrl: text("witnessSignatureUrl"),
  status: mysqlEnum("status", ["pending", "signed", "revoked"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConsentSignature = typeof consentSignatures.$inferSelect;
export type InsertConsentSignature = typeof consentSignatures.$inferInsert;

// ============================================
// Phase 43: 處方管理系統
// ============================================
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  genericName: varchar("genericName", { length: 255 }),
  category: mysqlEnum("category", ["oral", "topical", "injection", "supplement", "other"]).default("oral"),
  dosageForm: varchar("dosageForm", { length: 100 }),
  strength: varchar("strength", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  contraindications: text("contraindications"),
  sideEffects: text("sideEffects"),
  instructions: text("instructions"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

export const prescriptions = mysqlTable("prescriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  prescriberId: int("prescriberId").notNull(),
  appointmentId: int("appointmentId"),
  treatmentRecordId: int("treatmentRecordId"),
  medicationId: int("medicationId").notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }),
  quantity: int("quantity").notNull(),
  refillsAllowed: int("refillsAllowed").default(0),
  refillsUsed: int("refillsUsed").default(0),
  instructions: text("instructions"),
  warnings: text("warnings"),
  status: mysqlEnum("status", ["active", "completed", "cancelled", "expired"]).default("active"),
  prescribedAt: timestamp("prescribedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;

export const customerAllergies = mysqlTable("customerAllergies", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  allergyType: mysqlEnum("allergyType", ["medication", "food", "environmental", "other"]).default("medication"),
  allergen: varchar("allergen", { length: 255 }).notNull(),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe", "life_threatening"]).default("moderate"),
  reaction: text("reaction"),
  diagnosedDate: date("diagnosedDate"),
  notes: text("notes"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerAllergy = typeof customerAllergies.$inferSelect;
export type InsertCustomerAllergy = typeof customerAllergies.$inferInsert;

// ============================================
// Phase 44: AI 膚質分析
// ============================================
export const skinAnalysisRecords = mysqlTable("skinAnalysisRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  appointmentId: int("appointmentId"),
  photoUrl: text("photoUrl").notNull(),
  analysisType: mysqlEnum("analysisType", ["full_face", "forehead", "cheeks", "chin", "nose", "eyes"]).default("full_face"),
  overallScore: int("overallScore"),
  skinAge: int("skinAge"),
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
  aiModel: varchar("aiModel", { length: 100 }),
  rawResults: json("rawResults"),
  recommendations: text("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkinAnalysisRecord = typeof skinAnalysisRecords.$inferSelect;
export type InsertSkinAnalysisRecord = typeof skinAnalysisRecords.$inferInsert;

export const skinMetrics = mysqlTable("skinMetrics", {
  id: int("id").autoincrement().primaryKey(),
  analysisRecordId: int("analysisRecordId").notNull(),
  metricType: mysqlEnum("metricType", ["wrinkles", "spots", "pores", "texture", "hydration", "oiliness", "redness", "elasticity"]).notNull(),
  score: int("score").notNull(),
  severity: mysqlEnum("severity", ["none", "mild", "moderate", "severe"]).default("none"),
  affectedArea: varchar("affectedArea", { length: 100 }),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SkinMetric = typeof skinMetrics.$inferSelect;
export type InsertSkinMetric = typeof skinMetrics.$inferInsert;

// ============================================
// Phase 45: 會員訂閱制管理
// ============================================
export const membershipPlans = mysqlTable("membershipPlans", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annualPrice", { precision: 10, scale: 2 }),
  benefits: json("benefits"),
  includedServices: json("includedServices"),
  discountPercentage: int("discountPercentage").default(0),
  priorityBooking: boolean("priorityBooking").default(false),
  freeConsultations: int("freeConsultations").default(0),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembershipPlan = typeof membershipPlans.$inferSelect;
export type InsertMembershipPlan = typeof membershipPlans.$inferInsert;

export const memberSubscriptions = mysqlTable("memberSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  planId: int("planId").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).default("monthly"),
  status: mysqlEnum("status", ["active", "paused", "cancelled", "expired"]).default("active"),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  nextBillingDate: date("nextBillingDate"),
  autoRenew: boolean("autoRenew").default(true),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  lastPaymentDate: date("lastPaymentDate"),
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemberSubscription = typeof memberSubscriptions.$inferSelect;
export type InsertMemberSubscription = typeof memberSubscriptions.$inferInsert;

export const subscriptionPayments = mysqlTable("subscriptionPayments", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  billingPeriodStart: date("billingPeriodStart"),
  billingPeriodEnd: date("billingPeriodEnd"),
  paidAt: timestamp("paidAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = typeof subscriptionPayments.$inferInsert;

// ============================================
// Phase 46: 遠程諮詢功能
// ============================================
export const teleConsultations = mysqlTable("teleConsultations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  staffId: int("staffId").notNull(),
  appointmentId: int("appointmentId"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration").default(30),
  roomId: varchar("roomId", { length: 255 }),
  roomUrl: text("roomUrl"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled", "no_show"]).default("scheduled"),
  consultationType: mysqlEnum("consultationType", ["initial", "follow_up", "pre_treatment", "post_treatment"]).default("initial"),
  notes: text("notes"),
  summary: text("summary"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeleConsultation = typeof teleConsultations.$inferSelect;
export type InsertTeleConsultation = typeof teleConsultations.$inferInsert;

export const consultationRecordings = mysqlTable("consultationRecordings", {
  id: int("id").autoincrement().primaryKey(),
  teleConsultationId: int("teleConsultationId").notNull(),
  recordingUrl: text("recordingUrl").notNull(),
  duration: int("duration"),
  fileSize: int("fileSize"),
  format: varchar("format", { length: 20 }),
  transcription: text("transcription"),
  consentGiven: boolean("consentGiven").default(false),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsultationRecording = typeof consultationRecordings.$inferSelect;
export type InsertConsultationRecording = typeof consultationRecordings.$inferInsert;

// ============================================
// Phase 47: 客戶推薦獎勵系統
// ============================================
export const referralCodes = mysqlTable("referralCodes", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  customerId: int("customerId").notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  referrerRewardType: mysqlEnum("referrerRewardType", ["points", "credit", "discount", "free_service"]).default("points"),
  referrerRewardValue: decimal("referrerRewardValue", { precision: 10, scale: 2 }).default("0"),
  refereeRewardType: mysqlEnum("refereeRewardType", ["points", "credit", "discount", "free_service"]).default("discount"),
  refereeRewardValue: decimal("refereeRewardValue", { precision: 10, scale: 2 }).default("0"),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0),
  isActive: boolean("isActive").default(true),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

export const referralRecords = mysqlTable("referralRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  referralCodeId: int("referralCodeId").notNull(),
  referrerId: int("referrerId").notNull(),
  refereeId: int("refereeId").notNull(),
  refereeOrderId: int("refereeOrderId"),
  status: mysqlEnum("status", ["pending", "qualified", "rewarded", "expired"]).default("pending"),
  qualifiedAt: timestamp("qualifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralRecord = typeof referralRecords.$inferSelect;
export type InsertReferralRecord = typeof referralRecords.$inferInsert;

export const referralRewards = mysqlTable("referralRewards", {
  id: int("id").autoincrement().primaryKey(),
  referralRecordId: int("referralRecordId").notNull(),
  recipientId: int("recipientId").notNull(),
  recipientType: mysqlEnum("recipientType", ["referrer", "referee"]).notNull(),
  rewardType: mysqlEnum("rewardType", ["points", "credit", "discount", "free_service"]).notNull(),
  rewardValue: decimal("rewardValue", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "issued", "used", "expired"]).default("pending"),
  issuedAt: timestamp("issuedAt"),
  usedAt: timestamp("usedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

// ============================================
// Phase 48: 社群媒體整合管理
// ============================================
export const socialAccounts = mysqlTable("socialAccounts", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "line", "tiktok", "youtube", "xiaohongshu"]).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accountId: varchar("accountId", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  followerCount: int("followerCount").default(0),
  isConnected: boolean("isConnected").default(false),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

export const scheduledPosts = mysqlTable("scheduledPosts", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  socialAccountId: int("socialAccountId").notNull(),
  content: text("content").notNull(),
  mediaUrls: json("mediaUrls"),
  hashtags: json("hashtags"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  publishedAt: timestamp("publishedAt"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed", "cancelled"]).default("draft"),
  postType: mysqlEnum("postType", ["image", "video", "carousel", "story", "reel"]).default("image"),
  externalPostId: varchar("externalPostId", { length: 255 }),
  errorMessage: text("errorMessage"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

export const socialAnalytics = mysqlTable("socialAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  socialAccountId: int("socialAccountId").notNull(),
  postId: int("postId"),
  date: date("date").notNull(),
  impressions: int("impressions").default(0),
  reach: int("reach").default(0),
  engagement: int("engagement").default(0),
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  saves: int("saves").default(0),
  clicks: int("clicks").default(0),
  followerGrowth: int("followerGrowth").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialAnalytic = typeof socialAnalytics.$inferSelect;
export type InsertSocialAnalytic = typeof socialAnalytics.$inferInsert;


// ============================================
// Phase 51: 背景任務管理
// ============================================
export const backgroundJobs = mysqlTable("backgroundJobs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  jobType: mysqlEnum("jobType", ["rfm_calculation", "report_generation", "data_export", "bulk_notification", "data_import"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending"),
  progress: int("progress").default(0),
  totalItems: int("totalItems").default(0),
  processedItems: int("processedItems").default(0),
  result: json("result"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BackgroundJob = typeof backgroundJobs.$inferSelect;
export type InsertBackgroundJob = typeof backgroundJobs.$inferInsert;


// ============================================
// Phase 56: 電子票券系統（LINE 整合）
// ============================================

// 票券模板表 - 定義票券類型
export const voucherTemplates = mysqlTable("voucherTemplates", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["treatment", "discount", "gift_card", "stored_value", "free_item"]).default("treatment"),
  // 票券價值設定
  value: decimal("value", { precision: 10, scale: 2 }),
  valueType: mysqlEnum("valueType", ["fixed_amount", "percentage", "treatment_count"]).default("fixed_amount"),
  // 適用範圍
  applicableProducts: json("applicableProducts"), // 適用產品 ID 列表
  applicableCategories: json("applicableCategories"), // 適用分類
  applicableServices: json("applicableServices"), // 適用服務/療程
  // 使用限制
  minPurchase: decimal("minPurchase", { precision: 10, scale: 2 }),
  maxDiscount: decimal("maxDiscount", { precision: 10, scale: 2 }),
  usageLimit: int("usageLimit"), // 每張票券可使用次數
  // 有效期設定
  validityType: mysqlEnum("validityType", ["fixed_date", "days_from_issue", "no_expiry"]).default("days_from_issue"),
  validDays: int("validDays").default(30), // 發送後有效天數
  fixedStartDate: date("fixedStartDate"),
  fixedEndDate: date("fixedEndDate"),
  // 外觀設定
  imageUrl: text("imageUrl"),
  backgroundColor: varchar("backgroundColor", { length: 20 }).default("#D4AF37"),
  textColor: varchar("textColor", { length: 20 }).default("#0A1628"),
  // 狀態
  isActive: boolean("isActive").default(true),
  isTransferable: boolean("isTransferable").default(false), // 是否可轉贈
  // 統計
  totalIssued: int("totalIssued").default(0),
  totalRedeemed: int("totalRedeemed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoucherTemplate = typeof voucherTemplates.$inferSelect;
export type InsertVoucherTemplate = typeof voucherTemplates.$inferInsert;

// 票券實例表 - 已發送的票券
export const voucherInstances = mysqlTable("voucherInstances", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  templateId: int("templateId").notNull(),
  customerId: int("customerId").notNull(),
  // 票券識別碼
  voucherCode: varchar("voucherCode", { length: 50 }).notNull().unique(),
  qrCodeUrl: text("qrCodeUrl"),
  // 票券狀態
  status: mysqlEnum("status", ["active", "used", "expired", "cancelled", "transferred"]).default("active"),
  // 使用情況
  remainingUses: int("remainingUses").default(1),
  usedCount: int("usedCount").default(0),
  // 有效期
  validFrom: timestamp("validFrom").defaultNow().notNull(),
  validUntil: timestamp("validUntil"),
  // 發送資訊
  issuedBy: int("issuedBy"), // 發送者 ID
  issueReason: varchar("issueReason", { length: 255 }), // 發送原因
  issueChannel: mysqlEnum("issueChannel", ["manual", "campaign", "birthday", "referral", "purchase", "line"]).default("manual"),
  // LINE 推送狀態
  linePushStatus: mysqlEnum("linePushStatus", ["pending", "sent", "failed", "not_applicable"]).default("pending"),
  linePushAt: timestamp("linePushAt"),
  linePushError: text("linePushError"),
  // 轉贈資訊
  originalOwnerId: int("originalOwnerId"),
  transferredAt: timestamp("transferredAt"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoucherInstance = typeof voucherInstances.$inferSelect;
export type InsertVoucherInstance = typeof voucherInstances.$inferInsert;

// 票券核銷記錄表
export const voucherRedemptions = mysqlTable("voucherRedemptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  voucherInstanceId: int("voucherInstanceId").notNull(),
  customerId: int("customerId").notNull(),
  // 核銷資訊
  redemptionMethod: mysqlEnum("redemptionMethod", ["qr_scan", "manual_code", "auto_apply"]).default("qr_scan"),
  redeemedBy: int("redeemedBy"), // 核銷員工 ID
  // 關聯訂單/療程
  orderId: int("orderId"),
  appointmentId: int("appointmentId"),
  treatmentRecordId: int("treatmentRecordId"),
  // 核銷金額
  discountApplied: decimal("discountApplied", { precision: 10, scale: 2 }),
  originalAmount: decimal("originalAmount", { precision: 10, scale: 2 }),
  finalAmount: decimal("finalAmount", { precision: 10, scale: 2 }),
  // 核銷地點
  redemptionLocation: varchar("redemptionLocation", { length: 255 }),
  // 備註
  notes: text("notes"),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VoucherRedemption = typeof voucherRedemptions.$inferSelect;
export type InsertVoucherRedemption = typeof voucherRedemptions.$inferInsert;

// 票券批次發送記錄表
export const voucherBatches = mysqlTable("voucherBatches", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  templateId: int("templateId").notNull(),
  // 批次資訊
  batchName: varchar("batchName", { length: 255 }).notNull(),
  batchType: mysqlEnum("batchType", ["manual", "campaign", "birthday", "rfm_segment", "all_customers"]).default("manual"),
  // 發送統計
  totalRecipients: int("totalRecipients").default(0),
  successCount: int("successCount").default(0),
  failedCount: int("failedCount").default(0),
  // 狀態
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
  // 目標客戶篩選條件
  targetCriteria: json("targetCriteria"),
  // 執行資訊
  scheduledAt: timestamp("scheduledAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  // 建立者
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoucherBatch = typeof voucherBatches.$inferSelect;
export type InsertVoucherBatch = typeof voucherBatches.$inferInsert;


// 票券轉贈記錄表
export const voucherTransfers = mysqlTable("voucherTransfers", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  voucherInstanceId: int("voucherInstanceId").notNull(),
  // 轉贈者資訊
  fromCustomerId: int("fromCustomerId").notNull(),
  fromCustomerName: varchar("fromCustomerName", { length: 100 }),
  fromCustomerPhone: varchar("fromCustomerPhone", { length: 20 }),
  // 受贈者資訊
  toCustomerId: int("toCustomerId"),
  toCustomerName: varchar("toCustomerName", { length: 100 }),
  toCustomerPhone: varchar("toCustomerPhone", { length: 20 }).notNull(),
  toCustomerEmail: varchar("toCustomerEmail", { length: 320 }),
  // 轉贈狀態
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "expired", "cancelled"]).default("pending"),
  // 轉贈訊息
  giftMessage: text("giftMessage"),
  // 領取資訊
  claimCode: varchar("claimCode", { length: 50 }).notNull().unique(),
  claimedAt: timestamp("claimedAt"),
  // 通知狀態
  notificationSent: boolean("notificationSent").default(false),
  notificationChannel: mysqlEnum("notificationChannel", ["line", "sms", "email"]).default("line"),
  notificationSentAt: timestamp("notificationSentAt"),
  // 有效期限（轉贈邀請的有效期）
  expiresAt: timestamp("expiresAt").notNull(),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoucherTransfer = typeof voucherTransfers.$inferSelect;
export type InsertVoucherTransfer = typeof voucherTransfers.$inferInsert;


// ============================================
// 系統設定表 - Super Admin 全域設定
// ============================================
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: mysqlEnum("category", ["platform", "voucher", "notification", "system"]).default("platform"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// ============================================
// 票券到期提醒記錄表
// ============================================
export const voucherReminderLogs = mysqlTable("voucherReminderLogs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  voucherInstanceId: int("voucherInstanceId").notNull(),
  customerId: int("customerId").notNull(),
  // 提醒資訊
  reminderType: mysqlEnum("reminderType", ["expiry_warning", "expiry_final", "promotion"]).default("expiry_warning"),
  daysBeforeExpiry: int("daysBeforeExpiry"),
  // 發送狀態
  status: mysqlEnum("status", ["pending", "sent", "failed", "cancelled"]).default("pending"),
  channel: mysqlEnum("channel", ["line", "sms", "email"]).default("line"),
  // 發送時間
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  // 錯誤訊息
  errorMessage: text("errorMessage"),
  // LINE 訊息 ID
  lineMessageId: varchar("lineMessageId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoucherReminderLog = typeof voucherReminderLogs.$inferSelect;
export type InsertVoucherReminderLog = typeof voucherReminderLogs.$inferInsert;


// ============================================
// Phase 61: 每日結帳系統
// ============================================

// 每日結帳記錄主表
export const dailySettlements = mysqlTable("dailySettlements", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  // 結帳日期
  settlementDate: date("settlementDate").notNull(),
  // 開帳資訊
  openingCash: decimal("openingCash", { precision: 12, scale: 2 }).default("0"),
  openedBy: int("openedBy"),
  openedAt: timestamp("openedAt"),
  // 結帳資訊
  closingCash: decimal("closingCash", { precision: 12, scale: 2 }),
  closedBy: int("closedBy"),
  closedAt: timestamp("closedAt"),
  // 營收統計
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0"),
  cashRevenue: decimal("cashRevenue", { precision: 12, scale: 2 }).default("0"),
  cardRevenue: decimal("cardRevenue", { precision: 12, scale: 2 }).default("0"),
  linePayRevenue: decimal("linePayRevenue", { precision: 12, scale: 2 }).default("0"),
  otherRevenue: decimal("otherRevenue", { precision: 12, scale: 2 }).default("0"),
  // 訂單統計
  totalOrders: int("totalOrders").default(0),
  completedOrders: int("completedOrders").default(0),
  cancelledOrders: int("cancelledOrders").default(0),
  refundedOrders: int("refundedOrders").default(0),
  // 預約統計
  totalAppointments: int("totalAppointments").default(0),
  completedAppointments: int("completedAppointments").default(0),
  noShowAppointments: int("noShowAppointments").default(0),
  // 現金差異
  cashDifference: decimal("cashDifference", { precision: 12, scale: 2 }).default("0"),
  cashDifferenceNote: text("cashDifferenceNote"),
  // 狀態
  status: mysqlEnum("status", ["open", "closed", "reconciled"]).default("open"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailySettlement = typeof dailySettlements.$inferSelect;
export type InsertDailySettlement = typeof dailySettlements.$inferInsert;

// 結帳明細表
export const settlementItems = mysqlTable("settlementItems", {
  id: int("id").autoincrement().primaryKey(),
  settlementId: int("settlementId").notNull(),
  // 關聯訂單或交易
  orderId: int("orderId"),
  appointmentId: int("appointmentId"),
  // 交易類型
  itemType: mysqlEnum("itemType", ["sale", "refund", "deposit", "withdrawal", "adjustment"]).notNull(),
  // 付款方式
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "credit_card", "debit_card", "line_pay", "transfer", "other"]).notNull(),
  // 金額
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  // 描述
  description: text("description"),
  // 客戶資訊
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  // 操作者
  staffId: int("staffId"),
  staffName: varchar("staffName", { length: 255 }),
  // 交易時間
  transactionAt: timestamp("transactionAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SettlementItem = typeof settlementItems.$inferSelect;
export type InsertSettlementItem = typeof settlementItems.$inferInsert;

// 收銀機操作記錄
export const cashDrawerRecords = mysqlTable("cashDrawerRecords", {
  id: int("id").autoincrement().primaryKey(),
  settlementId: int("settlementId").notNull(),
  organizationId: int("organizationId").notNull(),
  // 操作類型
  operationType: mysqlEnum("operationType", ["open", "close", "deposit", "withdrawal", "count"]).notNull(),
  // 金額
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  // 操作前後餘額
  balanceBefore: decimal("balanceBefore", { precision: 12, scale: 2 }),
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }),
  // 操作者
  operatedBy: int("operatedBy").notNull(),
  operatorName: varchar("operatorName", { length: 255 }),
  // 原因/備註
  reason: text("reason"),
  // 操作時間
  operatedAt: timestamp("operatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashDrawerRecord = typeof cashDrawerRecords.$inferSelect;
export type InsertCashDrawerRecord = typeof cashDrawerRecords.$inferInsert;

// 付款記錄表（統一管理所有付款）
export const paymentRecords = mysqlTable("paymentRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  // 關聯
  orderId: int("orderId"),
  appointmentId: int("appointmentId"),
  customerId: int("customerId"),
  // 付款資訊
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "credit_card", "debit_card", "line_pay", "transfer", "other"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  // 交易狀態
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded", "cancelled"]).default("pending"),
  // 交易參考
  transactionId: varchar("transactionId", { length: 255 }),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  // 付款時間
  paidAt: timestamp("paidAt"),
  // 退款資訊
  refundedAmount: decimal("refundedAmount", { precision: 12, scale: 2 }).default("0"),
  refundedAt: timestamp("refundedAt"),
  refundReason: text("refundReason"),
  // 操作者
  processedBy: int("processedBy"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentRecord = typeof paymentRecords.$inferSelect;
export type InsertPaymentRecord = typeof paymentRecords.$inferInsert;

// LINE Channel 設定表（用於儲存 LINE 憑證）
export const lineChannelConfigs = mysqlTable("lineChannelConfigs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId"),
  // 是否為平台級設定（null organizationId 表示平台級）
  isPlatformLevel: boolean("isPlatformLevel").default(false),
  // LINE Channel 資訊
  channelId: varchar("channelId", { length: 100 }).notNull(),
  channelSecret: text("channelSecret").notNull(),
  channelAccessToken: text("channelAccessToken").notNull(),
  // LIFF 設定
  liffId: varchar("liffId", { length: 100 }),
  // 狀態
  isActive: boolean("isActive").default(true),
  // 最後驗證時間
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "failed"]).default("pending"),
  // 備註
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LineChannelConfig = typeof lineChannelConfigs.$inferSelect;
export type InsertLineChannelConfig = typeof lineChannelConfigs.$inferInsert;


// ============================================
// Phase 62: 每日結帳系統強化
// ============================================

// 自動結帳設定表
export const autoSettlementSettings = mysqlTable("autoSettlementSettings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique(),
  // 自動結帳開關
  isEnabled: boolean("isEnabled").default(false),
  // 自動結帳時間（24小時制，例如 "23:00"）
  autoSettleTime: varchar("autoSettleTime", { length: 10 }).default("23:00"),
  // 時區設定
  timezone: varchar("timezone", { length: 50 }).default("Asia/Taipei"),
  // 自動報表生成
  autoGenerateReport: boolean("autoGenerateReport").default(true),
  // 報表接收者（Email 列表）
  reportRecipients: json("reportRecipients"),
  // 報表格式
  reportFormat: mysqlEnum("reportFormat", ["pdf", "excel", "both"]).default("pdf"),
  // 是否發送 LINE 通知
  sendLineNotification: boolean("sendLineNotification").default(false),
  // LINE 通知接收者（用戶 ID 列表）
  lineNotifyRecipients: json("lineNotifyRecipients"),
  // 最後執行時間
  lastExecutedAt: timestamp("lastExecutedAt"),
  lastExecutionStatus: mysqlEnum("lastExecutionStatus", ["success", "failed", "skipped"]),
  lastExecutionError: text("lastExecutionError"),
  // 建立與更新時間
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoSettlementSetting = typeof autoSettlementSettings.$inferSelect;
export type InsertAutoSettlementSetting = typeof autoSettlementSettings.$inferInsert;

// 結帳報表表
export const settlementReports = mysqlTable("settlementReports", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  settlementId: int("settlementId"),
  // 報表類型
  reportType: mysqlEnum("reportType", ["daily", "weekly", "monthly", "custom"]).default("daily"),
  // 報表期間
  periodStart: date("periodStart").notNull(),
  periodEnd: date("periodEnd").notNull(),
  // 報表標題
  title: varchar("title", { length: 255 }).notNull(),
  // 報表數據（JSON 格式儲存完整報表數據）
  reportData: json("reportData"),
  // 營收摘要
  totalRevenue: decimal("totalRevenue", { precision: 14, scale: 2 }).default("0"),
  cashRevenue: decimal("cashRevenue", { precision: 14, scale: 2 }).default("0"),
  cardRevenue: decimal("cardRevenue", { precision: 14, scale: 2 }).default("0"),
  linePayRevenue: decimal("linePayRevenue", { precision: 14, scale: 2 }).default("0"),
  otherRevenue: decimal("otherRevenue", { precision: 14, scale: 2 }).default("0"),
  // 訂單統計
  totalOrders: int("totalOrders").default(0),
  averageOrderValue: decimal("averageOrderValue", { precision: 10, scale: 2 }).default("0"),
  // 預約統計
  totalAppointments: int("totalAppointments").default(0),
  completedAppointments: int("completedAppointments").default(0),
  // 報表檔案
  pdfUrl: text("pdfUrl"),
  excelUrl: text("excelUrl"),
  // 生成方式
  generatedBy: mysqlEnum("generatedBy", ["auto", "manual"]).default("manual"),
  generatedByUserId: int("generatedByUserId"),
  // 狀態
  status: mysqlEnum("status", ["generating", "completed", "failed"]).default("generating"),
  errorMessage: text("errorMessage"),
  // 建立時間
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SettlementReport = typeof settlementReports.$inferSelect;
export type InsertSettlementReport = typeof settlementReports.$inferInsert;

// 營收趨勢快照表（用於儀表板快速查詢）
export const revenueTrendSnapshots = mysqlTable("revenueTrendSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  // 快照日期
  snapshotDate: date("snapshotDate").notNull(),
  // 週期類型
  periodType: mysqlEnum("periodType", ["daily", "weekly", "monthly"]).default("daily"),
  // 營收數據
  totalRevenue: decimal("totalRevenue", { precision: 14, scale: 2 }).default("0"),
  cashRevenue: decimal("cashRevenue", { precision: 14, scale: 2 }).default("0"),
  cardRevenue: decimal("cardRevenue", { precision: 14, scale: 2 }).default("0"),
  linePayRevenue: decimal("linePayRevenue", { precision: 14, scale: 2 }).default("0"),
  otherRevenue: decimal("otherRevenue", { precision: 14, scale: 2 }).default("0"),
  // 訂單數據
  totalOrders: int("totalOrders").default(0),
  averageOrderValue: decimal("averageOrderValue", { precision: 10, scale: 2 }).default("0"),
  // 預約數據
  totalAppointments: int("totalAppointments").default(0),
  completedAppointments: int("completedAppointments").default(0),
  // 客戶數據
  newCustomers: int("newCustomers").default(0),
  returningCustomers: int("returningCustomers").default(0),
  // 時段分布（JSON 格式：{ "09:00": 1500, "10:00": 2300, ... }）
  hourlyRevenue: json("hourlyRevenue"),
  // 建立時間
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueTrendSnapshot = typeof revenueTrendSnapshots.$inferSelect;
export type InsertRevenueTrendSnapshot = typeof revenueTrendSnapshots.$inferInsert;


// ============================================
// LINE 整合設定表 - 診所端自行設定
// ============================================
export const lineChannelSettings = mysqlTable("lineChannelSettings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique(),
  channelId: varchar("channelId", { length: 100 }),
  channelSecret: varchar("channelSecret", { length: 100 }),
  channelAccessToken: text("channelAccessToken"),
  liffId: varchar("liffId", { length: 100 }),
  webhookUrl: text("webhookUrl"),
  isVerified: boolean("isVerified").default(false),
  verifiedAt: timestamp("verifiedAt"),
  botBasicId: varchar("botBasicId", { length: 100 }),
  botDisplayName: varchar("botDisplayName", { length: 255 }),
  botPictureUrl: text("botPictureUrl"),
  richMenuId: varchar("richMenuId", { length: 100 }),
  notificationEnabled: boolean("notificationEnabled").default(true),
  appointmentReminderEnabled: boolean("appointmentReminderEnabled").default(true),
  marketingMessageEnabled: boolean("marketingMessageEnabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LineChannelSetting = typeof lineChannelSettings.$inferSelect;
export type InsertLineChannelSetting = typeof lineChannelSettings.$inferInsert;

// ============================================
// 資料匯入記錄表
// ============================================
export const importRecords = mysqlTable("importRecords", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId").notNull(),
  importType: mysqlEnum("importType", ["customer", "product", "staff", "appointment", "order"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl"),
  totalRows: int("totalRows").default(0),
  successRows: int("successRows").default(0),
  failedRows: int("failedRows").default(0),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  errorLog: json("errorLog"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImportRecord = typeof importRecords.$inferSelect;
export type InsertImportRecord = typeof importRecords.$inferInsert;

// ============================================
// 支付設定表 - 支援多支付服務商
// ============================================
export const paymentSettings = mysqlTable("paymentSettings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  provider: mysqlEnum("provider", ["lemonsqueezy", "ecpay", "stripe", "linepay", "jkopay"]).notNull(),
  isEnabled: boolean("isEnabled").default(false),
  isTestMode: boolean("isTestMode").default(true),
  // LemonSqueezy 設定
  lsApiKey: text("lsApiKey"),
  lsStoreId: varchar("lsStoreId", { length: 100 }),
  lsWebhookSecret: text("lsWebhookSecret"),
  // 綠界 ECPay 設定
  ecpayMerchantId: varchar("ecpayMerchantId", { length: 50 }),
  ecpayHashKey: varchar("ecpayHashKey", { length: 100 }),
  ecpayHashIv: varchar("ecpayHashIv", { length: 100 }),
  // Stripe 設定
  stripePublishableKey: text("stripePublishableKey"),
  stripeSecretKey: text("stripeSecretKey"),
  stripeWebhookSecret: text("stripeWebhookSecret"),
  // LINE Pay 設定
  linePayChannelId: varchar("linePayChannelId", { length: 100 }),
  linePayChannelSecret: text("linePayChannelSecret"),
  // 街口支付設定
  jkopayMerchantId: varchar("jkopayMerchantId", { length: 100 }),
  jkopayApiKey: text("jkopayApiKey"),
  // 通用設定
  defaultCurrency: varchar("defaultCurrency", { length: 10 }).default("TWD"),
  webhookUrl: text("webhookUrl"),
  returnUrl: text("returnUrl"),
  cancelUrl: text("cancelUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentSetting = typeof paymentSettings.$inferSelect;
export type InsertPaymentSetting = typeof paymentSettings.$inferInsert;

// ============================================
// 支付交易記錄表
// ============================================
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  orderId: int("orderId"),
  customerId: int("customerId"),
  provider: mysqlEnum("provider", ["lemonsqueezy", "ecpay", "stripe", "linepay", "jkopay", "cash", "transfer"]).notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  externalTransactionId: varchar("externalTransactionId", { length: 255 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "refunded", "cancelled"]).default("pending"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  cardLast4: varchar("cardLast4", { length: 4 }),
  receiptUrl: text("receiptUrl"),
  refundAmount: decimal("refundAmount", { precision: 12, scale: 2 }),
  refundReason: text("refundReason"),
  refundedAt: timestamp("refundedAt"),
  metadata: json("metadata"),
  errorMessage: text("errorMessage"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

// ============================================
// 訂閱方案表 - LemonSqueezy 整合
// ============================================
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  provider: mysqlEnum("provider", ["lemonsqueezy", "stripe"]).default("lemonsqueezy"),
  externalProductId: varchar("externalProductId", { length: 100 }),
  externalVariantId: varchar("externalVariantId", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("TWD"),
  billingInterval: mysqlEnum("billingInterval", ["monthly", "quarterly", "yearly"]).default("monthly"),
  features: json("features"),
  maxUsers: int("maxUsers").default(5),
  maxCustomers: int("maxCustomers").default(500),
  maxAppointments: int("maxAppointments").default(1000),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// ============================================
// 組織訂閱記錄表
// ============================================
export const organizationSubscriptions = mysqlTable("organizationSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  planId: int("planId").notNull(),
  provider: mysqlEnum("provider", ["lemonsqueezy", "stripe"]).default("lemonsqueezy"),
  externalSubscriptionId: varchar("externalSubscriptionId", { length: 255 }),
  externalCustomerId: varchar("externalCustomerId", { length: 255 }),
  status: mysqlEnum("status", ["active", "past_due", "cancelled", "paused", "trialing"]).default("trialing"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  cancelledAt: timestamp("cancelledAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrganizationSubscription = typeof organizationSubscriptions.$inferSelect;
export type InsertOrganizationSubscription = typeof organizationSubscriptions.$inferInsert;


// ============================================
// 打卡設定表 - 地理圍欄設定
// ============================================
export const attendanceSettings = mysqlTable("attendanceSettings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique(),
  // 診所基準位置
  clinicLatitude: decimal("clinicLatitude", { precision: 10, scale: 7 }),
  clinicLongitude: decimal("clinicLongitude", { precision: 10, scale: 7 }),
  clinicAddress: text("clinicAddress"),
  // 地理圍欄設定
  validDistance: int("validDistance").default(100), // 有效打卡距離 (米)
  enableGeofence: boolean("enableGeofence").default(false), // 是否啟用地理圍欄驗證
  // 降級機制設定
  allowOfflineClockIn: boolean("allowOfflineClockIn").default(true), // 允許離線打卡
  // 其他設定
  autoClockOutHours: int("autoClockOutHours").default(12), // 自動下班打卡時數
  requirePhoto: boolean("requirePhoto").default(false), // 是否需要拍照打卡
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AttendanceSettings = typeof attendanceSettings.$inferSelect;
export type InsertAttendanceSettings = typeof attendanceSettings.$inferInsert;

// ============================================
// LINE 遊戲模組 - 遊戲設定表
// ============================================
export const games = mysqlTable("games", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // 遊戲內部名稱 (ichiban_kuji, slot_machine, pachinko)
  title: varchar("title", { length: 255 }).notNull(), // 遊戲顯示標題
  description: text("description"),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true),
  maxPlaysPerDay: int("maxPlaysPerDay").default(-1), // -1 表示無限制
  settings: json("settings"), // 遊戲特定設定
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

// ============================================
// LINE 遊戲模組 - 獎品資料表
// ============================================
export const prizes = mysqlTable("prizes", {
  id: int("id").autoincrement().primaryKey(),
  gameId: int("gameId").notNull(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  type: mysqlEnum("type", ["coupon", "gift", "points", "service"]).default("gift"),
  value: decimal("value", { precision: 10, scale: 2 }), // 獎品價值
  quantity: int("quantity").default(-1), // -1 表示無限
  remainingQuantity: int("remainingQuantity").default(-1),
  probability: decimal("probability", { precision: 5, scale: 4 }).notNull(), // 0.0000 to 1.0000
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  metadata: json("metadata"), // 額外資訊 (如優惠券代碼等)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prize = typeof prizes.$inferSelect;
export type InsertPrize = typeof prizes.$inferInsert;

// ============================================
// LINE 遊戲模組 - 遊玩記錄表
// ============================================
export const gamePlays = mysqlTable("gamePlays", {
  id: int("id").autoincrement().primaryKey(),
  gameId: int("gameId").notNull(),
  userId: int("userId").notNull(),
  organizationId: int("organizationId").notNull(),
  playedAt: timestamp("playedAt").defaultNow().notNull(),
  result: mysqlEnum("result", ["win", "lose"]).notNull(),
  prizeId: int("prizeId"), // NULL 表示未中獎
  metadata: json("metadata"), // 遊戲過程資訊
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GamePlay = typeof gamePlays.$inferSelect;
export type InsertGamePlay = typeof gamePlays.$inferInsert;

// ============================================
// LINE 遊戲模組 - 使用者中獎記錄表
// ============================================
export const userPrizes = mysqlTable("userPrizes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prizeId: int("prizeId").notNull(),
  gamePlayId: int("gamePlayId").notNull(),
  organizationId: int("organizationId").notNull(),
  wonAt: timestamp("wonAt").defaultNow().notNull(),
  isRedeemed: boolean("isRedeemed").default(false),
  redeemedAt: timestamp("redeemedAt"),
  redeemedBy: int("redeemedBy"), // 兌換操作員 ID
  expiresAt: timestamp("expiresAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPrize = typeof userPrizes.$inferSelect;
export type InsertUserPrize = typeof userPrizes.$inferInsert;

// ============================================
// 業績管理系統 - 業績記錄表
// ============================================
export const performanceRecords = mysqlTable("performanceRecords", {
  id: varchar("id", { length: 191 }).primaryKey(),
  clinicId: varchar("clinicId", { length: 191 }).notNull(),
  staffId: varchar("staffId", { length: 191 }).notNull(),
  recordDate: timestamp("recordDate").notNull(),
  
  // 業績金額（使用 DECIMAL 確保精確性）
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  
  // 業績類型（appointment: 預約、treatment: 療程、product: 產品銷售、manual: 手動新增）
  type: varchar("type", { length: 50 }).notNull(),
  
  // 關聯 ID（預約 ID、療程 ID、產品 ID 等）
  relatedId: varchar("relatedId", { length: 191 }),
  
  // 備註
  notes: text("notes"),
  
  // 建立時間與更新時間
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceRecord = typeof performanceRecords.$inferSelect;
export type InsertPerformanceRecord = typeof performanceRecords.$inferInsert;

// ============================================
// 業績管理系統 - 業績目標表
// ============================================
export const performanceTargets = mysqlTable("performanceTargets", {
  id: varchar("id", { length: 191 }).primaryKey(),
  clinicId: varchar("clinicId", { length: 191 }).notNull(),
  staffId: varchar("staffId", { length: 191 }).notNull(),
  
  // 目標期間類型（monthly: 月度、quarterly: 季度、yearly: 年度）
  periodType: varchar("periodType", { length: 50 }).notNull(),
  
  // 目標年份
  year: int("year").notNull(),
  
  // 目標月份或季度（月度：1-12，季度：1-4，年度：0）
  period: int("period").notNull(),
  
  // 目標金額（使用 DECIMAL 確保精確性）
  targetAmount: decimal("targetAmount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  
  // 備註
  notes: text("notes"),
  
  // 建立時間與更新時間
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
export const inventorySystemB = mysqlTable("inventory_system_b", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  productId: int("product_id").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  quantity: int("quantity").notNull().default(0),
  minStock: int("min_stock").default(10),
  expiryDate: date("expiry_date"),
  location: varchar("location", { length: 100 }),
  supplier: varchar("supplier", { length: 255 }),
  status: mysqlEnum("inventory_status_b", ["in_stock", "low_stock", "expired"]).default("in_stock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type InventorySystemB = typeof inventorySystemB.$inferSelect;
export type InsertInventorySystemB = typeof inventorySystemB.$inferInsert;

// ============================================
// CRM 標籤表 (System B Integration)
// ============================================
export const crmTagsSystemB = mysqlTable("crm_tags_system_b", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#000000"),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CrmTagSystemB = typeof crmTagsSystemB.$inferSelect;
export type InsertCrmTagSystemB = typeof crmTagsSystemB.$inferInsert;

export const customerTagsSystemB = mysqlTable("customer_tags_system_b", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
  tagId: int("tag_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CustomerTagSystemB = typeof customerTagsSystemB.$inferSelect;
export type InsertCustomerTagSystemB = typeof customerTagsSystemB.$inferInsert;

// ============================================
// 遊戲化行銷表 (System B Integration)
// ============================================
export const gamesSystemB = mysqlTable("games_system_b", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("game_type_b", ["ichiban_kuji", "slot_machine", "wheel"]).notNull(),
  status: mysqlEnum("game_status_b", ["draft", "active", "paused", "ended"]).default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  description: text("description"),
  rules: json("rules"),
  imageUrl: text("image_url"),
  costPoints: int("cost_points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type GameSystemB = typeof gamesSystemB.$inferSelect;
export type InsertGameSystemB = typeof gamesSystemB.$inferInsert;

export const prizesSystemB = mysqlTable("prizes_system_b", {
  id: int("id").autoincrement().primaryKey(),
  gameId: int("game_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("prize_type_b", ["physical", "coupon", "points"]).default("physical"),
  quantity: int("quantity").notNull().default(0),
  remainingQuantity: int("remaining_quantity").notNull().default(0),
  probability: decimal("probability", { precision: 5, scale: 2 }).default("0"),
  imageUrl: text("image_url"),
  value: decimal("value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PrizeSystemB = typeof prizesSystemB.$inferSelect;
export type InsertPrizeSystemB = typeof prizesSystemB.$inferInsert;

export const gameParticipationsSystemB = mysqlTable("game_participations_system_b", {
  id: int("id").autoincrement().primaryKey(),
  gameId: int("game_id").notNull(),
  customerId: int("customer_id").notNull(),
  prizeId: int("prize_id"),
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
export const staffCommissionsSystemB = mysqlTable("staff_commissions_system_b", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  staffId: int("staff_id").notNull(),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("commission_status_b", ["calculated", "approved", "paid"]).default("calculated"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type StaffCommissionSystemB = typeof staffCommissionsSystemB.$inferSelect;
export type InsertStaffCommissionSystemB = typeof staffCommissionsSystemB.$inferInsert;

// ============================================
// 多店調撥表 (System B Integration)
// ============================================
export const inventoryTransfersSystemB = mysqlTable("inventory_transfers_system_b", {
  id: int("id").autoincrement().primaryKey(),
  fromOrgId: int("from_org_id").notNull(),
  toOrgId: int("to_org_id").notNull(),
  productId: int("product_id").notNull(),
  quantity: int("quantity").notNull(),
  status: mysqlEnum("transfer_status_b", ["pending", "approved", "shipped", "received", "cancelled"]).default("pending"),
  requestedBy: int("requested_by"),
  approvedBy: int("approved_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type InventoryTransferSystemB = typeof inventoryTransfersSystemB.$inferSelect;
export type InsertInventoryTransferSystemB = typeof inventoryTransfersSystemB.$inferInsert;


// ============================================
// 客戶互動歷史記錄表
// ============================================
export const interactions = mysqlTable("interactions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  customerId: int("customer_id").notNull(),
  type: mysqlEnum("type", ["phone", "meeting", "line", "appointment", "treatment", "note"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  createdBy: int("created_by"), // 操作員工 ID（客戶發送的訊息為 null）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

// ============================================
// 自動化標籤規則表
// ============================================
export const tagRules = mysqlTable("tag_rules", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  tagId: int("tag_id").notNull(), // 關聯到 customerTags
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ruleType: mysqlEnum("rule_type", ["spending", "visit_count", "last_visit", "member_level"]).notNull(),
  condition: json("condition").notNull(), // 規則條件 JSON（例如：{"operator": ">=", "value": 100000}）
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TagRule = typeof tagRules.$inferSelect;
export type InsertTagRule = typeof tagRules.$inferInsert;

// ============================================
// LINE Messaging API 設定表
// ============================================
export const lineMessagingSettings = mysqlTable("line_messaging_settings", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull().unique(),
  channelAccessToken: text("channel_access_token").notNull(),
  channelSecret: varchar("channel_secret", { length: 255 }).notNull(),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LineMessagingSetting = typeof lineMessagingSettings.$inferSelect;
export type InsertLineMessagingSetting = typeof lineMessagingSettings.$inferInsert;

// ============================================
// LINE Webhook 事件記錄表
// ============================================
export const lineWebhookEvents = mysqlTable("line_webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // message, follow, unfollow, join, leave, postback, beacon
  sourceType: varchar("source_type", { length: 20 }).notNull(), // user, group, room
  sourceId: varchar("source_id", { length: 100 }).notNull(), // LINE User ID, Group ID, Room ID
  messageType: varchar("message_type", { length: 20 }), // text, image, video, audio, file, location, sticker
  messageText: text("message_text"), // 訊息文字內容
  messageId: varchar("message_id", { length: 100 }), // LINE Message ID
  replyToken: varchar("reply_token", { length: 100 }), // LINE Reply Token
  rawPayload: json("raw_payload").notNull(), // 完整的 Webhook Payload (JSON)
  isProcessed: boolean("is_processed").notNull().default(false), // 是否已處理
  processedAt: timestamp("processed_at"), // 處理時間
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LineWebhookEvent = typeof lineWebhookEvents.$inferSelect;
export type InsertLineWebhookEvent = typeof lineWebhookEvents.$inferInsert;

// ============================================
// 自動回覆規則表
// ============================================
export const autoReplyRules = mysqlTable("auto_reply_rules", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // 規則名稱
  description: text("description"), // 規則說明
  triggerType: mysqlEnum("trigger_type", ["keyword", "regex", "always"]).notNull(), // keyword, regex, always
  triggerValue: text("trigger_value"), // 觸發關鍵字或正則表達式
  replyType: mysqlEnum("reply_type", ["text", "flex", "template"]).notNull(), // text, flex, template
  replyContent: text("reply_content").notNull(), // 回覆內容 (JSON for flex/template)
  isActive: boolean("is_active").notNull().default(true),
  priority: int("priority").notNull().default(0), // 優先級（數字越大越優先）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
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
export const richMenuTemplates = mysqlTable('rich_menu_templates', {
  id: int('id').primaryKey().autoincrement(),
  organizationId: int('organization_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  richMenuId: varchar('rich_menu_id', { length: 255 }), // LINE Rich Menu ID
  imageUrl: text('image_url'), // S3 圖片 URL
  chatBarText: varchar('chat_bar_text', { length: 14 }).notNull(), // 聊天室選單標題
  areas: json('areas').notNull(), // 按鈕區域定義 (JSON)
  isActive: boolean('is_active').default(true),
  targetAudience: varchar('target_audience', { length: 50 }), // 目標受眾：all, new_customer, vip, churn_risk
  abTestGroup: varchar('ab_test_group', { length: 50 }), // A/B 測試分組：control, variant_a, variant_b
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type RichMenuTemplate = typeof richMenuTemplates.$inferSelect;
export type InsertRichMenuTemplate = typeof richMenuTemplates.$inferInsert;

/**
 * Rich Menu 客戶分配記錄表
 */
export const richMenuAssignments = mysqlTable('rich_menu_assignments', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').notNull(),
  customerId: int('customer_id').notNull(),
  lineUserId: varchar('line_user_id', { length: 255 }).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
});

export type RichMenuAssignment = typeof richMenuAssignments.$inferSelect;
export type InsertRichMenuAssignment = typeof richMenuAssignments.$inferInsert;

/**
 * Rich Menu 點擊統計表
 */
export const richMenuClickStats = mysqlTable('rich_menu_click_stats', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').notNull(),
  customerId: int('customer_id'),
  lineUserId: varchar('line_user_id', { length: 255 }).notNull(),
  areaIndex: int('area_index').notNull(), // 點擊的按鈕區域索引
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
export const broadcastCampaigns = mysqlTable('broadcast_campaigns', {
  id: int('id').primaryKey().autoincrement(),
  organizationId: int('organization_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  messageType: varchar('message_type', { length: 50 }).notNull(), // text, flex, image
  messageContent: json('message_content').notNull(), // 訊息內容 (JSON)
  targetAudience: json('target_audience').notNull(), // 分群條件 (JSON)
  scheduledAt: timestamp('scheduled_at'), // 排程發送時間
  status: varchar('status', { length: 50 }).default('draft'), // draft, scheduled, sending, completed, failed
  totalRecipients: int('total_recipients').default(0),
  sentCount: int('sent_count').default(0),
  deliveredCount: int('delivered_count').default(0),
  clickedCount: int('clicked_count').default(0),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type BroadcastCampaign = typeof broadcastCampaigns.$inferSelect;
export type InsertBroadcastCampaign = typeof broadcastCampaigns.$inferInsert;

/**
 * 推播收件人記錄表
 */
export const broadcastRecipients = mysqlTable('broadcast_recipients', {
  id: int('id').primaryKey().autoincrement(),
  campaignId: int('campaign_id').notNull(),
  customerId: int('customer_id').notNull(),
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
export const aiConversations = mysqlTable('ai_conversations', {
  id: int('id').primaryKey().autoincrement(),
  organizationId: int('organization_id').notNull(),
  customerId: int('customer_id'),
  lineUserId: varchar('line_user_id', { length: 255 }).notNull(),
  sessionId: varchar('session_id', { length: 255 }).notNull(), // 對話 Session ID
  userMessage: text('user_message').notNull(),
  aiResponse: text('ai_response').notNull(),
  intent: varchar('intent', { length: 100 }), // 識別的意圖：appointment, consultation, faq, general
  confidence: decimal('confidence', { precision: 5, scale: 2 }), // 意圖信心分數
  context: json('context'), // 對話上下文 (JSON)
  createdAt: timestamp('created_at').defaultNow(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

/**
 * AI 意圖定義表
 */
export const aiIntents = mysqlTable('ai_intents', {
  id: int('id').primaryKey().autoincrement(),
  organizationId: int('organization_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  keywords: json('keywords').notNull(), // 關鍵字列表 (JSON)
  trainingExamples: json('training_examples'), // 訓練範例 (JSON)
  responseTemplate: text('response_template'), // 回覆模板
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type AiIntent = typeof aiIntents.$inferSelect;
export type InsertAiIntent = typeof aiIntents.$inferInsert;

/**
 * AI 知識庫表
 */
export const aiKnowledgeBase = mysqlTable('ai_knowledge_base', {
  id: int('id').primaryKey().autoincrement(),
  organizationId: int('organization_id').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // FAQ, 產品資訊, 療程說明
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  keywords: json('keywords'), // 關鍵字列表 (JSON)
  priority: int('priority').default(0), // 優先級
  isActive: boolean('is_active').default(true),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type AiKnowledgeBase = typeof aiKnowledgeBase.$inferSelect;
export type InsertAiKnowledgeBase = typeof aiKnowledgeBase.$inferInsert;

/**
 * Rich Menu 模板市集表
 */
export const richMenuTemplateMarket = mysqlTable('rich_menu_template_market', {
  id: int('id').primaryKey().autoincrement(),
  category: varchar('category', { length: 50 }).notNull(), // 'restaurant', 'beauty', 'retail', 'medical'
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  imageWidth: int('image_width').notNull(),
  imageHeight: int('image_height').notNull(),
  areas: json('areas').notNull(), // 按鈕區域定義（JSON 格式）
  tags: json('tags'), // 標籤（例如：['熱門', '新品', '優惠']）
  usageCount: int('usage_count').default(0), // 使用次數
  rating: decimal('rating', { precision: 3, scale: 2 }), // 評分（0-5）
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type RichMenuTemplateMarket = typeof richMenuTemplateMarket.$inferSelect;
export type InsertRichMenuTemplateMarket = typeof richMenuTemplateMarket.$inferInsert;

/**
 * 推播活動版本表（A/B 測試）
 */
export const broadcastCampaignVariants = mysqlTable('broadcast_campaign_variants', {
  id: int('id').primaryKey().autoincrement(),
  campaignId: int('campaign_id').notNull(),
  variantName: varchar('variant_name', { length: 100 }).notNull(), // 版本名稱（例如：A, B, C）
  messageContent: text('message_content').notNull(),
  messageType: varchar('message_type', { length: 50 }).notNull(), // text, image, flex
  flexMessageJson: json('flex_message_json'), // Flex Message JSON
  trafficPercentage: int('traffic_percentage').notNull(), // 流量分配百分比（0-100）
  sentCount: int('sent_count').default(0), // 發送數量
  openedCount: int('opened_count').default(0), // 開啟數量
  clickedCount: int('clicked_count').default(0), // 點擊數量
  convertedCount: int('converted_count').default(0), // 轉換數量
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type BroadcastCampaignVariant = typeof broadcastCampaignVariants.$inferSelect;
export type InsertBroadcastCampaignVariant = typeof broadcastCampaignVariants.$inferInsert;

/**
 * AI 知識庫向量表（pgvector 整合）
 */
export const aiKnowledgeBaseVectors = mysqlTable('ai_knowledge_base_vectors', {
  id: int('id').primaryKey().autoincrement(),
  knowledgeBaseId: int('knowledge_base_id').notNull(),
  embedding: json('embedding').notNull(), // 向量（JSON 格式，因 MySQL 不支援 vector 類型）
  embeddingModel: varchar('embedding_model', { length: 100 }).default('text-embedding-ada-002'), // 向量模型
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type AiKnowledgeBaseVector = typeof aiKnowledgeBaseVectors.$inferSelect;
export type InsertAiKnowledgeBaseVector = typeof aiKnowledgeBaseVectors.$inferInsert;
