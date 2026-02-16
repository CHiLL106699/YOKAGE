import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { db } from '../db';
import { lineWebhookEvents, lineMessagingSettings, customers, interactions, autoReplyRules } from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { verifyLineSignature, type LineWebhookPayload, type LineWebhookEvent } from '../_core/lineWebhook';
import { TRPCError } from '@trpc/server';

export const lineWebhookRouter = router({
  /**
   * LINE Webhook 接收端點（由 LINE 平台呼叫）
   * 注意：此端點應該由 Express middleware 處理，而非 tRPC
   * 這裡僅提供內部處理邏輯
   */
  processWebhookEvent: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      signature: z.string(),
      body: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, signature, body } = input;

      // 1. 取得 LINE Channel Secret
      const [settings] = await db
        .select()
        .from(lineMessagingSettings)
        .where(eq(lineMessagingSettings.organizationId, organizationId))
        .limit(1);

      if (!settings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'LINE Messaging settings not found',
        });
      }

      // 2. 驗證簽章
      const isValid = verifyLineSignature(body, signature, settings.channelSecret);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid LINE signature',
        });
      }

      // 3. 解析 Webhook Payload
      const payload: LineWebhookPayload = JSON.parse(body);

      // 4. 處理每個事件
      const results = [];
      for (const event of payload.events) {
        const result = await processLineEvent(organizationId, event);
        results.push(result);
      }

      return { success: true, processed: results.length };
    }),

  /**
   * 查詢 Webhook 事件日誌
   */
  listEvents: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
      eventType: z.string().optional(),
      sourceId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, page, pageSize, eventType, sourceId } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(lineWebhookEvents.organizationId, organizationId)];
      if (eventType) {
        conditions.push(eq(lineWebhookEvents.eventType, eventType));
      }
      if (sourceId) {
        conditions.push(eq(lineWebhookEvents.sourceId, sourceId));
      }

      const events = await db
        .select()
        .from(lineWebhookEvents)
        .where(and(...conditions))
        .orderBy(desc(lineWebhookEvents.createdAt))
        .limit(pageSize)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(lineWebhookEvents)
        .where(and(...conditions));
      const count = countResult[0]?.count || 0;

      return {
        events,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      };
    }),

  /**
   * 取得單一事件詳情
   */
  getEvent: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const [event] = await db
        .select()
        .from(lineWebhookEvents)
        .where(eq(lineWebhookEvents.id, input.id))
        .limit(1);

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      return event;
    }),
});

/**
 * 處理 LINE Webhook 事件
 */
async function processLineEvent(organizationId: number, event: LineWebhookEvent) {
  // 1. 記錄事件到資料庫
  const [webhookEvent] = await db.insert(lineWebhookEvents).values({
    organizationId,
    eventType: event.type,
    sourceType: event.source.type,
    sourceId: event.source.userId || event.source.groupId || event.source.roomId || '',
    messageType: event.message?.type || null,
    messageText: event.message?.text || null,
    messageId: event.message?.id || null,
    replyToken: event.replyToken || null,
    rawPayload: JSON.stringify(event),
     isProcessed: false,
  }).returning();
  // 2. 根據事件類型進行處理
  switch (event.type) {
    case 'message':
      await handleMessageEvent(organizationId, event, webhookEvent.id);
      break;
    case 'follow':
      await handleFollowEvent(organizationId, event);
      break;
    case 'unfollow':
      await handleUnfollowEvent(organizationId, event);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // 3. 標記事件為已處理
  await db
    .update(lineWebhookEvents)
    .set({
      isProcessed: true,
      processedAt: new Date(),
    })
    .where(eq(lineWebhookEvents.id, webhookEvent.id));

  return { eventId: webhookEvent.id, type: event.type };
}

/**
 * 處理訊息事件
 */
async function handleMessageEvent(organizationId: number, event: LineWebhookEvent, webhookEventId: number) {
  if (!event.message || !event.source.userId) {
    return;
  }

  // 1. 查找客戶
  const [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.organizationId, organizationId),
        eq(customers.lineUserId, event.source.userId)
      )
    )
    .limit(1);

  if (!customer) {
    console.log(`Customer not found for LINE User ID: ${event.source.userId}`);
    return;
  }

  // 2. 建立互動記錄
  const messageText = event.message.type === 'text' ? event.message.text : `[${event.message.type}]`;
  await db.insert(interactions).values({
    organizationId,
    customerId: customer.id,
    type: 'line',
    title: 'LINE 訊息',
    content: messageText || '',
    createdBy: null, // 客戶發送的訊息，createdBy 為 null
  });

  // 3. 檢查自動回覆規則
  if (event.message.type === 'text' && event.message.text) {
    await checkAutoReplyRules(organizationId, event.message.text, event.replyToken);
  }
}

/**
 * 處理關注事件
 */
async function handleFollowEvent(organizationId: number, event: LineWebhookEvent) {
  if (!event.source.userId) {
    return;
  }

  // 查找或建立客戶
  const [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.organizationId, organizationId),
        eq(customers.lineUserId, event.source.userId)
      )
    )
    .limit(1);

  if (customer) {
    // 建立互動記錄
    await db.insert(interactions).values({
      organizationId,
      customerId: customer.id,
      type: 'line',
      title: 'LINE 關注',
      content: '客戶已關注 LINE Bot',
      createdBy: null,
    });
  }
}

/**
 * 處理取消關注事件
 */
async function handleUnfollowEvent(organizationId: number, event: LineWebhookEvent) {
  if (!event.source.userId) {
    return;
  }

  // 查找客戶
  const [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.organizationId, organizationId),
        eq(customers.lineUserId, event.source.userId)
      )
    )
    .limit(1);

  if (customer) {
    // 建立互動記錄
    await db.insert(interactions).values({
      organizationId,
      customerId: customer.id,
      type: 'line',
      title: 'LINE 取消關注',
      content: '客戶已取消關注 LINE Bot',
      createdBy: null,
    });
  }
}

/**
 * 檢查自動回覆規則
 */
async function checkAutoReplyRules(organizationId: number, messageText: string, replyToken?: string) {
  if (!replyToken) {
    return;
  }

  // 查詢啟用的自動回覆規則（按優先級排序）
  const rules = await db
    .select()
    .from(autoReplyRules)
    .where(
      and(
        eq(autoReplyRules.organizationId, organizationId),
        eq(autoReplyRules.isActive, true)
      )
    )
    .orderBy(desc(autoReplyRules.priority));

  // 檢查規則是否匹配
  for (const rule of rules) {
    let isMatch = false;

    switch (rule.triggerType) {
      case 'keyword':
        isMatch = messageText.includes(rule.triggerValue || '');
        break;
      case 'regex':
        try {
          const regex = new RegExp(rule.triggerValue || '');
          isMatch = regex.test(messageText);
        } catch (error) {
          console.error(`Invalid regex in rule ${rule.id}:`, error);
        }
        break;
      case 'always':
        isMatch = true;
        break;
    }

    if (isMatch) {
      // 發送自動回覆（這裡需要整合 LINE Messaging API）
      console.log(`Auto-reply rule matched: ${rule.name}`);
      // TODO: 實作自動回覆發送邏輯
      break; // 只觸發第一個匹配的規則
    }
  }
}
