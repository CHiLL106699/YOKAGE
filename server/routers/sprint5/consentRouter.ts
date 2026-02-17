/**
 * Sprint 5: 知情同意書管理與數位簽署 Router
 * 功能：模板 CRUD、版本控制、數位簽署、簽署記錄查詢
 */
import { z } from 'zod';
import { eq, and, desc, sql, asc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../../_core/trpc';
import { getDb } from '../../db';
import { consentFormTemplates, consentSignatures, customers } from '../../../drizzle/schema';

// ============================================
// 知情同意書模板管理
// ============================================
export const sprint5ConsentRouter = router({
  // --- 模板 CRUD ---
  listTemplates: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      category: z.enum(['treatment', 'surgery', 'anesthesia', 'photography', 'general']).optional(),
      isActive: z.boolean().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { data: [], total: 0 };

      const { organizationId, category, isActive, page, limit } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(consentFormTemplates.organizationId, organizationId)];
      if (category) conditions.push(eq(consentFormTemplates.category, category));
      if (isActive !== undefined) conditions.push(eq(consentFormTemplates.isActive, isActive));

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const data = await db.select()
        .from(consentFormTemplates)
        .where(whereClause)
        .orderBy(desc(consentFormTemplates.updatedAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(consentFormTemplates)
        .where(whereClause);

      return { data, total: Number(countResult[0]?.count ?? 0) };
    }),

  getTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const result = await db.select()
        .from(consentFormTemplates)
        .where(eq(consentFormTemplates.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該同意書模板' });
      }
      return result[0];
    }),

  createTemplate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1, '名稱不能為空'),
      category: z.enum(['treatment', 'surgery', 'anesthesia', 'photography', 'general']).default('general'),
      content: z.string().min(1, '內容不能為空'),
      requiredFields: z.any().optional(),
      version: z.string().default('1.0'),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const [result] = await db.insert(consentFormTemplates)
        .values({
          organizationId: input.organizationId,
          name: input.name,
          category: input.category,
          content: input.content,
          requiredFields: input.requiredFields ?? null,
          version: input.version,
          isActive: true,
        })
        .returning();

      return { id: result.id, success: true };
    }),

  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.enum(['treatment', 'surgery', 'anesthesia', 'photography', 'general']).optional(),
      content: z.string().optional(),
      requiredFields: z.any().optional(),
      version: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.requiredFields !== undefined) updateData.requiredFields = data.requiredFields;
      if (data.version !== undefined) updateData.version = data.version;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await db.update(consentFormTemplates)
        .set(updateData)
        .where(eq(consentFormTemplates.id, id));

      return { success: true };
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 軟刪除：設為 inactive
      await db.update(consentFormTemplates)
        .set({ isActive: false })
        .where(eq(consentFormTemplates.id, input.id));

      return { success: true };
    }),

  // --- 數位簽署 ---
  sign: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      templateId: z.number(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      signatureImageUrl: z.string().min(1, '簽名圖片不能為空'),
      signedContent: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      witnessName: z.string().optional(),
      witnessSignatureUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 驗證模板存在
      const template = await db.select()
        .from(consentFormTemplates)
        .where(eq(consentFormTemplates.id, input.templateId))
        .limit(1);

      if (template.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該同意書模板' });
      }

      const [result] = await db.insert(consentSignatures)
        .values({
          organizationId: input.organizationId,
          customerId: input.customerId,
          templateId: input.templateId,
          appointmentId: input.appointmentId ?? null,
          treatmentRecordId: input.treatmentRecordId ?? null,
          signatureImageUrl: input.signatureImageUrl,
          signedContent: input.signedContent ?? template[0].content,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          witnessName: input.witnessName ?? null,
          witnessSignatureUrl: input.witnessSignatureUrl ?? null,
          status: 'signed',
        })
        .returning();

      return { id: result.id, success: true };
    }),

  // --- 簽署記錄查詢 ---
  listSignatures: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      templateId: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { data: [], total: 0 };

      const { organizationId, customerId, templateId, page, limit } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(consentSignatures.organizationId, organizationId)];
      if (customerId) conditions.push(eq(consentSignatures.customerId, customerId));
      if (templateId) conditions.push(eq(consentSignatures.templateId, templateId));

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const data = await db.select({
        signature: consentSignatures,
        templateName: consentFormTemplates.name,
        templateCategory: consentFormTemplates.category,
        customerName: customers.name,
      })
        .from(consentSignatures)
        .leftJoin(consentFormTemplates, eq(consentSignatures.templateId, consentFormTemplates.id))
        .leftJoin(customers, eq(consentSignatures.customerId, customers.id))
        .where(whereClause)
        .orderBy(desc(consentSignatures.signedAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(consentSignatures)
        .where(whereClause);

      return {
        data: data.map(d => ({
          ...d.signature,
          templateName: d.templateName,
          templateCategory: d.templateCategory,
          customerName: d.customerName,
        })),
        total: Number(countResult[0]?.count ?? 0),
      };
    }),

  getSignature: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const result = await db.select({
        signature: consentSignatures,
        templateName: consentFormTemplates.name,
        templateContent: consentFormTemplates.content,
        templateCategory: consentFormTemplates.category,
        customerName: customers.name,
      })
        .from(consentSignatures)
        .leftJoin(consentFormTemplates, eq(consentSignatures.templateId, consentFormTemplates.id))
        .leftJoin(customers, eq(consentSignatures.customerId, customers.id))
        .where(eq(consentSignatures.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該簽署記錄' });
      }

      const d = result[0];
      return {
        ...d.signature,
        templateName: d.templateName,
        templateContent: d.templateContent,
        templateCategory: d.templateCategory,
        customerName: d.customerName,
      };
    }),
});
