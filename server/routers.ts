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

  // 到診率統計 API
  getAttendanceStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate, staffId } = input;
      return await db.getAppointmentAttendanceStats(organizationId, { startDate, endDate, staffId });
    }),

  // 爹約分析 API
  getNoShowAnalysis: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      return await db.getNoShowAnalysis(organizationId, { startDate, endDate });
    }),

  // 候補名單管理 API
  getWaitlist: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getWaitlist(input.organizationId, input.date);
    }),

  addToWaitlist: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      preferredDate: z.string(),
      preferredTimeSlot: z.string().optional(),
      productId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { preferredDate, ...rest } = input;
      const id = await db.addToWaitlist({
        ...rest,
        preferredDate: new Date(preferredDate),
      });
      return { id };
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
// Report Router
// ============================================
const reportRouter = router({
  revenue: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      // Get orders within date range
      const orders = await db.listOrders(organizationId, {
        status: 'completed',
      });
      
      const totalRevenue = orders.data.reduce((sum, order) => sum + Number(order.subtotal), 0);
      
      // Generate daily revenue data
      const dailyMap = new Map<string, number>();
      orders.data.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + Number(order.subtotal));
      });
      
      const dailyRevenue = Array.from(dailyMap.entries()).map(([date, amount]) => ({
        date,
        amount,
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Revenue by category (simplified)
      const byCategory = [
        { category: '療程', amount: Math.round(totalRevenue * 0.6) },
        { category: '產品', amount: Math.round(totalRevenue * 0.3) },
        { category: '其他', amount: Math.round(totalRevenue * 0.1) },
      ];
      
      return {
        totalRevenue,
        growthRate: 12.5, // TODO: Calculate actual growth
        dailyRevenue,
        byCategory,
      };
    }),

  appointmentStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      const appointments = await db.listAppointments(organizationId, {
        date: startDate,
      });
      
      const total = appointments.data.length;
      const completed = appointments.data.filter(a => a.status === 'completed').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // By time slot
      const timeSlotMap = new Map<string, number>();
      appointments.data.forEach(apt => {
        const hour = new Date(apt.appointmentDate).getHours();
        const slot = `${hour}:00`;
        timeSlotMap.set(slot, (timeSlotMap.get(slot) || 0) + 1);
      });
      
      const byTimeSlot = Array.from(timeSlotMap.entries()).map(([timeSlot, count]) => ({
        timeSlot,
        count,
      })).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      
      // By status
      const statusMap = new Map<string, number>();
      appointments.data.forEach(apt => {
        const status = apt.status || 'pending';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      
      const statusLabels: Record<string, string> = {
        pending: '待確認',
        confirmed: '已確認',
        completed: '已完成',
        cancelled: '已取消',
        no_show: '未到',
      };
      
      const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
        status: statusLabels[status] || status,
        count,
      }));
      
      return {
        totalAppointments: total,
        completionRate,
        byTimeSlot,
        byStatus,
      };
    }),

  customerStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      const customers = await db.listCustomers(organizationId, { limit: 1000 });
      
      const start = new Date(startDate);
      const newCustomers = customers.data.filter(c => new Date(c.createdAt) >= start).length;
      const returningCustomers = customers.total - newCustomers;
      const returnRate = customers.total > 0 ? Math.round((returningCustomers / customers.total) * 100) : 0;
      
      // By member level
      const levelMap = new Map<string, number>();
      customers.data.forEach(c => {
        const level = c.memberLevel || 'regular';
        levelMap.set(level, (levelMap.get(level) || 0) + 1);
      });
      
      const levelLabels: Record<string, string> = {
        regular: '一般',
        silver: '銀卡',
        gold: '金卡',
        platinum: '白金',
        diamond: '鑽石',
      };
      
      const byMemberLevel = Array.from(levelMap.entries()).map(([level, count]) => ({
        level: levelLabels[level] || level,
        count,
      }));
      
      // By frequency (simplified)
      const byFrequency = [
        { frequency: '1次', count: Math.round(customers.total * 0.4) },
        { frequency: '2-3次', count: Math.round(customers.total * 0.3) },
        { frequency: '4-6次', count: Math.round(customers.total * 0.2) },
        { frequency: '7次以上', count: Math.round(customers.total * 0.1) },
      ];
      
      return {
        newCustomers,
        returningCustomers,
        returnRate,
        byMemberLevel,
        byFrequency,
      };
    }),

  productStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId } = input;
      const products = await db.listProducts(organizationId, { limit: 100 });
      
      // Sort by some metric (simplified - using price as proxy)
      const sortedProducts = [...products.data].sort((a, b) => Number(b.price) - Number(a.price));
      
      const topProducts = sortedProducts.slice(0, 10).map((p, i) => ({
        name: p.name,
        count: 50 - i * 5, // Placeholder counts
      }));
      
      return {
        topProduct: topProducts[0] || null,
        topProducts,
      };
    }),

  staffPerformance: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId } = input;
      const staffResult = await db.listStaff(organizationId);
      
      // Generate mock performance data
      const rankings = staffResult.data.map((s: { id: number; name: string }, i: number) => ({
        staffId: s.id,
        name: s.name,
        revenue: 100000 - i * 15000,
        serviceCount: 30 - i * 3,
      })).sort((a: { revenue: number }, b: { revenue: number }) => b.revenue - a.revenue);
      
      return {
        rankings,
      };
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
// Treatment Record Router - 核心功能 1
// ============================================
const treatmentRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listTreatmentRecords(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getTreatmentRecordById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      treatmentDate: z.string(),
      treatmentType: z.string().optional(),
      treatmentArea: z.string().optional(),
      dosage: z.string().optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
      satisfactionScore: z.number().optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { treatmentDate, nextFollowUpDate, ...rest } = input;
      const data: any = {
        ...rest,
        treatmentDate: new Date(treatmentDate),
      };
      if (nextFollowUpDate) {
        data.nextFollowUpDate = nextFollowUpDate;
      }
      const id = await db.createTreatmentRecord(data);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      treatmentType: z.string().optional(),
      treatmentArea: z.string().optional(),
      dosage: z.string().optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
      satisfactionScore: z.number().optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateTreatmentRecord(id, data as any);
      return { success: true };
    }),

  getTimeline: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerTreatmentTimeline(input.customerId);
    }),

  // 療程照片相關
  listPhotos: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      treatmentRecordId: z.number().optional(),
      photoType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listTreatmentPhotos(input.customerId, input);
    }),

  uploadPhoto: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      treatmentRecordId: z.number().optional(),
      photoType: z.enum(["before", "after", "during", "other"]),
      photoUrl: z.string(),
      thumbnailUrl: z.string().optional(),
      photoDate: z.string(),
      angle: z.string().optional(),
      notes: z.string().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { photoDate, ...rest } = input;
      const id = await db.createTreatmentPhoto({
        ...rest,
        photoDate: new Date(photoDate),
      });
      return { id };
    }),

  getBeforeAfter: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      treatmentRecordId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getBeforeAfterPhotos(input.customerId, input.treatmentRecordId);
    }),
});

