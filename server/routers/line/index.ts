/**
 * lineRouter — YaoYouQian 強化層
 * 包含 YaoYouQian LINE 版本的專屬功能
 */
import { router, protectedProcedure, publicProcedure } from "../../_core/trpc";
import { z } from "zod";
import * as db from "../../db";

// ============================================
// LIFF Auth Router (LINE)
// ============================================
const liffAuthRouter = router({
  verifyToken: publicProcedure
    .input(z.object({
      accessToken: z.string(),
      idToken: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, userId: null as string | null };
    }),
  linkAccount: protectedProcedure
    .input(z.object({
      lineUserId: z.string(),
      displayName: z.string().optional(),
      pictureUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),
});

// ============================================
// LINE Pay Router (LINE)
// ============================================
const linePayRouter = router({
  requestPayment: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      orderId: z.number(),
      amount: z.number(),
      currency: z.string().default("TWD"),
      productName: z.string(),
    }))
    .mutation(async ({ input }) => {
      return {
        returnCode: "0000",
        paymentUrl: null as string | null,
        transactionId: null as string | null,
      };
    }),
  confirmPayment: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
  refund: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      refundAmount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
});

// ============================================
// LIFF Booking Router (LINE) — 預約功能
// ============================================
const liffBookingRouter = router({
  availableSlots: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      // 查詢該日期的預約，計算可用時段
      const appointments = await db.listAppointments(input.organizationId, {
        date: input.date,
        staffId: input.staffId,
      });
      return { date: input.date, bookedSlots: appointments };
    }),
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
      appointmentDate: z.string(),
      startTime: z.string(),
      endTime: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createAppointment({
        organizationId: input.organizationId,
        customerId: ctx.user.id,
        staffId: input.staffId,
        appointmentDate: input.appointmentDate,
        startTime: input.startTime,
        endTime: input.endTime,
        notes: input.notes,
        status: "confirmed",
      });
      return { id, success: true };
    }),
  myBookings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return await db.listAppointments(input.organizationId);
    }),
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateAppointment(input.id, { status: "cancelled" });
      return { success: true };
    }),
  reschedule: protectedProcedure
    .input(z.object({
      id: z.number(),
      appointmentDate: z.string(),
      startTime: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAppointment(id, data);
      return { success: true };
    }),
});

// ============================================
// LIFF Shop Router (LINE)
// ============================================
const liffShopRouter = router({
  products: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      category: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listProducts(organizationId, options);
    }),
  productDetail: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductById(input.id);
    }),
});

// ============================================
// LIFF Member Router (LINE) — 會員中心（含預約管理）
// ============================================
const liffMemberRouter = router({
  profile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),
  // 會員中心 — 預約查詢/取消/修改
  appointments: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return await db.listAppointments(input.organizationId);
    }),
  cancelAppointment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateAppointment(input.id, { status: "cancelled" });
      return { success: true };
    }),
  rescheduleAppointment: protectedProcedure
    .input(z.object({
      id: z.number(),
      appointmentDate: z.string(),
      startTime: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAppointment(id, data);
      return { success: true };
    }),
  points: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async () => {
      return { balance: 0, history: [] as any[] };
    }),
  vouchers: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return { data: [] as any[], total: 0 };
    }),
});

// ============================================
// 匯出 lineEnhancedRouter
// ============================================
export const lineEnhancedRouter = router({
  liffAuth: liffAuthRouter,
  linePay: linePayRouter,
  liffBooking: liffBookingRouter,
  liffShop: liffShopRouter,
  liffMember: liffMemberRouter,
});

export type LineEnhancedRouter = typeof lineEnhancedRouter;
