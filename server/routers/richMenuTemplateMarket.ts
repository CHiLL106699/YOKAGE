import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { richMenuTemplateMarket, richMenuTemplates } from "../../drizzle/schema";
import { eq, and, sql, desc, ilike, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Rich Menu 模板市集 Router (Phase 109)
 *
 * 功能：
 * - 模板列表（分類篩選、搜尋、分頁）
 * - 模板詳情
 * - 模板 CRUD
 * - 一鍵套用模板至 Rich Menu
 * - 模板評分
 */

const categoryEnum = z.enum(["restaurant", "beauty", "retail", "medical"]);

const areaSchema = z.object({
  bounds: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  action: z.object({
    type: z.enum(["uri", "message", "postback"]),
    label: z.string().optional(),
    data: z.string().optional(),
    uri: z.string().optional(),
    text: z.string().optional(),
  }),
});

export const richMenuTemplateMarketRouter = router({
  /**
   * 列出模板（支援分類篩選、搜尋、分頁）
   */
  list: protectedProcedure
    .input(
      z.object({
        category: categoryEnum.optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
      })
    )
    .query(async ({ input }) => {
      const { category, search, page, limit } = input;
      const offset = (page - 1) * limit;

      // 動態組合 WHERE 條件
      const conditions = [];
      if (category) {
        conditions.push(eq(richMenuTemplateMarket.category, category));
      }
      if (search) {
        conditions.push(
          or(
            ilike(richMenuTemplateMarket.name, `%${search}%`),
            ilike(richMenuTemplateMarket.description, `%${search}%`)
          )
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // 查詢資料
      const templates = await db
        .select()
        .from(richMenuTemplateMarket)
        .where(whereClause)
        .orderBy(desc(richMenuTemplateMarket.usageCount))
        .limit(limit)
        .offset(offset);

      // 查詢總數
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(richMenuTemplateMarket)
        .where(whereClause);

      const total = Number(countResult.count);

      return {
        data: templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * 取得單一模板詳情
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [template] = await db
        .select()
        .from(richMenuTemplateMarket)
        .where(eq(richMenuTemplateMarket.id, input.id))
        .limit(1);

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "模板不存在",
        });
      }

      return template;
    }),

  /**
   * 建立新模板
   */
  create: protectedProcedure
    .input(
      z.object({
        category: categoryEnum,
        name: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().min(1),
        imageWidth: z.number().min(1),
        imageHeight: z.number().min(1),
        areas: z.array(areaSchema),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [result] = await db
        .insert(richMenuTemplateMarket)
        .values({
          category: input.category,
          name: input.name,
          description: input.description ?? null,
          imageUrl: input.imageUrl,
          imageWidth: input.imageWidth,
          imageHeight: input.imageHeight,
          areas: input.areas as any,
          tags: (input.tags ?? []) as any,
          usageCount: 0,
          rating: "0",
        })
        .returning();

      return result;
    }),

  /**
   * 更新模板
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        category: categoryEnum.optional(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        imageWidth: z.number().optional(),
        imageHeight: z.number().optional(),
        areas: z.array(areaSchema).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // 檢查模板是否存在
      const [existing] = await db
        .select()
        .from(richMenuTemplateMarket)
        .where(eq(richMenuTemplateMarket.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "模板不存在",
        });
      }

      // 過濾 undefined 欄位
      const updateData: Record<string, any> = {};
      if (data.category !== undefined) updateData.category = data.category;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.imageWidth !== undefined)
        updateData.imageWidth = data.imageWidth;
      if (data.imageHeight !== undefined)
        updateData.imageHeight = data.imageHeight;
      if (data.areas !== undefined) updateData.areas = data.areas;
      if (data.tags !== undefined) updateData.tags = data.tags;
      updateData.updatedAt = new Date();

      const [updated] = await db
        .update(richMenuTemplateMarket)
        .set(updateData)
        .where(eq(richMenuTemplateMarket.id, id))
        .returning();

      return updated;
    }),

  /**
   * 刪除模板
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(richMenuTemplateMarket)
        .where(eq(richMenuTemplateMarket.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "模板不存在",
        });
      }

      await db
        .delete(richMenuTemplateMarket)
        .where(eq(richMenuTemplateMarket.id, input.id));

      return { success: true };
    }),

  /**
   * 一鍵套用模板到 Rich Menu
   * 將模板市集的 areas 和 image 設定複製到 rich_menu_templates 表
   */
  applyTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        organizationId: z.number(),
        chatBarText: z.string().max(14).default("查看選單"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. 取得市集模板
      const [marketTemplate] = await db
        .select()
        .from(richMenuTemplateMarket)
        .where(eq(richMenuTemplateMarket.id, input.templateId))
        .limit(1);

      if (!marketTemplate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "市集模板不存在",
        });
      }

      // 2. 複製到 rich_menu_templates
      const [newTemplate] = await db
        .insert(richMenuTemplates)
        .values({
          organizationId: input.organizationId,
          name: `[市集] ${marketTemplate.name}`,
          description: marketTemplate.description,
          richMenuId: null,
          imageUrl: marketTemplate.imageUrl,
          chatBarText: input.chatBarText,
          areas: marketTemplate.areas as any,
          isActive: false, // 預設不啟用，讓使用者確認後再啟用
          targetAudience: "all",
          createdBy: ctx.user?.id ?? null,
        })
        .returning();

      // 3. 更新市集模板的使用次數
      await db
        .update(richMenuTemplateMarket)
        .set({
          usageCount: sql`${richMenuTemplateMarket.usageCount} + 1`,
        })
        .where(eq(richMenuTemplateMarket.id, input.templateId));

      return {
        success: true,
        newTemplateId: newTemplate.id,
        message: `已成功套用模板「${marketTemplate.name}」，請至 Rich Menu 管理頁面進行後續設定。`,
      };
    }),

  /**
   * 評分功能
   * 使用簡化的平均評分計算（新評分 = (舊評分 * 使用次數 + 新評分) / (使用次數 + 1)）
   */
  rateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        rating: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ input }) => {
      const [template] = await db
        .select()
        .from(richMenuTemplateMarket)
        .where(eq(richMenuTemplateMarket.id, input.templateId))
        .limit(1);

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "模板不存在",
        });
      }

      // 計算新的平均評分
      const currentRating = Number(template.rating) || 0;
      const currentCount = template.usageCount || 0;
      // 使用加權平均：若 usageCount 為 0，則直接使用新評分
      const newRating =
        currentCount > 0
          ? (currentRating * currentCount + input.rating) / (currentCount + 1)
          : input.rating;

      const [updated] = await db
        .update(richMenuTemplateMarket)
        .set({
          rating: String(Math.round(newRating * 100) / 100),
          updatedAt: new Date(),
        })
        .where(eq(richMenuTemplateMarket.id, input.templateId))
        .returning();

      return {
        success: true,
        newRating: Number(updated.rating),
      };
    }),
});
