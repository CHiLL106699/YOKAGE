import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { broadcastCampaigns, broadcastRecipients, customers, customerTagRelations } from "../../drizzle/schema";
import { eq, and, sql, desc, inArray, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * 客戶分群推播系統 Router
 * 
 * 功能：
 * - 推播活動 CRUD
 * - 分群篩選引擎
 * - 批量發送 LINE 訊息
 * - 排程發送機制
 * - 效果追蹤統計
 */

export const broadcastRouter = router({
  /**
   * 列出所有推播活動
   */
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const campaigns = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.organizationId, input.organizationId))
        .orderBy(desc(broadcastCampaigns.createdAt));

      return campaigns;
    }),

  /**
   * 取得單一推播活動詳細資訊
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const [campaign] = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, input.id))
        .limit(1);

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "推播活動不存在",
        });
      }

      return campaign;
    }),

  /**
   * 根據分群條件預覽目標客戶數量
   */
  previewAudience: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      targetAudience: z.object({
        tags: z.array(z.number()).optional(), // 客戶標籤 ID 列表
        minSpent: z.number().optional(), // 最低消費金額
        maxSpent: z.number().optional(), // 最高消費金額
        minVisitCount: z.number().optional(), // 最低到店次數
        maxVisitCount: z.number().optional(), // 最高到店次數
        lastVisitDaysAgo: z.number().optional(), // 最後到店天數（例如：90 表示 90 天內未回診）
        memberLevels: z.array(z.enum(["bronze", "silver", "gold", "platinum", "diamond"])).optional(), // 會員等級
      }),
    }))
    .query(async ({ input }) => {
      const { organizationId, targetAudience } = input;

      // 建立查詢條件
      const conditions: any[] = [eq(customers.organizationId, organizationId)];

      // 消費金額篩選
      if (targetAudience.minSpent !== undefined) {
        conditions.push(gte(customers.totalSpent, targetAudience.minSpent.toString()));
      }
      if (targetAudience.maxSpent !== undefined) {
        conditions.push(lte(customers.totalSpent, targetAudience.maxSpent.toString()));
      }

      // 到店次數篩選
      if (targetAudience.minVisitCount !== undefined) {
        conditions.push(gte(customers.visitCount, targetAudience.minVisitCount));
      }
      if (targetAudience.maxVisitCount !== undefined) {
        conditions.push(lte(customers.visitCount, targetAudience.maxVisitCount));
      }

      // 會員等級篩選
      if (targetAudience.memberLevels && targetAudience.memberLevels.length > 0) {
        conditions.push(inArray(customers.memberLevel, targetAudience.memberLevels));
      }

      // 標籤篩選（需要 JOIN customerTagRelations）
      let query = db.select({ count: sql<number>`count(distinct ${customers.id})` }).from(customers);

      if (targetAudience.tags && targetAudience.tags.length > 0) {
        query = query
          .innerJoin(customerTagRelations, eq(customers.id, customerTagRelations.customerId))
          .where(
            and(
              ...conditions,
              inArray(customerTagRelations.tagId, targetAudience.tags)
            )
          ) as any;
      } else {
        query = query.where(and(...conditions)) as any;
      }

      const [result] = await query;
      const count = Number(result.count);

      return { count };
    }),

  /**
   * 建立推播活動
   */
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      messageType: z.enum(["text", "flex", "image"]),
      messageContent: z.any(), // JSON 格式的訊息內容
      targetAudience: z.object({
        tags: z.array(z.number()).optional(),
        minSpent: z.number().optional(),
        maxSpent: z.number().optional(),
        minVisitCount: z.number().optional(),
        maxVisitCount: z.number().optional(),
        lastVisitDaysAgo: z.number().optional(),
        memberLevels: z.array(z.enum(["bronze", "silver", "gold", "platinum", "diamond"])).optional(),
      }),
      scheduledAt: z.string().optional(), // ISO 8601 格式的排程時間
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. 計算目標客戶數量
      const { count } = await broadcastRouter.createCaller({ user: ctx.user } as any).previewAudience({
        organizationId: input.organizationId,
        targetAudience: input.targetAudience,
      });

      // 2. 建立推播活動
      const [result] = await db.insert(broadcastCampaigns).values({
        organizationId: input.organizationId,
        name: input.name,
        description: input.description,
        messageType: input.messageType,
        messageContent: input.messageContent as any,
        targetAudience: input.targetAudience as any,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        status: input.scheduledAt ? "scheduled" : "draft",
        totalRecipients: count,
        createdBy: ctx.user.id,
      });

      const insertId: number = Number(result.insertId);
      const [newCampaign] = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, insertId))
        .limit(1);

      return newCampaign;
    }),

  /**
   * 更新推播活動
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      messageType: z.enum(["text", "flex", "image"]).optional(),
      messageContent: z.any().optional(),
      targetAudience: z.object({
        tags: z.array(z.number()).optional(),
        minSpent: z.number().optional(),
        maxSpent: z.number().optional(),
        minVisitCount: z.number().optional(),
        maxVisitCount: z.number().optional(),
        lastVisitDaysAgo: z.number().optional(),
        memberLevels: z.array(z.enum(["bronze", "silver", "gold", "platinum", "diamond"])).optional(),
      }).optional(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {
        name: input.name,
        description: input.description,
        messageType: input.messageType,
        messageContent: input.messageContent,
        targetAudience: input.targetAudience,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      };

      // 移除 undefined 的欄位
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await db
        .update(broadcastCampaigns)
        .set(updateData)
        .where(eq(broadcastCampaigns.id, input.id));

      const [updatedCampaign] = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, input.id))
        .limit(1);

      return updatedCampaign;
    }),

  /**
   * 刪除推播活動
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db
        .delete(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, input.id));

      return { success: true };
    }),

  /**
   * 立即發送推播活動
   */
  send: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      // 1. 取得推播活動資訊
      const [campaign] = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, input.id))
        .limit(1);

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "推播活動不存在",
        });
      }

      // 2. 取得目標客戶列表
      const targetAudience = campaign.targetAudience as any;
      const conditions: any[] = [
        eq(customers.organizationId, campaign.organizationId),
        eq(customers.isActive, true),
      ];

      // 消費金額篩選
      if (targetAudience.minSpent !== undefined) {
        conditions.push(gte(customers.totalSpent, targetAudience.minSpent.toString()));
      }
      if (targetAudience.maxSpent !== undefined) {
        conditions.push(lte(customers.totalSpent, targetAudience.maxSpent.toString()));
      }

      // 到店次數篩選
      if (targetAudience.minVisitCount !== undefined) {
        conditions.push(gte(customers.visitCount, targetAudience.minVisitCount));
      }
      if (targetAudience.maxVisitCount !== undefined) {
        conditions.push(lte(customers.visitCount, targetAudience.maxVisitCount));
      }

      // 會員等級篩選
      if (targetAudience.memberLevels && targetAudience.memberLevels.length > 0) {
        conditions.push(inArray(customers.memberLevel, targetAudience.memberLevels));
      }

      // 標籤篩選
      let targetCustomers;
      if (targetAudience.tags && targetAudience.tags.length > 0) {
        targetCustomers = await db
          .select({ id: customers.id, lineUserId: customers.lineUserId })
          .from(customers)
          .innerJoin(customerTagRelations, eq(customers.id, customerTagRelations.customerId))
          .where(
            and(
              ...conditions,
              inArray(customerTagRelations.tagId, targetAudience.tags)
            )
          );
      } else {
        targetCustomers = await db
          .select({ id: customers.id, lineUserId: customers.lineUserId })
          .from(customers)
          .where(and(...conditions));
      }

      // 3. 過濾有 LINE User ID 的客戶
      const validCustomers = targetCustomers.filter((c) => c.lineUserId);

      // 4. 更新推播活動狀態
      await db
        .update(broadcastCampaigns)
        .set({ status: "sending", totalRecipients: validCustomers.length })
        .where(eq(broadcastCampaigns.id, input.id));

      // 5. 建立收件人記錄
      if (validCustomers.length > 0) {
        await db.insert(broadcastRecipients).values(
          validCustomers.map((c) => ({
            campaignId: input.id,
            customerId: c.id,
            lineUserId: c.lineUserId!,
            status: "pending",
          }))
        );
      }

      // 6. 批量發送 LINE 訊息（TODO: 整合 LINE Messaging API）
      // for (const customer of validCustomers) {
      //   try {
      //     await sendLineMessage(customer.lineUserId, campaign.messageContent);
      //     await db
      //       .update(broadcastRecipients)
      //       .set({ status: "sent", sentAt: new Date() })
      //       .where(
      //         and(
      //           eq(broadcastRecipients.campaignId, input.id),
      //           eq(broadcastRecipients.customerId, customer.id)
      //         )
      //       );
      //   } catch (error) {
      //     await db
      //       .update(broadcastRecipients)
      //       .set({ status: "failed", errorMessage: error.message })
      //       .where(
      //         and(
      //           eq(broadcastRecipients.campaignId, input.id),
      //           eq(broadcastRecipients.customerId, customer.id)
      //         )
      //       );
      //   }
      // }

      // 7. 更新推播活動狀態
      await db
        .update(broadcastCampaigns)
        .set({ status: "completed", sentCount: validCustomers.length })
        .where(eq(broadcastCampaigns.id, input.id));

      return { success: true, sentCount: validCustomers.length };
    }),

  /**
   * 取得推播活動統計
   */
  getStats: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      // 1. 取得推播活動資訊
      const [campaign] = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, input.id))
        .limit(1);

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "推播活動不存在",
        });
      }

      // 2. 計算各狀態的收件人數量
      const [sentResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(broadcastRecipients)
        .where(
          and(
            eq(broadcastRecipients.campaignId, input.id),
            eq(broadcastRecipients.status, "sent")
          )
        );

      const [deliveredResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(broadcastRecipients)
        .where(
          and(
            eq(broadcastRecipients.campaignId, input.id),
            eq(broadcastRecipients.status, "delivered")
          )
        );

      const [failedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(broadcastRecipients)
        .where(
          and(
            eq(broadcastRecipients.campaignId, input.id),
            eq(broadcastRecipients.status, "failed")
          )
        );

      const sentCount = Number(sentResult.count);
      const deliveredCount = Number(deliveredResult.count);
      const failedCount = Number(failedResult.count);

      // 3. 計算送達率
      const totalRecipients = campaign.totalRecipients || 0;
      const deliveryRate =
        totalRecipients > 0
          ? (deliveredCount / totalRecipients) * 100
          : 0;

      return {
        totalRecipients: campaign.totalRecipients,
        sentCount,
        deliveredCount,
        failedCount,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
      };
    }),

  /**
   * 取得推播活動收件人列表
   */
  getRecipients: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      status: z.enum(["pending", "sent", "delivered", "failed"]).optional(),
    }))
    .query(async ({ input }) => {
      const conditions: any[] = [eq(broadcastRecipients.campaignId, input.campaignId)];

      if (input.status) {
        conditions.push(eq(broadcastRecipients.status, input.status));
      }

      const recipients = await db
        .select({
          id: broadcastRecipients.id,
          customerId: broadcastRecipients.customerId,
          customerName: customers.name,
          lineUserId: broadcastRecipients.lineUserId,
          status: broadcastRecipients.status,
          sentAt: broadcastRecipients.sentAt,
          deliveredAt: broadcastRecipients.deliveredAt,
          clickedAt: broadcastRecipients.clickedAt,
          errorMessage: broadcastRecipients.errorMessage,
        })
        .from(broadcastRecipients)
        .innerJoin(customers, eq(broadcastRecipients.customerId, customers.id))
        .where(and(...conditions))
        .orderBy(desc(broadcastRecipients.sentAt));

      return recipients;
    }),
});
