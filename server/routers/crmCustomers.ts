import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { customers, customerTags, customerTagRelations } from "../../drizzle/schema";
import { eq, and, inArray, like, or } from "drizzle-orm";

export const crmCustomersRouter = router({
  // 查詢客戶列表（支援按標籤篩選、搜尋）
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        tagIds: z.array(z.number()).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { organizationId, tagIds, search } = input;

      // 建立基礎查詢條件
      const conditions = [eq(customers.organizationId, organizationId)];

      // 如果有搜尋關鍵字，加入搜尋條件
      if (search) {
        conditions.push(
          or(
            like(customers.name, `%${search}%`),
            like(customers.phone, `%${search}%`),
            like(customers.email, `%${search}%`)
          )!
        );
      }

      const allCustomers = await db
        .select()
        .from(customers)
        .where(and(...conditions));

      // 如果有標籤篩選，進一步篩選客戶
      if (tagIds && tagIds.length > 0) {
        const customerIdsWithTags = await db
          .select({ customerId: customerTagRelations.customerId })
          .from(customerTagRelations)
          .where(inArray(customerTagRelations.tagId, tagIds));

        const customerIds = customerIdsWithTags.map((r) => r.customerId);
        return allCustomers.filter((c) => customerIds.includes(c.id));
      }

      return allCustomers;
    }),

  // 新增客戶
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        lineUserId: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        birthday: z.date().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { birthday, ...rest } = input;
      const [newCustomer] = await db.insert(customers).values({
        ...rest,
        birthday: birthday?.toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return { success: true, customerId: newCustomer.id };
    }),

  // 更新客戶
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        lineUserId: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        birthday: z.date().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
        source: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, birthday, ...updateData } = input;

      await db
        .update(customers)
        .set({
          ...updateData,
          ...(birthday !== undefined ? { birthday: birthday.toISOString().split('T')[0] } : {}),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, id));

      return { success: true };
    }),

  // 刪除客戶
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // 先刪除客戶的所有標籤關聯
      await db
        .delete(customerTagRelations)
        .where(eq(customerTagRelations.customerId, input.id));

      // 再刪除客戶
      await db.delete(customers).where(eq(customers.id, input.id));

      return { success: true };
    }),

  // 為客戶新增標籤
  addTag: protectedProcedure
    .input(
      z.object({
        customerId: z.number(),
        tagId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(customerTagRelations).values({
        customerId: input.customerId,
        tagId: input.tagId,
        createdAt: new Date(),
      });

      return { success: true };
    }),

  // 為客戶移除標籤
  removeTag: protectedProcedure
    .input(
      z.object({
        customerId: z.number(),
        tagId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(customerTagRelations)
        .where(
          and(
            eq(customerTagRelations.customerId, input.customerId),
            eq(customerTagRelations.tagId, input.tagId)
          )
        );

      return { success: true };
    }),

  // 查詢客戶的所有標籤
  getCustomerTags: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const relations = await db
        .select()
        .from(customerTagRelations)
        .where(eq(customerTagRelations.customerId, input.customerId));

      const tagIds = relations.map((r) => r.tagId);

      if (tagIds.length === 0) {
        return [];
      }

      const tags = await db
        .select()
        .from(customerTags)
        .where(inArray(customerTags.id, tagIds));

      return tags;
    }),
});