// ============================================
// Customer Package Router - 核心功能 2
// ============================================
const packageRouter = router({
  list: protectedProcedure
    .input(z.object({
      customerId: z.number().optional(),
      organizationId: z.number().optional(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      if (input.customerId) {
        return await db.listCustomerPackages(input.customerId, { status: input.status });
      }
      if (input.organizationId) {
        return await db.listOrganizationPackages(input.organizationId, input);
      }
      return [];
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerPackageById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      productId: z.number(),
      packageName: z.string(),
      totalSessions: z.number(),
      purchasePrice: z.string(),
      purchaseDate: z.string(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { purchaseDate, expiryDate, ...rest } = input;
      const id = await db.createCustomerPackage({
        ...rest,
        remainingSessions: input.totalSessions,
        purchaseDate: new Date(purchaseDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });
      return { id };
    }),

  deductSession: protectedProcedure
    .input(z.object({
      packageId: z.number(),
      sessionsToDeduct: z.number().optional(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      staffId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { packageId, sessionsToDeduct = 1, ...usageData } = input;
      
      // 扣除堂數
      const result = await db.deductPackageSession(packageId, sessionsToDeduct);
      
      // 建立使用記錄
      const pkg = await db.getCustomerPackageById(packageId);
      if (pkg) {
        await db.createPackageUsageRecord({
          packageId,
          customerId: pkg.customerId,
          sessionsUsed: sessionsToDeduct,
          usageDate: new Date(),
          ...usageData,
        });
      }
      
      return result;
    }),

  getUsageRecords: protectedProcedure
    .input(z.object({ packageId: z.number() }))
    .query(async ({ input }) => {
      return await db.listPackageUsageRecords(input.packageId);
    }),
});

// ============================================
// Consultation Router - 核心功能 3
// ============================================
const consultationRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
      staffId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listConsultations(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getConsultationById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      prospectName: z.string().optional(),
      prospectPhone: z.string().optional(),
      prospectEmail: z.string().optional(),
      consultationDate: z.string(),
      consultationType: z.enum(["walk_in", "phone", "online", "referral"]).optional(),
      staffId: z.number().optional(),
      interestedProducts: z.array(z.number()).optional(),
      concerns: z.string().optional(),
      recommendations: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { consultationDate, ...rest } = input;
      const id = await db.createConsultation({
        ...rest,
        consultationDate: new Date(consultationDate),
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "scheduled", "converted", "lost"]).optional(),
      staffId: z.number().optional(),
      recommendations: z.string().optional(),
      notes: z.string().optional(),
      convertedOrderId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (data.status === 'converted') {
        (data as any).conversionDate = new Date();
      }
      await db.updateConsultation(id, data as any);
      return { success: true };
    }),

  getConversionStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getConsultationConversionStats(input.organizationId);
    }),
});

// ============================================
// Follow-up Router - 核心功能 3
// ============================================
const followUpRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      consultationId: z.number().optional(),
      customerId: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listFollowUps(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      consultationId: z.number().optional(),
      customerId: z.number().optional(),
      staffId: z.number().optional(),
      followUpDate: z.string(),
      followUpType: z.enum(["call", "sms", "line", "email", "visit"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { followUpDate, ...rest } = input;
      const id = await db.createFollowUp({
        ...rest,
        followUpDate: new Date(followUpDate),
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "completed", "cancelled", "rescheduled"]).optional(),
      outcome: z.string().optional(),
      notes: z.string().optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, nextFollowUpDate, ...rest } = input;
      const data: any = { ...rest };
      if (nextFollowUpDate) data.nextFollowUpDate = new Date(nextFollowUpDate);
      await db.updateFollowUp(id, data);
      return { success: true };
    }),

  getPending: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getPendingFollowUps(input.organizationId, input.staffId);
    }),
});

