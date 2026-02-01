import { z } from "zod";
import { router, protectedProcedure, adminProcedure, publicProcedure } from "../_core/trpc";
import { db } from "../db";
import { lineMessagingSettings, customers, interactions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const lineMessagingRouter = router({
  // 查詢診所的 LINE Messaging 設定
  getSettings: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const [settings] = await db
        .select()
        .from(lineMessagingSettings)
        .where(eq(lineMessagingSettings.organizationId, input.organizationId))
        .limit(1);

      return settings || null;
    }),

  // 建立或更新 LINE Messaging 設定
  upsertSettings: adminProcedure
    .input(
      z.object({
        organizationId: z.number(),
        channelAccessToken: z.string().min(1),
        channelSecret: z.string().min(1),
        webhookUrl: z.string().url().optional(),
        isActive: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 檢查是否已存在設定
      const [existing] = await db
        .select()
        .from(lineMessagingSettings)
        .where(eq(lineMessagingSettings.organizationId, input.organizationId))
        .limit(1);

      if (existing) {
        // 更新現有設定
        await db
          .update(lineMessagingSettings)
          .set({
            channelAccessToken: input.channelAccessToken,
            channelSecret: input.channelSecret,
            webhookUrl: input.webhookUrl,
            isActive: input.isActive,
          })
          .where(eq(lineMessagingSettings.id, existing.id));

        return { success: true, id: existing.id };
      } else {
        // 建立新設定
        const [result] = await db.insert(lineMessagingSettings).values(input);

        return { success: true, id: result.insertId };
      }
    }),

  // 發送訊息給客戶
  sendMessage: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        customerId: z.number(),
        messageType: z.enum(["text", "flex"]),
        content: z.string(),
        flexMessage: z.any().optional(), // Flex Message JSON
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 查詢 LINE Messaging 設定
      const [settings] = await db
        .select()
        .from(lineMessagingSettings)
        .where(and(
          eq(lineMessagingSettings.organizationId, input.organizationId),
          eq(lineMessagingSettings.isActive, true)
        ))
        .limit(1);

      if (!settings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "LINE Messaging 設定不存在或未啟用",
        });
      }

      // 查詢客戶資訊
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, input.customerId))
        .limit(1);

      if (!customer || !customer.lineUserId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "客戶不存在或未綁定 LINE 帳號",
        });
      }

      // 準備訊息內容
      let messagePayload: any;
      if (input.messageType === "text") {
        messagePayload = {
          type: "text",
          text: input.content,
        };
      } else if (input.messageType === "flex" && input.flexMessage) {
        messagePayload = {
          type: "flex",
          altText: input.content,
          contents: input.flexMessage,
        };
      }

      // 發送 LINE 訊息
      try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.channelAccessToken}`,
          },
          body: JSON.stringify({
            to: customer.lineUserId,
            messages: [messagePayload],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `LINE API 錯誤: ${errorData.message || "未知錯誤"}`,
          });
        }

        // 記錄互動歷史
        await db.insert(interactions).values({
          organizationId: input.organizationId,
          customerId: input.customerId,
          type: "line",
          title: "發送 LINE 訊息",
          content: input.content,
          createdBy: ctx.user.id,
        });

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `發送訊息失敗: ${error.message}`,
        });
      }
    }),

  // 批量發送訊息
  sendBulkMessage: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        customerIds: z.array(z.number()),
        messageType: z.enum(["text", "flex"]),
        content: z.string(),
        flexMessage: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 查詢 LINE Messaging 設定
      const [settings] = await db
        .select()
        .from(lineMessagingSettings)
        .where(and(
          eq(lineMessagingSettings.organizationId, input.organizationId),
          eq(lineMessagingSettings.isActive, true)
        ))
        .limit(1);

      if (!settings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "LINE Messaging 設定不存在或未啟用",
        });
      }

      let successCount = 0;
      let failCount = 0;

      for (const customerId of input.customerIds) {
        try {
          // 查詢客戶資訊
          const [customer] = await db
            .select()
            .from(customers)
            .where(eq(customers.id, customerId))
            .limit(1);

          if (!customer || !customer.lineUserId) {
            failCount++;
            continue;
          }

          // 準備訊息內容
          let messagePayload: any;
          if (input.messageType === "text") {
            messagePayload = {
              type: "text",
              text: input.content,
            };
          } else if (input.messageType === "flex" && input.flexMessage) {
            messagePayload = {
              type: "flex",
              altText: input.content,
              contents: input.flexMessage,
            };
          }

          // 發送 LINE 訊息
          const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${settings.channelAccessToken}`,
            },
            body: JSON.stringify({
              to: customer.lineUserId,
              messages: [messagePayload],
            }),
          });

          if (response.ok) {
            // 記錄互動歷史
            await db.insert(interactions).values({
              organizationId: input.organizationId,
              customerId,
              type: "line",
              title: "發送 LINE 訊息（批量）",
              content: input.content,
              createdBy: ctx.user.id,
            });
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      return { success: true, successCount, failCount };
    }),

  // Webhook 接收 LINE 訊息（公開 API）
  webhook: publicProcedure
    .input(
      z.object({
        organizationId: z.number(),
        events: z.array(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      // 處理 LINE Webhook 事件
      for (const event of input.events) {
        if (event.type === "message" && event.message.type === "text") {
          const lineUserId = event.source.userId;
          const messageText = event.message.text;

          // 查詢客戶
          const [customer] = await db
            .select()
            .from(customers)
            .where(and(
              eq(customers.organizationId, input.organizationId),
              eq(customers.lineUserId, lineUserId)
            ))
            .limit(1);

          if (customer) {
            // 記錄客戶訊息為互動歷史
            await db.insert(interactions).values({
              organizationId: input.organizationId,
              customerId: customer.id,
              type: "line",
              title: "收到 LINE 訊息",
              content: messageText,
              createdBy: 1, // 系統自動記錄
            });
          }
        }
      }

      return { success: true };
    }),
});
