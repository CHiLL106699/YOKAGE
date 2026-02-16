import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';

/**
 * 遊戲化行銷 Router
 * 基本 CRUD 架構：list, getById, create, update, delete
 */
export const gameRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      type: z.enum(['ichiban_kuji', 'slot_machine', 'pachinko', 'scratch_card']).optional(),
      status: z.enum(['active', 'inactive', 'ended']).optional(),
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
      type: z.enum(['ichiban_kuji', 'slot_machine', 'pachinko', 'scratch_card']),
      description: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      maxParticipations: z.number().optional(),
      costPerPlay: z.number().default(0),
      rules: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, id: Date.now() };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      maxParticipations: z.number().optional(),
      costPerPlay: z.number().optional(),
      status: z.enum(['active', 'inactive', 'ended']).optional(),
      rules: z.record(z.string(), z.any()).optional(),
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
