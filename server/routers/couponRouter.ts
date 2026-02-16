import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';

/**
 * 優惠券管理 Router
 * 基本 CRUD 架構：list, getById, create, update, delete
 */
export const couponRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      status: z.enum(['active', 'expired', 'disabled']).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      return { data: [], total: 0, page: input?.page ?? 1, limit: input?.limit ?? 20 };
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
      code: z.string().min(1),
      type: z.enum(['percentage', 'fixed_amount', 'free_item']),
      value: z.number(),
      minPurchase: z.number().optional(),
      maxDiscount: z.number().optional(),
      usageLimit: z.number().optional(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, id: Date.now() };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      code: z.string().optional(),
      type: z.enum(['percentage', 'fixed_amount', 'free_item']).optional(),
      value: z.number().optional(),
      minPurchase: z.number().optional(),
      maxDiscount: z.number().optional(),
      usageLimit: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['active', 'expired', 'disabled']).optional(),
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
