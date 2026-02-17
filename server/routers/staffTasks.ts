/**
 * Staff Tasks Router — 員工任務管理
 * 用於 LiffStaffTasksPage
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';
import { getDb } from '../db';
import { staffTasks } from '../../drizzle/staff-tasks-schema';

export const staffTasksRouter = router({
  /** 取得員工任務列表 */
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
      status: z.string().optional(),
      date: z.string().optional(), // YYYY-MM-DD
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { today: [], upcoming: [], overdue: [] };

      const conditions: any[] = [
        eq(staffTasks.organizationId, input.organizationId),
      ];
      if (input.staffId) {
        conditions.push(eq(staffTasks.staffId, input.staffId));
      }
      if (input.status && input.status !== 'all') {
        conditions.push(eq(staffTasks.status, input.status));
      }

      const tasks = await db.select()
        .from(staffTasks)
        .where(and(...conditions))
        .orderBy(asc(staffTasks.dueDate), asc(staffTasks.dueTime));

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      const today = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = t.dueDate.toISOString().split('T')[0];
        return d === todayStr && t.status !== 'completed';
      });
      const upcoming = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = t.dueDate.toISOString().split('T')[0];
        return d > todayStr && t.status !== 'completed';
      });
      const overdue = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = t.dueDate.toISOString().split('T')[0];
        return d < todayStr && t.status !== 'completed';
      });

      return { today, upcoming, overdue };
    }),

  /** 更新任務狀態 */
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'in_progress', 'completed']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      };
      if (input.status === 'completed') {
        updateData.completedAt = new Date();
      }
      if (input.notes) {
        updateData.notes = input.notes;
      }

      await db.update(staffTasks)
        .set(updateData)
        .where(eq(staffTasks.id, input.id));

      return { success: true };
    }),

  /** 建立任務 */
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      type: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(['high', 'normal', 'low']).optional(),
      dueDate: z.string().optional(),
      dueTime: z.string().optional(),
      relatedCustomerId: z.number().optional(),
      relatedCustomerName: z.string().optional(),
      relatedCustomerPhone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      const [result] = await db.insert(staffTasks).values({
        organizationId: input.organizationId,
        staffId: input.staffId,
        type: input.type ?? 'general',
        title: input.title,
        description: input.description,
        priority: input.priority ?? 'normal',
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        dueTime: input.dueTime,
        relatedCustomerId: input.relatedCustomerId,
        relatedCustomerName: input.relatedCustomerName,
        relatedCustomerPhone: input.relatedCustomerPhone,
      }).returning();

      return { id: result.id, success: true };
    }),
});

export type StaffTasksRouter = typeof staffTasksRouter;