// ============================================
// RFM Analysis Router - 核心功能 4
// ============================================
const rfmRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      segment: z.string().optional(),
      minChurnRisk: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listCustomerRfmScores(organizationId, options);
    }),

  getCustomerScore: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerRfmScore(input.customerId);
    }),

  calculate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const rfmData = await db.calculateCustomerRfm(input.organizationId, input.customerId);
      await db.upsertCustomerRfmScore({
        organizationId: input.organizationId,
        customerId: input.customerId,
        ...rfmData,
      });
      return rfmData;
    }),

  calculateAll: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .mutation(async ({ input }) => {
      const customers = await db.listCustomers(input.organizationId, { limit: 1000 });
      let processed = 0;
      
      for (const customer of customers.data) {
        const rfmData = await db.calculateCustomerRfm(input.organizationId, customer.id);
        await db.upsertCustomerRfmScore({
          organizationId: input.organizationId,
          customerId: customer.id,
          ...rfmData,
        });
        processed++;
      }
      
      return { processed };
    }),

  getChurnRiskList: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      minRisk: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const scores = await db.listCustomerRfmScores(input.organizationId, {
        minChurnRisk: input.minRisk || 50,
      });
      return scores.sort((a, b) => (b.churnRisk || 0) - (a.churnRisk || 0));
    }),
});

// ============================================
// Commission Router - 核心功能 6
// ============================================
const commissionRouter = router({
  listRules: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.listCommissionRules(input.organizationId);
    }),

  createRule: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      productId: z.number().optional(),
      productCategory: z.string().optional(),
      commissionType: z.enum(["percentage", "fixed"]).optional(),
      commissionValue: z.string(),
      minSalesAmount: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCommissionRule(input);
      return { id };
    }),

  updateRule: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      commissionType: z.enum(["percentage", "fixed"]).optional(),
      commissionValue: z.string().optional(),
      minSalesAmount: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCommissionRule(id, data as any);
      return { success: true };
    }),

  listCommissions: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listStaffCommissions(organizationId, options);
    }),

  createCommission: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      orderId: z.number().optional(),
      orderItemId: z.number().optional(),
      appointmentId: z.number().optional(),
      commissionRuleId: z.number().optional(),
      salesAmount: z.string(),
      commissionAmount: z.string(),
      commissionDate: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { commissionDate, ...rest } = input;
      const id = await db.createStaffCommission({
        ...rest,
        commissionDate: new Date(commissionDate),
      });
      return { id };
    }),

  updateCommissionStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "paid", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const data: any = { status: input.status };
      if (input.status === 'paid') data.paidAt = new Date();
      await db.updateStaffCommission(input.id, data);
      return { success: true };
    }),

  getStaffSummary: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.getStaffCommissionSummary(
        input.organizationId,
        input.staffId,
        new Date(input.startDate),
        new Date(input.endDate)
      );
    }),
});

