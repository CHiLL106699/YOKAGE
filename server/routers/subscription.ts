import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { db } from '../db';
import { subscriptions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const subscriptionRouter = router({
  // 取得所有訂閱方案
  list: protectedProcedure.query(async () => {
    const plans = await db.select().from(subscriptions);
    return plans;
  }),

  // 取得單一訂閱方案
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [plan] = await db.select().from(subscriptions).where(eq(subscriptions.id, input.id));
      return plan;
    }),

  // 建立訂閱方案
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      price: z.number(),
      features: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const [newPlan] = await db.insert(subscriptions).values({
        id: `plan_${Date.now()}`,
        name: input.name,
        price: input.price,
        features: input.features,
      }).returning();
      return newPlan;
    }),

  // 更新訂閱方案
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      price: z.number().optional(),
      features: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const [updatedPlan] = await db.update(subscriptions)
        .set(updateData)
        .where(eq(subscriptions.id, id))
        .returning();
      return updatedPlan;
    }),

  // 刪除訂閱方案
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(subscriptions).where(eq(subscriptions.id, input.id));
      return { success: true };
    }),
});
