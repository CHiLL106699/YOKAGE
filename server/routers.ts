import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============================================
// Super Admin Router
// ============================================
const superAdminRouter = router({
  stats: adminProcedure.query(async () => {
    return await db.getSuperAdminStats();
  }),

  listOrganizations: adminProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.listOrganizations(input);
    }),

  createOrganization: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      subscriptionPlan: z.enum(["free", "basic", "pro", "enterprise"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = await db.getOrganizationBySlug(input.slug);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Slug already exists" });
      }
      const id = await db.createOrganization(input);
      return { id };
    }),

  updateOrganization: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      subscriptionPlan: z.enum(["free", "basic", "pro", "enterprise"]).optional(),
      subscriptionStatus: z.enum(["active", "suspended", "cancelled"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateOrganization(id, data);
      return { success: true };
    }),

  deleteOrganization: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteOrganization(input.id);
      return { success: true };
    }),

  getOrganization: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrganizationById(input.id);
    }),
});

// ============================================
// Organization Router (Clinic Admin)
// ============================================
const organizationRouter = router({
  current: protectedProcedure.query(async ({ ctx }) => {
    const orgs = await db.getUserOrganizations(ctx.user.id);
    return orgs.length > 0 ? orgs[0] : null;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserOrganizations(ctx.user.id);
  }),

  stats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrganizationStats(input.organizationId);
    }),

  users: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrganizationUsers(input.organizationId);
    }),
});

// ============================================
// Customer Router
// ============================================
const customerRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listCustomers(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const customer = await db.getCustomerById(input.id);
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }
      const tags = await db.getCustomerTags(input.id);
      return { ...customer, tags };
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      birthday: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCustomer(input as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      birthday: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
      memberLevel: z.enum(["bronze", "silver", "gold", "platinum", "diamond"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCustomer(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCustomer(input.id);
      return { success: true };
    }),

  tags: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.number() }))
      .query(async ({ input }) => {
        return await db.listCustomerTags(input.organizationId);
      }),

    create: protectedProcedure
      .input(z.object({
        organizationId: z.number(),
        name: z.string().min(1),
        color: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCustomerTag(input);
        return { id };
      }),

    addToCustomer: protectedProcedure
      .input(z.object({ customerId: z.number(), tagId: z.number() }))
      .mutation(async ({ input }) => {
        await db.addTagToCustomer(input.customerId, input.tagId);
        return { success: true };
      }),
  }),
});

// ============================================
// Product Router
// ============================================
const productRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      category: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listProducts(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      type: z.enum(["service", "product", "package"]).optional(),
      price: z.string(),
      costPrice: z.string().optional(),
      duration: z.number().optional(),
      stock: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createProduct(input);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      type: z.enum(["service", "product", "package"]).optional(),
      price: z.string().optional(),
      costPrice: z.string().optional(),
      duration: z.number().optional(),
      stock: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateProduct(id, data);
      return { success: true };
    }),
});

// ============================================
// Staff Router
// ============================================
const staffRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listStaff(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getStaffById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      employeeId: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      position: z.string().optional(),
      department: z.string().optional(),
      hireDate: z.string().optional(),
      salary: z.string().optional(),
      salaryType: z.enum(["monthly", "hourly", "commission"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createStaff(input as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      employeeId: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      position: z.string().optional(),
      department: z.string().optional(),
      salary: z.string().optional(),
      salaryType: z.enum(["monthly", "hourly", "commission"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateStaff(id, data);
      return { success: true };
    }),
});

// ============================================
// Appointment Router
// ============================================
const appointmentRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      date: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listAppointments(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getAppointmentById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      appointmentDate: z.string(),
      startTime: z.string(),
      endTime: z.string().optional(),
      notes: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createAppointment(input as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      appointmentDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      status: z.enum(["pending", "confirmed", "arrived", "in_progress", "completed", "cancelled", "no_show"]).optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAppointment(id, data as any);
      return { success: true };
    }),
});

// ============================================
// Schedule Router
// ============================================
const scheduleRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listSchedules(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      scheduleDate: z.string(),
      shiftType: z.enum(["morning", "afternoon", "evening", "full", "off", "custom"]).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createSchedule(input as any);
      return { id };
    }),
});