// ============================================
// Inventory Router - 核心功能 7
// ============================================
const inventoryRouter = router({
  listTransactions: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number().optional(),
      transactionType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listInventoryTransactions(organizationId, options);
    }),

  createTransaction: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number(),
      transactionType: z.enum(["purchase", "sale", "adjustment", "return", "transfer", "waste"]),
      quantity: z.number(),
      unitCost: z.string().optional(),
      totalCost: z.string().optional(),
      referenceId: z.number().optional(),
      referenceType: z.string().optional(),
      batchNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
      staffId: z.number().optional(),
      transactionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { transactionDate, expiryDate, ...rest } = input;
      const data: any = {
        ...rest,
        transactionDate: new Date(transactionDate),
      };
      if (expiryDate) {
        data.expiryDate = expiryDate;
      }
      const id = await db.createInventoryTransaction(data);
      return { id };
    }),

  getCostAnalysis: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getProductCostAnalysis(input.organizationId, input.productId);
    }),

  getGrossMargin: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number(),
    }))
    .query(async ({ input }) => {
      const product = await db.getProductById(input.productId);
      const costAnalysis = await db.getProductCostAnalysis(input.organizationId, input.productId);
      
      if (!product) return { grossMargin: 0, marginRate: 0 };
      
      const sellingPrice = Number(product.price);
      const cost = costAnalysis.averageCost;
      const grossMargin = sellingPrice - cost;
      const marginRate = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;
      
      return { grossMargin, marginRate, sellingPrice, cost };
    }),
});

// ============================================
// Revenue Target Router - 核心功能 8
// ============================================
const revenueTargetRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      year: z.number().optional(),
      targetType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listRevenueTargets(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      targetType: z.enum(["monthly", "quarterly", "yearly"]).optional(),
      targetYear: z.number(),
      targetMonth: z.number().optional(),
      targetQuarter: z.number().optional(),
      targetAmount: z.string(),
      staffId: z.number().optional(),
      productCategory: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createRevenueTarget(input);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      targetAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateRevenueTarget(id, data as any);
      return { success: true };
    }),

  getAchievement: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      year: z.number(),
      month: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.calculateRevenueAchievement(input.organizationId, input.year, input.month);
    }),
});

// ============================================
// Marketing Campaign Router - 核心功能 9
// ============================================
const marketingRouter = router({
  listCampaigns: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listMarketingCampaigns(organizationId, options);
    }),

  createCampaign: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      campaignType: z.enum(["facebook", "google", "line", "instagram", "referral", "event", "other"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.string().optional(),
      targetAudience: z.string().optional(),
      description: z.string().optional(),
      trackingCode: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { startDate, endDate, ...rest } = input;
      const id = await db.createMarketingCampaign({
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      return { id };
    }),

  updateCampaign: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["draft", "active", "paused", "completed"]).optional(),
      actualSpend: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateMarketingCampaign(id, data as any);
      return { success: true };
    }),

  getSourceROI: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      campaignId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getSourceROIAnalysis(input.organizationId, input.campaignId);
    }),

  trackCustomerSource: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      campaignId: z.number().optional(),
      sourceType: z.string().optional(),
      sourceName: z.string().optional(),
      referralCode: z.string().optional(),
      referredByCustomerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCustomerSource({
        ...input,
        firstVisitDate: new Date(),
      });
      return { id };
    }),
});

// ============================================
// Satisfaction Survey Router - 核心功能 10
// ============================================
const satisfactionRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      status: z.string().optional(),
      surveyType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listSatisfactionSurveys(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      surveyType: z.enum(["post_treatment", "post_purchase", "general", "nps"]).optional(),
      staffId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createSatisfactionSurvey(input);
      return { id };
    }),

  submit: protectedProcedure
    .input(z.object({
      id: z.number(),
      overallScore: z.number().optional(),
      serviceScore: z.number().optional(),
      staffScore: z.number().optional(),
      facilityScore: z.number().optional(),
      valueScore: z.number().optional(),
      npsScore: z.number().optional(),
      wouldRecommend: z.boolean().optional(),
      feedback: z.string().optional(),
      improvementSuggestions: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSatisfactionSurvey(id, {
        ...data,
        status: 'completed',
        completedAt: new Date(),
      });
      return { success: true };
    }),

  getNPSStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getNPSStats(input.organizationId);
    }),

  getTrend: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      months: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getSatisfactionTrend(input.organizationId, input.months);
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
  report: reportRouter,
  // 核心功能模組
  treatment: treatmentRouter,
  package: packageRouter,
  consultation: consultationRouter,
  followUp: followUpRouter,
  rfm: rfmRouter,
  commission: commissionRouter,
  inventory: inventoryRouter,
  revenueTarget: revenueTargetRouter,
  marketing: marketingRouter,
  satisfaction: satisfactionRouter,
});

export type AppRouter = typeof appRouter;
