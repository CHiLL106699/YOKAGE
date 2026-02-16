import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers.js';
import { db } from './db.js';
import { lineWebhookEvents, autoReplyRules } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

describe('LINE Webhook Integration Tests', () => {
  const caller = appRouter.createCaller({
    user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
    req: {} as any,
    res: {} as any,
  });

  beforeAll(async () => {
    // 清理測試資料
    await db.delete(autoReplyRules).where(eq(autoReplyRules.organizationId, 999));
    await db.delete(lineWebhookEvents).where(eq(lineWebhookEvents.organizationId, 999));
  });

  describe('自動回覆規則管理', () => {
    it('應該能夠新增自動回覆規則', async () => {
      const result = await caller.autoReplyRules.create({
        organizationId: 999,
        name: '測試規則',
        description: '測試用自動回覆規則',
        triggerType: 'keyword',
        triggerValue: '測試',
        replyType: 'text',
        replyContent: '這是測試回覆',
        priority: 10,
        isActive: true,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('測試規則');
      expect(result.triggerType).toBe('keyword');
    });

    it('應該能夠查詢自動回覆規則列表', async () => {
      const result = await caller.autoReplyRules.list({
        organizationId: 999,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('測試規則');
    });

    it('應該能夠更新自動回覆規則', async () => {
      const rules = await caller.autoReplyRules.list({ organizationId: 999 });
      const ruleId = rules[0].id;

      const result = await caller.autoReplyRules.update({
        id: ruleId,
        name: '更新後的規則',
        description: '更新後的描述',
        triggerType: 'keyword',
        triggerValue: '更新',
        replyType: 'text',
        replyContent: '更新後的回覆',
        priority: 20,
        isActive: true,
      });

      expect(result.name).toBe('更新後的規則');
      expect(result.priority).toBe(20);
    });

    it('應該能夠切換規則啟用狀態', async () => {
      const rules = await caller.autoReplyRules.list({ organizationId: 999 });
      const ruleId = rules[0].id;

      const result = await caller.autoReplyRules.toggleActive({
        id: ruleId,
        isActive: false,
      });

      expect(result.isActive).toBe(false);
    });

    it('應該能夠刪除自動回覆規則', async () => {
      const rules = await caller.autoReplyRules.list({ organizationId: 999 });
      const ruleId = rules[0].id;

      await caller.autoReplyRules.delete({ id: ruleId });

      const updatedRules = await caller.autoReplyRules.list({ organizationId: 999 });
      expect(updatedRules.length).toBe(0);
    });
  });

  describe('Webhook 事件記錄', () => {
    it('應該能夠記錄 Webhook 事件', async () => {
      const mockPayload = {
        destination: 'test-destination',
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              id: 'test-message-id',
              text: '測試訊息',
            },
            timestamp: Date.now(),
            source: {
              type: 'user',
              userId: 'test-user-id',
            },
            replyToken: 'test-reply-token',
            mode: 'active',
          },
        ],
      };

      // 手動插入測試事件（模擬 Webhook 接收）
      const [result] = await db.insert(lineWebhookEvents).values({
        organizationId: 999,
        eventType: 'message',
        messageType: 'text',
        messageText: '測試訊息',
        sourceType: 'user',
        sourceId: 'test-user-id',
        sourceUserId: 'test-user-id',
        replyToken: 'test-reply-token',
        rawPayload: JSON.stringify(mockPayload),
        isProcessed: true,
        createdAt: new Date(),
      }).returning();

      const [event] = await db
        .select()
        .from(lineWebhookEvents)
        .where(eq(lineWebhookEvents.id, result.id))
        .limit(1);

      expect(event).toBeDefined();
      expect(event.eventType).toBe('message');
      expect(event.messageText).toBe('測試訊息');
    });

    it('應該能夠查詢 Webhook 事件列表', async () => {
      const result = await caller.lineWebhook.listEvents({
        organizationId: 999,
        page: 1,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
      expect(result.events[0].eventType).toBe('message');
    });
  });

  describe('自動回覆規則匹配', () => {
    beforeAll(async () => {
      // 建立測試規則
      await caller.autoReplyRules.create({
        organizationId: 999,
        name: '關鍵字規則',
        description: '測試關鍵字匹配',
        triggerType: 'keyword',
        triggerValue: '預約',
        replyType: 'text',
        replyContent: '請問您要預約哪個時段？',
        priority: 10,
        isActive: true,
      });

      await caller.autoReplyRules.create({
        organizationId: 999,
        name: '正則表達式規則',
        description: '測試正則表達式匹配',
        triggerType: 'regex',
        triggerValue: '^查詢.*',
        replyType: 'text',
        replyContent: '請稍候，正在為您查詢...',
        priority: 5,
        isActive: true,
      });
    });

    it('應該能夠匹配關鍵字規則', async () => {
      const rules = await caller.autoReplyRules.list({ organizationId: 999 });
      const keywordRule = rules.find((r) => r.triggerType === 'keyword');

      expect(keywordRule).toBeDefined();
      expect('我想預約'.includes(keywordRule!.triggerValue)).toBe(true);
    });

    it('應該能夠匹配正則表達式規則', async () => {
      const rules = await caller.autoReplyRules.list({ organizationId: 999 });
      const regexRule = rules.find((r) => r.triggerType === 'regex');

      expect(regexRule).toBeDefined();
      const regex = new RegExp(regexRule!.triggerValue);
      expect(regex.test('查詢預約')).toBe(true);
      expect(regex.test('我要查詢')).toBe(false);
    });

    it('應該依照優先級選擇規則', async () => {
      const rules = await caller.autoReplyRules.list({ organizationId: 999 });
      const sortedRules = rules.sort((a, b) => b.priority - a.priority);

      expect(sortedRules[0].priority).toBeGreaterThanOrEqual(sortedRules[1].priority);
    });
  });
});
