import { router, protectedProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { db } from '../db.js';
import { crmTagsSystemB, customerTagsSystemB } from '../../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

export const crmTagsRouter = router({
  // 列出所有標籤
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const tags = await db
        .select()
        .from(crmTagsSystemB)
        .where(eq(crmTagsSystemB.organizationId, input.organizationId));
      return tags;
    }),

  // 建立標籤
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      color: z.string().optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.insert(crmTagsSystemB).values({
        organizationId: 1, // TODO: Get from ctx.user
        name: input.name,
        color: input.color || '#3B82F6'
      });
      return { success: true, id: 1 }; // TODO: Return actual insertId
    }),

  // 更新標籤
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      color: z.string().optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(crmTagsSystemB)
        .set({
          name: input.name,
          color: input.color
        })
        .where(and(
          eq(crmTagsSystemB.id, input.id),
          eq(crmTagsSystemB.organizationId, 1) // TODO: Get from ctx.user
        ));
      return { success: true };
    }),

  // 刪除標籤
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 先刪除所有客戶標籤關聯
      await db
        .delete(customerTagsSystemB)
        .where(eq(customerTagsSystemB.tagId, input.id));
      
      // 再刪除標籤本身
      await db
        .delete(crmTagsSystemB)
        .where(and(
          eq(crmTagsSystemB.id, input.id),
          eq(crmTagsSystemB.organizationId, 1) // TODO: Get from ctx.user
        ));
      return { success: true };
    }),

  // 為客戶分配標籤
  assignToCustomer: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      tagId: z.number()
    }))
    .mutation(async ({ input }) => {
      await db.insert(customerTagsSystemB).values({
        customerId: input.customerId,
        tagId: input.tagId
      });
      return { success: true };
    }),

  // 移除客戶標籤
  removeFromCustomer: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      tagId: z.number()
    }))
    .mutation(async ({ input }) => {
      await db
        .delete(customerTagsSystemB)
        .where(and(
          eq(customerTagsSystemB.customerId, input.customerId),
          eq(customerTagsSystemB.tagId, input.tagId)
        ));
      return { success: true };
    }),

  // 查詢客戶的所有標籤
  getCustomerTags: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const tags = await db
        .select({
          id: crmTagsSystemB.id,
          name: crmTagsSystemB.name,
          color: crmTagsSystemB.color
        })
        .from(customerTagsSystemB)
        .innerJoin(crmTagsSystemB, eq(customerTagsSystemB.tagId, crmTagsSystemB.id))
        .where(eq(customerTagsSystemB.customerId, input.customerId));
      return tags;
    }),

  // 按標籤篩選客戶
  getCustomersByTag: protectedProcedure
    .input(z.object({ tagId: z.number() }))
    .query(async ({ input }) => {
      const customers = await db
        .select({
          customerId: customerTagsSystemB.customerId
        })
        .from(customerTagsSystemB)
        .where(eq(customerTagsSystemB.tagId, input.tagId));
      return customers.map(c => c.customerId);
    })
});
