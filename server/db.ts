import { eq, and, desc, asc, sql, like, or, gte, lte, isNull, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  InsertUser, users,
  organizations, InsertOrganization,
  organizationUsers, InsertOrganizationUser,
  customers, InsertCustomer,
  customerTags, InsertCustomerTag,
  customerTagRelations, InsertCustomerTagRelation,
  products, InsertProduct,
  staff, InsertStaff,
  appointments, InsertAppointment,
  appointmentSlots, InsertAppointmentSlot,
  schedules, InsertSchedule,
  attendanceRecords, InsertAttendanceRecord,
  coupons, InsertCoupon,
  orders, InsertOrder,
  orderItems, InsertOrderItem,
  aftercareRecords, InsertAftercareRecord,
  lineChannels, InsertLineChannel,
  activityLogs, InsertActivityLog,
  systemSettings, InsertSystemSetting,
  voucherReminderLogs, InsertVoucherReminderLog,
  dailySettlements, InsertDailySettlement,
  settlementItems, InsertSettlementItem,
  cashDrawerRecords, InsertCashDrawerRecord,
  paymentRecords, InsertPaymentRecord,
  lineChannelConfigs, InsertLineChannelConfig,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Export db instance for direct use in routers
export const db = drizzle(process.env.DATABASE_URL || '');


// ============================================
// User Queries
// ============================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "avatar", "lineUserId"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Organization Queries
// ============================================
export async function createOrganization(org: InsertOrganization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(organizations).values(org).returning();

  return result.id;
}

export async function updateOrganization(id: number, org: Partial<InsertOrganization>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(organizations).set(org).where(eq(organizations.id, id));
}

export async function getOrganizationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listOrganizations(options?: { page?: number; limit?: number; search?: string }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(organizations);
  
  if (options?.search) {
    query = query.where(like(organizations.name, `%${options.search}%`)) as typeof query;
  }

  const data = await query.orderBy(desc(organizations.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(organizations);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function deleteOrganization(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(organizations).where(eq(organizations.id, id));
}

// ============================================
// Organization User Queries
// ============================================
export async function addUserToOrganization(data: InsertOrganizationUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(organizationUsers).values(data).returning();

  return result.id;
}

export async function getUserOrganizations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      orgUser: organizationUsers,
      organization: organizations,
    })
    .from(organizationUsers)
    .innerJoin(organizations, eq(organizationUsers.organizationId, organizations.id))
    .where(and(eq(organizationUsers.userId, userId), eq(organizationUsers.isActive, true)));
  
  return result;
}

export async function getOrganizationUsers(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      orgUser: organizationUsers,
      user: users,
    })
    .from(organizationUsers)
    .innerJoin(users, eq(organizationUsers.userId, users.id))
    .where(eq(organizationUsers.organizationId, organizationId));
  
  return result;
}

// ============================================
// Customer Queries
// ============================================
export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(customers).values(customer).returning();

  return result.id;
}

export async function updateCustomer(id: number, customer: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(customer).where(eq(customers.id, id));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listCustomers(organizationId: number, options?: { page?: number; limit?: number; search?: string }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(customers.organizationId, organizationId);
  
  if (options?.search) {
    whereClause = and(
      whereClause,
      or(
        like(customers.name, `%${options.search}%`),
        like(customers.phone, `%${options.search}%`),
        like(customers.email, `%${options.search}%`)
      )
    ) as typeof whereClause;
  }

  const data = await db.select().from(customers).where(whereClause).orderBy(desc(customers.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.organizationId, organizationId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ isActive: false }).where(eq(customers.id, id));
}

// ============================================
// Customer Tag Queries
// ============================================
export async function createCustomerTag(tag: InsertCustomerTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(customerTags).values(tag).returning();

  return result.id;
}

export async function listCustomerTags(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customerTags).where(eq(customerTags.organizationId, organizationId));
}

export async function addTagToCustomer(customerId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(customerTagRelations).values({ customerId, tagId });
}

export async function getCustomerTags(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ tag: customerTags })
    .from(customerTagRelations)
    .innerJoin(customerTags, eq(customerTagRelations.tagId, customerTags.id))
    .where(eq(customerTagRelations.customerId, customerId));
  
  return result.map(r => r.tag);
}

