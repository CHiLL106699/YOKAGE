import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';

/**
 * 出勤設定 Router
 * 基本 CRUD 架構：list, getById, create, update, delete
 */
export const attendanceSettingsRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return { data: [], total: 0 };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return null;
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      clockInTime: z.string().optional(),
      clockOutTime: z.string().optional(),
      lateThresholdMinutes: z.number().default(15),
      earlyLeaveThresholdMinutes: z.number().default(15),
      requireLocation: z.boolean().default(false),
      locationLatitude: z.number().optional(),
      locationLongitude: z.number().optional(),
      locationRadius: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, id: Date.now() };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      clockInTime: z.string().optional(),
      clockOutTime: z.string().optional(),
      lateThresholdMinutes: z.number().optional(),
      earlyLeaveThresholdMinutes: z.number().optional(),
      requireLocation: z.boolean().optional(),
      locationLatitude: z.number().optional(),
      locationLongitude: z.number().optional(),
      locationRadius: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
});
