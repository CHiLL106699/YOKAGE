import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { attendanceRecords, staff } from '../../drizzle/schema';

/**
 * 智慧打卡系統 tRPC Router
 * 提供打卡、補登、審核等功能
 */

export const attendanceRouter = router({
  /**
   * 上班打卡
   */
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

      const today = new Date().toISOString().split('T')[0];

      // 檢查今天是否已經打過卡
      const existingRecord = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.organizationId, input.organizationId),
            eq(attendanceRecords.staffId, input.staffId),
            sql`${attendanceRecords.recordDate} = ${today}`
          )
        )
        .limit(1);

      if (existingRecord.length > 0 && existingRecord[0].clockIn) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '今天已經打過上班卡了' });
      }

      // 計算是否在地理圍欄內（假設診所位置為固定座標，這裡簡化處理）
      // 實際應該從 organizations 表取得診所座標
      const isWithinGeofence = true; // 簡化處理
      const distanceFromClinic = 0; // 簡化處理

      if (existingRecord.length > 0) {
        // 更新現有記錄
        await db
          .update(attendanceRecords)
          .set({
            clockIn: new Date(),
            checkInLatitude: input.latitude.toString(),
            checkInLongitude: input.longitude.toString(),
            checkInAccuracy: input.accuracy?.toString(),
            checkInAddress: input.address,
            isWithinGeofence,
            distanceFromClinic: distanceFromClinic.toString(),
            updatedAt: new Date(),
          })
          .where(eq(attendanceRecords.id, existingRecord[0].id));
      } else {
        // 建立新記錄
        await db.insert(attendanceRecords).values({
          organizationId: input.organizationId,
          staffId: input.staffId,
          recordDate: new Date(today),
          clockIn: new Date(),
          checkInLatitude: input.latitude.toString(),
          checkInLongitude: input.longitude.toString(),
          checkInAccuracy: input.accuracy?.toString(),
          checkInAddress: input.address,
          isWithinGeofence,
          distanceFromClinic: distanceFromClinic.toString(),
          status: 'normal',
        });
      }

      return { success: true, message: '上班打卡成功' };
    }),

  /**
   * 下班打卡
   */
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

      const today = new Date().toISOString().split('T')[0];

      // 檢查今天是否已經打過上班卡
      const existingRecord = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.organizationId, input.organizationId),
            eq(attendanceRecords.staffId, input.staffId),
            sql`${attendanceRecords.recordDate} = ${today}`
          )
        )
        .limit(1);

      if (existingRecord.length === 0 || !existingRecord[0].clockIn) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '請先打上班卡' });
      }

      if (existingRecord[0].clockOut) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '今天已經打過下班卡了' });
      }

      // 更新下班打卡
      await db
        .update(attendanceRecords)
        .set({
          clockOut: new Date(),
          checkOutLatitude: input.latitude.toString(),
          checkOutLongitude: input.longitude.toString(),
          checkOutAccuracy: input.accuracy?.toString(),
          checkOutAddress: input.address,
          updatedAt: new Date(),
        })
        .where(eq(attendanceRecords.id, existingRecord[0].id));

      return { success: true, message: '下班打卡成功' };
    }),

  /**
   * 申請補登打卡
   */
  requestCorrection: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      recordDate: z.string(), // YYYY-MM-DD
      clockIn: z.string().optional(), // ISO 8601 timestamp
      clockOut: z.string().optional(), // ISO 8601 timestamp
      reason: z.string().min(1, '請填寫補登原因'),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 檢查該日期是否已有記錄
      const existingRecord = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.organizationId, input.organizationId),
            eq(attendanceRecords.staffId, input.staffId),
            sql`${attendanceRecords.recordDate} = ${input.recordDate}`
          )
        )
        .limit(1);

      if (existingRecord.length > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '該日期已有打卡記錄，請聯繫主管修改' });
      }

      // 建立補登記錄
      await db.insert(attendanceRecords).values({
        organizationId: input.organizationId,
        staffId: input.staffId,
          recordDate: new Date(input.recordDate),
        clockIn: input.clockIn ? new Date(input.clockIn) : null,
        clockOut: input.clockOut ? new Date(input.clockOut) : null,
        isManualEntry: true,
        manualReason: input.reason,
        approvalStatus: 'pending',
        status: 'normal',
      });

      // 查詢剛建立的記錄（使用 ORDER BY id DESC 確保取得最新記錄）
      const newRecord = await db
        .select({ id: attendanceRecords.id })
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.organizationId, input.organizationId),
            eq(attendanceRecords.staffId, input.staffId),
            sql`DATE(${attendanceRecords.recordDate}) = ${input.recordDate}`
          )
        )
        .orderBy(sql`${attendanceRecords.id} DESC`)
        .limit(1);

      const recordId = newRecord[0]?.id;

      return { success: true, message: '補登申請已提交，等待主管審核', recordId };
    }),

  /**
   * 審核補登申請（主管權限）
   */
  approveCorrection: protectedProcedure
    .input(z.object({
      recordId: z.number(),
      approved: z.boolean(),
      approverId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 檢查記錄是否存在
      const record = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.id, input.recordId))
        .limit(1);

      if (record.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該打卡記錄' });
      }

      if (!record[0].isManualEntry) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '該記錄不是補登申請' });
      }

      if (record[0].approvalStatus !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '該申請已經審核過了' });
      }

      // 更新審核狀態
      await db
        .update(attendanceRecords)
        .set({
          approvalStatus: input.approved ? 'approved' : 'rejected',
          approvedBy: input.approverId,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(attendanceRecords.id, input.recordId));

      return {
        success: true,
        message: input.approved ? '補登申請已核准' : '補登申請已拒絕',
      };
    }),

  /**
   * 查詢打卡記錄
   */
  listRecords: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
      startDate: z.string().optional(), // YYYY-MM-DD
      endDate: z.string().optional(), // YYYY-MM-DD
      approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const conditions = [eq(attendanceRecords.organizationId, input.organizationId)];

      if (input.staffId) {
        conditions.push(eq(attendanceRecords.staffId, input.staffId));
      }

      if (input.startDate) {
        conditions.push(sql`${attendanceRecords.recordDate} >= ${input.startDate}`);
      }

      if (input.endDate) {
        conditions.push(sql`${attendanceRecords.recordDate} <= ${input.endDate}`);
      }

      if (input.approvalStatus) {
        conditions.push(eq(attendanceRecords.approvalStatus, input.approvalStatus));
      }

      const records = await db
        .select()
        .from(attendanceRecords)
        .where(and(...conditions))
        .orderBy(desc(attendanceRecords.recordDate));

      return records;
    }),

  /**
   * 取得今日打卡狀態
   */
  getTodayStatus: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const today = new Date().toISOString().split('T')[0];

      const [record] = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.organizationId, input.organizationId),
            eq(attendanceRecords.staffId, input.staffId),
            sql`${attendanceRecords.recordDate} = ${today}`
          )
        )
        .limit(1);

      return {
        hasClockedIn: !!record?.clockIn,
        hasClockedOut: !!record?.clockOut,
        record: record || null,
      };
    }),
});
