import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import { db } from './db';
import { customers, crmTags, customerTagAssignments, interactions, tagRules, lineMessagingSettings } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

describe('CRM Integration Tests', () => {
  let testOrganizationId: number;
  let testCustomerId: number;
  let testTagId: number;

  beforeAll(async () => {
    // 使用測試組織 ID
    testOrganizationId = 1;
  });

  afterAll(async () => {
    // 清理測試資料
    if (testCustomerId) {
      await db.delete(interactions).where(eq(interactions.customerId, testCustomerId));
      await db.delete(customerTagAssignments).where(eq(customerTagAssignments.customerId, testCustomerId));
      await db.delete(customers).where(eq(customers.id, testCustomerId));
    }
    if (testTagId) {
      await db.delete(tagRules).where(eq(tagRules.tagId, testTagId));
      await db.delete(crmTags).where(eq(crmTags.id, testTagId));
    }
  });

  describe('Customer Management', () => {
    it('should create a new customer', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.crmCustomers.create({
        organizationId: testOrganizationId,
        name: '測試客戶',
        phone: '0912345678',
        email: 'test@test.com',
        lineUserId: 'U1234567890',
        gender: 'female',
        birthday: '1990-01-01',
        address: '台北市信義區',
        source: '測試來源',
        memberLevel: 'silver',
        notes: '測試備註',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('測試客戶');
      testCustomerId = result.id;
    });

    it('should list customers', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.crmCustomers.list({
        organizationId: testOrganizationId,
        page: 1,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(result.customers).toBeInstanceOf(Array);
      expect(result.customers.length).toBeGreaterThan(0);
    });
  });

  describe('Tag Management', () => {
    it('should create a new tag', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.crmTags.create({
        organizationId: testOrganizationId,
        name: '測試標籤',
        color: '#FF5733',
        description: '測試標籤描述',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('測試標籤');
      testTagId = result.id;
    });

    it('should assign tag to customer', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      await caller.crmCustomers.addTag({
        customerId: testCustomerId,
        tagId: testTagId,
      });

      const tags = await caller.crmCustomers.getCustomerTags({ customerId: testCustomerId });
      expect(tags).toBeInstanceOf(Array);
      expect(tags.some((t: any) => t.id === testTagId)).toBe(true);
    });
  });

  describe('Interaction History', () => {
    it('should create interaction record', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.interactions.create({
        customerId: testCustomerId,
        type: 'phone',
        title: '測試電話',
        content: '測試電話內容',
        createdBy: 1,
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('測試電話');
    });

    it('should list interaction records', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.interactions.list({
        customerId: testCustomerId,
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Tag Rules', () => {
    it('should create tag rule', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.tagRules.create({
        organizationId: testOrganizationId,
        tagId: testTagId,
        name: '測試規則',
        description: '測試規則描述',
        ruleType: 'spending',
        condition: '>=',
        value: 10000,
        isActive: true,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('測試規則');
    });

    it('should list tag rules', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.tagRules.list({
        organizationId: testOrganizationId,
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('LINE Messaging', () => {
    it('should save LINE settings', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.lineMessaging.saveSettings({
        organizationId: testOrganizationId,
        channelAccessToken: 'test-token',
        channelSecret: 'test-secret',
      });

      expect(result).toBeDefined();
      expect(result.organizationId).toBe(testOrganizationId);
    });

    it('should get LINE settings', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', openId: 'test-open-id' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.lineMessaging.getSettings({
        organizationId: testOrganizationId,
      });

      expect(result).toBeDefined();
      expect(result?.organizationId).toBe(testOrganizationId);
    });
  });
});
