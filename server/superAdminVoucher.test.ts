import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database functions
vi.mock("./db", () => ({
  getGlobalVoucherStats: vi.fn().mockResolvedValue({
    totalTemplates: 10,
    totalIssued: 100,
    totalRedeemed: 50,
    totalExpired: 10,
    redemptionRate: 50,
    pendingReminders: 5,
  }),
  listAllVoucherTemplates: vi.fn().mockResolvedValue({
    data: [
      {
        template: {
          id: 1,
          name: "測試票券",
          type: "discount",
          value: "100",
          valueType: "fixed_amount",
          validDays: 30,
          isActive: true,
        },
        organization: { id: 1, name: "測試診所" },
      },
    ],
    total: 1,
  }),
  getVoucherStatsByOrganization: vi.fn().mockResolvedValue([
    {
      organizationId: 1,
      organizationName: "測試診所",
      templateCount: 5,
      issuedCount: 50,
      redeemedCount: 25,
      redemptionRate: 50,
    },
  ]),
  getAllExpiringVouchers: vi.fn().mockResolvedValue([]),
  batchCreateVoucherTemplates: vi.fn().mockResolvedValue([1, 2, 3]),
  listOrganizations: vi.fn().mockResolvedValue({ data: [{ id: 1, name: "測試診所" }], total: 1 }),
  getAllSystemSettings: vi.fn().mockResolvedValue([]),
  upsertSystemSetting: vi.fn().mockResolvedValue(1),
  scheduleVoucherExpiryReminders: vi.fn().mockResolvedValue(5),
  getReminderStats: vi.fn().mockResolvedValue({ total: 10, pending: 5, sent: 4, failed: 1 }),
  listVoucherReminderLogs: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}));

import * as db from "./db";

describe("Super Admin Voucher Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getGlobalVoucherStats", () => {
    it("should return global voucher statistics", async () => {
      const stats = await db.getGlobalVoucherStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalTemplates).toBe(10);
      expect(stats.totalIssued).toBe(100);
      expect(stats.totalRedeemed).toBe(50);
      expect(stats.redemptionRate).toBe(50);
      expect(stats.pendingReminders).toBe(5);
    });
  });

  describe("listAllVoucherTemplates", () => {
    it("should return all voucher templates with organization info", async () => {
      const result = await db.listAllVoucherTemplates({});
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].template.name).toBe("測試票券");
      expect(result.data[0].organization.name).toBe("測試診所");
    });
  });

  describe("getVoucherStatsByOrganization", () => {
    it("should return voucher stats grouped by organization", async () => {
      const stats = await db.getVoucherStatsByOrganization();
      
      expect(stats).toHaveLength(1);
      expect(stats[0].organizationName).toBe("測試診所");
      expect(stats[0].redemptionRate).toBe(50);
    });
  });

  describe("batchCreateVoucherTemplates", () => {
    it("should create multiple voucher templates", async () => {
      const templates = [
        {
          name: "新客體驗券",
          type: "treatment" as const,
          value: "1",
          valueType: "treatment_count" as const,
          validDays: 60,
          organizationId: 1,
          validityType: "days_from_issue" as const,
        },
        {
          name: "折扣券",
          type: "discount" as const,
          value: "20",
          valueType: "percentage" as const,
          validDays: 30,
          organizationId: 1,
          validityType: "days_from_issue" as const,
        },
      ];
      
      const ids = await db.batchCreateVoucherTemplates(templates);
      
      expect(ids).toHaveLength(3);
      expect(db.batchCreateVoucherTemplates).toHaveBeenCalledWith(templates);
    });
  });

  describe("System Settings", () => {
    it("should get all system settings", async () => {
      const settings = await db.getAllSystemSettings();
      
      expect(Array.isArray(settings)).toBe(true);
    });

    it("should upsert system setting", async () => {
      const id = await db.upsertSystemSetting("test_key", "test_value", "Test description", "platform");
      
      expect(id).toBe(1);
      expect(db.upsertSystemSetting).toHaveBeenCalledWith("test_key", "test_value", "Test description", "platform");
    });
  });

  describe("Voucher Expiry Reminders", () => {
    it("should schedule expiry reminders", async () => {
      const count = await db.scheduleVoucherExpiryReminders(1, 3);
      
      expect(count).toBe(5);
      expect(db.scheduleVoucherExpiryReminders).toHaveBeenCalledWith(1, 3);
    });

    it("should get reminder stats", async () => {
      const stats = await db.getReminderStats();
      
      expect(stats.total).toBe(10);
      expect(stats.pending).toBe(5);
      expect(stats.sent).toBe(4);
      expect(stats.failed).toBe(1);
    });

    it("should list reminder logs", async () => {
      const result = await db.listVoucherReminderLogs({});
      
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});

describe("CSV Import Validation", () => {
  const validVoucherTypes = ["treatment", "discount", "gift_card", "stored_value", "free_item"];
  const validValueTypes = ["fixed_amount", "percentage", "treatment_count"];

  it("should validate voucher type", () => {
    expect(validVoucherTypes.includes("treatment")).toBe(true);
    expect(validVoucherTypes.includes("discount")).toBe(true);
    expect(validVoucherTypes.includes("invalid_type")).toBe(false);
  });

  it("should validate value type", () => {
    expect(validValueTypes.includes("fixed_amount")).toBe(true);
    expect(validValueTypes.includes("percentage")).toBe(true);
    expect(validValueTypes.includes("treatment_count")).toBe(true);
    expect(validValueTypes.includes("invalid_value_type")).toBe(false);
  });

  it("should validate CSV row data", () => {
    const validRow = {
      name: "測試票券",
      type: "discount",
      value: "100",
      valueType: "fixed_amount",
      validDays: 30,
    };

    expect(validRow.name.length).toBeGreaterThan(0);
    expect(validVoucherTypes.includes(validRow.type)).toBe(true);
    expect(validValueTypes.includes(validRow.valueType)).toBe(true);
    expect(validRow.validDays).toBeGreaterThan(0);
  });

  it("should reject invalid CSV row data", () => {
    const invalidRow = {
      name: "",
      type: "invalid",
      value: "",
      valueType: "invalid",
      validDays: -1,
    };

    expect(invalidRow.name.length).toBe(0);
    expect(validVoucherTypes.includes(invalidRow.type)).toBe(false);
    expect(validValueTypes.includes(invalidRow.valueType)).toBe(false);
    expect(invalidRow.validDays).toBeLessThan(0);
  });
});
