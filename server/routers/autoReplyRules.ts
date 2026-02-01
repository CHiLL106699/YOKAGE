import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { db } from '../db';
import { autoReplyRules } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const autoReplyRulesRouter = router({
  /**
   * 查詢自動回覆規則列表
   */
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const rules = await db
        .select()
        .from(autoReplyRules)
        .where(eq(autoReplyRules.organizationId, input.organizationId))
        .orderBy(desc(autoReplyRules.priority), desc(autoReplyRules.createdAt));

      return rules;
    }),

  /**
   * 取得單一自動回覆規則
   */
  get: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const [rule] = await db
        .select()
        .from(autoReplyRules)
        .where(eq(autoReplyRules.id, input.id))
        .limit(1);

      if (!rule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Auto-reply rule not found',
        });
      }

      return rule;
    }),

  /**
   * 新增自動回覆規則
   */
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      triggerType: z.enum(['keyword', 'regex', 'always']),
      triggerValue: z.string().optional(),
      replyType: z.enum(['text', 'flex', 'template']),
      replyContent: z.string().min(1),
      isActive: z.boolean().default(true),
      priority: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const [result] = await db.insert(autoReplyRules).values({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { id: result.insertId };
    }),

  /**
   * 更新自動回覆規則
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      triggerType: z.enum(['keyword', 'regex', 'always']).optional(),
      triggerValue: z.string().optional(),
      replyType: z.enum(['text', 'flex', 'template']).optional(),
      replyContent: z.string().optional(),
      isActive: z.boolean().optional(),
      priority: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      await db
        .update(autoReplyRules)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(autoReplyRules.id, id));

      return { success: true };
    }),

  /**
   * 刪除自動回覆規則
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db
        .delete(autoReplyRules)
        .where(eq(autoReplyRules.id, input.id));

      return { success: true };
    }),

  /**
   * 切換規則啟用狀態
   */
  toggleActive: protectedProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db
        .update(autoReplyRules)
        .set({
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(eq(autoReplyRules.id, input.id));

      return { success: true };
    }),

  /**
   * 更新規則優先級
   */
  updatePriority: protectedProcedure
    .input(z.object({
      id: z.number(),
      priority: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db
        .update(autoReplyRules)
        .set({
          priority: input.priority,
          updatedAt: new Date(),
        })
        .where(eq(autoReplyRules.id, input.id));

      return { success: true };
    }),
});
