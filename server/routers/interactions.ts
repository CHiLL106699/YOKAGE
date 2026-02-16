import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { interactions } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const interactionsRouter = router({
  // 查詢客戶的所有互動記錄
  list: protectedProcedure
    .input(
      z.object({
        customerId: z.number(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const { customerId, limit, offset } = input;

      const records = await db
        .select()
        .from(interactions)
        .where(eq(interactions.customerId, customerId))
        .orderBy(desc(interactions.createdAt))
        .limit(limit)
        .offset(offset);

      return records;
    }),

  // 新增互動記錄
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        customerId: z.number(),
        type: z.enum(["phone", "meeting", "line", "appointment", "treatment", "note"]),
        title: z.string().min(1),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [record] = await db.insert(interactions).values({
        ...input,
        createdBy: ctx.user.id,
      }).returning();

      return { success: true, id: record.id };
    }),

  // 更新互動記錄
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;

      await db
        .update(interactions)
        .set(updates)
        .where(eq(interactions.id, id));

      return { success: true };
    }),

  // 刪除互動記錄
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.delete(interactions).where(eq(interactions.id, input.id));

      return { success: true };
    }),
});
