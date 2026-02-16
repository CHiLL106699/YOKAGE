import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { broadcastCampaignVariants, broadcastCampaigns } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * 推播活動 A/B 測試版本管理 Router
 * Phase 110
 *
 * 功能：
 * - 版本 CRUD（createVariant, updateVariant, deleteVariant, listVariants）
 * - 版本效果統計（getVariantStats）
 * - 自動分配演算法（autoDistribute）
 * - 選出最佳版本（selectWinner）
 */

// ============================================
// Zod Schemas
// ============================================

const variantInputSchema = z.object({
  campaignId: z.number(),
  variantName: z.string().min(1, "版本名稱不可為空"),
  messageContent: z.string().min(1, "訊息內容不可為空"),
  messageType: z.enum(["text", "image", "flex"]),
  flexMessageJson: z.any().optional(),
  trafficPercentage: z.number().min(0).max(100),
});

const variantUpdateSchema = z.object({
  id: z.number(),
  variantName: z.string().min(1).optional(),
  messageContent: z.string().min(1).optional(),
  messageType: z.enum(["text", "image", "flex"]).optional(),
  flexMessageJson: z.any().optional(),
  trafficPercentage: z.number().min(0).max(100).optional(),
});

// ============================================
// Router
// ============================================

export const broadcastVariantsRouter = router({
  /**
   * 建立新的訊息版本
   */
  createVariant: protectedProcedure
    .input(variantInputSchema)
    .mutation(async ({ input }) => {
      // 驗證 campaign 存在
      const [campaign] = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, input.campaignId))
        .limit(1);

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "推播活動不存在",
        });
      }

      // 驗證流量百分比總和不超過 100
      const existingVariants = await db
        .select({ trafficPercentage: broadcastCampaignVariants.trafficPercentage })
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.campaignId, input.campaignId));

      const currentTotal = existingVariants.reduce(
        (sum, v) => sum + (v.trafficPercentage || 0),
        0
      );

      if (currentTotal + input.trafficPercentage > 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `流量百分比總和不可超過 100%（目前已分配 ${currentTotal}%，嘗試新增 ${input.trafficPercentage}%）`,
        });
      }

      const [result] = await db
        .insert(broadcastCampaignVariants)
        .values({
          campaignId: input.campaignId,
          variantName: input.variantName,
          messageContent: input.messageContent,
          messageType: input.messageType,
          flexMessageJson: input.flexMessageJson ?? null,
          trafficPercentage: input.trafficPercentage,
          sentCount: 0,
          openedCount: 0,
          clickedCount: 0,
          convertedCount: 0,
        })
        .returning();

      return result;
    }),

  /**
   * 批量建立版本（用於建立活動時一次建立多個版本）
   */
  createBatch: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        variants: z.array(
          z.object({
            variantName: z.string().min(1),
            messageContent: z.string().min(1),
            messageType: z.enum(["text", "image", "flex"]),
            flexMessageJson: z.any().optional(),
            trafficPercentage: z.number().min(0).max(100),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      // 驗證 campaign 存在
      const [campaign] = await db
        .select()
        .from(broadcastCampaigns)
        .where(eq(broadcastCampaigns.id, input.campaignId))
        .limit(1);

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "推播活動不存在",
        });
      }

      // 驗證流量百分比總和
      const totalPercentage = input.variants.reduce(
        (sum, v) => sum + v.trafficPercentage,
        0
      );

      if (totalPercentage > 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `流量百分比總和不可超過 100%（目前為 ${totalPercentage}%）`,
        });
      }

      // 批量插入
      const results = await db
        .insert(broadcastCampaignVariants)
        .values(
          input.variants.map((v) => ({
            campaignId: input.campaignId,
            variantName: v.variantName,
            messageContent: v.messageContent,
            messageType: v.messageType,
            flexMessageJson: v.flexMessageJson ?? null,
            trafficPercentage: v.trafficPercentage,
            sentCount: 0,
            openedCount: 0,
            clickedCount: 0,
            convertedCount: 0,
          }))
        )
        .returning();

      return results;
    }),

  /**
   * 更新版本內容
   */
  updateVariant: protectedProcedure
    .input(variantUpdateSchema)
    .mutation(async ({ input }) => {
      // 驗證版本存在
      const [existing] = await db
        .select()
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "版本不存在",
        });
      }

      // 若更新流量百分比，驗證總和
      if (input.trafficPercentage !== undefined) {
        const otherVariants = await db
          .select({ trafficPercentage: broadcastCampaignVariants.trafficPercentage })
          .from(broadcastCampaignVariants)
          .where(
            and(
              eq(broadcastCampaignVariants.campaignId, existing.campaignId),
              sql`${broadcastCampaignVariants.id} != ${input.id}`
            )
          );

        const othersTotal = otherVariants.reduce(
          (sum, v) => sum + (v.trafficPercentage || 0),
          0
        );

        if (othersTotal + input.trafficPercentage > 100) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `流量百分比總和不可超過 100%（其他版本已分配 ${othersTotal}%）`,
          });
        }
      }

      const updateData: Record<string, any> = {};
      if (input.variantName !== undefined) updateData.variantName = input.variantName;
      if (input.messageContent !== undefined) updateData.messageContent = input.messageContent;
      if (input.messageType !== undefined) updateData.messageType = input.messageType;
      if (input.flexMessageJson !== undefined) updateData.flexMessageJson = input.flexMessageJson;
      if (input.trafficPercentage !== undefined) updateData.trafficPercentage = input.trafficPercentage;
      updateData.updatedAt = new Date();

      await db
        .update(broadcastCampaignVariants)
        .set(updateData)
        .where(eq(broadcastCampaignVariants.id, input.id));

      const [updated] = await db
        .select()
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.id, input.id))
        .limit(1);

      return updated;
    }),

  /**
   * 刪除版本
   */
  deleteVariant: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "版本不存在",
        });
      }

      await db
        .delete(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.id, input.id));

      return { success: true };
    }),

  /**
   * 列出活動的所有版本
   */
  listVariants: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const variants = await db
        .select()
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.campaignId, input.campaignId))
        .orderBy(broadcastCampaignVariants.id);

      return variants;
    }),

  /**
   * 取得版本效果統計（開啟率/點擊率/轉換率）
   */
  getVariantStats: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const variants = await db
        .select()
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.campaignId, input.campaignId))
        .orderBy(broadcastCampaignVariants.id);

      const stats = variants.map((v) => {
        const sent = v.sentCount || 0;
        const opened = v.openedCount || 0;
        const clicked = v.clickedCount || 0;
        const converted = v.convertedCount || 0;

        return {
          id: v.id,
          variantName: v.variantName,
          messageType: v.messageType,
          trafficPercentage: v.trafficPercentage,
          sentCount: sent,
          openedCount: opened,
          clickedCount: clicked,
          convertedCount: converted,
          openRate: sent > 0 ? Math.round((opened / sent) * 10000) / 100 : 0,
          clickRate: sent > 0 ? Math.round((clicked / sent) * 10000) / 100 : 0,
          convertRate: sent > 0 ? Math.round((converted / sent) * 10000) / 100 : 0,
          // 綜合評分：開啟率 * 0.3 + 點擊率 * 0.4 + 轉換率 * 0.3
          score:
            sent > 0
              ? Math.round(
                  ((opened / sent) * 0.3 +
                    (clicked / sent) * 0.4 +
                    (converted / sent) * 0.3) *
                    10000
                ) / 100
              : 0,
        };
      });

      // 找出最佳版本
      const bestVariant =
        stats.length > 0
          ? stats.reduce((best, current) =>
              current.score > best.score ? current : best
            )
          : null;

      return {
        variants: stats,
        bestVariantId: bestVariant?.id ?? null,
        bestVariantName: bestVariant?.variantName ?? null,
      };
    }),

  /**
   * 自動分配演算法
   * mode: 'random' (隨機分配) | 'weighted' (權重分配)
   *
   * 此 API 接收一組客戶 ID 列表，根據版本的流量百分比分配客戶到不同版本。
   * 回傳分配結果：{ variantId: number, customerIds: number[] }[]
   */
  autoDistribute: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        customerIds: z.array(z.number()),
        mode: z.enum(["random", "weighted"]).default("weighted"),
      })
    )
    .mutation(async ({ input }) => {
      const variants = await db
        .select()
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.campaignId, input.campaignId))
        .orderBy(broadcastCampaignVariants.id);

      if (variants.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "此活動尚未建立任何版本",
        });
      }

      const totalPercentage = variants.reduce(
        (sum, v) => sum + (v.trafficPercentage || 0),
        0
      );

      if (totalPercentage === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "所有版本的流量百分比皆為 0",
        });
      }

      const customerIds = [...input.customerIds];
      const distribution: { variantId: number; variantName: string; customerIds: number[] }[] =
        variants.map((v) => ({
          variantId: v.id,
          variantName: v.variantName,
          customerIds: [],
        }));

      if (input.mode === "random") {
        // 隨機分配：打亂客戶列表後按比例切分
        for (let i = customerIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [customerIds[i], customerIds[j]] = [customerIds[j], customerIds[i]];
        }

        let offset = 0;
        for (let i = 0; i < variants.length; i++) {
          const ratio = (variants[i].trafficPercentage || 0) / totalPercentage;
          const count =
            i === variants.length - 1
              ? customerIds.length - offset
              : Math.round(customerIds.length * ratio);
          distribution[i].customerIds = customerIds.slice(offset, offset + count);
          offset += count;
        }
      } else {
        // 權重分配：每位客戶根據權重隨機分配到某個版本
        const cumulativeWeights: number[] = [];
        let cumulative = 0;
        for (const v of variants) {
          cumulative += (v.trafficPercentage || 0) / totalPercentage;
          cumulativeWeights.push(cumulative);
        }

        for (const customerId of customerIds) {
          const rand = Math.random();
          let assignedIndex = 0;
          for (let i = 0; i < cumulativeWeights.length; i++) {
            if (rand <= cumulativeWeights[i]) {
              assignedIndex = i;
              break;
            }
          }
          distribution[assignedIndex].customerIds.push(customerId);
        }
      }

      // 更新各版本的 sentCount
      for (const d of distribution) {
        if (d.customerIds.length > 0) {
          await db
            .update(broadcastCampaignVariants)
            .set({
              sentCount: sql`${broadcastCampaignVariants.sentCount} + ${d.customerIds.length}`,
              updatedAt: new Date(),
            })
            .where(eq(broadcastCampaignVariants.id, d.variantId));
        }
      }

      return distribution;
    }),

  /**
   * 選出最佳版本
   * 根據綜合評分（開啟率 * 0.3 + 點擊率 * 0.4 + 轉換率 * 0.3）選出最佳版本，
   * 並將該版本的訊息內容回寫到主推播活動中。
   */
  selectWinner: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        winnerId: z.number().optional(), // 若不指定，則自動選出最佳版本
      })
    )
    .mutation(async ({ input }) => {
      const variants = await db
        .select()
        .from(broadcastCampaignVariants)
        .where(eq(broadcastCampaignVariants.campaignId, input.campaignId))
        .orderBy(broadcastCampaignVariants.id);

      if (variants.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "此活動尚未建立任何版本",
        });
      }

      let winner;

      if (input.winnerId) {
        // 手動指定贏家
        winner = variants.find((v) => v.id === input.winnerId);
        if (!winner) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "指定的版本不存在",
          });
        }
      } else {
        // 自動選出最佳版本（根據綜合評分）
        winner = variants.reduce((best, current) => {
          const bestSent = best.sentCount || 0;
          const currentSent = current.sentCount || 0;

          const bestScore =
            bestSent > 0
              ? ((best.openedCount || 0) / bestSent) * 0.3 +
                ((best.clickedCount || 0) / bestSent) * 0.4 +
                ((best.convertedCount || 0) / bestSent) * 0.3
              : 0;

          const currentScore =
            currentSent > 0
              ? ((current.openedCount || 0) / currentSent) * 0.3 +
                ((current.clickedCount || 0) / currentSent) * 0.4 +
                ((current.convertedCount || 0) / currentSent) * 0.3
              : 0;

          return currentScore > bestScore ? current : best;
        });
      }

      // 將贏家的訊息內容回寫到主推播活動
      // 注意：broadcastCampaigns.messageContent 是 jsonb 型別
      const messageContentForCampaign =
        winner.messageType === "flex" && winner.flexMessageJson
          ? winner.flexMessageJson
          : { type: winner.messageType, text: winner.messageContent };

      await db
        .update(broadcastCampaigns)
        .set({
          messageType: winner.messageType,
          messageContent: messageContentForCampaign,
          updatedAt: new Date(),
        })
        .where(eq(broadcastCampaigns.id, input.campaignId));

      return {
        winnerId: winner.id,
        winnerName: winner.variantName,
        messageType: winner.messageType,
        messageContent: winner.messageContent,
        sentCount: winner.sentCount,
        openedCount: winner.openedCount,
        clickedCount: winner.clickedCount,
        convertedCount: winner.convertedCount,
      };
    }),

  /**
   * 更新版本的成效指標（供 Webhook 回調使用）
   */
  updateMetrics: protectedProcedure
    .input(
      z.object({
        variantId: z.number(),
        metric: z.enum(["opened", "clicked", "converted"]),
        increment: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const columnMap = {
        opened: broadcastCampaignVariants.openedCount,
        clicked: broadcastCampaignVariants.clickedCount,
        converted: broadcastCampaignVariants.convertedCount,
      };

      const column = columnMap[input.metric];

      await db
        .update(broadcastCampaignVariants)
        .set({
          [input.metric === "opened"
            ? "openedCount"
            : input.metric === "clicked"
            ? "clickedCount"
            : "convertedCount"]: sql`${column} + ${input.increment}`,
          updatedAt: new Date(),
        })
        .where(eq(broadcastCampaignVariants.id, input.variantId));

      return { success: true };
    }),
});