// ============================================
// Attendance Router
// ============================================
const attendanceRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listAttendanceRecords(organizationId, options);
    }),

  clockIn: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      location: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }))
    .mutation(async ({ input }) => {
      const today = new Date().toISOString().split('T')[0];
      const id = await db.createAttendanceRecord({
        organizationId: input.organizationId,
        staffId: input.staffId,
        recordDate: today,
        clockIn: new Date(),
        clockInLocation: input.location,
      } as any);
      return { id };
    }),

  clockOut: protectedProcedure
    .input(z.object({
      id: z.number(),
      location: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateAttendanceRecord(input.id, {
        clockOut: new Date(),
        clockOutLocation: input.location,
      });
      return { success: true };
    }),
});

// ============================================
// Order Router
// ============================================
const orderRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listOrders(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrderById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      orderNumber: z.string(),
      subtotal: z.string(),
      discount: z.string().optional(),
      tax: z.string().optional(),
      total: z.string(),
      couponId: z.number().optional(),
      paymentMethod: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createOrder(input);
      return { id };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "paid", "processing", "completed", "cancelled", "refunded"]),
    }))
    .mutation(async ({ input }) => {
      await db.updateOrder(input.id, { status: input.status });
      return { success: true };
    }),
});

// ============================================
// Coupon Router
// ============================================
const couponRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.listCoupons(input.organizationId);
    }),

  validate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      code: z.string(),
    }))
    .query(async ({ input }) => {
      const coupon = await db.getCouponByCode(input.organizationId, input.code);
      if (!coupon) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid coupon code" });
      }
      return coupon;
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      discountType: z.enum(["percentage", "fixed"]).optional(),
      discountValue: z.string(),
      minPurchase: z.string().optional(),
      maxDiscount: z.string().optional(),
      usageLimit: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { startDate, endDate, ...rest } = input;
      const data: Record<string, unknown> = { ...rest };
      if (startDate) data.startDate = new Date(startDate);
      if (endDate) data.endDate = new Date(endDate);
      const id = await db.createCoupon(data as any);
      return { id };
    }),
});

// ============================================
// Aftercare Router
// ============================================
const aftercareRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listAftercareRecords(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      productId: z.number().optional(),
      staffId: z.number().optional(),
      treatmentDate: z.string(),
      followUpDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { treatmentDate, followUpDate, ...rest } = input;
      const data: Record<string, unknown> = { ...rest, treatmentDate };
      if (followUpDate) data.followUpDate = followUpDate;
      const id = await db.createAftercareRecord(data as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
      notes: z.string().optional(),
      customerFeedback: z.string().optional(),
      followUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, followUpDate, ...rest } = input;
      const data: Record<string, unknown> = { ...rest };
      if (followUpDate) data.followUpDate = followUpDate;
      await db.updateAftercareRecord(id, data);
      return { success: true };
    }),
});

// ============================================
// LINE Channel Router
// ============================================
const lineRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.listLineChannels(input.organizationId);
    }),

  getChannel: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getLineChannelByOrg(input.organizationId);
    }),

  createChannel: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      channelName: z.string().min(1),
      channelId: z.string().min(1),
      channelSecret: z.string().optional(),
      accessToken: z.string().optional(),
      liffId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createLineChannel(input);
      return { id };
    }),
});

// ============================================
// Clinic Dashboard Router (for clinic admins)
// ============================================
const clinicRouter = router({
  stats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      const { organizationId } = input;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get today's appointments
      const appointments = await db.listAppointments(organizationId, {
        date: today.toISOString().split('T')[0],
      });
      
      // Get customer count
      const customers = await db.listCustomers(organizationId, { limit: 1 });
      
      // Get pending aftercare
      const aftercare = await db.listAftercareRecords(organizationId, { status: 'pending' });
      
      return {
        todayAppointments: appointments.data.length,
        customers: customers.total,
        monthlyRevenue: 0, // TODO: Calculate from orders
        pendingAftercare: aftercare.length,
      };
    }),
});

// ============================================
// Main App Router
// ============================================
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  superAdmin: superAdminRouter,
  organization: organizationRouter,
  customer: customerRouter,
  product: productRouter,
  staff: staffRouter,
  appointment: appointmentRouter,
  schedule: scheduleRouter,
  attendance: attendanceRouter,
  order: orderRouter,
  coupon: couponRouter,
  aftercare: aftercareRouter,
  line: lineRouter,
  clinic: clinicRouter,
});

export type AppRouter = typeof appRouter;
