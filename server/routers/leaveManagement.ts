import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { leaveRequests } from "../../drizzle/schema";

type LeaveType = '病假' | '事假' | '特休' | '育嬰假' | '喪假' | '婚假' | '產假' | '陪產假' | '其他';

export const leaveManagementRouter = router({
  /**
   * 員工提交請假申請
   */
  submitLeaveRequest: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        leaveType: z.enum(['病假', '事假', '特休', '育嬰假', '喪假', '婚假', '產假', '陪產假', '其他']),
        startDate: z.string(), // ISO 8601 date string
        endDate: z.string(), // ISO 8601 date string
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const leaveId = crypto.randomUUID();

      await db.insert(leaveRequests).values({
        id: leaveId,
        clinicId: input.clinicId,
        staffId: ctx.user.openId,
        leaveType: input.leaveType,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        reason: input.reason,
        status: 'pending',
      });

      const [newLeave] = await db
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.id, leaveId))
        .limit(1);

      return {
        success: true,
        leave: newLeave,
      };
    }),

  /**
   * 查詢我的請假記錄
   */
  getMyLeaveRequests: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const conditions: any[] = [
        eq(leaveRequests.clinicId, input.clinicId),
        eq(leaveRequests.staffId, ctx.user.openId),
      ];

      if (input.status && input.status !== 'all') {
        conditions.push(eq(leaveRequests.status, input.status));
      }

      if (input.startDate) {
        conditions.push(gte(leaveRequests.startDate, new Date(input.startDate)));
      }

      if (input.endDate) {
        conditions.push(lte(leaveRequests.endDate, new Date(input.endDate)));
      }

      const leaves = await db
        .select()
        .from(leaveRequests)
        .where(and(...conditions))
        .orderBy(desc(leaveRequests.createdAt));

      return leaves;
    }),

  /**
   * 管理員查詢待審核請假
   */
  getPendingLeaveRequests: adminProcedure
    .input(
      z.object({
        clinicId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const leaves = await db
        .select()
        .from(leaveRequests)
        .where(
          and(
            eq(leaveRequests.clinicId, input.clinicId),
            eq(leaveRequests.status, 'pending')
          )
        )
        .orderBy(desc(leaveRequests.createdAt));

      return leaves;
    }),

  /**
   * 管理員批准請假
   */
  approveLeaveRequest: adminProcedure
    .input(
      z.object({
        leaveId: z.string(),
        reviewNote: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(leaveRequests)
        .set({
          status: 'approved',
          reviewerId: ctx.user.openId,
          reviewedAt: new Date(),
          reviewNote: input.reviewNote,
        })
        .where(eq(leaveRequests.id, input.leaveId));

      const [updatedLeave] = await db
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.id, input.leaveId))
        .limit(1);

      return {
        success: true,
        leave: updatedLeave,
      };
    }),

  /**
   * 管理員拒絕請假
   */
  rejectLeaveRequest: adminProcedure
    .input(
      z.object({
        leaveId: z.string(),
        reviewNote: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(leaveRequests)
        .set({
          status: 'rejected',
          reviewerId: ctx.user.openId,
          reviewedAt: new Date(),
          reviewNote: input.reviewNote,
        })
        .where(eq(leaveRequests.id, input.leaveId));

      const [updatedLeave] = await db
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.id, input.leaveId))
        .limit(1);

      return {
        success: true,
        leave: updatedLeave,
      };
    }),

  /**
   * 查詢請假統計
   */
  getLeaveStatistics: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        year: z.number(),
        month: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // 計算日期範圍
      const startDate = input.month
        ? new Date(input.year, input.month - 1, 1)
        : new Date(input.year, 0, 1);
      const endDate = input.month
        ? new Date(input.year, input.month, 0, 23, 59, 59)
        : new Date(input.year, 11, 31, 23, 59, 59);

      const leaves = await db
        .select()
        .from(leaveRequests)
        .where(
          and(
            eq(leaveRequests.clinicId, input.clinicId),
            eq(leaveRequests.staffId, ctx.user.openId),
            gte(leaveRequests.startDate, startDate),
            lte(leaveRequests.endDate, endDate)
          )
        );

      // 統計各類型請假天數
      const statistics = leaves.reduce((acc: Record<string, { count: number; days: number }>, leave: typeof leaveRequests.$inferSelect) => {
        const days = Math.ceil(
          (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (!acc[leave.leaveType]) {
          acc[leave.leaveType] = { count: 0, days: 0 };
        }

        acc[leave.leaveType].count += 1;
        acc[leave.leaveType].days += days;

        return acc;
      }, {} as Record<string, { count: number; days: number }>);

      const totalDays = Object.entries(statistics).reduce(
        (sum, [_, stat]) => sum + stat.days,
        0
      );

      return {
        statistics,
        totalLeaves: leaves.length,
        totalDays,
      };
    }),

  /**
   * 查詢所有員工請假記錄（管理員專用）
   */
  getAllLeaveRequests: adminProcedure
    .input(
      z.object({
        clinicId: z.string(),
        status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const conditions: any[] = [eq(leaveRequests.clinicId, input.clinicId)];

      if (input.status && input.status !== 'all') {
        conditions.push(eq(leaveRequests.status, input.status));
      }

      if (input.startDate) {
        conditions.push(gte(leaveRequests.startDate, new Date(input.startDate)));
      }

      if (input.endDate) {
        conditions.push(lte(leaveRequests.endDate, new Date(input.endDate)));
      }

      const leaves = await db
        .select()
        .from(leaveRequests)
        .where(and(...conditions))
        .orderBy(desc(leaveRequests.createdAt));

      return leaves;
    }),
});
