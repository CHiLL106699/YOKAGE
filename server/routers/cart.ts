/**
 * Cart Router — 購物車管理
 * 用於 LiffCartPage / LiffShopPage
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db';
import { cartItems } from '../../drizzle/staff-tasks-schema';

export const cartRouter = router({
  /** 取得購物車列表 */
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db.select()
        .from(cartItems)
        .where(and(
          eq(cartItems.organizationId, input.organizationId),
          eq(cartItems.customerId, input.customerId),
        ));
    }),

  /** 加入購物車 */
  add: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      productId: z.number(),
      productName: z.string(),
      productImage: z.string().optional(),
      specs: z.string().optional(),
      price: z.number(),
      originalPrice: z.number().optional(),
      quantity: z.number().default(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      // Check if item already exists
      const existing = await db.select()
        .from(cartItems)
        .where(and(
          eq(cartItems.organizationId, input.organizationId),
          eq(cartItems.customerId, input.customerId),
          eq(cartItems.productId, input.productId),
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(cartItems)
          .set({ quantity: existing[0].quantity + input.quantity, updatedAt: new Date() })
          .where(eq(cartItems.id, existing[0].id));
        return { id: existing[0].id, success: true };
      }

      const [result] = await db.insert(cartItems).values({
        organizationId: input.organizationId,
        customerId: input.customerId,
        productId: input.productId,
        productName: input.productName,
        productImage: input.productImage,
        specs: input.specs,
        price: input.price,
        originalPrice: input.originalPrice,
        quantity: input.quantity,
      }).returning();

      return { id: result.id, success: true };
    }),

  /** 更新數量 */
  updateQuantity: protectedProcedure
    .input(z.object({
      id: z.number(),
      quantity: z.number().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      await db.update(cartItems)
        .set({ quantity: input.quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, input.id));

      return { success: true };
    }),

  /** 切換選取狀態 */
  toggleSelect: protectedProcedure
    .input(z.object({
      id: z.number(),
      selected: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      await db.update(cartItems)
        .set({ selected: input.selected, updatedAt: new Date() })
        .where(eq(cartItems.id, input.id));

      return { success: true };
    }),

  /** 刪除購物車項目 */
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      await db.delete(cartItems).where(eq(cartItems.id, input.id));
      return { success: true };
    }),

  /** 清空購物車 */
  clear: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      await db.delete(cartItems).where(and(
        eq(cartItems.organizationId, input.organizationId),
        eq(cartItems.customerId, input.customerId),
      ));
      return { success: true };
    }),
});

export type CartRouter = typeof cartRouter;
