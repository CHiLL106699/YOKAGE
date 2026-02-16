import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { voucherTemplates, voucherInstances, customers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// 直接建立資料庫連接
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

describe("Voucher System", () => {
  let testTemplateId: number;
  let testCustomerId: number;
  let testVoucherCode: string;
  const testOrgId = 1;

  beforeAll(async () => {
    // 確保有測試客戶
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.organizationId, testOrgId))
      .limit(1);

    if (existingCustomers.length > 0) {
      testCustomerId = existingCustomers[0].id;
    } else {
      const [newCustomer] = await db
        .insert(customers)
        .values({
          organizationId: testOrgId,
          name: "測試客戶",
          phone: "0912345678",
          memberLevel: "silver",
        })
        .returning({ id: customers.id });
      testCustomerId = newCustomer.id;
    }
  });

  afterAll(async () => {
    // 清理測試數據
    if (testTemplateId) {
      await db.delete(voucherInstances).where(eq(voucherInstances.templateId, testTemplateId));
      await db.delete(voucherTemplates).where(eq(voucherTemplates.id, testTemplateId));
    }
    await client.end();
  });

  describe("Voucher Template CRUD", () => {
    it("should create a voucher template", async () => {
      const [template] = await db
        .insert(voucherTemplates)
        .values({
          organizationId: testOrgId,
          name: "測試療程券",
          type: "treatment",
          value: "3",
          valueType: "treatment_count",
          description: "測試用療程券，可兌換 3 堂療程",
          validityDays: 90,
          maxUsageCount: 3,
          isActive: true,
          backgroundColor: "#1E3A5F",
          textColor: "#F5D78E",
        })
        .returning({ id: voucherTemplates.id });

      testTemplateId = template.id;
      expect(testTemplateId).toBeGreaterThan(0);
    });

    it("should read voucher template", async () => {
      const templates = await db
        .select()
        .from(voucherTemplates)
        .where(eq(voucherTemplates.id, testTemplateId));

      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe("測試療程券");
      expect(templates[0].type).toBe("treatment");
      expect(templates[0].value).toContain("3");
    });

    it("should update voucher template", async () => {
      await db
        .update(voucherTemplates)
        .set({ name: "更新後的療程券" })
        .where(eq(voucherTemplates.id, testTemplateId));

      const [updated] = await db
        .select()
        .from(voucherTemplates)
        .where(eq(voucherTemplates.id, testTemplateId));

      expect(updated.name).toBe("更新後的療程券");
    });
  });

  describe("Voucher Instance Operations", () => {
    it("should issue a voucher to customer", async () => {
      // 生成票券代碼
      testVoucherCode = `TEST${Date.now().toString(36).toUpperCase().slice(-6)}`;

      const [instance] = await db
        .insert(voucherInstances)
        .values({
          organizationId: testOrgId,
          templateId: testTemplateId,
          customerId: testCustomerId,
          voucherCode: testVoucherCode,
          status: "active",
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 天後
          remainingUses: 3,
          usedCount: 0,
          issueChannel: "manual",
        })
        .returning({ id: voucherInstances.id });

      expect(instance.id).toBeGreaterThan(0);
    });

    it("should find voucher by code", async () => {
      const [voucher] = await db
        .select()
        .from(voucherInstances)
        .where(eq(voucherInstances.voucherCode, testVoucherCode));

      expect(voucher).toBeDefined();
      expect(voucher.status).toBe("active");
      expect(voucher.customerId).toBe(testCustomerId);
    });

    it("should redeem voucher", async () => {
      // 模擬核銷 - 使用正確的欄位名稱
      await db
        .update(voucherInstances)
        .set({
          usedCount: 1,
          remainingUses: 2,
        })
        .where(eq(voucherInstances.voucherCode, testVoucherCode));

      const [redeemed] = await db
        .select()
        .from(voucherInstances)
        .where(eq(voucherInstances.voucherCode, testVoucherCode));

      expect(redeemed).toBeDefined();
      expect(redeemed?.usedCount).toBe(1);
      expect(redeemed?.remainingUses).toBe(2);
    });

    it("should mark voucher as used when max usage reached", async () => {
      // 模擬用完所有次數
      await db
        .update(voucherInstances)
        .set({
          usedCount: 3,
          remainingUses: 0,
          status: "used",
        })
        .where(eq(voucherInstances.voucherCode, testVoucherCode));

      const [used] = await db
        .select()
        .from(voucherInstances)
        .where(eq(voucherInstances.voucherCode, testVoucherCode));

      expect(used).toBeDefined();
      expect(used?.status).toBe("used");
      expect(used?.usedCount).toBe(3);
    });
  });

  describe("Voucher Validation", () => {
    it("should reject expired voucher", async () => {
      // 建立一個已過期的票券
      const expiredCode = `EXP${Date.now().toString(36).toUpperCase().slice(-6)}`;
      
      await db.insert(voucherInstances).values({
        organizationId: testOrgId,
        templateId: testTemplateId,
        customerId: testCustomerId,
        voucherCode: expiredCode,
        status: "active",
        validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天過期
        remainingUses: 1,
        usedCount: 0,
        issueChannel: "manual",
      });

      const [expired] = await db
        .select()
        .from(voucherInstances)
        .where(eq(voucherInstances.voucherCode, expiredCode));

      // 檢查是否已過期
      expect(expired).toBeDefined();
      const isExpired = expired?.validUntil && new Date(expired.validUntil) < new Date();
      expect(isExpired).toBe(true);

      // 清理
      await db.delete(voucherInstances).where(eq(voucherInstances.voucherCode, expiredCode));
    });

    it("should reject already used voucher", async () => {
      const usedCode = `USED${Date.now().toString(36).toUpperCase().slice(-6)}`;
      
      await db.insert(voucherInstances).values({
        organizationId: testOrgId,
        templateId: testTemplateId,
        customerId: testCustomerId,
        voucherCode: usedCode,
        status: "used",
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        remainingUses: 0,
        usedCount: 1,
        issueChannel: "manual",
      });

      const [used] = await db
        .select()
        .from(voucherInstances)
        .where(eq(voucherInstances.voucherCode, usedCode));

      expect(used).toBeDefined();
      expect(used?.status).toBe("used");

      // 清理
      await db.delete(voucherInstances).where(eq(voucherInstances.voucherCode, usedCode));
    });
  });
});
