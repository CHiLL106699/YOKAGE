/**
 * coreRouter — 共用層
 * 包含兩個產品線（YOKAGE / YaoYouQian）共用的核心功能
 */
import { router, protectedProcedure, publicProcedure } from "../../_core/trpc";
import { z } from "zod";
import * as db from "../../db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../../_core/cookies";

// === 從既有 router 檔案 import ===
import { appointmentRouter as newAppointmentRouter } from "../appointment";
import { customerRouter as newCustomerRouter } from "../customer";
import { staffRouter as newStaffRouter } from "../staff";
import { notificationRouter } from "../notification";
import { lineWebhookRouter } from "../lineWebhook";
import { gameRouter as gamificationRouter } from "../game";

// ============================================
// Auth Router (Core)
// ============================================
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  getUserRoles: protectedProcedure.query(async ({ ctx }) => {
    const roles = await db.getUserOrganizations(ctx.user.id);
    const baseRole = ctx.user.role;
    return {
      userId: ctx.user.id,
      baseRole,
      tenantRoles: roles.map((r: any) => ({
        tenantId: r.id,
        tenantName: r.name,
        tenantSlug: r.slug,
        role: r.role || "staff",
      })),
    };
  }),
});

// ============================================
// Tenant Router (Core)
// ============================================
const tenantRouter = router({
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
// Schedule Router (Core)
// ============================================
const scheduleRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        staffId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await db.listSchedules(input.organizationId, input);
    }),
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        staffId: z.number(),
        scheduleDate: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        shiftType: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await db.createSchedule(input);
      return { id };
    }),
});

// ============================================
// Clock Router (Core) — 打卡功能
// ============================================
const clockRouter = router({
  clockIn: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        staffId: z.number(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().split("T")[0];
      const record = await db.createAttendanceRecord({
        organizationId: input.organizationId,
        staffId: input.staffId,
        recordDate: today,
        clockIn: new Date(),
        checkInLatitude: input.latitude?.toString(),
        checkInLongitude: input.longitude?.toString(),
        status: "normal",
      });
      return record;
    }),
  clockOut: protectedProcedure
    .input(
      z.object({
        recordId: z.number(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateAttendanceRecord(input.recordId, {
        clockOut: new Date(),
        checkOutLatitude: input.latitude?.toString(),
        checkOutLongitude: input.longitude?.toString(),
      });
      return { success: true };
    }),
  myRecords: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        staffId: z.number().optional(),
        date: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await db.listAttendanceRecords(input.organizationId, {
        staffId: input.staffId,
        date: input.date,
      });
    }),
  todayStatus: protectedProcedure
    .input(z.object({ organizationId: z.number(), staffId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split("T")[0];
      const records = await db.listAttendanceRecords(input.organizationId, {
        staffId: input.staffId,
        date: today,
      });
      return records.length > 0 ? records[0] : null;
    }),
});

// ============================================
// 匯出 coreRouter
// ============================================
export const coreRouter = router({
  auth: authRouter,
  tenant: tenantRouter,
  appointment: newAppointmentRouter,
  customer: newCustomerRouter,
  staff: newStaffRouter,
  schedule: scheduleRouter,
  clock: clockRouter,
  notification: notificationRouter,
  lineWebhook: lineWebhookRouter,
  gamification: gamificationRouter,
});

export type CoreRouter = typeof coreRouter;
