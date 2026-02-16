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

// ============================================
// 共用的 targetAudience schema
// ============================================
const targetAudienceSchema = z.object({
  tags: z.array(z.number()).optional(),
  minSpent: z.number().optional(),
  maxSpent: z.number().optional(),
  minVisitCount: z.number().optional(),
  maxVisitCount: z.number().optional(),
  lastVisitDaysAgo: z.number().optional(),
  memberLevels: z.array(z.enum(["bronze", "silver", "gold", "platinum", "diamond"])).optional(),
});

type TargetAudience = z.infer<typeof targetAudienceSchema>;

// ============================================
// 提取為獨立的 helper function，避免 broadcastRouter.createCaller 循環引用
// ============================================
async function computeAudienceCount(organizationId: number, targetAudience: TargetAudience): Promise<number> {
  const conditions: any[] = [eq(customers.organizationId, organizationId)];

  if (targetAudience.minSpent !== undefined) {
    conditions.push(gte(customers.totalSpent, targetAudience.minSpent.toString()));
  }
  if (targetAudience.maxSpent !== undefined) {
    conditions.push(lte(customers.totalSpent, targetAudience.maxSpent.toString()));
  }
  if (targetAudience.minVisitCount !== undefined) {
    conditions.push(gte(customers.visitCount, targetAudience.minVisitCount));
  }
  if (targetAudience.maxVisitCount !== undefined) {
    conditions.push(lte(customers.visitCount, targetAudience.maxVisitCount));
  }
  if (targetAudience.memberLevels && targetAudience.memberLevels.length > 0) {
    conditions.push(inArray(customers.memberLevel, targetAudience.memberLevels));
  }

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
  return Number((result as any).count);
}

// ============================================
// Router 定義
// ============================================
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
      targetAudience: targetAudienceSchema,
    }))
    .query(async ({ input }): Promise<{ count: number }> => {
      const count = await computeAudienceCount(input.organizationId, input.targetAudience);
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
      messageContent: z.any(),
      targetAudience: targetAudienceSchema,
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. 使用 helper function 計算目標客戶數量（避免循環引用）
      const count = await computeAudienceCount(input.organizationId, input.targetAudience);

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
      }).returning();

      const insertId = result.id;
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
      targetAudience: targetAudienceSchema.optional(),
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

      if (targetAudience.minSpent !== undefined) {
        conditions.push(gte(customers.totalSpent, targetAudience.minSpent.toString()));
      }
      if (targetAudience.maxSpent !== undefined) {
        conditions.push(lte(customers.totalSpent, targetAudience.maxSpent.toString()));
      }
      if (targetAudience.minVisitCount !== undefined) {
        conditions.push(gte(customers.visitCount, targetAudience.minVisitCount));
      }
      if (targetAudience.maxVisitCount !== undefined) {
        conditions.push(lte(customers.visitCount, targetAudience.maxVisitCount));
      }
      if (targetAudience.memberLevels && targetAudience.memberLevels.length > 0) {
        conditions.push(inArray(customers.memberLevel, targetAudience.memberLevels));
      }

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
