import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { richMenuTemplates, richMenuAssignments, richMenuClickStats, customers } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

/**
 * Rich Menu 動態管理系統 Router
 * 
 * 功能：
 * - Rich Menu 模板 CRUD
 * - LINE Rich Menu API 整合（建立/刪除/綁定）
 * - A/B 測試分配邏輯
 * - 點擊追蹤統計
 */

export const richMenuRouter = router({
  /**
   * 列出所有 Rich Menu 模板
   */
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const templates = await db
        .select()
        .from(richMenuTemplates)
        .where(eq(richMenuTemplates.organizationId, input.organizationId))
        .orderBy(desc(richMenuTemplates.createdAt));

      return templates;
    }),

  /**
   * 取得單一 Rich Menu 模板詳細資訊
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const [template] = await db
        .select()
        .from(richMenuTemplates)
        .where(eq(richMenuTemplates.id, input.id))
        .limit(1);

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rich Menu 模板不存在",
        });
      }

      return template;
    }),

  /**
   * 建立 Rich Menu 模板
   */
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      chatBarText: z.string().max(14),
      areas: z.array(z.object({
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
      })),
      targetAudience: z.enum(["all", "new_customer", "vip", "churn_risk"]).optional(),
      abTestGroup: z.enum(["control", "variant_a", "variant_b"]).optional(),
      imageBase64: z.string(), // Base64 編碼的圖片
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. 上傳圖片至 S3
      const imageBuffer = Buffer.from(input.imageBase64, "base64");
      const imageKey = `rich-menu/${input.organizationId}/${Date.now()}.png`;
      const { url: imageUrl } = await storagePut(imageKey, imageBuffer, "image/png");

      // 2. 建立 LINE Rich Menu（TODO: 整合 LINE Messaging API）
      // const richMenuId = await createLineRichMenu({
      //   size: { width: 2500, height: 1686 },
      //   selected: false,
      //   name: input.name,
      //   chatBarText: input.chatBarText,
      //   areas: input.areas,
      // });

      // 3. 儲存至資料庫
      const [result] = await db.insert(richMenuTemplates).values({
        organizationId: input.organizationId,
        name: input.name,
        description: input.description,
        richMenuId: null, // TODO: 替換為實際的 LINE Rich Menu ID
        imageUrl,
        chatBarText: input.chatBarText,
        areas: input.areas as any,
        targetAudience: input.targetAudience,
        abTestGroup: input.abTestGroup,
        createdBy: ctx.user.id,
      });

      const insertId = Number(result.insertId);
      const [newTemplate] = await db
        .select()
        .from(richMenuTemplates)
        .where(eq(richMenuTemplates.id, insertId))
        .limit(1);

      return newTemplate;
    }),

  /**
   * 更新 Rich Menu 模板
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      chatBarText: z.string().max(14).optional(),
      areas: z.array(z.object({
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
      })).optional(),
      targetAudience: z.enum(["all", "new_customer", "vip", "churn_risk"]).optional(),
      abTestGroup: z.enum(["control", "variant_a", "variant_b"]).optional(),
      isActive: z.boolean().optional(),
      imageBase64: z.string().optional(), // 如果提供，則更新圖片
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {
        name: input.name,
        description: input.description,
        chatBarText: input.chatBarText,
        areas: input.areas,
        targetAudience: input.targetAudience,
        abTestGroup: input.abTestGroup,
        isActive: input.isActive,
      };

      // 如果提供新圖片，則上傳至 S3
      if (input.imageBase64) {
        const [template] = await db
          .select()
          .from(richMenuTemplates)
          .where(eq(richMenuTemplates.id, input.id))
          .limit(1);

        if (!template) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Rich Menu 模板不存在",
          });
        }

        const imageBuffer = Buffer.from(input.imageBase64, "base64");
        const imageKey = `rich-menu/${template.organizationId}/${Date.now()}.png`;
        const { url: imageUrl } = await storagePut(imageKey, imageBuffer, "image/png");
        updateData.imageUrl = imageUrl;
      }

      // 移除 undefined 的欄位
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await db
        .update(richMenuTemplates)
        .set(updateData)
        .where(eq(richMenuTemplates.id, input.id));

      const [updatedTemplate] = await db
        .select()
        .from(richMenuTemplates)
        .where(eq(richMenuTemplates.id, input.id))
        .limit(1);

      return updatedTemplate;
    }),

  /**
   * 刪除 Rich Menu 模板
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      // TODO: 刪除 LINE Rich Menu
      // await deleteLineRichMenu(template.richMenuId);

      await db
        .delete(richMenuTemplates)
        .where(eq(richMenuTemplates.id, input.id));

      return { success: true };
    }),

  /**
   * 分配 Rich Menu 給客戶（支援 A/B 測試）
   */
  assignToCustomer: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      templateId: z.number().optional(), // 如果不提供，則自動根據 A/B 測試分配
    }))
    .mutation(async ({ input }) => {
      // 1. 取得客戶資訊
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, input.customerId))
        .limit(1);

      if (!customer || !customer.lineUserId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "客戶不存在或未綁定 LINE",
        });
      }

      // 2. 如果未指定模板，則根據 A/B 測試分配
      let templateId = input.templateId;
      if (!templateId) {
        const templates = await db
          .select()
          .from(richMenuTemplates)
          .where(
            and(
              eq(richMenuTemplates.organizationId, customer.organizationId),
              eq(richMenuTemplates.isActive, true)
            )
          );

        if (templates.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "沒有可用的 Rich Menu 模板",
          });
        }

        // 簡單的 A/B 測試分配邏輯：隨機選擇
        const randomIndex = Math.floor(Math.random() * templates.length);
        templateId = templates[randomIndex].id;
      }

      // 3. 取得模板資訊
      const [template] = await db
        .select()
        .from(richMenuTemplates)
        .where(eq(richMenuTemplates.id, templateId))
        .limit(1);

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rich Menu 模板不存在",
        });
      }

      // 4. 綁定 Rich Menu 至客戶（TODO: 整合 LINE Messaging API）
      // await linkRichMenuToUser(customer.lineUserId, template.richMenuId);

      // 5. 記錄分配記錄
      await db.insert(richMenuAssignments).values({
        templateId,
        customerId: input.customerId,
        lineUserId: customer.lineUserId,
      });

      return { success: true, templateId };
    }),

  /**
   * 記錄 Rich Menu 點擊事件
   */
  trackClick: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      lineUserId: z.string(),
      areaIndex: z.number(),
    }))
    .mutation(async ({ input }) => {
      // 1. 查詢客戶 ID
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.lineUserId, input.lineUserId))
        .limit(1);

      // 2. 記錄點擊事件
      await db.insert(richMenuClickStats).values({
        templateId: input.templateId,
        customerId: customer?.id,
        lineUserId: input.lineUserId,
        areaIndex: input.areaIndex,
      });

      return { success: true };
    }),

  /**
   * 取得 Rich Menu 點擊統計
   */
  getClickStats: protectedProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .query(async ({ input }) => {
      // 1. 總點擊次數
      const [totalClicksResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(richMenuClickStats)
        .where(eq(richMenuClickStats.templateId, input.templateId));

      const totalClicks = Number(totalClicksResult.count);

      // 2. 各區域點擊次數
      const areaClicksResult = await db
        .select({
          areaIndex: richMenuClickStats.areaIndex,
          count: sql<number>`count(*)`,
        })
        .from(richMenuClickStats)
        .where(eq(richMenuClickStats.templateId, input.templateId))
        .groupBy(richMenuClickStats.areaIndex);

      const areaClicks = areaClicksResult.map((row) => ({
        areaIndex: row.areaIndex,
        count: Number(row.count),
      }));

      // 3. 獨立使用者數
      const [uniqueUsersResult] = await db
        .select({ count: sql<number>`count(distinct ${richMenuClickStats.lineUserId})` })
        .from(richMenuClickStats)
        .where(eq(richMenuClickStats.templateId, input.templateId));

      const uniqueUsers = Number(uniqueUsersResult.count);

      return {
        totalClicks,
        uniqueUsers,
        areaClicks,
      };
    }),

  /**
   * 取得 A/B 測試統計
   */
  getAbTestStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const templates = await db
        .select()
        .from(richMenuTemplates)
        .where(
          and(
            eq(richMenuTemplates.organizationId, input.organizationId),
            eq(richMenuTemplates.isActive, true)
          )
        );

      const stats = await Promise.all(
        templates.map(async (template) => {
          // 分配數
          const [assignmentsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(richMenuAssignments)
            .where(eq(richMenuAssignments.templateId, template.id));

          const assignments = Number(assignmentsResult.count);

          // 點擊數
          const [clicksResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(richMenuClickStats)
            .where(eq(richMenuClickStats.templateId, template.id));

          const clicks = Number(clicksResult.count);

          // 點擊率
          const clickRate = assignments > 0 ? (clicks / assignments) * 100 : 0;

          return {
            templateId: template.id,
            templateName: template.name,
            abTestGroup: template.abTestGroup,
            assignments,
            clicks,
            clickRate: Math.round(clickRate * 100) / 100,
          };
        })
      );

      return stats;
    }),
});
