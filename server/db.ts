import { eq, and, desc, asc, sql, like, or } from "drizzle-orm";
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