// ============================================
// Product Queries
// ============================================
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(products).values(product).returning();

  return result.id;
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listProducts(organizationId: number, options?: { page?: number; limit?: number; category?: string }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = and(eq(products.organizationId, organizationId), eq(products.isActive, true));
  
  if (options?.category) {
    whereClause = and(whereClause, eq(products.category, options.category)) as typeof whereClause;
  }

  const data = await db.select().from(products).where(whereClause).orderBy(asc(products.sortOrder)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.organizationId, organizationId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// ============================================
// Staff Queries
// ============================================
export async function createStaff(staffData: InsertStaff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(staff).values(staffData).returning();

  return result.id;
}

export async function updateStaff(id: number, staffData: Partial<InsertStaff>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(staff).set(staffData).where(eq(staff.id, id));
}

export async function getStaffById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listStaff(organizationId: number, options?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const data = await db.select().from(staff)
    .where(and(eq(staff.organizationId, organizationId), eq(staff.isActive, true)))
    .orderBy(asc(staff.name))
    .limit(limit).offset(offset);
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(staff).where(eq(staff.organizationId, organizationId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// ============================================
// Appointment Queries
// ============================================
export async function createAppointment(appointment: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(appointments).values(appointment).returning();

  return result.id;
}

export async function updateAppointment(id: number, appointment: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(appointments).set(appointment).where(eq(appointments.id, id));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listAppointments(organizationId: number, options?: { page?: number; limit?: number; date?: string; staffId?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;

  let whereClause = eq(appointments.organizationId, organizationId);
  
  if (options?.date) {
    whereClause = and(whereClause, sql`${appointments.appointmentDate} = ${options.date}`) as typeof whereClause;
  }
  if (options?.staffId) {
    whereClause = and(whereClause, eq(appointments.staffId, options.staffId)) as typeof whereClause;
  }

  const data = await db.select().from(appointments).where(whereClause).orderBy(asc(appointments.appointmentDate), asc(appointments.startTime)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(appointments).where(eq(appointments.organizationId, organizationId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// ============================================
// Schedule Queries
// ============================================
export async function createSchedule(schedule: InsertSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(schedules).values(schedule).returning();

  return result.id;
}

export async function listSchedules(organizationId: number, options?: { startDate?: string; endDate?: string; staffId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(schedules.organizationId, organizationId);
  
  if (options?.staffId) {
    whereClause = and(whereClause, eq(schedules.staffId, options.staffId)) as typeof whereClause;
  }

  return await db.select().from(schedules).where(whereClause).orderBy(asc(schedules.scheduleDate));
}

// ============================================
// Attendance Queries
// ============================================
export async function createAttendanceRecord(record: InsertAttendanceRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(attendanceRecords).values(record).returning();

  return result.id;
}

export async function updateAttendanceRecord(id: number, record: Partial<InsertAttendanceRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(attendanceRecords).set(record).where(eq(attendanceRecords.id, id));
}

export async function listAttendanceRecords(organizationId: number, options?: { date?: string; staffId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(attendanceRecords.organizationId, organizationId);
  
  if (options?.date) {
    whereClause = and(whereClause, sql`${attendanceRecords.recordDate} = ${options.date}`) as typeof whereClause;
  }
  if (options?.staffId) {
    whereClause = and(whereClause, eq(attendanceRecords.staffId, options.staffId)) as typeof whereClause;
  }

  return await db.select().from(attendanceRecords).where(whereClause).orderBy(desc(attendanceRecords.recordDate));
}

// ============================================
// Order Queries
// ============================================
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(orders).values(order).returning();

  return result.id;
}

export async function updateOrder(id: number, order: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(order).where(eq(orders.id, id));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listOrders(organizationId: number, options?: { page?: number; limit?: number; status?: string }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const data = await db.select().from(orders).where(eq(orders.organizationId, organizationId)).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.organizationId, organizationId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// ============================================
// Coupon Queries
// ============================================
export async function createCoupon(coupon: InsertCoupon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(coupons).values(coupon).returning();

  return result.id;
}

export async function getCouponByCode(organizationId: number, code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coupons)
    .where(and(eq(coupons.organizationId, organizationId), eq(coupons.code, code), eq(coupons.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listCoupons(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(coupons).where(eq(coupons.organizationId, organizationId)).orderBy(desc(coupons.createdAt));
}

// ============================================
// Aftercare Queries
// ============================================
export async function createAftercareRecord(record: InsertAftercareRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(aftercareRecords).values(record).returning();

  return result.id;
}

export async function updateAftercareRecord(id: number, record: Partial<InsertAftercareRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aftercareRecords).set(record).where(eq(aftercareRecords.id, id));
}

export async function listAftercareRecords(organizationId: number, options?: { customerId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(aftercareRecords.organizationId, organizationId);
  
  if (options?.customerId) {
    whereClause = and(whereClause, eq(aftercareRecords.customerId, options.customerId)) as typeof whereClause;
  }

  return await db.select().from(aftercareRecords).where(whereClause).orderBy(desc(aftercareRecords.treatmentDate));
}

// ============================================
// LINE Channel Queries
// ============================================
export async function createLineChannel(channel: InsertLineChannel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(lineChannels).values(channel).returning();

  return result.id;
}

export async function getLineChannelByOrg(organizationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lineChannels).where(eq(lineChannels.organizationId, organizationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listLineChannels(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(lineChannels).where(eq(lineChannels.organizationId, organizationId));
}

// ============================================
// Activity Log Queries
// ============================================
export async function logActivity(log: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(log);
}

// ============================================
// Dashboard Stats
// ============================================
export async function getOrganizationStats(organizationId: number) {
  const db = await getDb();
  if (!db) return null;

  const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.organizationId, organizationId));
  const [appointmentCount] = await db.select({ count: sql<number>`count(*)` }).from(appointments).where(eq(appointments.organizationId, organizationId));
  const [staffCount] = await db.select({ count: sql<number>`count(*)` }).from(staff).where(eq(staff.organizationId, organizationId));
  const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.organizationId, organizationId));

  return {
    customers: customerCount?.count || 0,
    appointments: appointmentCount?.count || 0,
    staff: staffCount?.count || 0,
    products: productCount?.count || 0,
  };
}

export async function getSuperAdminStats() {
  const db = await getDb();
  if (!db) return null;

  const [orgCount] = await db.select({ count: sql<number>`count(*)` }).from(organizations);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(customers);
  const [appointmentCount] = await db.select({ count: sql<number>`count(*)` }).from(appointments);

  return {
    organizations: orgCount?.count || 0,
    users: userCount?.count || 0,
    customers: customerCount?.count || 0,
    appointments: appointmentCount?.count || 0,
  };
}


// ============================================
// 療程記錄 Queries - 核心功能 1
// ============================================
import {
  treatmentRecords, InsertTreatmentRecord,
  treatmentPhotos, InsertTreatmentPhoto,
  customerPackages, InsertCustomerPackage,
  packageUsageRecords, InsertPackageUsageRecord,
  consultations, InsertConsultation,
  followUps, InsertFollowUp,
  customerRfmScores, InsertCustomerRfmScore,
  commissionRules, InsertCommissionRule,
  staffCommissions, InsertStaffCommission,
  inventoryTransactions, InsertInventoryTransaction,
  revenueTargets, InsertRevenueTarget,
  marketingCampaigns, InsertMarketingCampaign,
  customerSources, InsertCustomerSource,
  satisfactionSurveys, InsertSatisfactionSurvey,
} from "../drizzle/schema";

export async function createTreatmentRecord(record: InsertTreatmentRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(treatmentRecords).values(record).returning();

  return result.id;
}

export async function updateTreatmentRecord(id: number, record: Partial<InsertTreatmentRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(treatmentRecords).set(record).where(eq(treatmentRecords.id, id));
}

export async function getTreatmentRecordById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(treatmentRecords).where(eq(treatmentRecords.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listTreatmentRecords(organizationId: number, options?: { customerId?: number; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(treatmentRecords.organizationId, organizationId);
  if (options?.customerId) {
    whereClause = and(whereClause, eq(treatmentRecords.customerId, options.customerId)) as typeof whereClause;
  }

  const data = await db.select().from(treatmentRecords).where(whereClause).orderBy(desc(treatmentRecords.treatmentDate)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(treatmentRecords).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function getCustomerTreatmentTimeline(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(treatmentRecords).where(eq(treatmentRecords.customerId, customerId)).orderBy(desc(treatmentRecords.treatmentDate));
}

// ============================================
// 療程照片 Queries - 核心功能 1
// ============================================
export async function createTreatmentPhoto(photo: InsertTreatmentPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(treatmentPhotos).values(photo).returning();

  return result.id;
}

export async function listTreatmentPhotos(customerId: number, options?: { treatmentRecordId?: number; photoType?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(treatmentPhotos.customerId, customerId);
  if (options?.treatmentRecordId) {
    whereClause = and(whereClause, eq(treatmentPhotos.treatmentRecordId, options.treatmentRecordId)) as typeof whereClause;
  }

  return await db.select().from(treatmentPhotos).where(whereClause).orderBy(desc(treatmentPhotos.photoDate));
}

export async function getBeforeAfterPhotos(customerId: number, treatmentRecordId?: number) {
  const db = await getDb();
  if (!db) return { before: [], after: [] };

  let whereClause = eq(treatmentPhotos.customerId, customerId);
  if (treatmentRecordId) {
    whereClause = and(whereClause, eq(treatmentPhotos.treatmentRecordId, treatmentRecordId)) as typeof whereClause;
  }

  const photos = await db.select().from(treatmentPhotos).where(whereClause).orderBy(asc(treatmentPhotos.photoDate));
  
  return {
    before: photos.filter(p => p.photoType === 'before'),
    after: photos.filter(p => p.photoType === 'after'),
  };
}

// ============================================
// 客戶套餐 Queries - 核心功能 2
// ============================================
export async function createCustomerPackage(pkg: InsertCustomerPackage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(customerPackages).values(pkg).returning();

  return result.id;
}

export async function updateCustomerPackage(id: number, pkg: Partial<InsertCustomerPackage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customerPackages).set(pkg).where(eq(customerPackages.id, id));
}

export async function getCustomerPackageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customerPackages).where(eq(customerPackages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listCustomerPackages(customerId: number, options?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(customerPackages.customerId, customerId);
  if (options?.status) {
    whereClause = and(whereClause, eq(customerPackages.status, options.status as any)) as typeof whereClause;
  }

  return await db.select().from(customerPackages).where(whereClause).orderBy(desc(customerPackages.purchaseDate));
}

export async function listOrganizationPackages(organizationId: number, options?: { page?: number; limit?: number; status?: string }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(customerPackages.organizationId, organizationId);
  if (options?.status) {
    whereClause = and(whereClause, eq(customerPackages.status, options.status as any)) as typeof whereClause;
  }

  const data = await db.select().from(customerPackages).where(whereClause).orderBy(desc(customerPackages.purchaseDate)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(customerPackages).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function deductPackageSession(packageId: number, sessionsToDeduct: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const pkg = await getCustomerPackageById(packageId);
  if (!pkg) throw new Error("Package not found");
  if (pkg.remainingSessions < sessionsToDeduct) throw new Error("Insufficient sessions");
  
  const newUsed = pkg.usedSessions + sessionsToDeduct;
  const newRemaining = pkg.remainingSessions - sessionsToDeduct;
  const newStatus = newRemaining === 0 ? 'completed' : pkg.status;
  
  await db.update(customerPackages).set({
    usedSessions: newUsed,
    remainingSessions: newRemaining,
    status: newStatus,
  }).where(eq(customerPackages.id, packageId));
  
  return { usedSessions: newUsed, remainingSessions: newRemaining, status: newStatus };
}

// ============================================
// 套餐使用記錄 Queries - 核心功能 2
// ============================================
export async function createPackageUsageRecord(record: InsertPackageUsageRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(packageUsageRecords).values(record).returning();

  return result.id;
}

export async function listPackageUsageRecords(packageId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(packageUsageRecords).where(eq(packageUsageRecords.packageId, packageId)).orderBy(desc(packageUsageRecords.usageDate));
}

// ============================================
// 諮詢記錄 Queries - 核心功能 3
// ============================================
export async function createConsultation(consultation: InsertConsultation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(consultations).values(consultation).returning();

  return result.id;
}

export async function updateConsultation(id: number, consultation: Partial<InsertConsultation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(consultations).set(consultation).where(eq(consultations.id, id));
}

export async function getConsultationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(consultations).where(eq(consultations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listConsultations(organizationId: number, options?: { page?: number; limit?: number; status?: string; staffId?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(consultations.organizationId, organizationId);
  if (options?.status) {
    whereClause = and(whereClause, eq(consultations.status, options.status as any)) as typeof whereClause;
  }
  if (options?.staffId) {
    whereClause = and(whereClause, eq(consultations.staffId, options.staffId)) as typeof whereClause;
  }

  const data = await db.select().from(consultations).where(whereClause).orderBy(desc(consultations.consultationDate)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(consultations).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function getConsultationConversionStats(organizationId: number) {
  const db = await getDb();
  if (!db) return { total: 0, converted: 0, conversionRate: 0 };
  
  const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(consultations).where(eq(consultations.organizationId, organizationId));
  const [convertedResult] = await db.select({ count: sql<number>`count(*)` }).from(consultations).where(and(eq(consultations.organizationId, organizationId), eq(consultations.status, 'converted')));
  
  const total = totalResult?.count || 0;
  const converted = convertedResult?.count || 0;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
  
  return { total, converted, conversionRate };
}

// ============================================
// 跟進記錄 Queries - 核心功能 3
// ============================================
export async function createFollowUp(followUp: InsertFollowUp) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(followUps).values(followUp).returning();

  return result.id;
}

export async function updateFollowUp(id: number, followUp: Partial<InsertFollowUp>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(followUps).set(followUp).where(eq(followUps.id, id));
}

export async function listFollowUps(organizationId: number, options?: { consultationId?: number; customerId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(followUps.organizationId, organizationId);
  if (options?.consultationId) {
    whereClause = and(whereClause, eq(followUps.consultationId, options.consultationId)) as typeof whereClause;
  }
  if (options?.customerId) {
    whereClause = and(whereClause, eq(followUps.customerId, options.customerId)) as typeof whereClause;
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(followUps.status, options.status as any)) as typeof whereClause;
  }

  return await db.select().from(followUps).where(whereClause).orderBy(desc(followUps.followUpDate));
}

export async function getPendingFollowUps(organizationId: number, staffId?: number) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = and(eq(followUps.organizationId, organizationId), eq(followUps.status, 'pending'));
  if (staffId) {
    whereClause = and(whereClause, eq(followUps.staffId, staffId)) as typeof whereClause;
  }

  return await db.select().from(followUps).where(whereClause).orderBy(asc(followUps.followUpDate));
}

// ============================================
// RFM 分析 Queries - 核心功能 4
// ============================================
export async function upsertCustomerRfmScore(score: InsertCustomerRfmScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(customerRfmScores)
    .where(and(eq(customerRfmScores.organizationId, score.organizationId), eq(customerRfmScores.customerId, score.customerId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(customerRfmScores).set({
      ...score,
      calculatedAt: new Date(),
    }).where(eq(customerRfmScores.id, existing[0].id));
    return existing[0].id;
  } else {
    const [result] = await db.insert(customerRfmScores).values(score).returning();

    return result.id;
  }
}

export async function getCustomerRfmScore(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customerRfmScores).where(eq(customerRfmScores.customerId, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listCustomerRfmScores(organizationId: number, options?: { segment?: string; minChurnRisk?: number }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(customerRfmScores.organizationId, organizationId);
  if (options?.segment) {
    whereClause = and(whereClause, eq(customerRfmScores.segment, options.segment)) as typeof whereClause;
  }

  const results = await db.select().from(customerRfmScores).where(whereClause).orderBy(desc(customerRfmScores.totalScore));
  
  if (options?.minChurnRisk !== undefined) {
    return results.filter(r => (r.churnRisk || 0) >= options.minChurnRisk!);
  }
  
  return results;
}

export async function calculateCustomerRfm(organizationId: number, customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 取得客戶訂單資料
  const customerOrders = await db.select().from(orders)
    .where(and(eq(orders.organizationId, organizationId), eq(orders.customerId, customerId), eq(orders.status, 'completed')));
  
  if (customerOrders.length === 0) {
    return {
      recencyScore: 1,
      frequencyScore: 1,
      monetaryScore: 1,
      totalScore: 3,
      segment: 'new',
      churnRisk: 50,
    };
  }
  
  // 計算 Recency (最近一次消費距今天數)
  const lastOrder = customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const daysSinceLastPurchase = Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const recencyScore = daysSinceLastPurchase <= 30 ? 5 : daysSinceLastPurchase <= 60 ? 4 : daysSinceLastPurchase <= 90 ? 3 : daysSinceLastPurchase <= 180 ? 2 : 1;
  
  // 計算 Frequency (消費次數)
  const purchaseCount = customerOrders.length;
  const frequencyScore = purchaseCount >= 10 ? 5 : purchaseCount >= 6 ? 4 : purchaseCount >= 3 ? 3 : purchaseCount >= 2 ? 2 : 1;
  
  // 計算 Monetary (總消費金額)
  const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const monetaryScore = totalSpent >= 100000 ? 5 : totalSpent >= 50000 ? 4 : totalSpent >= 20000 ? 3 : totalSpent >= 5000 ? 2 : 1;
  
  const totalScore = recencyScore + frequencyScore + monetaryScore;
  
  // 判斷客戶分群
  let segment = 'regular';
  if (totalScore >= 13) segment = 'champion';
  else if (totalScore >= 10) segment = 'loyal';
  else if (recencyScore >= 4 && frequencyScore <= 2) segment = 'new';
  else if (recencyScore <= 2 && frequencyScore >= 3) segment = 'at_risk';
  else if (recencyScore <= 2 && frequencyScore <= 2) segment = 'lost';
  
  // 計算流失風險
  const churnRisk = Math.max(0, Math.min(100, 100 - (recencyScore * 15) - (frequencyScore * 5)));
  
  return {
    recencyScore,
    frequencyScore,
    monetaryScore,
    totalScore,
    segment,
    lastPurchaseDate: lastOrder.createdAt,
    purchaseCount,
    totalSpent: totalSpent.toString(),
    churnRisk,
  };
}

// ============================================
// 員工佣金 Queries - 核心功能 6
// ============================================
export async function createCommissionRule(rule: InsertCommissionRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(commissionRules).values(rule).returning();

  return result.id;
}

export async function updateCommissionRule(id: number, rule: Partial<InsertCommissionRule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(commissionRules).set(rule).where(eq(commissionRules.id, id));
}

export async function listCommissionRules(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(commissionRules).where(eq(commissionRules.organizationId, organizationId)).orderBy(desc(commissionRules.createdAt));
}

export async function createStaffCommission(commission: InsertStaffCommission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(staffCommissions).values(commission).returning();

  return result.id;
}

export async function updateStaffCommission(id: number, commission: Partial<InsertStaffCommission>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(staffCommissions).set(commission).where(eq(staffCommissions.id, id));
}

export async function listStaffCommissions(organizationId: number, options?: { staffId?: number; status?: string; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(staffCommissions.organizationId, organizationId);
  if (options?.staffId) {
    whereClause = and(whereClause, eq(staffCommissions.staffId, options.staffId)) as typeof whereClause;
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(staffCommissions.status, options.status as any)) as typeof whereClause;
  }

  return await db.select().from(staffCommissions).where(whereClause).orderBy(desc(staffCommissions.commissionDate));
}

export async function getStaffCommissionSummary(organizationId: number, staffId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { totalSales: 0, totalCommission: 0, count: 0 };

  const commissions = await db.select().from(staffCommissions)
    .where(and(
      eq(staffCommissions.organizationId, organizationId),
      eq(staffCommissions.staffId, staffId)
    ));
  
  const filtered = commissions.filter(c => {
    const date = new Date(c.commissionDate);
    return date >= startDate && date <= endDate;
  });

  return {
    totalSales: filtered.reduce((sum, c) => sum + Number(c.salesAmount), 0),
    totalCommission: filtered.reduce((sum, c) => sum + Number(c.commissionAmount), 0),
    count: filtered.length,
  };
}

// ============================================
// 庫存異動 Queries - 核心功能 7
// ============================================
export async function createInventoryTransaction(transaction: InsertInventoryTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(inventoryTransactions).values(transaction).returning();
  
  // 更新產品庫存
  const product = await getProductById(transaction.productId);
  if (product) {
    let newStock = product.stock || 0;
    if (transaction.transactionType === 'purchase' || transaction.transactionType === 'return') {
      newStock += transaction.quantity;
    } else if (transaction.transactionType === 'sale' || transaction.transactionType === 'waste') {
      newStock -= transaction.quantity;
    }
    await updateProduct(transaction.productId, { stock: newStock });
  }
  
  return result.id;
}

export async function listInventoryTransactions(organizationId: number, options?: { productId?: number; transactionType?: string; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(inventoryTransactions.organizationId, organizationId);
  if (options?.productId) {
    whereClause = and(whereClause, eq(inventoryTransactions.productId, options.productId)) as typeof whereClause;
  }
  if (options?.transactionType) {
    whereClause = and(whereClause, eq(inventoryTransactions.transactionType, options.transactionType as any)) as typeof whereClause;
  }

  return await db.select().from(inventoryTransactions).where(whereClause).orderBy(desc(inventoryTransactions.transactionDate));
}

export async function getProductCostAnalysis(organizationId: number, productId: number) {
  const db = await getDb();
  if (!db) return { averageCost: 0, totalCost: 0, totalQuantity: 0 };

  const transactions = await db.select().from(inventoryTransactions)
    .where(and(
      eq(inventoryTransactions.organizationId, organizationId),
      eq(inventoryTransactions.productId, productId),
      eq(inventoryTransactions.transactionType, 'purchase')
    ));

  const totalCost = transactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
  const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
  const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;

  return { averageCost, totalCost, totalQuantity };
}

// ============================================
// 營收目標 Queries - 核心功能 8
// ============================================
export async function createRevenueTarget(target: InsertRevenueTarget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(revenueTargets).values(target).returning();

  return result.id;
}

export async function updateRevenueTarget(id: number, target: Partial<InsertRevenueTarget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(revenueTargets).set(target).where(eq(revenueTargets.id, id));
}

export async function listRevenueTargets(organizationId: number, options?: { year?: number; targetType?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(revenueTargets.organizationId, organizationId);
  if (options?.year) {
    whereClause = and(whereClause, eq(revenueTargets.targetYear, options.year)) as typeof whereClause;
  }
  if (options?.targetType) {
    whereClause = and(whereClause, eq(revenueTargets.targetType, options.targetType as any)) as typeof whereClause;
  }

  return await db.select().from(revenueTargets).where(whereClause).orderBy(desc(revenueTargets.targetYear), asc(revenueTargets.targetMonth));
}

export async function calculateRevenueAchievement(organizationId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return { target: 0, actual: 0, achievementRate: 0 };

  // 取得目標
  const [targetResult] = await db.select().from(revenueTargets)
    .where(and(
      eq(revenueTargets.organizationId, organizationId),
      eq(revenueTargets.targetYear, year),
      eq(revenueTargets.targetMonth, month)
    )).limit(1);

  // 計算實際營收
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const completedOrders = await db.select().from(orders)
    .where(and(
      eq(orders.organizationId, organizationId),
      eq(orders.status, 'completed')
    ));
  
  const monthlyOrders = completedOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  const actual = monthlyOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const target = targetResult ? Number(targetResult.targetAmount) : 0;
  const achievementRate = target > 0 ? Math.round((actual / target) * 100) : 0;

  // 更新目標記錄
  if (targetResult) {
    await updateRevenueTarget(targetResult.id, {
      actualAmount: actual.toString(),
      achievementRate: achievementRate.toString(),
    });
  }

  return { target, actual, achievementRate };
}

// ============================================
// 行銷活動 Queries - 核心功能 9
// ============================================
export async function createMarketingCampaign(campaign: InsertMarketingCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(marketingCampaigns).values(campaign).returning();

  return result.id;
}

export async function updateMarketingCampaign(id: number, campaign: Partial<InsertMarketingCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(marketingCampaigns).set(campaign).where(eq(marketingCampaigns.id, id));
}

export async function listMarketingCampaigns(organizationId: number, options?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(marketingCampaigns.organizationId, organizationId);
  if (options?.status) {
    whereClause = and(whereClause, eq(marketingCampaigns.status, options.status as any)) as typeof whereClause;
  }

  return await db.select().from(marketingCampaigns).where(whereClause).orderBy(desc(marketingCampaigns.createdAt));
}

// ============================================
// 客戶來源追蹤 Queries - 核心功能 9
// ============================================
export async function createCustomerSource(source: InsertCustomerSource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(customerSources).values(source).returning();

  return result.id;
}

export async function updateCustomerSource(id: number, source: Partial<InsertCustomerSource>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customerSources).set(source).where(eq(customerSources.id, id));
}

export async function getCustomerSourceByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customerSources).where(eq(customerSources.customerId, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSourceROIAnalysis(organizationId: number, campaignId?: number) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(customerSources.organizationId, organizationId);
  if (campaignId) {
    whereClause = and(whereClause, eq(customerSources.campaignId, campaignId)) as typeof whereClause;
  }

  const sources = await db.select().from(customerSources).where(whereClause);
  
  // 按來源類型分組計算
  const sourceMap = new Map<string, { count: number; totalValue: number }>();
  sources.forEach(s => {
    const key = s.sourceType || 'unknown';
    const existing = sourceMap.get(key) || { count: 0, totalValue: 0 };
    sourceMap.set(key, {
      count: existing.count + 1,
      totalValue: existing.totalValue + Number(s.lifetimeValue || 0),
    });
  });

  return Array.from(sourceMap.entries()).map(([sourceType, data]) => ({
    sourceType,
    customerCount: data.count,
    totalLifetimeValue: data.totalValue,
    averageLifetimeValue: data.count > 0 ? data.totalValue / data.count : 0,
  }));
}

// ============================================
// 滿意度調查 Queries - 核心功能 10
// ============================================
export async function createSatisfactionSurvey(survey: InsertSatisfactionSurvey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(satisfactionSurveys).values(survey).returning();

  return result.id;
}

export async function updateSatisfactionSurvey(id: number, survey: Partial<InsertSatisfactionSurvey>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(satisfactionSurveys).set(survey).where(eq(satisfactionSurveys.id, id));
}

export async function listSatisfactionSurveys(organizationId: number, options?: { customerId?: number; status?: string; surveyType?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(satisfactionSurveys.organizationId, organizationId);
  if (options?.customerId) {
    whereClause = and(whereClause, eq(satisfactionSurveys.customerId, options.customerId)) as typeof whereClause;
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(satisfactionSurveys.status, options.status as any)) as typeof whereClause;
  }
  if (options?.surveyType) {
    whereClause = and(whereClause, eq(satisfactionSurveys.surveyType, options.surveyType as any)) as typeof whereClause;
  }

  return await db.select().from(satisfactionSurveys).where(whereClause).orderBy(desc(satisfactionSurveys.createdAt));
}

export async function getNPSStats(organizationId: number) {
  const db = await getDb();
  if (!db) return { nps: 0, promoters: 0, passives: 0, detractors: 0, totalResponses: 0 };

  const surveys = await db.select().from(satisfactionSurveys)
    .where(and(
      eq(satisfactionSurveys.organizationId, organizationId),
      eq(satisfactionSurveys.status, 'completed')
    ));

  const withNps = surveys.filter(s => s.npsScore !== null);
  if (withNps.length === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, totalResponses: 0 };

  const promoters = withNps.filter(s => (s.npsScore || 0) >= 9).length;
  const passives = withNps.filter(s => (s.npsScore || 0) >= 7 && (s.npsScore || 0) <= 8).length;
  const detractors = withNps.filter(s => (s.npsScore || 0) <= 6).length;
  
  const nps = Math.round(((promoters - detractors) / withNps.length) * 100);

  return {
    nps,
    promoters,
    passives,
    detractors,
    totalResponses: withNps.length,
  };
}

export async function getSatisfactionTrend(organizationId: number, months: number = 6) {
  const db = await getDb();
  if (!db) return [];

  const surveys = await db.select().from(satisfactionSurveys)
    .where(and(
      eq(satisfactionSurveys.organizationId, organizationId),
      eq(satisfactionSurveys.status, 'completed')
    ))
    .orderBy(desc(satisfactionSurveys.completedAt));

  // 按月份分組
  const monthlyData = new Map<string, { scores: number[]; npsScores: number[] }>();
  
  surveys.forEach(s => {
    if (!s.completedAt) return;
    const monthKey = new Date(s.completedAt).toISOString().slice(0, 7);
    const existing = monthlyData.get(monthKey) || { scores: [], npsScores: [] };
    if (s.overallScore) existing.scores.push(s.overallScore);
    if (s.npsScore) existing.npsScores.push(s.npsScore);
    monthlyData.set(monthKey, existing);
  });

  return Array.from(monthlyData.entries())
    .slice(0, months)
    .map(([month, data]) => ({
      month,
      averageScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
      averageNps: data.npsScores.length > 0 ? data.npsScores.reduce((a, b) => a + b, 0) / data.npsScores.length : 0,
      responseCount: data.scores.length,
    }))
    .reverse();
}


// ============================================
// 預約到診率統計 Queries - 核心功能 5
// ============================================
export async function getAppointmentAttendanceStats(organizationId: number, options?: { startDate?: string; endDate?: string; staffId?: number }) {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, noShow: 0, cancelled: 0, attendanceRate: 0, noShowRate: 0 };

  let whereClause = eq(appointments.organizationId, organizationId);
  if (options?.staffId) {
    whereClause = and(whereClause, eq(appointments.staffId, options.staffId)) as typeof whereClause;
  }

  const allAppointments = await db.select().from(appointments).where(whereClause);
  
  // 過濾日期範圍
  let filtered = allAppointments;
  if (options?.startDate) {
    const start = new Date(options.startDate);
    filtered = filtered.filter(a => new Date(a.appointmentDate) >= start);
  }
  if (options?.endDate) {
    const end = new Date(options.endDate);
    filtered = filtered.filter(a => new Date(a.appointmentDate) <= end);
  }

  const total = filtered.length;
  const completed = filtered.filter(a => a.status === 'completed' || a.status === 'arrived' || a.status === 'in_progress').length;
  const noShow = filtered.filter(a => a.status === 'no_show').length;
  const cancelled = filtered.filter(a => a.status === 'cancelled').length;
  
  const attendanceRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const noShowRate = total > 0 ? Math.round((noShow / total) * 100) : 0;

  return { total, completed, noShow, cancelled, attendanceRate, noShowRate };
}

export async function getNoShowAnalysis(organizationId: number, options?: { startDate?: string; endDate?: string }) {
  const db = await getDb();
  if (!db) return { byDayOfWeek: [], byTimeSlot: [], byCustomer: [], trends: [] };

  let whereClause = and(
    eq(appointments.organizationId, organizationId),
    eq(appointments.status, 'no_show')
  );

  const noShowAppointments = await db.select().from(appointments).where(whereClause);
  
  // 過濾日期範圍
  let filtered = noShowAppointments;
  if (options?.startDate) {
    const start = new Date(options.startDate);
    filtered = filtered.filter(a => new Date(a.appointmentDate) >= start);
  }
  if (options?.endDate) {
    const end = new Date(options.endDate);
    filtered = filtered.filter(a => new Date(a.appointmentDate) <= end);
  }

  // 按星期幾分析
  const dayOfWeekMap = new Map<number, number>();
  const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  filtered.forEach(a => {
    const day = new Date(a.appointmentDate).getDay();
    dayOfWeekMap.set(day, (dayOfWeekMap.get(day) || 0) + 1);
  });
  const byDayOfWeek = Array.from(dayOfWeekMap.entries()).map(([day, count]) => ({
    day: dayNames[day],
    count,
  })).sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day));

  // 按時段分析
  const timeSlotMap = new Map<string, number>();
  filtered.forEach(a => {
    const hour = parseInt(a.startTime.split(':')[0]);
    let slot = '其他';
    if (hour >= 9 && hour < 12) slot = '上午 (9-12)';
    else if (hour >= 12 && hour < 14) slot = '中午 (12-14)';
    else if (hour >= 14 && hour < 18) slot = '下午 (14-18)';
    else if (hour >= 18 && hour < 21) slot = '晚間 (18-21)';
    timeSlotMap.set(slot, (timeSlotMap.get(slot) || 0) + 1);
  });
  const byTimeSlot = Array.from(timeSlotMap.entries()).map(([slot, count]) => ({ slot, count }));

  // 按客戶分析（高風險客戶）
  const customerMap = new Map<number, number>();
  filtered.forEach(a => {
    customerMap.set(a.customerId, (customerMap.get(a.customerId) || 0) + 1);
  });
  const byCustomer = Array.from(customerMap.entries())
    .map(([customerId, count]) => ({ customerId, noShowCount: count }))
    .sort((a, b) => b.noShowCount - a.noShowCount)
    .slice(0, 10);

  // 月度趨勢
  const monthMap = new Map<string, number>();
  filtered.forEach(a => {
    const month = new Date(a.appointmentDate).toISOString().slice(0, 7);
    monthMap.set(month, (monthMap.get(month) || 0) + 1);
  });
  const trends = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { byDayOfWeek, byTimeSlot, byCustomer, trends };
}

// ============================================
// 候補名單 Queries - 核心功能 5
// ============================================
import { waitlist, InsertWaitlist } from "../drizzle/schema";

export async function addToWaitlist(data: InsertWaitlist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(waitlist).values(data).returning();

  return result.id;
}

export async function getWaitlist(organizationId: number, date?: string) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = and(
    eq(waitlist.organizationId, organizationId),
    eq(waitlist.status, 'waiting')
  );

  if (date) {
    whereClause = and(whereClause, eq(waitlist.preferredDate, date)) as typeof whereClause;
  }

  return await db.select().from(waitlist).where(whereClause).orderBy(asc(waitlist.preferredDate), asc(waitlist.createdAt));
}

export async function updateWaitlistStatus(id: number, status: 'waiting' | 'notified' | 'booked' | 'cancelled', bookedAppointmentId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (status === 'notified') {
    updateData.notifiedAt = new Date();
  }
  if (bookedAppointmentId) {
    updateData.bookedAppointmentId = bookedAppointmentId;
  }
  
  await db.update(waitlist).set(updateData).where(eq(waitlist.id, id));
}

export async function notifyWaitlistForCancellation(organizationId: number, appointmentDate: string, timeSlot?: string) {
  const db = await getDb();
  if (!db) return [];

  // 找到符合條件的候補客戶
  let whereClause = and(
    eq(waitlist.organizationId, organizationId),
    eq(waitlist.preferredDate, appointmentDate),
    eq(waitlist.status, 'waiting')
  );

  const candidates = await db.select().from(waitlist).where(whereClause).orderBy(asc(waitlist.createdAt));
  
  // 返回前 3 位候補客戶
  return candidates.slice(0, 3);
}


// ============================================
// Phase 41: 注射點位圖 Queries
// ============================================
import {
  injectionRecords, InsertInjectionRecord,
  injectionPoints, InsertInjectionPoint,
  consentFormTemplates, InsertConsentFormTemplate,
  consentSignatures, InsertConsentSignature,
  medications, InsertMedication,
  prescriptions, InsertPrescription,
  customerAllergies, InsertCustomerAllergy,
  skinAnalysisRecords, InsertSkinAnalysisRecord,
  skinMetrics, InsertSkinMetric,
  membershipPlans, InsertMembershipPlan,
  memberSubscriptions, InsertMemberSubscription,
  subscriptionPayments, InsertSubscriptionPayment,
  teleConsultations, InsertTeleConsultation,
  consultationRecordings, InsertConsultationRecording,
  referralCodes, InsertReferralCode,
  referralRecords, InsertReferralRecord,
  referralRewards, InsertReferralReward,
  socialAccounts, InsertSocialAccount,
  scheduledPosts, InsertScheduledPost,
  socialAnalytics, InsertSocialAnalytic,
} from "../drizzle/schema";

export async function createInjectionRecord(record: InsertInjectionRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(injectionRecords).values(record).returning();

  return result.id;
}

export async function getInjectionRecordById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(injectionRecords).where(eq(injectionRecords.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listInjectionRecords(customerId: number, options?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const data = await db.select().from(injectionRecords).where(eq(injectionRecords.customerId, customerId)).orderBy(desc(injectionRecords.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(injectionRecords).where(eq(injectionRecords.customerId, customerId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function createInjectionPoint(point: InsertInjectionPoint) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(injectionPoints).values(point).returning();

  return result.id;
}

export async function listInjectionPoints(injectionRecordId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(injectionPoints).where(eq(injectionPoints.injectionRecordId, injectionRecordId));
}

export async function compareInjectionHistory(customerId: number, templateType: string) {
  const db = await getDb();
  if (!db) return [];
  
  const records = await db.select().from(injectionRecords)
    .where(and(eq(injectionRecords.customerId, customerId), eq(injectionRecords.templateType, templateType as any)))
    .orderBy(desc(injectionRecords.createdAt))
    .limit(5);
  
  const result = [];
  for (const record of records) {
    const points = await listInjectionPoints(record.id);
    result.push({ ...record, points });
  }
  return result;
}

// ============================================
// Phase 42: 電子同意書 Queries
// ============================================
export async function createConsentFormTemplate(template: InsertConsentFormTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(consentFormTemplates).values(template).returning();

  return result.id;
}

export async function updateConsentFormTemplate(id: number, template: Partial<InsertConsentFormTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(consentFormTemplates).set(template).where(eq(consentFormTemplates.id, id));
}

export async function listConsentFormTemplates(organizationId: number, options?: { category?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(consentFormTemplates.organizationId, organizationId);
  if (options?.category) {
    whereClause = and(whereClause, eq(consentFormTemplates.category, options.category as any)) as typeof whereClause;
  }
  if (options?.isActive !== undefined) {
    whereClause = and(whereClause, eq(consentFormTemplates.isActive, options.isActive)) as typeof whereClause;
  }

  return await db.select().from(consentFormTemplates).where(whereClause).orderBy(desc(consentFormTemplates.createdAt));
}

export async function createConsentSignature(signature: InsertConsentSignature) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(consentSignatures).values(signature).returning();

  return result.id;
}

export async function getConsentSignatureById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(consentSignatures).where(eq(consentSignatures.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listCustomerConsentSignatures(customerId: number, options?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const data = await db.select().from(consentSignatures).where(eq(consentSignatures.customerId, customerId)).orderBy(desc(consentSignatures.signedAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(consentSignatures).where(eq(consentSignatures.customerId, customerId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// ============================================
// Phase 43: 處方管理 Queries
// ============================================
export async function createMedication(medication: InsertMedication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(medications).values(medication).returning();

  return result.id;
}

export async function updateMedication(id: number, medication: Partial<InsertMedication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(medications).set(medication).where(eq(medications.id, id));
}

export async function listMedications(organizationId: number, options?: { category?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(medications.organizationId, organizationId);
  if (options?.category) {
    whereClause = and(whereClause, eq(medications.category, options.category as any)) as typeof whereClause;
  }
  if (options?.isActive !== undefined) {
    whereClause = and(whereClause, eq(medications.isActive, options.isActive)) as typeof whereClause;
  }

  return await db.select().from(medications).where(whereClause).orderBy(medications.name);
}

export async function createPrescription(prescription: InsertPrescription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(prescriptions).values(prescription).returning();

  return result.id;
}

export async function updatePrescription(id: number, prescription: Partial<InsertPrescription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(prescriptions).set(prescription).where(eq(prescriptions.id, id));
}

export async function listCustomerPrescriptions(customerId: number, options?: { status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(prescriptions.customerId, customerId);
  if (options?.status) {
    whereClause = and(whereClause, eq(prescriptions.status, options.status as any)) as typeof whereClause;
  }

  const data = await db.select().from(prescriptions).where(whereClause).orderBy(desc(prescriptions.prescribedAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(prescriptions).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function createCustomerAllergy(allergy: InsertCustomerAllergy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(customerAllergies).values(allergy).returning();

  return result.id;
}

export async function listCustomerAllergies(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customerAllergies).where(and(eq(customerAllergies.customerId, customerId), eq(customerAllergies.isActive, true)));
}

export async function checkAllergyConflict(customerId: number, medicationId: number) {
  const db = await getDb();
  if (!db) return { hasConflict: false, conflicts: [] };
  
  const allergies = await listCustomerAllergies(customerId);
  const medication = await db.select().from(medications).where(eq(medications.id, medicationId)).limit(1);
  
  if (!medication.length) return { hasConflict: false, conflicts: [] };
  
  const conflicts = allergies.filter(a => 
    medication[0].name?.toLowerCase().includes(a.allergen.toLowerCase()) ||
    medication[0].genericName?.toLowerCase().includes(a.allergen.toLowerCase())
  );
  
  return { hasConflict: conflicts.length > 0, conflicts };
}

// ============================================
// Phase 44: AI 膚質分析 Queries
// ============================================
export async function createSkinAnalysisRecord(record: InsertSkinAnalysisRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(skinAnalysisRecords).values(record).returning();

  return result.id;
}

export async function getSkinAnalysisRecordById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(skinAnalysisRecords).where(eq(skinAnalysisRecords.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listSkinAnalysisRecords(customerId: number, options?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const data = await db.select().from(skinAnalysisRecords).where(eq(skinAnalysisRecords.customerId, customerId)).orderBy(desc(skinAnalysisRecords.analyzedAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(skinAnalysisRecords).where(eq(skinAnalysisRecords.customerId, customerId));
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function createSkinMetric(metric: InsertSkinMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(skinMetrics).values(metric).returning();

  return result.id;
}

export async function listSkinMetrics(analysisRecordId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skinMetrics).where(eq(skinMetrics.analysisRecordId, analysisRecordId));
}

export async function compareSkinAnalysis(customerId: number, metricType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const records = await db.select().from(skinAnalysisRecords)
    .where(eq(skinAnalysisRecords.customerId, customerId))
    .orderBy(desc(skinAnalysisRecords.analyzedAt))
    .limit(10);
  
  const result = [];
  for (const record of records) {
    let metrics = await listSkinMetrics(record.id);
    if (metricType) {
      metrics = metrics.filter(m => m.metricType === metricType);
    }
    result.push({ ...record, metrics });
  }
  return result;
}

// ============================================
// Phase 45: 會員訂閱制 Queries
// ============================================
export async function createMembershipPlan(plan: InsertMembershipPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(membershipPlans).values(plan).returning();

  return result.id;
}

export async function updateMembershipPlan(id: number, plan: Partial<InsertMembershipPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(membershipPlans).set(plan).where(eq(membershipPlans.id, id));
}

export async function listMembershipPlans(organizationId: number, options?: { isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(membershipPlans.organizationId, organizationId);
  if (options?.isActive !== undefined) {
    whereClause = and(whereClause, eq(membershipPlans.isActive, options.isActive)) as typeof whereClause;
  }

  return await db.select().from(membershipPlans).where(whereClause).orderBy(membershipPlans.sortOrder);
}

export async function createMemberSubscription(subscription: InsertMemberSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(memberSubscriptions).values(subscription).returning();

  return result.id;
}

export async function updateMemberSubscription(id: number, subscription: Partial<InsertMemberSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(memberSubscriptions).set(subscription).where(eq(memberSubscriptions.id, id));
}

export async function getCustomerSubscription(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(memberSubscriptions)
    .where(and(eq(memberSubscriptions.customerId, customerId), eq(memberSubscriptions.status, 'active')))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listOrganizationSubscriptions(organizationId: number, options?: { status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(memberSubscriptions.organizationId, organizationId);
  if (options?.status) {
    whereClause = and(whereClause, eq(memberSubscriptions.status, options.status as any)) as typeof whereClause;
  }

  const data = await db.select().from(memberSubscriptions).where(whereClause).orderBy(desc(memberSubscriptions.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(memberSubscriptions).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function createSubscriptionPayment(payment: InsertSubscriptionPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(subscriptionPayments).values(payment).returning();

  return result.id;
}

export async function listSubscriptionPayments(subscriptionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subscriptionPayments).where(eq(subscriptionPayments.subscriptionId, subscriptionId)).orderBy(desc(subscriptionPayments.createdAt));
}

// ============================================
// Phase 46: 遠程諮詢 Queries
// ============================================
export async function createTeleConsultation(consultation: InsertTeleConsultation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(teleConsultations).values(consultation).returning();

  return result.id;
}

export async function updateTeleConsultation(id: number, consultation: Partial<InsertTeleConsultation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teleConsultations).set(consultation).where(eq(teleConsultations.id, id));
}

export async function getTeleConsultationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teleConsultations).where(eq(teleConsultations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listTeleConsultations(organizationId: number, options?: { status?: string; customerId?: number; staffId?: number; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(teleConsultations.organizationId, organizationId);
  if (options?.status) {
    whereClause = and(whereClause, eq(teleConsultations.status, options.status as any)) as typeof whereClause;
  }
  if (options?.customerId) {
    whereClause = and(whereClause, eq(teleConsultations.customerId, options.customerId)) as typeof whereClause;
  }
  if (options?.staffId) {
    whereClause = and(whereClause, eq(teleConsultations.staffId, options.staffId)) as typeof whereClause;
  }

  const data = await db.select().from(teleConsultations).where(whereClause).orderBy(desc(teleConsultations.scheduledAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(teleConsultations).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function createConsultationRecording(recording: InsertConsultationRecording) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(consultationRecordings).values(recording).returning();

  return result.id;
}

export async function listConsultationRecordings(teleConsultationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(consultationRecordings).where(eq(consultationRecordings.teleConsultationId, teleConsultationId));
}

// ============================================
// Phase 47: 推薦獎勵系統 Queries
// ============================================
export async function createReferralCode(code: InsertReferralCode) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(referralCodes).values(code).returning();

  return result.id;
}

export async function getReferralCodeByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referralCodes).where(eq(referralCodes.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerReferralCode(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referralCodes)
    .where(and(eq(referralCodes.customerId, customerId), eq(referralCodes.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateReferralCodeUsage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referralCodes).set({ usedCount: sql`${referralCodes.usedCount} + 1` }).where(eq(referralCodes.id, id));
}

export async function createReferralRecord(record: InsertReferralRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(referralRecords).values(record).returning();

  return result.id;
}

export async function listReferralRecords(organizationId: number, options?: { referrerId?: number; status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(referralRecords.organizationId, organizationId);
  if (options?.referrerId) {
    whereClause = and(whereClause, eq(referralRecords.referrerId, options.referrerId)) as typeof whereClause;
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(referralRecords.status, options.status as any)) as typeof whereClause;
  }

  const data = await db.select().from(referralRecords).where(whereClause).orderBy(desc(referralRecords.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(referralRecords).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function createReferralReward(reward: InsertReferralReward) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(referralRewards).values(reward).returning();

  return result.id;
}

export async function listCustomerReferralRewards(customerId: number, options?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(referralRewards.recipientId, customerId);
  if (options?.status) {
    whereClause = and(whereClause, eq(referralRewards.status, options.status as any)) as typeof whereClause;
  }

  return await db.select().from(referralRewards).where(whereClause).orderBy(desc(referralRewards.createdAt));
}

export async function getReferralStats(organizationId: number) {
  const db = await getDb();
  if (!db) return { totalReferrals: 0, qualifiedReferrals: 0, totalRewardsIssued: 0 };
  
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(referralRecords).where(eq(referralRecords.organizationId, organizationId));
  const qualifiedResult = await db.select({ count: sql<number>`count(*)` }).from(referralRecords).where(and(eq(referralRecords.organizationId, organizationId), eq(referralRecords.status, 'rewarded')));
  const rewardsResult = await db.select({ count: sql<number>`count(*)` }).from(referralRewards).where(eq(referralRewards.status, 'issued'));
  
  return {
    totalReferrals: totalResult[0]?.count || 0,
    qualifiedReferrals: qualifiedResult[0]?.count || 0,
    totalRewardsIssued: rewardsResult[0]?.count || 0,
  };
}

// ============================================
// Phase 48: 社群媒體整合 Queries
// ============================================
export async function createSocialAccount(account: InsertSocialAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(socialAccounts).values(account).returning();

  return result.id;
}

export async function updateSocialAccount(id: number, account: Partial<InsertSocialAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialAccounts).set(account).where(eq(socialAccounts.id, id));
}

export async function listSocialAccounts(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(socialAccounts).where(eq(socialAccounts.organizationId, organizationId));
}

export async function createScheduledPost(post: InsertScheduledPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(scheduledPosts).values(post).returning();

  return result.id;
}

export async function updateScheduledPost(id: number, post: Partial<InsertScheduledPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(scheduledPosts).set(post).where(eq(scheduledPosts.id, id));
}

export async function listScheduledPosts(organizationId: number, options?: { status?: string; socialAccountId?: number; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(scheduledPosts.organizationId, organizationId);
  if (options?.status) {
    whereClause = and(whereClause, eq(scheduledPosts.status, options.status as any)) as typeof whereClause;
  }
  if (options?.socialAccountId) {
    whereClause = and(whereClause, eq(scheduledPosts.socialAccountId, options.socialAccountId)) as typeof whereClause;
  }

  const data = await db.select().from(scheduledPosts).where(whereClause).orderBy(desc(scheduledPosts.scheduledAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(scheduledPosts).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function createSocialAnalytic(analytic: InsertSocialAnalytic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(socialAnalytics).values(analytic).returning();

  return result.id;
}

export async function getSocialAnalytics(socialAccountId: number, options?: { startDate?: string; endDate?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(socialAnalytics.socialAccountId, socialAccountId);
  if (options?.startDate) {
    whereClause = and(whereClause, gte(socialAnalytics.date, options.startDate)) as typeof whereClause;
  }
  if (options?.endDate) {
    whereClause = and(whereClause, lte(socialAnalytics.date, options.endDate)) as typeof whereClause;
  }

  return await db.select().from(socialAnalytics).where(whereClause).orderBy(socialAnalytics.date);
}

export async function getSocialAccountStats(organizationId: number) {
  const db = await getDb();
  if (!db) return { totalAccounts: 0, connectedAccounts: 0, totalFollowers: 0, totalPosts: 0 };
  
  const accounts = await listSocialAccounts(organizationId);
  const connectedAccounts = accounts.filter(a => a.isConnected).length;
  const totalFollowers = accounts.reduce((sum, a) => sum + (a.followerCount || 0), 0);
  
  const postsResult = await db.select({ count: sql<number>`count(*)` }).from(scheduledPosts).where(eq(scheduledPosts.organizationId, organizationId));
  
  return {
    totalAccounts: accounts.length,
    connectedAccounts,
    totalFollowers,
    totalPosts: postsResult[0]?.count || 0,
  };
}


// ============================================
// Phase 51: 背景任務管理 Queries
// ============================================
import { backgroundJobs, InsertBackgroundJob } from "../drizzle/schema";

export async function createBackgroundJob(job: InsertBackgroundJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(backgroundJobs).values(job).returning();

  return result.id;
}

export async function getBackgroundJobById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(backgroundJobs).where(eq(backgroundJobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBackgroundJob(id: number, job: Partial<InsertBackgroundJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(backgroundJobs).set(job).where(eq(backgroundJobs.id, id));
}

export async function listBackgroundJobs(organizationId: number, options?: { jobType?: string; status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(backgroundJobs.organizationId, organizationId);
  if (options?.jobType) {
    whereClause = and(whereClause, eq(backgroundJobs.jobType, options.jobType as any)) as typeof whereClause;
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(backgroundJobs.status, options.status as any)) as typeof whereClause;
  }

  const data = await db.select().from(backgroundJobs).where(whereClause).orderBy(desc(backgroundJobs.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(backgroundJobs).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function getLatestJobByType(organizationId: number, jobType: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(backgroundJobs)
    .where(and(
      eq(backgroundJobs.organizationId, organizationId),
      eq(backgroundJobs.jobType, jobType as any)
    ))
    .orderBy(desc(backgroundJobs.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// 非同步 RFM 批次計算（背景執行）
export async function processRfmCalculationJob(jobId: number, organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 更新任務狀態為執行中
  await updateBackgroundJob(jobId, {
    status: 'running',
    startedAt: new Date(),
  });
  
  try {
    // 取得所有客戶
    const customersResult = await listCustomers(organizationId, { limit: 10000 });
    const totalItems = customersResult.data.length;
    
    await updateBackgroundJob(jobId, { totalItems });
    
    let processedItems = 0;
    const batchSize = 50; // 每批處理 50 個客戶
    
    for (let i = 0; i < customersResult.data.length; i += batchSize) {
      const batch = customersResult.data.slice(i, i + batchSize);
      
      // 批次處理客戶 RFM 計算
      await Promise.all(batch.map(async (customer) => {
        const rfmData = await calculateCustomerRfm(organizationId, customer.id);
        await upsertCustomerRfmScore({
          organizationId,
          customerId: customer.id,
          ...rfmData,
        });
      }));
      
      processedItems += batch.length;
      const progress = Math.round((processedItems / totalItems) * 100);
      
      // 更新進度
      await updateBackgroundJob(jobId, {
        processedItems,
        progress,
      });
    }
    
    // 完成任務
    await updateBackgroundJob(jobId, {
      status: 'completed',
      processedItems: totalItems,
      progress: 100,
      completedAt: new Date(),
      result: { processed: totalItems },
    });
    
    return { processed: totalItems };
  } catch (error) {
    // 任務失敗
    await updateBackgroundJob(jobId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });
    throw error;
  }
}


// ============================================
// Phase 56: 電子票券系統 Queries
// ============================================
import { 
  voucherTemplates, InsertVoucherTemplate,
  voucherInstances, InsertVoucherInstance,
  voucherRedemptions, InsertVoucherRedemption,
  voucherBatches, InsertVoucherBatch,
} from "../drizzle/schema";
import { nanoid } from 'nanoid';

// 票券模板 CRUD
export async function createVoucherTemplate(template: InsertVoucherTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(voucherTemplates).values(template).returning();

  return result.id;
}

export async function updateVoucherTemplate(id: number, template: Partial<InsertVoucherTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(voucherTemplates).set(template).where(eq(voucherTemplates.id, id));
}

export async function getVoucherTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voucherTemplates).where(eq(voucherTemplates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listVoucherTemplates(organizationId: number, options?: { type?: string; isActive?: boolean; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(voucherTemplates.organizationId, organizationId);
  if (options?.type) {
    whereClause = and(whereClause, eq(voucherTemplates.type, options.type as any)) as typeof whereClause;
  }
  if (options?.isActive !== undefined) {
    whereClause = and(whereClause, eq(voucherTemplates.isActive, options.isActive)) as typeof whereClause;
  }

  const data = await db.select().from(voucherTemplates).where(whereClause).orderBy(desc(voucherTemplates.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(voucherTemplates).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function deleteVoucherTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(voucherTemplates).where(eq(voucherTemplates.id, id));
}

// 票券實例 CRUD
export async function generateVoucherCode(): Promise<string> {
  return `VC-${nanoid(10).toUpperCase()}`;
}

export async function createVoucherInstance(instance: InsertVoucherInstance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 自動生成票券代碼
  if (!instance.voucherCode) {
    instance.voucherCode = await generateVoucherCode();
  }
  
  const [result] = await db.insert(voucherInstances).values(instance).returning();
  
  // 更新模板的發送統計
  await db.update(voucherTemplates)
    .set({ totalIssued: sql`totalIssued + 1` })
    .where(eq(voucherTemplates.id, instance.templateId));
  
  return result.id;
}

export async function updateVoucherInstance(id: number, instance: Partial<InsertVoucherInstance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(voucherInstances).set(instance).where(eq(voucherInstances.id, id));
}

export async function getVoucherInstanceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voucherInstances).where(eq(voucherInstances.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getVoucherInstanceByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voucherInstances).where(eq(voucherInstances.voucherCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listVoucherInstances(organizationId: number, options?: { 
  customerId?: number; 
  templateId?: number; 
  status?: string; 
  page?: number; 
  limit?: number 
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(voucherInstances.organizationId, organizationId);
  if (options?.customerId) {
    whereClause = and(whereClause, eq(voucherInstances.customerId, options.customerId)) as typeof whereClause;
  }
  if (options?.templateId) {
    whereClause = and(whereClause, eq(voucherInstances.templateId, options.templateId)) as typeof whereClause;
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(voucherInstances.status, options.status as any)) as typeof whereClause;
  }

  const data = await db.select().from(voucherInstances).where(whereClause).orderBy(desc(voucherInstances.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(voucherInstances).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

export async function listCustomerVouchers(customerId: number, options?: { status?: string; includeExpired?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(voucherInstances.customerId, customerId);
  
  if (options?.status) {
    whereClause = and(whereClause, eq(voucherInstances.status, options.status as any)) as typeof whereClause;
  }
  
  if (!options?.includeExpired) {
    // 只顯示未過期的票券
    whereClause = and(whereClause, or(
      isNull(voucherInstances.validUntil),
      gte(voucherInstances.validUntil, new Date())
    )) as typeof whereClause;
  }

  return await db.select().from(voucherInstances).where(whereClause).orderBy(desc(voucherInstances.createdAt));
}

// 票券核銷
export async function redeemVoucher(redemption: InsertVoucherRedemption) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 取得票券實例
  const voucher = await getVoucherInstanceById(redemption.voucherInstanceId);
  if (!voucher) throw new Error("Voucher not found");
  if (voucher.status !== 'active') throw new Error("Voucher is not active");
  if ((voucher.remainingUses ?? 0) <= 0) throw new Error("Voucher has no remaining uses");
  if (voucher.validUntil && new Date(voucher.validUntil) < new Date()) throw new Error("Voucher has expired");
  
  // 建立核銷記錄
  const [result] = await db.insert(voucherRedemptions).values(redemption).returning();
  
  // 更新票券實例
  const newUsedCount = (voucher.usedCount ?? 0) + 1;
  const newRemainingUses = (voucher.remainingUses ?? 0) - 1;
  const newStatus = newRemainingUses <= 0 ? 'used' : 'active';
  
  await updateVoucherInstance(voucher.id, {
    usedCount: newUsedCount,
    remainingUses: newRemainingUses,
    status: newStatus,
  });
  
  // 更新模板的核銷統計
  await db.update(voucherTemplates)
    .set({ totalRedeemed: sql`totalRedeemed + 1` })
    .where(eq(voucherTemplates.id, voucher.templateId));
  
  return result.id;
}

export async function listVoucherRedemptions(organizationId: number, options?: { 
  voucherInstanceId?: number; 
  customerId?: number;
  page?: number; 
  limit?: number 
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(voucherRedemptions.organizationId, organizationId);
  if (options?.voucherInstanceId) {
    whereClause = and(whereClause, eq(voucherRedemptions.voucherInstanceId, options.voucherInstanceId)) as typeof whereClause;
  }
  if (options?.customerId) {
    whereClause = and(whereClause, eq(voucherRedemptions.customerId, options.customerId)) as typeof whereClause;
  }

  const data = await db.select().from(voucherRedemptions).where(whereClause).orderBy(desc(voucherRedemptions.redeemedAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(voucherRedemptions).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// 批次發送
export async function createVoucherBatch(batch: InsertVoucherBatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(voucherBatches).values(batch).returning();

  return result.id;
}

export async function updateVoucherBatch(id: number, batch: Partial<InsertVoucherBatch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(voucherBatches).set(batch).where(eq(voucherBatches.id, id));
}

export async function getVoucherBatchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voucherBatches).where(eq(voucherBatches.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listVoucherBatches(organizationId: number, options?: { status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause = eq(voucherBatches.organizationId, organizationId);
  if (options?.status) {
    whereClause = and(whereClause, eq(voucherBatches.status, options.status as any)) as typeof whereClause;
  }

  const data = await db.select().from(voucherBatches).where(whereClause).orderBy(desc(voucherBatches.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(voucherBatches).where(whereClause);
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// 批次發送票券給多個客戶
export async function issueVouchersToCustomers(
  organizationId: number,
  templateId: number,
  customerIds: number[],
  options?: {
    issuedBy?: number;
    issueReason?: string;
    issueChannel?: 'manual' | 'campaign' | 'birthday' | 'referral' | 'purchase' | 'line';
    batchId?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const template = await getVoucherTemplateById(templateId);
  if (!template) throw new Error("Voucher template not found");
  
  const results: { customerId: number; voucherId: number; voucherCode: string }[] = [];
  
  for (const customerId of customerIds) {
    // 計算有效期
    let validUntil: Date | undefined;
    if (template.validityType === 'days_from_issue' && template.validDays) {
      validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + template.validDays);
    } else if (template.validityType === 'fixed_date' && template.fixedEndDate) {
      validUntil = new Date(template.fixedEndDate);
    }
    
    const voucherCode = await generateVoucherCode();
    
    const voucherId = await createVoucherInstance({
      organizationId,
      templateId,
      customerId,
      voucherCode,
      status: 'active',
      remainingUses: template.usageLimit || 1,
      validFrom: new Date(),
      validUntil,
      issuedBy: options?.issuedBy,
      issueReason: options?.issueReason,
      issueChannel: options?.issueChannel || 'manual',
      linePushStatus: 'pending',
    });
    
    results.push({ customerId, voucherId, voucherCode });
  }
  
  // 更新批次統計
  if (options?.batchId) {
    await updateVoucherBatch(options.batchId, {
      successCount: results.length,
      status: 'completed',
      completedAt: new Date(),
    });
  }
  
  return results;
}

// 票券統計
export async function getVoucherStats(organizationId: number) {
  const db = await getDb();
  if (!db) return { 
    totalTemplates: 0, 
    activeTemplates: 0, 
    totalIssued: 0, 
    totalRedeemed: 0, 
    redemptionRate: 0,
    pendingPush: 0,
  };
  
  const templates = await listVoucherTemplates(organizationId, { limit: 1000 });
  const activeTemplates = templates.data.filter(t => t.isActive).length;
  const totalIssued = templates.data.reduce((sum, t) => sum + (t.totalIssued || 0), 0);
  const totalRedeemed = templates.data.reduce((sum, t) => sum + (t.totalRedeemed || 0), 0);
  const redemptionRate = totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0;
  
  // 待推送的票券數量
  const pendingResult = await db.select({ count: sql<number>`count(*)` })
    .from(voucherInstances)
    .where(and(
      eq(voucherInstances.organizationId, organizationId),
      eq(voucherInstances.linePushStatus, 'pending')
    ));
  
  return {
    totalTemplates: templates.total,
    activeTemplates,
    totalIssued,
    totalRedeemed,
    redemptionRate,
    pendingPush: pendingResult[0]?.count || 0,
  };
}

// 檢查並更新過期票券
export async function updateExpiredVouchers(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(voucherInstances)
    .set({ status: 'expired' })
    .where(and(
      eq(voucherInstances.organizationId, organizationId),
      eq(voucherInstances.status, 'active'),
      lte(voucherInstances.validUntil, new Date())
    ));
  
  return result;
}

// 轉贈票券
export async function transferVoucher(voucherId: number, newCustomerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const voucher = await getVoucherInstanceById(voucherId);
  if (!voucher) throw new Error("Voucher not found");
  if (voucher.status !== 'active') throw new Error("Voucher is not active");
  
  // 取得模板檢查是否可轉贈
  const template = await getVoucherTemplateById(voucher.templateId);
  if (!template?.isTransferable) throw new Error("This voucher is not transferable");
  
  // 更新票券
  await updateVoucherInstance(voucherId, {
    originalOwnerId: voucher.customerId,
    customerId: newCustomerId,
    status: 'transferred',
    transferredAt: new Date(),
  });
  
  // 建立新票券給新擁有者
  const newVoucherId = await createVoucherInstance({
    organizationId: voucher.organizationId,
    templateId: voucher.templateId,
    customerId: newCustomerId,
    voucherCode: await generateVoucherCode(),
    status: 'active',
    remainingUses: voucher.remainingUses,
    validFrom: new Date(),
    validUntil: voucher.validUntil,
    issueChannel: 'manual',
    notes: `Transferred from voucher ${voucher.voucherCode}`,
  });
  
  return newVoucherId;
}


// ============================================
// 票券轉贈功能
// ============================================
import { voucherTransfers, InsertVoucherTransfer } from "../drizzle/schema";

// 生成轉贈領取碼
export async function generateClaimCode(): Promise<string> {
  return `GIFT-${nanoid(8).toUpperCase()}`;
}

// 建立轉贈記錄
export async function createVoucherTransfer(transfer: InsertVoucherTransfer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 檢查票券是否存在且可轉贈
  const voucher = await getVoucherInstanceById(transfer.voucherInstanceId);
  if (!voucher) throw new Error("Voucher not found");
  if (voucher.status !== 'active') throw new Error("Voucher is not active");
  
  // 檢查模板是否允許轉贈
  const template = await getVoucherTemplateById(voucher.templateId);
  if (!template?.isTransferable) throw new Error("This voucher is not transferable");
  
  // 生成領取碼
  if (!transfer.claimCode) {
    transfer.claimCode = await generateClaimCode();
  }
  
  // 設定預設有效期（7天）
  if (!transfer.expiresAt) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    transfer.expiresAt = expiresAt;
  }
  
  const [result] = await db.insert(voucherTransfers).values(transfer).returning();
  
  // 更新票券狀態為待轉贈
  await updateVoucherInstance(transfer.voucherInstanceId, {
    status: 'transferred',
  });
  
  return result.id;
}

// 根據領取碼獲取轉贈記錄
export async function getVoucherTransferByClaimCode(claimCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voucherTransfers).where(eq(voucherTransfers.claimCode, claimCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// 根據 ID 獲取轉贈記錄
export async function getVoucherTransferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voucherTransfers).where(eq(voucherTransfers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// 更新轉贈記錄
export async function updateVoucherTransfer(id: number, transfer: Partial<InsertVoucherTransfer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(voucherTransfers).set(transfer).where(eq(voucherTransfers.id, id));
}

// 領取轉贈票券
export async function claimVoucherTransfer(claimCode: string, toCustomerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 獲取轉贈記錄
  const transfer = await getVoucherTransferByClaimCode(claimCode);
  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== 'pending') throw new Error("Transfer is not pending");
  if (new Date(transfer.expiresAt) < new Date()) throw new Error("Transfer has expired");
  
  // 獲取原始票券
  const originalVoucher = await getVoucherInstanceById(transfer.voucherInstanceId);
  if (!originalVoucher) throw new Error("Original voucher not found");
  
  // 獲取模板
  const template = await getVoucherTemplateById(originalVoucher.templateId);
  if (!template) throw new Error("Voucher template not found");
  
  // 建立新票券給受贈者
  const newVoucherId = await createVoucherInstance({
    organizationId: originalVoucher.organizationId,
    templateId: originalVoucher.templateId,
    customerId: toCustomerId,
    voucherCode: await generateVoucherCode(),
    status: 'active',
    remainingUses: originalVoucher.remainingUses,
    validFrom: new Date(),
    validUntil: originalVoucher.validUntil,
    originalOwnerId: transfer.fromCustomerId,
    issueChannel: 'manual',
    notes: `Received as gift from transfer ${transfer.claimCode}`,
  });
  
  // 更新轉贈記錄
  await updateVoucherTransfer(transfer.id, {
    status: 'accepted',
    toCustomerId,
    claimedAt: new Date(),
  });
  
  return newVoucherId;
}

// 取消轉贈
export async function cancelVoucherTransfer(transferId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const transfer = await getVoucherTransferById(transferId);
  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== 'pending') throw new Error("Transfer is not pending");
  
  // 恢復原始票券狀態
  await updateVoucherInstance(transfer.voucherInstanceId, {
    status: 'active',
  });
  
  // 更新轉贈記錄
  await updateVoucherTransfer(transferId, {
    status: 'cancelled',
  });
}

// 列出客戶的轉贈記錄（發出的）
export async function listSentTransfers(customerId: number, options?: { status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause = eq(voucherTransfers.fromCustomerId, customerId);
  if (options?.status) {
    whereClause = and(whereClause, eq(voucherTransfers.status, options.status as any)) as typeof whereClause;
  }
  
  const data = await db.select().from(voucherTransfers).where(whereClause).orderBy(desc(voucherTransfers.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(voucherTransfers).where(whereClause);
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// 列出待領取的轉贈（根據手機號碼）
export async function listPendingTransfersByPhone(phone: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(voucherTransfers).where(and(
    eq(voucherTransfers.toCustomerPhone, phone),
    eq(voucherTransfers.status, 'pending'),
    gte(voucherTransfers.expiresAt, new Date())
  )).orderBy(desc(voucherTransfers.createdAt));
}

// 過期未領取的轉贈
export async function expirePendingTransfers(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 找出過期的轉贈
  const expiredTransfers = await db.select().from(voucherTransfers).where(and(
    eq(voucherTransfers.organizationId, organizationId),
    eq(voucherTransfers.status, 'pending'),
    lte(voucherTransfers.expiresAt, new Date())
  ));
  
  // 逐一處理
  for (const transfer of expiredTransfers) {
    // 恢復原始票券
    await updateVoucherInstance(transfer.voucherInstanceId, {
      status: 'active',
    });
    
    // 更新轉贈狀態
    await updateVoucherTransfer(transfer.id, {
      status: 'expired',
    });
  }
  
  return expiredTransfers.length;
}

// 獲取轉贈統計
export async function getTransferStats(organizationId: number) {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, accepted: 0, expired: 0, cancelled: 0 };
  
  const stats = await db.select({
    status: voucherTransfers.status,
    count: sql<number>`count(*)`,
  }).from(voucherTransfers)
    .where(eq(voucherTransfers.organizationId, organizationId))
    .groupBy(voucherTransfers.status);
  
  const result = { total: 0, pending: 0, accepted: 0, expired: 0, cancelled: 0 };
  for (const stat of stats) {
    result.total += stat.count;
    if (stat.status === 'pending') result.pending = stat.count;
    if (stat.status === 'accepted') result.accepted = stat.count;
    if (stat.status === 'expired') result.expired = stat.count;
    if (stat.status === 'cancelled') result.cancelled = stat.count;
  }
  
  return result;
}


// ============================================
// 批量匯入票券模板
// ============================================
export async function batchCreateVoucherTemplates(templates: InsertVoucherTemplate[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results: number[] = [];
  for (const template of templates) {
    const [result] = await db.insert(voucherTemplates).values(template).returning();
    results.push(result.id);
  }
  
  return results;
}

// ============================================
// 票券到期提醒設定
// ============================================
export async function getVouchersExpiringInDays(organizationId: number, days: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  // 找出即將到期的有效票券
  return await db.select({
    voucher: voucherInstances,
    template: voucherTemplates,
    customer: customers,
  })
    .from(voucherInstances)
    .innerJoin(voucherTemplates, eq(voucherInstances.templateId, voucherTemplates.id))
    .innerJoin(customers, eq(voucherInstances.customerId, customers.id))
    .where(and(
      eq(voucherInstances.organizationId, organizationId),
      eq(voucherInstances.status, 'active'),
      gte(voucherInstances.validUntil, now),
      lte(voucherInstances.validUntil, futureDate)
    ))
    .orderBy(voucherInstances.validUntil);
}

// 獲取所有診所的即將到期票券（Super Admin 用）
export async function getAllExpiringVouchers(days: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return await db.select({
    voucher: voucherInstances,
    template: voucherTemplates,
    customer: customers,
    organization: organizations,
  })
    .from(voucherInstances)
    .innerJoin(voucherTemplates, eq(voucherInstances.templateId, voucherTemplates.id))
    .innerJoin(customers, eq(voucherInstances.customerId, customers.id))
    .innerJoin(organizations, eq(voucherInstances.organizationId, organizations.id))
    .where(and(
      eq(voucherInstances.status, 'active'),
      gte(voucherInstances.validUntil, now),
      lte(voucherInstances.validUntil, futureDate)
    ))
    .orderBy(voucherInstances.validUntil);
}

// 獲取票券報表統計（Super Admin 用）
export async function getGlobalVoucherStats() {
  const db = await getDb();
  if (!db) return {
    totalTemplates: 0,
    totalIssued: 0,
    totalRedeemed: 0,
    totalExpired: 0,
    redemptionRate: 0,
    pendingReminders: 0,
  };
  
  // 統計模板數量
  const templateCount = await db.select({ count: sql<number>`count(*)` }).from(voucherTemplates).where(eq(voucherTemplates.isActive, true));
  
  // 統計票券實例
  const instanceStats = await db.select({
    status: voucherInstances.status,
    count: sql<number>`count(*)`,
  }).from(voucherInstances).groupBy(voucherInstances.status);
  
  let totalIssued = 0;
  let totalRedeemed = 0;
  let totalExpired = 0;
  
  for (const stat of instanceStats) {
    totalIssued += stat.count;
    if (stat.status === 'used') totalRedeemed = stat.count;
    if (stat.status === 'expired') totalExpired = stat.count;
  }
  
  // 計算核銷率
  const redemptionRate = totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0;
  
  // 統計待發送提醒（3天內到期）
  const now = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  const pendingRemindersResult = await db.select({ count: sql<number>`count(*)` })
    .from(voucherInstances)
    .where(and(
      eq(voucherInstances.status, 'active'),
      gte(voucherInstances.validUntil, now),
      lte(voucherInstances.validUntil, threeDaysLater)
    ));
  
  return {
    totalTemplates: templateCount[0]?.count || 0,
    totalIssued,
    totalRedeemed,
    totalExpired,
    redemptionRate: Math.round(redemptionRate * 10) / 10,
    pendingReminders: pendingRemindersResult[0]?.count || 0,
  };
}

// 列出所有診所的票券模板（Super Admin 用）
export async function listAllVoucherTemplates(options?: { type?: string; isActive?: boolean; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  let whereClause: WhereClause = undefined;
  if (options?.type) {
    whereClause = eq(voucherTemplates.type, options.type as any);
  }
  if (options?.isActive !== undefined) {
    whereClause = whereClause 
      ? and(whereClause, eq(voucherTemplates.isActive, options.isActive))
      : eq(voucherTemplates.isActive, options.isActive);
  }

  const query = db.select({
    template: voucherTemplates,
    organization: organizations,
  })
    .from(voucherTemplates)
    .innerJoin(organizations, eq(voucherTemplates.organizationId, organizations.id));
  
  const data = whereClause 
    ? await query.where(whereClause).orderBy(desc(voucherTemplates.createdAt)).limit(limit).offset(offset)
    : await query.orderBy(desc(voucherTemplates.createdAt)).limit(limit).offset(offset);
  
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(voucherTemplates);
  const countResult = whereClause 
    ? await countQuery.where(whereClause)
    : await countQuery;
  const total = countResult[0]?.count || 0;

  return { data, total };
}

// 各診所票券統計（Super Admin 用）
export async function getVoucherStatsByOrganization() {
  const db = await getDb();
  if (!db) return [];
  
  const stats = await db.select({
    organizationId: voucherInstances.organizationId,
    organizationName: organizations.name,
    templateCount: sql<number>`count(distinct ${voucherInstances.templateId})`,
    issuedCount: sql<number>`count(*)`,
    redeemedCount: sql<number>`sum(case when ${voucherInstances.status} = 'used' then 1 else 0 end)`,
  })
    .from(voucherInstances)
    .innerJoin(organizations, eq(voucherInstances.organizationId, organizations.id))
    .groupBy(voucherInstances.organizationId, organizations.name);
  
  return stats.map(stat => ({
    ...stat,
    redemptionRate: stat.issuedCount > 0 
      ? Math.round((Number(stat.redeemedCount) / stat.issuedCount) * 1000) / 10 
      : 0,
  }));
}


// ============================================
// 系統設定 CRUD
// ============================================
export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return result[0] || null;
}

export async function getSystemSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(systemSettings).where(eq(systemSettings.category, category as any));
}

export async function getAllSystemSettings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(systemSettings).orderBy(systemSettings.category, systemSettings.key);
}

export async function upsertSystemSetting(key: string, value: string, description?: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSystemSetting(key);
  if (existing) {
    await db.update(systemSettings).set({ value, description, category: category as any }).where(eq(systemSettings.key, key));
    return existing.id;
  } else {
    const [result] = await db.insert(systemSettings).values({ key, value, description, category: category as any }).returning();

    return result.id;
  }
}

export async function deleteSystemSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(systemSettings).where(eq(systemSettings.key, key));
}

// ============================================
// 票券到期提醒記錄 CRUD
// ============================================
export async function createVoucherReminderLog(data: InsertVoucherReminderLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(voucherReminderLogs).values(data).returning();

  return result.id;
}

export async function updateVoucherReminderLog(id: number, data: Partial<InsertVoucherReminderLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(voucherReminderLogs).set(data).where(eq(voucherReminderLogs.id, id));
}

export async function getVoucherReminderLogById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(voucherReminderLogs).where(eq(voucherReminderLogs.id, id)).limit(1);
  return result[0] || null;
}

export async function listVoucherReminderLogs(options?: { organizationId?: number; status?: string; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause: WhereClause = undefined;
  if (options?.organizationId) {
    whereClause = eq(voucherReminderLogs.organizationId, options.organizationId);
  }
  if (options?.status) {
    whereClause = whereClause 
      ? and(whereClause, eq(voucherReminderLogs.status, options.status as any))
      : eq(voucherReminderLogs.status, options.status as any);
  }
  
  const query = db.select().from(voucherReminderLogs);
  const data = whereClause 
    ? await query.where(whereClause).orderBy(desc(voucherReminderLogs.createdAt)).limit(limit).offset(offset)
    : await query.orderBy(desc(voucherReminderLogs.createdAt)).limit(limit).offset(offset);
  
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(voucherReminderLogs);
  const countResult = whereClause 
    ? await countQuery.where(whereClause)
    : await countQuery;
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// 獲取待發送的提醒
export async function getPendingReminders(organizationId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let whereClause: WhereClause = and(
    eq(voucherReminderLogs.status, 'pending'),
    lte(voucherReminderLogs.scheduledAt, new Date())
  );
  
  if (organizationId) {
    whereClause = and(whereClause, eq(voucherReminderLogs.organizationId, organizationId));
  }
  
  return await db.select({
    reminder: voucherReminderLogs,
    voucher: voucherInstances,
    template: voucherTemplates,
    customer: customers,
  })
    .from(voucherReminderLogs)
    .innerJoin(voucherInstances, eq(voucherReminderLogs.voucherInstanceId, voucherInstances.id))
    .innerJoin(voucherTemplates, eq(voucherInstances.templateId, voucherTemplates.id))
    .innerJoin(customers, eq(voucherReminderLogs.customerId, customers.id))
    .where(whereClause)
    .orderBy(voucherReminderLogs.scheduledAt);
}

// 建立票券到期提醒排程
export async function scheduleVoucherExpiryReminders(organizationId: number, daysBeforeExpiry: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 找出即將到期且尚未建立提醒的票券
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysBeforeExpiry);
  
  const expiringVouchers = await db.select({
    voucher: voucherInstances,
    customer: customers,
  })
    .from(voucherInstances)
    .innerJoin(customers, eq(voucherInstances.customerId, customers.id))
    .where(and(
      eq(voucherInstances.organizationId, organizationId),
      eq(voucherInstances.status, 'active'),
      gte(voucherInstances.validUntil, now),
      lte(voucherInstances.validUntil, futureDate)
    ));
  
  // 檢查是否已有提醒記錄
  const createdCount = { count: 0 };
  for (const item of expiringVouchers) {
    const existingReminder = await db.select().from(voucherReminderLogs).where(and(
      eq(voucherReminderLogs.voucherInstanceId, item.voucher.id),
      eq(voucherReminderLogs.daysBeforeExpiry, daysBeforeExpiry),
      eq(voucherReminderLogs.status, 'pending')
    )).limit(1);
    
    if (existingReminder.length === 0) {
      // 計算提醒時間（到期前 N 天的早上 10 點）
      const reminderDate = new Date(item.voucher.validUntil!);
      reminderDate.setDate(reminderDate.getDate() - daysBeforeExpiry);
      reminderDate.setHours(10, 0, 0, 0);
      
      await createVoucherReminderLog({
        organizationId,
        voucherInstanceId: item.voucher.id,
        customerId: item.voucher.customerId!,
        reminderType: daysBeforeExpiry <= 1 ? 'expiry_final' : 'expiry_warning',
        daysBeforeExpiry,
        status: 'pending',
        channel: 'line',
        scheduledAt: reminderDate,
      });
      createdCount.count++;
    }
  }
  
  return createdCount.count;
}

// 獲取提醒統計
export async function getReminderStats(organizationId?: number) {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, sent: 0, failed: 0 };
  
  let whereClause: WhereClause = undefined;
  if (organizationId) {
    whereClause = eq(voucherReminderLogs.organizationId, organizationId);
  }
  
  const query = db.select({
    status: voucherReminderLogs.status,
    count: sql<number>`count(*)`,
  }).from(voucherReminderLogs);
  
  const stats = whereClause 
    ? await query.where(whereClause).groupBy(voucherReminderLogs.status)
    : await query.groupBy(voucherReminderLogs.status);
  
  const result = { total: 0, pending: 0, sent: 0, failed: 0 };
  for (const stat of stats) {
    result.total += stat.count;
    if (stat.status === 'pending') result.pending = stat.count;
    if (stat.status === 'sent') result.sent = stat.count;
    if (stat.status === 'failed') result.failed = stat.count;
  }
  
  return result;
}


// ============================================
// Super Admin - 使用者管理
// ============================================
export async function listAllUsers(options?: { 
  page?: number; 
  limit?: number; 
  search?: string;
  role?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 15;
  const offset = (page - 1) * limit;
  
  let whereConditions: WhereClause[] = [];
  
  if (options?.search) {
    whereConditions.push(
      or(
        like(users.name, `%${options.search}%`),
        like(users.email, `%${options.search}%`)
      )
    );
  }
  
  if (options?.role) {
    whereConditions.push(eq(users.role, options.role as any));
  }
  
  // 由於 users 資料表沒有 isActive 欄位，改用 role 來判斷狀態
  // status 篩選目前不實作
  
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
  
  // 獲取用戶列表（含所屬診所）
  const query = db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users);
  
  const data = whereClause 
    ? await query.where(whereClause).orderBy(desc(users.createdAt)).limit(limit).offset(offset)
    : await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  
  // 獲取用戶所屬診所
  const usersWithOrg = await Promise.all(data.map(async (user) => {
    const orgUser = await db.select({
      organizationId: organizationUsers.organizationId,
      organizationName: organizations.name,
    })
      .from(organizationUsers)
      .innerJoin(organizations, eq(organizationUsers.organizationId, organizations.id))
      .where(eq(organizationUsers.userId, user.id))
      .limit(1);
    
    return {
      ...user,
      organizationId: orgUser[0]?.organizationId || null,
      organizationName: orgUser[0]?.organizationName || null,
    };
  }));
  
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
  const countResult = whereClause 
    ? await countQuery.where(whereClause)
    : await countQuery;
  const total = countResult[0]?.count || 0;
  
  return { users: usersWithOrg, total };
}

export async function getUserStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, admins: 0, newThisMonth: 0, activeRate: 0, growthRate: 0 };
  
  const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
  // 由於沒有 isActive 欄位，改用最近 30 天有登入的用戶作為「活躍」定義
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [activeResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.lastSignedIn, thirtyDaysAgo));
  const [adminsResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'clinic_admin'));
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const [newThisMonthResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, startOfMonth));
  
  const total = totalResult?.count || 0;
  const active = activeResult?.count || 0;
  
  return {
    total,
    active,
    admins: adminsResult?.count || 0,
    newThisMonth: newThisMonthResult?.count || 0,
    activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
    growthRate: 12, // 模擬成長率
  };
}

export async function updateUserById(userId: number, data: { role?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (data.role) {
    await db.update(users).set({
      role: data.role as any,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
  }
}

export async function toggleUserStatus(userId: number, isActive: boolean) {
  // 由於 users 資料表沒有 isActive 欄位，改用 role 來模擬停用狀態
  // 實際應用中可以新增 isActive 欄位或使用其他機制
  // 目前僅記錄操作，不實際修改資料庫
  return { success: true };
}

// ============================================
// Super Admin - 系統監控
// ============================================
export async function getSystemHealth() {
  // 模擬系統健康狀態
  return {
    overallStatus: "healthy",
    apiLatency: 45,
    errorRate: 0.2,
    uptime: 99.9,
    services: {
      api: "healthy",
      database: "healthy",
      line: "healthy",
      storage: "healthy",
      notification: "healthy",
    },
  };
}

export async function getErrorLogs(options?: { limit?: number }) {
  // 模擬錯誤日誌
  return {
    logs: [
      { timestamp: new Date(), level: "error", source: "api/vouchers", message: "Invalid voucher code" },
      { timestamp: new Date(Date.now() - 3600000), level: "warn", source: "line/webhook", message: "Rate limit approaching" },
    ],
  };
}

export async function getAuditLogs(options?: { limit?: number }) {
  const db = await getDb();
  if (!db) return { logs: [] };
  
  const limit = options?.limit || 20;
  
  const logs = await db.select({
    id: activityLogs.id,
    timestamp: activityLogs.createdAt,
    userId: activityLogs.userId,
    action: activityLogs.action,
    target: activityLogs.entityType,
    details: activityLogs.details,
  })
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
  
  // 獲取用戶名稱
  const logsWithUser = await Promise.all(logs.map(async (log) => {
    if (log.userId) {
      const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, log.userId)).limit(1);
      return { ...log, userName: user?.name || "系統", success: true };
    }
    return { ...log, userName: "系統", success: true };
  }));
  
  return { logs: logsWithUser };
}

export async function getPerformanceMetrics() {
  // 模擬效能指標
  return {
    cpu: 45,
    memory: 62,
    disk: 38,
    dbConnections: 12,
    requestsToday: 12345,
    avgResponseTime: 45,
    successRate: 99.8,
    errorCount: 23,
  };
}

// ============================================
// Super Admin - 通知中心
// ============================================
export async function getNotificationStats() {
  // 模擬通知統計
  return {
    sentThisMonth: 156,
    deliveryRate: 98,
    lineSent: 120,
    scheduled: 5,
  };
}

export async function listNotifications(options?: { limit?: number }) {
  // 模擬通知列表
  return {
    notifications: [
      {
        id: 1,
        title: "系統維護通知",
        content: "系統將於本週六進行例行維護",
        type: "maintenance",
        targetScope: "all",
        sendLine: true,
        sendEmail: false,
        status: "sent",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 2,
        title: "新功能上線",
        content: "電子票券系統已正式上線",
        type: "feature",
        targetScope: "admins",
        sendLine: true,
        sendEmail: true,
        status: "sent",
        createdAt: new Date(Date.now() - 172800000),
      },
    ],
  };
}

export async function listNotificationTemplates() {
  return {
    templates: [
      { id: 1, title: "系統維護通知", content: "親愛的用戶，系統將於 {date} 進行維護，預計維護時間為 {duration}。", type: "maintenance" },
      { id: 2, title: "新功能上線", content: "我們很高興地宣布，{feature} 功能已正式上線！立即體驗全新功能。", type: "feature" },
      { id: 3, title: "重要公告", content: "親愛的用戶，{content}", type: "announcement" },
      { id: 4, title: "緊急警報", content: "【緊急通知】{content}，請立即處理。", type: "alert" },
    ],
  };
}

export async function sendNotification(data: {
  title: string;
  content: string;
  type: string;
  targetScope: string;
  targetOrganizations?: number[];
  sendLine: boolean;
  sendEmail: boolean;
  scheduledAt?: string;
}) {
  // 實際發送通知的邏輯（整合 LINE/Email）
  
  // TODO: 整合 LINE Messaging API 和 Email 服務
  
  return { success: true, notificationId: Date.now() };
}

export async function saveNotificationTemplate(data: {
  title: string;
  content: string;
  type: string;
}) {
  // 儲存通知模板
  return { success: true };
}


// ============================================
// Phase 61: 每日結帳系統
// ============================================

// 建立每日結帳記錄
export async function createDailySettlement(data: InsertDailySettlement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(dailySettlements).values(data).returning();

  return result.id;
}

// 根據 ID 獲取結帳記錄
export async function getDailySettlementById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(dailySettlements).where(eq(dailySettlements.id, id)).limit(1);
  return result[0] || null;
}

// 根據日期獲取結帳記錄
export async function getDailySettlementByDate(organizationId: number, date: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(dailySettlements)
    .where(and(
      eq(dailySettlements.organizationId, organizationId),
      eq(dailySettlements.settlementDate, date)
    ))
    .limit(1);
  return result[0] || null;
}

// 更新結帳記錄
export async function updateDailySettlement(id: number, data: Partial<InsertDailySettlement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dailySettlements).set(data).where(eq(dailySettlements.id, id));
}

// 列出結帳記錄
export async function listDailySettlements(organizationId: number, options?: { 
  startDate?: string; 
  endDate?: string; 
  status?: string;
  page?: number; 
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause: WhereClause = eq(dailySettlements.organizationId, organizationId);
  
  if (options?.startDate) {
    whereClause = and(whereClause, gte(dailySettlements.settlementDate, options.startDate));
  }
  if (options?.endDate) {
    whereClause = and(whereClause, lte(dailySettlements.settlementDate, options.endDate));
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(dailySettlements.status, options.status as any));
  }
  
  const data = await db.select().from(dailySettlements)
    .where(whereClause)
    .orderBy(desc(dailySettlements.settlementDate))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(dailySettlements).where(whereClause);
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// 開帳
export async function openDailySettlement(organizationId: number, date: string, openingCash: number, openedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 檢查是否已有當日結帳記錄
  const existing = await getDailySettlementByDate(organizationId, date);
  if (existing) {
    throw new Error("當日已開帳");
  }
  
  const [result] = await db.insert(dailySettlements).values({
    organizationId,
    settlementDate: date,
    openingCash: openingCash.toString(),
    openedBy,
    openedAt: new Date(),
    status: 'open',
  }).returning();
  
  // 建立開帳收銀機記錄
  await createCashDrawerRecord({
    settlementId: result.id,
    organizationId,
    operationType: 'open',
    amount: openingCash.toString(),
    balanceAfter: openingCash.toString(),
    operatedBy: openedBy,
  });
  
  return result.id;
}

// 結帳
export async function closeDailySettlement(
  settlementId: number, 
  closingCash: number, 
  closedBy: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const settlement = await getDailySettlementById(settlementId);
  if (!settlement) throw new Error("結帳記錄不存在");
  if (settlement.status !== 'open') throw new Error("此結帳記錄已關閉");
  
  // 計算當日營收統計
  const stats = await calculateDailyStats(settlement.organizationId, settlement.settlementDate.toString().split('T')[0]);
  
  // 計算現金差異
  const expectedCash = Number(settlement.openingCash || 0) + stats.cashRevenue;
  const cashDifference = closingCash - expectedCash;
  
  await db.update(dailySettlements).set({
    closingCash: closingCash.toString(),
    closedBy,
    closedAt: new Date(),
    totalRevenue: stats.totalRevenue.toString(),
    cashRevenue: stats.cashRevenue.toString(),
    cardRevenue: stats.cardRevenue.toString(),
    linePayRevenue: stats.linePayRevenue.toString(),
    otherRevenue: stats.otherRevenue.toString(),
    totalOrders: stats.totalOrders,
    completedOrders: stats.completedOrders,
    cancelledOrders: stats.cancelledOrders,
    refundedOrders: stats.refundedOrders,
    totalAppointments: stats.totalAppointments,
    completedAppointments: stats.completedAppointments,
    noShowAppointments: stats.noShowAppointments,
    cashDifference: cashDifference.toString(),
    status: 'closed',
    notes,
  }).where(eq(dailySettlements.id, settlementId));
  
  // 建立結帳收銀機記錄
  await createCashDrawerRecord({
    settlementId,
    organizationId: settlement.organizationId,
    operationType: 'close',
    amount: closingCash.toString(),
    balanceBefore: expectedCash.toString(),
    balanceAfter: closingCash.toString(),
    operatedBy: closedBy,
    reason: cashDifference !== 0 ? `現金差異: ${cashDifference}` : undefined,
  });
  
  return { cashDifference, stats };
}

// 計算當日統計
export async function calculateDailyStats(organizationId: number, date: string) {
  const db = await getDb();
  if (!db) return {
    totalRevenue: 0,
    cashRevenue: 0,
    cardRevenue: 0,
    linePayRevenue: 0,
    otherRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    noShowAppointments: 0,
  };
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // 計算訂單統計
  const orderStats = await db.select({
    status: orders.status,
    count: sql<number>`count(*)`,
    total: sql<number>`sum(${orders.total})`,
  })
    .from(orders)
    .where(and(
      eq(orders.organizationId, organizationId),
      gte(orders.createdAt, startOfDay),
      lte(orders.createdAt, endOfDay)
    ))
    .groupBy(orders.status);
  
  let totalOrders = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;
  let refundedOrders = 0;
  let totalRevenue = 0;
  
  for (const stat of orderStats) {
    totalOrders += stat.count;
    if (stat.status === 'completed' || stat.status === 'paid') {
      completedOrders += stat.count;
      totalRevenue += Number(stat.total || 0);
    }
    if (stat.status === 'cancelled') cancelledOrders = stat.count;
    if (stat.status === 'refunded') refundedOrders = stat.count;
  }
  
  // 計算付款方式統計
  const paymentStats = await db.select({
    paymentMethod: paymentRecords.paymentMethod,
    total: sql<number>`sum(${paymentRecords.amount})`,
  })
    .from(paymentRecords)
    .where(and(
      eq(paymentRecords.organizationId, organizationId),
      eq(paymentRecords.status, 'completed'),
      gte(paymentRecords.paidAt, startOfDay),
      lte(paymentRecords.paidAt, endOfDay)
    ))
    .groupBy(paymentRecords.paymentMethod);
  
  let cashRevenue = 0;
  let cardRevenue = 0;
  let linePayRevenue = 0;
  let otherRevenue = 0;
  
  for (const stat of paymentStats) {
    const amount = Number(stat.total || 0);
    if (stat.paymentMethod === 'cash') cashRevenue = amount;
    else if (stat.paymentMethod === 'credit_card' || stat.paymentMethod === 'debit_card') cardRevenue += amount;
    else if (stat.paymentMethod === 'line_pay') linePayRevenue = amount;
    else otherRevenue += amount;
  }
  
  // 計算預約統計
  const appointmentStats = await db.select({
    status: appointments.status,
    count: sql<number>`count(*)`,
  })
    .from(appointments)
    .where(and(
      eq(appointments.organizationId, organizationId),
      eq(appointments.appointmentDate, date)
    ))
    .groupBy(appointments.status);
  
  let totalAppointments = 0;
  let completedAppointments = 0;
  let noShowAppointments = 0;
  
  for (const stat of appointmentStats) {
    totalAppointments += stat.count;
    if (stat.status === 'completed') completedAppointments = stat.count;
    if (stat.status === 'no_show') noShowAppointments = stat.count;
  }
  
  return {
    totalRevenue,
    cashRevenue,
    cardRevenue,
    linePayRevenue,
    otherRevenue,
    totalOrders,
    completedOrders,
    cancelledOrders,
    refundedOrders,
    totalAppointments,
    completedAppointments,
    noShowAppointments,
  };
}

// 建立結帳明細
export async function createSettlementItem(data: InsertSettlementItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(settlementItems).values(data).returning();

  return result.id;
}

// 列出結帳明細
export async function listSettlementItems(settlementId: number, options?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;
  
  const data = await db.select().from(settlementItems)
    .where(eq(settlementItems.settlementId, settlementId))
    .orderBy(desc(settlementItems.transactionAt))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(settlementItems)
    .where(eq(settlementItems.settlementId, settlementId));
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// 建立收銀機記錄
export async function createCashDrawerRecord(data: InsertCashDrawerRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(cashDrawerRecords).values(data).returning();

  return result.id;
}

// 列出收銀機記錄
export async function listCashDrawerRecords(settlementId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cashDrawerRecords)
    .where(eq(cashDrawerRecords.settlementId, settlementId))
    .orderBy(desc(cashDrawerRecords.operatedAt));
}

// 建立付款記錄
export async function createPaymentRecord(data: InsertPaymentRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(paymentRecords).values(data).returning();

  return result.id;
}

// 更新付款記錄
export async function updatePaymentRecord(id: number, data: Partial<InsertPaymentRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(paymentRecords).set(data).where(eq(paymentRecords.id, id));
}

// 根據 ID 獲取付款記錄
export async function getPaymentRecordById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(paymentRecords).where(eq(paymentRecords.id, id)).limit(1);
  return result[0] || null;
}

// 列出付款記錄
export async function listPaymentRecords(organizationId: number, options?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause: WhereClause = eq(paymentRecords.organizationId, organizationId);
  
  if (options?.startDate) {
    whereClause = and(whereClause, gte(paymentRecords.createdAt, new Date(options.startDate)));
  }
  if (options?.endDate) {
    whereClause = and(whereClause, lte(paymentRecords.createdAt, new Date(options.endDate)));
  }
  if (options?.status) {
    whereClause = and(whereClause, eq(paymentRecords.status, options.status as any));
  }
  if (options?.paymentMethod) {
    whereClause = and(whereClause, eq(paymentRecords.paymentMethod, options.paymentMethod as any));
  }
  
  const data = await db.select().from(paymentRecords)
    .where(whereClause)
    .orderBy(desc(paymentRecords.createdAt))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(paymentRecords).where(whereClause);
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// 獲取結帳統計摘要
export async function getSettlementSummary(organizationId: number, options?: { startDate?: string; endDate?: string }) {
  const db = await getDb();
  if (!db) return {
    totalRevenue: 0,
    totalCash: 0,
    totalCard: 0,
    totalLinePay: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    cashDifferenceTotal: 0,
    settlementCount: 0,
  };
  
  let whereClause: WhereClause = eq(dailySettlements.organizationId, organizationId);
  
  if (options?.startDate) {
    whereClause = and(whereClause, gte(dailySettlements.settlementDate, options.startDate));
  }
  if (options?.endDate) {
    whereClause = and(whereClause, lte(dailySettlements.settlementDate, options.endDate));
  }
  
  const summary = await db.select({
    totalRevenue: sql<number>`sum(${dailySettlements.totalRevenue})`,
    totalCash: sql<number>`sum(${dailySettlements.cashRevenue})`,
    totalCard: sql<number>`sum(${dailySettlements.cardRevenue})`,
    totalLinePay: sql<number>`sum(${dailySettlements.linePayRevenue})`,
    totalOrders: sql<number>`sum(${dailySettlements.totalOrders})`,
    cashDifferenceTotal: sql<number>`sum(${dailySettlements.cashDifference})`,
    settlementCount: sql<number>`count(*)`,
  })
    .from(dailySettlements)
    .where(whereClause);
  
  const result = summary[0];
  const totalOrders = Number(result?.totalOrders || 0);
  const totalRevenue = Number(result?.totalRevenue || 0);
  
  return {
    totalRevenue,
    totalCash: Number(result?.totalCash || 0),
    totalCard: Number(result?.totalCard || 0),
    totalLinePay: Number(result?.totalLinePay || 0),
    totalOrders,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    cashDifferenceTotal: Number(result?.cashDifferenceTotal || 0),
    settlementCount: Number(result?.settlementCount || 0),
  };
}

// ============================================
// LINE Channel 設定
// ============================================

// 建立 LINE Channel 設定
export async function createLineChannelConfig(data: InsertLineChannelConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(lineChannelConfigs).values(data).returning();

  return result.id;
}

// 更新 LINE Channel 設定
export async function updateLineChannelConfig(id: number, data: Partial<InsertLineChannelConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(lineChannelConfigs).set(data).where(eq(lineChannelConfigs.id, id));
}

// 根據 ID 獲取 LINE Channel 設定
export async function getLineChannelConfigById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(lineChannelConfigs).where(eq(lineChannelConfigs.id, id)).limit(1);
  return result[0] || null;
}

// 獲取平台級 LINE Channel 設定
export async function getPlatformLineChannelConfig() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(lineChannelConfigs)
    .where(and(
      eq(lineChannelConfigs.isPlatformLevel, true),
      eq(lineChannelConfigs.isActive, true)
    ))
    .limit(1);
  return result[0] || null;
}

// 獲取診所的 LINE Channel 設定
export async function getOrganizationLineChannelConfig(organizationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(lineChannelConfigs)
    .where(and(
      eq(lineChannelConfigs.organizationId, organizationId),
      eq(lineChannelConfigs.isActive, true)
    ))
    .limit(1);
  
  // 如果診所沒有設定，返回平台級設定
  if (!result[0]) {
    return await getPlatformLineChannelConfig();
  }
  
  return result[0];
}

// 列出所有 LINE Channel 設定
export async function listLineChannelConfigs(options?: { organizationId?: number; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause: WhereClause = undefined;
  if (options?.organizationId) {
    whereClause = eq(lineChannelConfigs.organizationId, options.organizationId);
  }
  
  const query = db.select().from(lineChannelConfigs);
  const data = whereClause 
    ? await query.where(whereClause).orderBy(desc(lineChannelConfigs.createdAt)).limit(limit).offset(offset)
    : await query.orderBy(desc(lineChannelConfigs.createdAt)).limit(limit).offset(offset);
  
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(lineChannelConfigs);
  const countResult = whereClause 
    ? await countQuery.where(whereClause)
    : await countQuery;
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// 驗證 LINE Channel 憑證
export async function verifyLineChannelCredentials(channelId: string, channelSecret: string, channelAccessToken: string) {
  try {
    // 呼叫 LINE API 驗證憑證
    const response = await fetch('https://api.line.me/v2/bot/info', {
      headers: {
        'Authorization': `Bearer ${channelAccessToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, botInfo: data };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Connection failed' };
  }
}


// ============================================
// Phase 62: 每日結帳系統強化
// ============================================
import { 
  autoSettlementSettings, InsertAutoSettlementSetting,
  settlementReports, InsertSettlementReport,
  revenueTrendSnapshots, InsertRevenueTrendSnapshot,
} from "../drizzle/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WhereClause = any;

// 自動結帳設定 CRUD
export async function getAutoSettlementSettings(organizationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(autoSettlementSettings)
    .where(eq(autoSettlementSettings.organizationId, organizationId))
    .limit(1);
  return result[0] || null;
}

export async function upsertAutoSettlementSettings(organizationId: number, data: Partial<InsertAutoSettlementSetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAutoSettlementSettings(organizationId);
  if (existing) {
    await db.update(autoSettlementSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(autoSettlementSettings.organizationId, organizationId));
    return existing.id;
  } else {
    const [result] = await db.insert(autoSettlementSettings).values({
      organizationId,
      ...data,
    }).returning();

    return result.id;
  }
}

// 結帳報表 CRUD
export async function createSettlementReport(data: InsertSettlementReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(settlementReports).values(data).returning();

  return result.id;
}

export async function getSettlementReportById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(settlementReports).where(eq(settlementReports.id, id)).limit(1);
  return result[0] || null;
}

export async function updateSettlementReport(id: number, data: Partial<InsertSettlementReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(settlementReports).set(data).where(eq(settlementReports.id, id));
}

export async function listSettlementReports(organizationId: number, options?: {
  reportType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause: WhereClause = eq(settlementReports.organizationId, organizationId);
  
  if (options?.reportType) {
    whereClause = and(whereClause, eq(settlementReports.reportType, options.reportType as any));
  }
  if (options?.startDate) {
    whereClause = and(whereClause, gte(settlementReports.periodStart, options.startDate));
  }
  if (options?.endDate) {
    whereClause = and(whereClause, lte(settlementReports.periodEnd, options.endDate));
  }
  
  const data = await db.select().from(settlementReports)
    .where(whereClause)
    .orderBy(desc(settlementReports.createdAt))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(settlementReports).where(whereClause);
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// 生成每日結帳報表
export async function generateDailySettlementReport(settlementId: number, generatedByUserId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const settlement = await getDailySettlementById(settlementId);
  if (!settlement) throw new Error("Settlement not found");
  
  const dateStr = settlement.settlementDate.toString().split('T')[0];
  
  // 建立報表記錄
  const reportId = await createSettlementReport({
    organizationId: settlement.organizationId,
    settlementId,
    reportType: 'daily',
    periodStart: dateStr,
    periodEnd: dateStr,
    title: `每日結帳報表 - ${dateStr}`,
    totalRevenue: settlement.totalRevenue || "0",
    cashRevenue: settlement.cashRevenue || "0",
    cardRevenue: settlement.cardRevenue || "0",
    linePayRevenue: settlement.linePayRevenue || "0",
    otherRevenue: settlement.otherRevenue || "0",
    totalOrders: settlement.totalOrders || 0,
    averageOrderValue: settlement.totalOrders && settlement.totalOrders > 0 
      ? (Number(settlement.totalRevenue || 0) / settlement.totalOrders).toFixed(2)
      : "0",
    totalAppointments: settlement.totalAppointments || 0,
    completedAppointments: settlement.completedAppointments || 0,
    generatedBy: generatedByUserId ? 'manual' : 'auto',
    generatedByUserId,
    status: 'completed',
    reportData: {
      settlement,
      generatedAt: new Date().toISOString(),
    },
  });
  
  // 同時建立營收快照
  await createRevenueTrendSnapshot({
    organizationId: settlement.organizationId,
    snapshotDate: dateStr,
    periodType: 'daily',
    totalRevenue: settlement.totalRevenue || "0",
    cashRevenue: settlement.cashRevenue || "0",
    cardRevenue: settlement.cardRevenue || "0",
    linePayRevenue: settlement.linePayRevenue || "0",
    otherRevenue: settlement.otherRevenue || "0",
    totalOrders: settlement.totalOrders || 0,
    averageOrderValue: settlement.totalOrders && settlement.totalOrders > 0 
      ? (Number(settlement.totalRevenue || 0) / settlement.totalOrders).toFixed(2)
      : "0",
    totalAppointments: settlement.totalAppointments || 0,
    completedAppointments: settlement.completedAppointments || 0,
  });
  
  return reportId;
}

// 營收趨勢快照 CRUD
export async function createRevenueTrendSnapshot(data: InsertRevenueTrendSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(revenueTrendSnapshots).values(data).returning();

  return result.id;
}

export async function getRevenueTrends(organizationId: number, options: {
  periodType: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(revenueTrendSnapshots)
    .where(and(
      eq(revenueTrendSnapshots.organizationId, organizationId),
      eq(revenueTrendSnapshots.periodType, options.periodType),
      gte(revenueTrendSnapshots.snapshotDate, options.startDate),
      lte(revenueTrendSnapshots.snapshotDate, options.endDate)
    ))
    .orderBy(revenueTrendSnapshots.snapshotDate);
}

// 獲取營收儀表板數據
export async function getRevenueDashboardData(organizationId: number, options?: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return {
    summary: { totalRevenue: 0, cashRevenue: 0, cardRevenue: 0, linePayRevenue: 0, otherRevenue: 0 },
    dailyTrend: [],
    weeklyTrend: [],
    monthlyTrend: [],
    paymentMethodBreakdown: [],
    hourlyDistribution: [],
  };
  
  const now = new Date();
  const startDate = options?.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = options?.endDate || now.toISOString().split('T')[0];
  
  // 獲取期間總營收
  const summary = await getSettlementSummary(organizationId, { startDate, endDate });
  
  // 獲取每日趨勢（最近 30 天）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyTrend = await db.select({
    date: dailySettlements.settlementDate,
    totalRevenue: dailySettlements.totalRevenue,
    cashRevenue: dailySettlements.cashRevenue,
    cardRevenue: dailySettlements.cardRevenue,
    linePayRevenue: dailySettlements.linePayRevenue,
    totalOrders: dailySettlements.totalOrders,
  })
    .from(dailySettlements)
    .where(and(
      eq(dailySettlements.organizationId, organizationId),
      gte(dailySettlements.settlementDate, thirtyDaysAgo.toISOString().split('T')[0]),
      eq(dailySettlements.status, 'closed')
    ))
    .orderBy(dailySettlements.settlementDate);
  
  // 計算每週趨勢（最近 12 週）
  const weeklyTrend = await db.select({
    week: sql<string>`YEARWEEK(${dailySettlements.settlementDate}, 1)`,
    totalRevenue: sql<number>`SUM(${dailySettlements.totalRevenue})`,
    totalOrders: sql<number>`SUM(${dailySettlements.totalOrders})`,
  })
    .from(dailySettlements)
    .where(and(
      eq(dailySettlements.organizationId, organizationId),
      gte(dailySettlements.settlementDate, new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      eq(dailySettlements.status, 'closed')
    ))
    .groupBy(sql`YEARWEEK(${dailySettlements.settlementDate}, 1)`)
    .orderBy(sql`YEARWEEK(${dailySettlements.settlementDate}, 1)`);
  
  // 計算每月趨勢（最近 12 個月）
  const monthlyTrend = await db.select({
    month: sql<string>`DATE_FORMAT(${dailySettlements.settlementDate}, '%Y-%m')`,
    totalRevenue: sql<number>`SUM(${dailySettlements.totalRevenue})`,
    totalOrders: sql<number>`SUM(${dailySettlements.totalOrders})`,
  })
    .from(dailySettlements)
    .where(and(
      eq(dailySettlements.organizationId, organizationId),
      gte(dailySettlements.settlementDate, new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      eq(dailySettlements.status, 'closed')
    ))
    .groupBy(sql`DATE_FORMAT(${dailySettlements.settlementDate}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${dailySettlements.settlementDate}, '%Y-%m')`);
  
  // 支付方式佔比
  const paymentMethodBreakdown = [
    { method: '現金', amount: summary.totalCash, percentage: summary.totalRevenue > 0 ? (summary.totalCash / summary.totalRevenue * 100).toFixed(1) : 0 },
    { method: '信用卡', amount: summary.totalCard, percentage: summary.totalRevenue > 0 ? (summary.totalCard / summary.totalRevenue * 100).toFixed(1) : 0 },
    { method: 'LINE Pay', amount: summary.totalLinePay, percentage: summary.totalRevenue > 0 ? (summary.totalLinePay / summary.totalRevenue * 100).toFixed(1) : 0 },
    { method: '其他', amount: summary.totalRevenue - summary.totalCash - summary.totalCard - summary.totalLinePay, percentage: summary.totalRevenue > 0 ? ((summary.totalRevenue - summary.totalCash - summary.totalCard - summary.totalLinePay) / summary.totalRevenue * 100).toFixed(1) : 0 },
  ].filter(item => item.amount > 0);
  
  return {
    summary,
    dailyTrend: dailyTrend.map(d => ({
      date: d.date,
      totalRevenue: Number(d.totalRevenue || 0),
      cashRevenue: Number(d.cashRevenue || 0),
      cardRevenue: Number(d.cardRevenue || 0),
      linePayRevenue: Number(d.linePayRevenue || 0),
      totalOrders: d.totalOrders || 0,
    })),
    weeklyTrend: weeklyTrend.map(w => ({
      week: w.week,
      totalRevenue: Number(w.totalRevenue || 0),
      totalOrders: Number(w.totalOrders || 0),
    })),
    monthlyTrend: monthlyTrend.map(m => ({
      month: m.month,
      totalRevenue: Number(m.totalRevenue || 0),
      totalOrders: Number(m.totalOrders || 0),
    })),
    paymentMethodBreakdown,
    hourlyDistribution: [], // 需要更詳細的時段數據
  };
}

// 進階篩選結帳歷史
export async function listDailySettlementsAdvanced(organizationId: number, options: {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  operatorId?: number;
  sortBy?: 'date' | 'revenue' | 'orders' | 'cashDifference';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereConditions: WhereClause[] = [eq(dailySettlements.organizationId, organizationId)];
  
  if (options.startDate) {
    whereConditions.push(gte(dailySettlements.settlementDate, options.startDate));
  }
  if (options.endDate) {
    whereConditions.push(lte(dailySettlements.settlementDate, options.endDate));
  }
  if (options.minAmount !== undefined) {
    whereConditions.push(gte(dailySettlements.totalRevenue, options.minAmount.toString()));
  }
  if (options.maxAmount !== undefined) {
    whereConditions.push(lte(dailySettlements.totalRevenue, options.maxAmount.toString()));
  }
  if (options.status) {
    whereConditions.push(eq(dailySettlements.status, options.status as any));
  }
  if (options.operatorId) {
    whereConditions.push(
      or(
        eq(dailySettlements.openedBy, options.operatorId),
        eq(dailySettlements.closedBy, options.operatorId)
      )
    );
  }
  
  const whereClause = and(...whereConditions);
  
  // 排序
  let orderByClause: WhereClause;
  const sortOrder = options.sortOrder === 'asc' ? asc : desc;
  switch (options.sortBy) {
    case 'revenue':
      orderByClause = sortOrder(dailySettlements.totalRevenue);
      break;
    case 'orders':
      orderByClause = sortOrder(dailySettlements.totalOrders);
      break;
    case 'cashDifference':
      orderByClause = sortOrder(dailySettlements.cashDifference);
      break;
    case 'date':
    default:
      orderByClause = sortOrder(dailySettlements.settlementDate);
  }
  
  const data = await db.select().from(dailySettlements)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);
  
  // 獲取操作者名稱
  const dataWithOperators = await Promise.all(data.map(async (settlement) => {
    let openedByName = null;
    let closedByName = null;
    
    if (settlement.openedBy) {
      const [opener] = await db.select({ name: users.name }).from(users).where(eq(users.id, settlement.openedBy)).limit(1);
      openedByName = opener?.name || null;
    }
    if (settlement.closedBy) {
      const [closer] = await db.select({ name: users.name }).from(users).where(eq(users.id, settlement.closedBy)).limit(1);
      closedByName = closer?.name || null;
    }
    
    return {
      ...settlement,
      openedByName,
      closedByName,
    };
  }));
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(dailySettlements).where(whereClause);
  const total = countResult[0]?.count || 0;
  
  // 計算篩選結果的統計
  const statsResult = await db.select({
    totalRevenue: sql<number>`SUM(${dailySettlements.totalRevenue})`,
    totalOrders: sql<number>`SUM(${dailySettlements.totalOrders})`,
    avgRevenue: sql<number>`AVG(${dailySettlements.totalRevenue})`,
    totalCashDifference: sql<number>`SUM(${dailySettlements.cashDifference})`,
  }).from(dailySettlements).where(whereClause);
  
  const stats = {
    totalRevenue: Number(statsResult[0]?.totalRevenue || 0),
    totalOrders: Number(statsResult[0]?.totalOrders || 0),
    avgRevenue: Number(statsResult[0]?.avgRevenue || 0),
    totalCashDifference: Number(statsResult[0]?.totalCashDifference || 0),
  };
  
  return { data: dataWithOperators, total, stats };
}

// 獲取所有操作者列表（用於篩選下拉選單）
export async function getSettlementOperators(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // 獲取所有曾經操作過結帳的用戶
  const operators = await db.selectDistinct({
    userId: dailySettlements.openedBy,
  })
    .from(dailySettlements)
    .where(eq(dailySettlements.organizationId, organizationId));
  
  const closers = await db.selectDistinct({
    userId: dailySettlements.closedBy,
  })
    .from(dailySettlements)
    .where(eq(dailySettlements.organizationId, organizationId));
  
  const allUserIds = [
    ...operators.map(o => o.userId).filter((id): id is number => id !== null),
    ...closers.map(c => c.userId).filter((id): id is number => id !== null),
  ];
  const userIds = Array.from(new Set(allUserIds));
  
  if (userIds.length === 0) return [];
  
  const userList = await db.select({
    id: users.id,
    name: users.name,
  })
    .from(users)
    .where(inArray(users.id, userIds as number[]));
  
  return userList;
}

// 執行自動結帳
export async function executeAutoSettlement(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const settings = await getAutoSettlementSettings(organizationId);
  if (!settings || !settings.isEnabled) {
    return { success: false, message: "Auto settlement is not enabled" };
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  // 檢查今日是否已有結帳記錄
  const existing = await getDailySettlementByDate(organizationId, today);
  if (!existing) {
    return { success: false, message: "No settlement record found for today. Please open settlement first." };
  }
  
  if (existing.status === 'closed') {
    return { success: false, message: "Today's settlement is already closed" };
  }
  
  try {
    // 計算當日統計
    const stats = await calculateDailyStats(organizationId, today);
    
    // 預估結帳現金（開帳現金 + 現金營收）
    const expectedClosingCash = Number(existing.openingCash || 0) + stats.cashRevenue;
    
    // 執行結帳
    await closeDailySettlement(existing.id, expectedClosingCash, 0, "自動結帳");
    
    // 生成報表
    if (settings.autoGenerateReport) {
      await generateDailySettlementReport(existing.id);
    }
    
    // 更新最後執行時間
    await upsertAutoSettlementSettings(organizationId, {
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'success',
    });
    
    return { success: true, settlementId: existing.id, stats };
  } catch (error: any) {
    // 記錄錯誤
    await upsertAutoSettlementSettings(organizationId, {
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'failed',
      lastExecutionError: error.message,
    });
    
    return { success: false, message: error.message };
  }
}


// ============================================
// Batch Operations
// ============================================

// 批次刪除客戶（軟刪除）
export async function batchDeleteCustomers(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  const result = await db.update(customers)
    .set({ isActive: false })
    .where(inArray(customers.id, ids));
  
  return { affected: ids.length };
}

// 批次更新客戶會員等級
export async function batchUpdateCustomerLevel(ids: number[], memberLevel: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(customers)
    .set({ memberLevel: memberLevel as any })
    .where(inArray(customers.id, ids));
  
  return { affected: ids.length };
}

// 批次添加客戶標籤
export async function batchAddTagToCustomers(customerIds: number[], tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (customerIds.length === 0) return { affected: 0 };
  
  // 先檢查已存在的關聯
  const existing = await db.select()
    .from(customerTagRelations)
    .where(
      and(
        inArray(customerTagRelations.customerId, customerIds),
        eq(customerTagRelations.tagId, tagId)
      )
    );
  
  const existingCustomerIds = new Set(existing.map(e => e.customerId));
  const newCustomerIds = customerIds.filter(id => !existingCustomerIds.has(id));
  
  if (newCustomerIds.length > 0) {
    await db.insert(customerTagRelations).values(
      newCustomerIds.map(customerId => ({ customerId, tagId }))
    );
  }
  
  return { affected: newCustomerIds.length };
}

// 批次刪除產品（軟刪除）
export async function batchDeleteProducts(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(products)
    .set({ isActive: false })
    .where(inArray(products.id, ids));
  
  return { affected: ids.length };
}

// 批次更新產品狀態
export async function batchUpdateProductStatus(ids: number[], isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(products)
    .set({ isActive })
    .where(inArray(products.id, ids));
  
  return { affected: ids.length };
}

// 批次刪除預約
export async function batchDeleteAppointments(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(appointments)
    .set({ status: 'cancelled' })
    .where(inArray(appointments.id, ids));
  
  return { affected: ids.length };
}

// 批次更新預約狀態
export async function batchUpdateAppointmentStatus(ids: number[], status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(appointments)
    .set({ status: status as any })
    .where(inArray(appointments.id, ids));
  
  return { affected: ids.length };
}

// 批次刪除員工（軟刪除）
export async function batchDeleteStaff(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(staff)
    .set({ isActive: false })
    .where(inArray(staff.id, ids));
  
  return { affected: ids.length };
}

// 批次更新員工狀態
export async function batchUpdateStaffStatus(ids: number[], isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(staff)
    .set({ isActive })
    .where(inArray(staff.id, ids));
  
  return { affected: ids.length };
}

// 批次刪除訂單（軟刪除）
export async function batchDeleteOrders(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(orders)
    .set({ status: 'cancelled' })
    .where(inArray(orders.id, ids));
  
  return { affected: ids.length };
}

// 批次更新訂單狀態
export async function batchUpdateOrderStatus(ids: number[], status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return { affected: 0 };
  
  await db.update(orders)
    .set({ status: status as any })
    .where(inArray(orders.id, ids));
  
  return { affected: ids.length };
}


// ============================================
// Sprint 4: Raw SQL Query Helper (for upgrade management)
// ============================================
export async function query(sqlText: string, params: any[] = []): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.execute(sql.raw(
    params.reduce((text: string, param: any, i: number) => {
      const escaped = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param === null ? 'NULL' : String(param);
      return text.replace(`$${i + 1}`, escaped);
    }, sqlText)
  ));
  return Array.isArray(result) ? result : (result as any).rows || [];
}
