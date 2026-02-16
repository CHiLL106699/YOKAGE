import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';

/**
 * 獎品管理 Router
 * 基本 CRUD 架構：list, getById, create, update, delete
 */
export const prizeRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      gameId: z.number().optional(),
      type: z.enum(['coupon', 'product', 'points', 'custom']).optional(),
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
      gameId: z.number(),
      name: z.string().min(1),
      type: z.enum(['coupon', 'product', 'points', 'custom']),
      value: z.number().optional(),
      quantity: z.number().default(1),
      probability: z.number().min(0).max(1).optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, id: Date.now() };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(['coupon', 'product', 'points', 'custom']).optional(),
      value: z.number().optional(),
      quantity: z.number().optional(),
      probability: z.number().min(0).max(1).optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
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
