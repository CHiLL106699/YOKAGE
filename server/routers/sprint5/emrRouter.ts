/**
 * Sprint 5: 電子病歷 EMR 強化 Router
 * 功能：病歷 CRUD、圖片上傳、Before/After 比對
 */
import { z } from 'zod';
import { eq, and, desc, sql, asc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../../_core/trpc';
import { getDb } from '../../db';
import {
  treatmentRecords,
  treatmentPhotos,
  customers,
  staff,
  products,
} from '../../../drizzle/schema';

// ============================================
// EMR 電子病歷強化 Router
// ============================================
export const sprint5EmrRouter = router({
  // --- 病歷列表 ---
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      staffId: z.number().optional(),
      treatmentType: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { data: [], total: 0 };

      const { organizationId, customerId, staffId, treatmentType, startDate, endDate, page, limit } = input;
      const offset = (page - 1) * limit;

      const conditions: ReturnType<typeof eq>[] = [eq(treatmentRecords.organizationId, organizationId)];
      if (customerId) conditions.push(eq(treatmentRecords.customerId, customerId));
      if (staffId) conditions.push(eq(treatmentRecords.staffId, staffId));
      if (treatmentType) conditions.push(eq(treatmentRecords.treatmentType, treatmentType));
      if (startDate) conditions.push(sql`${treatmentRecords.treatmentDate} >= ${startDate}::timestamp`);
      if (endDate) conditions.push(sql`${treatmentRecords.treatmentDate} <= ${endDate}::timestamp`);

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const data = await db.select({
        record: treatmentRecords,
        customerName: customers.name,
        staffName: staff.name,
      })
        .from(treatmentRecords)
        .leftJoin(customers, eq(treatmentRecords.customerId, customers.id))
        .leftJoin(staff, eq(treatmentRecords.staffId, staff.id))
        .where(whereClause)
        .orderBy(desc(treatmentRecords.treatmentDate))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(treatmentRecords)
        .where(whereClause);

      return {
        data: data.map(d => ({
          ...d.record,
          customerName: d.customerName,
          staffName: d.staffName,
        })),
        total: Number(countResult[0]?.count ?? 0),
      };
    }),

  // --- 病歷詳情 ---
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const result = await db.select({
        record: treatmentRecords,
        customerName: customers.name,
        customerPhone: customers.phone,
        staffName: staff.name,
      })
        .from(treatmentRecords)
        .leftJoin(customers, eq(treatmentRecords.customerId, customers.id))
        .leftJoin(staff, eq(treatmentRecords.staffId, staff.id))
        .where(eq(treatmentRecords.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該病歷' });
      }

      // 取得相關照片
      const photos = await db.select()
        .from(treatmentPhotos)
        .where(eq(treatmentPhotos.treatmentRecordId, input.id))
        .orderBy(asc(treatmentPhotos.sortOrder), asc(treatmentPhotos.photoDate));

      const d = result[0];
      return {
        ...d.record,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        staffName: d.staffName,
        photos,
      };
    }),

  // --- 新增病歷 ---
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      treatmentDate: z.string(),
      treatmentType: z.string().optional(),
      treatmentArea: z.string().optional(),
      dosage: z.string().optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
      satisfactionScore: z.number().min(1).max(5).optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const [result] = await db.insert(treatmentRecords)
        .values({
          organizationId: input.organizationId,
          customerId: input.customerId,
          appointmentId: input.appointmentId ?? null,
          staffId: input.staffId ?? null,
          productId: input.productId ?? null,
          treatmentDate: new Date(input.treatmentDate),
          treatmentType: input.treatmentType ?? null,
          treatmentArea: input.treatmentArea ?? null,
          dosage: input.dosage ?? null,
          notes: input.notes ?? null,
          internalNotes: input.internalNotes ?? null,
          satisfactionScore: input.satisfactionScore ?? null,
          nextFollowUpDate: input.nextFollowUpDate ?? null,
        })
        .returning();

      return { id: result.id, success: true };
    }),

  // --- 更新病歷 ---
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      treatmentDate: z.string().optional(),
      treatmentType: z.string().optional(),
      treatmentArea: z.string().optional(),
      dosage: z.string().optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
      satisfactionScore: z.number().min(1).max(5).optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.staffId !== undefined) updateData.staffId = data.staffId;
      if (data.productId !== undefined) updateData.productId = data.productId;
      if (data.treatmentDate !== undefined) updateData.treatmentDate = new Date(data.treatmentDate);
      if (data.treatmentType !== undefined) updateData.treatmentType = data.treatmentType;
      if (data.treatmentArea !== undefined) updateData.treatmentArea = data.treatmentArea;
      if (data.dosage !== undefined) updateData.dosage = data.dosage;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
      if (data.satisfactionScore !== undefined) updateData.satisfactionScore = data.satisfactionScore;
      if (data.nextFollowUpDate !== undefined) updateData.nextFollowUpDate = data.nextFollowUpDate;

      await db.update(treatmentRecords)
        .set(updateData)
        .where(eq(treatmentRecords.id, id));

      return { success: true };
    }),

  // --- 刪除病歷 ---
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 先刪除相關照片
      await db.delete(treatmentPhotos)
        .where(eq(treatmentPhotos.treatmentRecordId, input.id));

      // 再刪除病歷
      await db.delete(treatmentRecords)
        .where(eq(treatmentRecords.id, input.id));

      return { success: true };
    }),

  // --- 照片管理 ---
  uploadPhoto: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      treatmentRecordId: z.number(),
      photoType: z.enum(['before', 'after', 'during', 'other']).default('before'),
      photoUrl: z.string().min(1),
      thumbnailUrl: z.string().optional(),
      angle: z.string().optional(),
      notes: z.string().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const [result] = await db.insert(treatmentPhotos)
        .values({
          organizationId: input.organizationId,
          customerId: input.customerId,
          treatmentRecordId: input.treatmentRecordId,
          photoType: input.photoType,
          photoUrl: input.photoUrl,
          thumbnailUrl: input.thumbnailUrl ?? null,
          photoDate: new Date(),
          angle: input.angle ?? null,
          notes: input.notes ?? null,
          isPublic: false,
          sortOrder: input.sortOrder,
        })
        .returning();

      return { id: result.id, success: true };
    }),

  deletePhoto: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      await db.delete(treatmentPhotos)
        .where(eq(treatmentPhotos.id, input.id));

      return { success: true };
    }),

  listPhotos: protectedProcedure
    .input(z.object({
      treatmentRecordId: z.number().optional(),
      customerId: z.number(),
      photoType: z.enum(['before', 'after', 'during', 'other']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions: ReturnType<typeof eq>[] = [eq(treatmentPhotos.customerId, input.customerId)];
      if (input.treatmentRecordId) conditions.push(eq(treatmentPhotos.treatmentRecordId, input.treatmentRecordId));
      if (input.photoType) conditions.push(eq(treatmentPhotos.photoType, input.photoType));

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      return await db.select()
        .from(treatmentPhotos)
        .where(whereClause)
        .orderBy(asc(treatmentPhotos.sortOrder), asc(treatmentPhotos.photoDate));
    }),

  // --- Before/After 比對 ---
  getBeforeAfterPairs: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      treatmentRecordId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions: ReturnType<typeof eq>[] = [eq(treatmentPhotos.customerId, input.customerId)];
      if (input.treatmentRecordId) {
        conditions.push(eq(treatmentPhotos.treatmentRecordId, input.treatmentRecordId));
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const photos = await db.select()
        .from(treatmentPhotos)
        .where(whereClause)
        .orderBy(asc(treatmentPhotos.photoDate));

      // 將照片按角度分組，配對 before/after
      const grouped: Record<string, { before: typeof photos[0] | null; after: typeof photos[0] | null }> = {};
      for (const photo of photos) {
        const key = photo.angle || 'default';
        if (!grouped[key]) grouped[key] = { before: null, after: null };
        if (photo.photoType === 'before' && !grouped[key].before) {
          grouped[key].before = photo;
        } else if (photo.photoType === 'after') {
          grouped[key].after = photo;
        }
      }

      return Object.entries(grouped)
        .filter(([_, pair]) => pair.before || pair.after)
        .map(([angle, pair]) => ({
          angle,
          before: pair.before,
          after: pair.after,
        }));
    }),
});
