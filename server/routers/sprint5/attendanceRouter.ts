/**
 * Sprint 5: 智慧打卡系統強化 Router
 * 功能：GPS 打卡、月統計、補打卡申請/審核、加班申請
 */
import { z } from 'zod';
import { eq, and, desc, sql, between, asc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../../_core/trpc';
import { getDb } from '../../db';
import { attendanceRecords, staff } from '../../../drizzle/schema';

// ============================================
// 智慧打卡系統強化 Router
// ============================================
export const sprint5AttendanceRouter = router({
  // --- GPS 打卡（上班） ---
  clockIn: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // 檢查今天是否已打過上班卡
      const existing = await db.select()
        .from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.organizationId, input.organizationId),
          eq(attendanceRecords.staffId, input.staffId),
          sql`${attendanceRecords.recordDate} = ${today}`,
        ))
        .limit(1);

      if (existing.length > 0 && existing[0].clockIn) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '今天已經打過上班卡了' });
      }

      if (existing.length > 0) {
        // 更新既有記錄
        await db.update(attendanceRecords)
          .set({
            clockIn: now,
            checkInLatitude: String(input.latitude),
            checkInLongitude: String(input.longitude),
            checkInAccuracy: input.accuracy ? String(input.accuracy) : null,
            checkInAddress: input.address ?? null,
          })
          .where(eq(attendanceRecords.id, existing[0].id));
        return { id: existing[0].id, success: true, time: now.toISOString() };
      }

      const [result] = await db.insert(attendanceRecords)
        .values({
          organizationId: input.organizationId,
          staffId: input.staffId,
          recordDate: today,
          clockIn: now,
          checkInLatitude: String(input.latitude),
          checkInLongitude: String(input.longitude),
          checkInAccuracy: input.accuracy ? String(input.accuracy) : null,
          checkInAddress: input.address ?? null,
          status: 'normal',
          isManualEntry: false,
        })
        .returning();

      return { id: result.id, success: true, time: now.toISOString() };
    }),

  // --- GPS 打卡（下班） ---
  clockOut: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const existing = await db.select()
        .from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.organizationId, input.organizationId),
          eq(attendanceRecords.staffId, input.staffId),
          sql`${attendanceRecords.recordDate} = ${today}`,
        ))
        .limit(1);

      if (existing.length === 0 || !existing[0].clockIn) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '尚未打上班卡，無法打下班卡' });
      }

      if (existing[0].clockOut) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '今天已經打過下班卡了' });
      }

      await db.update(attendanceRecords)
        .set({
          clockOut: now,
          checkOutLatitude: String(input.latitude),
          checkOutLongitude: String(input.longitude),
          checkOutAccuracy: input.accuracy ? String(input.accuracy) : null,
          checkOutAddress: input.address ?? null,
        })
        .where(eq(attendanceRecords.id, existing[0].id));

      return { id: existing[0].id, success: true, time: now.toISOString() };
    }),

  // --- 今日打卡狀態 ---
  todayStatus: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const today = new Date().toISOString().split('T')[0];

      const result = await db.select()
        .from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.organizationId, input.organizationId),
          eq(attendanceRecords.staffId, input.staffId),
          sql`${attendanceRecords.recordDate} = ${today}`,
        ))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),

  // --- 出勤記錄列表 ---
  listRecords: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
      startDate: z.string(),
      endDate: z.string(),
      status: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { data: [], total: 0 };

      const { organizationId, staffId, startDate, endDate, status, page, limit } = input;
      const offset = (page - 1) * limit;

      const conditions: ReturnType<typeof eq>[] = [
        eq(attendanceRecords.organizationId, organizationId),
        sql`${attendanceRecords.recordDate} >= ${startDate}`,
        sql`${attendanceRecords.recordDate} <= ${endDate}`,
      ];
      if (staffId) conditions.push(eq(attendanceRecords.staffId, staffId));
      if (status) conditions.push(eq(attendanceRecords.status, status));

      const whereClause = and(...conditions);

      const data = await db.select({
        record: attendanceRecords,
        staffName: staff.name,
      })
        .from(attendanceRecords)
        .leftJoin(staff, eq(attendanceRecords.staffId, staff.id))
        .where(whereClause)
        .orderBy(desc(attendanceRecords.recordDate))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(attendanceRecords)
        .where(whereClause);

      return {
        data: data.map(d => ({
          ...d.record,
          staffName: d.staffName,
        })),
        total: Number(countResult[0]?.count ?? 0),
      };
    }),

  // --- 月統計 ---
  monthlyStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      year: z.number(),
      month: z.number().min(1).max(12),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return {
        totalDays: 0, presentDays: 0, lateDays: 0, earlyLeaveDays: 0,
        absentDays: 0, makeUpDays: 0, overtimeHours: 0, records: [],
      };

      const { organizationId, staffId, year, month } = input;
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const records = await db.select()
        .from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.organizationId, organizationId),
          eq(attendanceRecords.staffId, staffId),
          sql`${attendanceRecords.recordDate} >= ${startDate}`,
          sql`${attendanceRecords.recordDate} <= ${endDate}`,
        ))
        .orderBy(asc(attendanceRecords.recordDate));

      let presentDays = 0;
      let lateDays = 0;
      let earlyLeaveDays = 0;
      let makeUpDays = 0;
      let totalOvertimeMinutes = 0;

      for (const record of records) {
        if (record.clockIn) presentDays++;
        if (record.status === 'late') lateDays++;
        if (record.status === 'early_leave') earlyLeaveDays++;
        if (record.isManualEntry) makeUpDays++;

        // 計算加班（超過 8 小時的部分）
        if (record.clockIn && record.clockOut) {
          const workMinutes = (record.clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60);
          if (workMinutes > 480) { // 8 hours = 480 minutes
            totalOvertimeMinutes += workMinutes - 480;
          }
        }
      }

      return {
        totalDays: lastDay,
        presentDays,
        lateDays,
        earlyLeaveDays,
        absentDays: 0, // 需要配合排班表計算
        makeUpDays,
        overtimeHours: Math.round(totalOvertimeMinutes / 60 * 10) / 10,
        records,
      };
    }),

  // --- 補打卡申請 ---
  submitMakeUpRequest: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      recordDate: z.string(),
      clockIn: z.string().optional(),
      clockOut: z.string().optional(),
      reason: z.string().min(1, '補打卡原因不能為空'),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 檢查是否已有該日記錄
      const existing = await db.select()
        .from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.organizationId, input.organizationId),
          eq(attendanceRecords.staffId, input.staffId),
          sql`${attendanceRecords.recordDate} = ${input.recordDate}`,
        ))
        .limit(1);

      if (existing.length > 0) {
        // 更新既有記錄
        const updateData: Record<string, unknown> = {
          isManualEntry: true,
          manualReason: input.reason,
          approvalStatus: 'pending',
        };
        if (input.clockIn) updateData.clockIn = new Date(input.clockIn);
        if (input.clockOut) updateData.clockOut = new Date(input.clockOut);

        await db.update(attendanceRecords)
          .set(updateData)
          .where(eq(attendanceRecords.id, existing[0].id));

        return { id: existing[0].id, success: true };
      }

      // 新建補打卡記錄
      const [result] = await db.insert(attendanceRecords)
        .values({
          organizationId: input.organizationId,
          staffId: input.staffId,
          recordDate: input.recordDate,
          clockIn: input.clockIn ? new Date(input.clockIn) : null,
          clockOut: input.clockOut ? new Date(input.clockOut) : null,
          status: 'normal',
          isManualEntry: true,
          manualReason: input.reason,
          approvalStatus: 'pending',
        })
        .returning();

      return { id: result.id, success: true };
    }),

  // --- 審核補打卡 ---
  approveMakeUp: protectedProcedure
    .input(z.object({
      recordId: z.number(),
      approved: z.boolean(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      await db.update(attendanceRecords)
        .set({
          approvalStatus: input.approved ? 'approved' : 'rejected',
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
        })
        .where(eq(attendanceRecords.id, input.recordId));

      return { success: true };
    }),

  // --- 待審核列表 ---
  listPendingApprovals: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { data: [], total: 0 };

      const { organizationId, page, limit } = input;
      const offset = (page - 1) * limit;

      const whereClause = and(
        eq(attendanceRecords.organizationId, organizationId),
        eq(attendanceRecords.isManualEntry, true),
        eq(attendanceRecords.approvalStatus, 'pending'),
      );

      const data = await db.select({
        record: attendanceRecords,
        staffName: staff.name,
      })
        .from(attendanceRecords)
        .leftJoin(staff, eq(attendanceRecords.staffId, staff.id))
        .where(whereClause)
        .orderBy(desc(attendanceRecords.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(attendanceRecords)
        .where(whereClause);

      return {
        data: data.map(d => ({
          ...d.record,
          staffName: d.staffName,
        })),
        total: Number(countResult[0]?.count ?? 0),
      };
    }),
});
