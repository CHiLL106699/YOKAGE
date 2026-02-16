import { router, protectedProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { db } from '../db.js';
import { crmTagsSystemB, customerTagsSystemB, organizationUsers } from '../../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * 取得使用者所屬的第一個 organizationId
 * 透過 organizationUsers 表查詢，確保多租戶隔離
 */
async function getUserOrganizationId(userId: number): Promise<number> {
  const result = await db
    .select({ organizationId: organizationUsers.organizationId })
    .from(organizationUsers)
    .where(eq(organizationUsers.userId, userId))
    .limit(1);

  if (result.length === 0) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '使用者未隸屬於任何組織',
    });
  }
  return result[0].organizationId;
}

export const crmTagsRouter = router({
  // 列出所有標籤
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = input?.organizationId ?? await getUserOrganizationId(ctx.user.id);
      const tags = await db
        .select()
        .from(crmTagsSystemB)
        .where(eq(crmTagsSystemB.organizationId, orgId));
      return tags;
    }),

  // 建立標籤 (M-03: 使用 .returning() 回傳真實 ID)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      color: z.string().optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = await getUserOrganizationId(ctx.user.id);
      const result = await db.insert(crmTagsSystemB).values({
        organizationId: orgId,
        name: input.name,
        color: input.color || '#3B82F6'
      }).returning({ id: crmTagsSystemB.id });
      return { success: true, id: result[0].id };
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
      const orgId = await getUserOrganizationId(ctx.user.id);
      await db
        .update(crmTagsSystemB)
        .set({
          name: input.name,
          color: input.color
        })
        .where(and(
          eq(crmTagsSystemB.id, input.id),
          eq(crmTagsSystemB.organizationId, orgId)
        ));
      return { success: true };
    }),

  // 刪除標籤
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const orgId = await getUserOrganizationId(ctx.user.id);
      // 先刪除所有客戶標籤關聯
      await db
        .delete(customerTagsSystemB)
        .where(eq(customerTagsSystemB.tagId, input.id));

      // 再刪除標籤本身
      await db
        .delete(crmTagsSystemB)
        .where(and(
          eq(crmTagsSystemB.id, input.id),
          eq(crmTagsSystemB.organizationId, orgId)
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
