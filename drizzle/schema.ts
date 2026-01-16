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
