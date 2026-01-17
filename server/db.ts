import { eq, and, desc, asc, sql, like, or, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
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
  const result = await db.insert(organizations).values(org);
  return result[0].insertId;
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
  const result = await db.insert(organizationUsers).values(data);
  return result[0].insertId;
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
  const result = await db.insert(customers).values(customer);
  return result[0].insertId;
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
  const result = await db.insert(customerTags).values(tag);
  return result[0].insertId;
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
  const result = await db.insert(products).values(product);
  return result[0].insertId;
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
  const result = await db.insert(staff).values(staffData);
  return result[0].insertId;
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
  const result = await db.insert(appointments).values(appointment);
  return result[0].insertId;
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
  const result = await db.insert(schedules).values(schedule);
  return result[0].insertId;
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
  const result = await db.insert(attendanceRecords).values(record);
  return result[0].insertId;
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
  const result = await db.insert(orders).values(order);
  return result[0].insertId;
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
  const result = await db.insert(coupons).values(coupon);
  return result[0].insertId;
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
  const result = await db.insert(aftercareRecords).values(record);
  return result[0].insertId;
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
  const result = await db.insert(lineChannels).values(channel);
  return result[0].insertId;
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
  const result = await db.insert(treatmentRecords).values(record);
  return result[0].insertId;
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
  const result = await db.insert(treatmentPhotos).values(photo);
  return result[0].insertId;
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
  const result = await db.insert(customerPackages).values(pkg);
  return result[0].insertId;
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
  const result = await db.insert(packageUsageRecords).values(record);
  return result[0].insertId;
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
  const result = await db.insert(consultations).values(consultation);
  return result[0].insertId;
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
  const result = await db.insert(followUps).values(followUp);
  return result[0].insertId;
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
    const result = await db.insert(customerRfmScores).values(score);
    return result[0].insertId;
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
  const result = await db.insert(commissionRules).values(rule);
  return result[0].insertId;
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
  const result = await db.insert(staffCommissions).values(commission);
  return result[0].insertId;
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
  const result = await db.insert(inventoryTransactions).values(transaction);
  
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
  
  return result[0].insertId;
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
  const result = await db.insert(revenueTargets).values(target);
  return result[0].insertId;
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
  const result = await db.insert(marketingCampaigns).values(campaign);
  return result[0].insertId;
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
  const result = await db.insert(customerSources).values(source);
  return result[0].insertId;
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
  const result = await db.insert(satisfactionSurveys).values(survey);
  return result[0].insertId;
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
  const result = await db.insert(waitlist).values(data);
  return result[0].insertId;
}

export async function getWaitlist(organizationId: number, date?: string) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = and(
    eq(waitlist.organizationId, organizationId),
    eq(waitlist.status, 'waiting')
  );

  if (date) {
    whereClause = and(whereClause, eq(waitlist.preferredDate, new Date(date))) as typeof whereClause;
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
    eq(waitlist.preferredDate, new Date(appointmentDate)),
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
  const result = await db.insert(injectionRecords).values(record);
  return result[0].insertId;
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
  const result = await db.insert(injectionPoints).values(point);
  return result[0].insertId;
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
  const result = await db.insert(consentFormTemplates).values(template);
  return result[0].insertId;
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
  const result = await db.insert(consentSignatures).values(signature);
  return result[0].insertId;
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
  const result = await db.insert(medications).values(medication);
  return result[0].insertId;
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
  const result = await db.insert(prescriptions).values(prescription);
  return result[0].insertId;
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
  const result = await db.insert(customerAllergies).values(allergy);
  return result[0].insertId;
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
  const result = await db.insert(skinAnalysisRecords).values(record);
  return result[0].insertId;
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
  const result = await db.insert(skinMetrics).values(metric);
  return result[0].insertId;
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
  const result = await db.insert(membershipPlans).values(plan);
  return result[0].insertId;
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
  const result = await db.insert(memberSubscriptions).values(subscription);
  return result[0].insertId;
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
  const result = await db.insert(subscriptionPayments).values(payment);
  return result[0].insertId;
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
  const result = await db.insert(teleConsultations).values(consultation);
  return result[0].insertId;
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
  const result = await db.insert(consultationRecordings).values(recording);
  return result[0].insertId;
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
  const result = await db.insert(referralCodes).values(code);
  return result[0].insertId;
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
  const result = await db.insert(referralRecords).values(record);
  return result[0].insertId;
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
  const result = await db.insert(referralRewards).values(reward);
  return result[0].insertId;
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
  const result = await db.insert(socialAccounts).values(account);
  return result[0].insertId;
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
  const result = await db.insert(scheduledPosts).values(post);
  return result[0].insertId;
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
  const result = await db.insert(socialAnalytics).values(analytic);
  return result[0].insertId;
}

export async function getSocialAnalytics(socialAccountId: number, options?: { startDate?: string; endDate?: string }) {
  const db = await getDb();
  if (!db) return [];

  let whereClause = eq(socialAnalytics.socialAccountId, socialAccountId);
  if (options?.startDate) {
    whereClause = and(whereClause, gte(socialAnalytics.date, new Date(options.startDate))) as typeof whereClause;
  }
  if (options?.endDate) {
    whereClause = and(whereClause, lte(socialAnalytics.date, new Date(options.endDate))) as typeof whereClause;
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
  const result = await db.insert(backgroundJobs).values(job);
  return result[0].insertId;
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
