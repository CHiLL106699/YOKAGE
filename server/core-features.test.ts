import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "super_admin" | "clinic_admin" | "staff" | "customer" = "clinic_admin"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Core Features - Treatment Records", () => {
  it("should list treatment records via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.treatment.list({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should create treatment record via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.treatment.create({
      organizationId: 1,
      customerId: 1,
      treatmentType: "injection",
      treatmentName: "玻尿酸注射測試",
      treatmentDate: new Date().toISOString(),
      staffId: 1,
      notes: "測試療程記錄",
    });

    expect(result).toBeDefined();
    // 檢查返回的資料結構
    if (result && typeof result === 'object') {
      expect(result).toHaveProperty('id');
    }
  });
});

describe("Core Features - Customer Packages", () => {
  it("should list customer packages via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.list({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should create customer package via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const purchaseDate = new Date();

    const result = await caller.package.create({
      organizationId: 1,
      customerId: 1,
      productId: 1,
      packageName: "美白療程套餐測試",
      totalSessions: 10,
      expiryDate: expiryDate.toISOString(),
      purchaseDate: purchaseDate.toISOString(),
      purchasePrice: "50000",
      totalPrice: "50000",
    });

    expect(result).toBeDefined();
    // 檢查返回的資料結構
    if (result && typeof result === 'object') {
      expect(result).toHaveProperty('id');
    }
  });
});

describe("Core Features - Consultations", () => {
  it("should list consultations via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.consultation.list({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should create consultation via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.consultation.create({
      organizationId: 1,
      prospectName: "測試客戶",
      prospectPhone: "0912345678",
      consultationDate: new Date().toISOString(),
      consultationType: "walk_in",
      concerns: "想了解玻尿酸療程",
      source: "facebook",
    });

    expect(result).toBeDefined();
    // 檢查返回的資料結構
    if (result && typeof result === 'object') {
      expect(result).toHaveProperty('id');
    }
  });

  it("should get conversion stats via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.consultation.getConversionStats({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("converted");
    expect(result).toHaveProperty("conversionRate");
  });
});

describe("Core Features - RFM Analysis", () => {
  it("should list RFM data via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rfm.list({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should calculate all RFM scores via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rfm.calculateAll({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("processed");
    expect(typeof result.processed).toBe("number");
  });

  it("should get churn risk list via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rfm.getChurnRiskList({
      organizationId: 1,
      minRisk: 50,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Core Features - Commission Management", () => {
  it("should list commission rules via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.commission.listRules({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create commission rule via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.commission.createRule({
      organizationId: 1,
      name: "注射類佣金測試",
      productCategory: "injection",
      commissionType: "percentage",
      commissionValue: "10",
    });

    expect(result).toBeDefined();
    // 檢查返回的資料結構
    if (result && typeof result === 'object') {
      expect(result).toHaveProperty('id');
    }
  });

  it("should list commission records via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.commission.listCommissions({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Core Features - Satisfaction Survey", () => {
  it("should list satisfaction surveys via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.satisfaction.list({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get NPS stats via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.satisfaction.getNPSStats({
      organizationId: 1,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("promoters");
    expect(result).toHaveProperty("passives");
    expect(result).toHaveProperty("detractors");
  });

  it("should get satisfaction trend via tRPC", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.satisfaction.getTrend({
      organizationId: 1,
      months: 6,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ============================================
// Phase B: 營運分析 - 剩餘 4 項核心功能
// ============================================

function createAuthenticatedCaller() {
  const { ctx } = createAuthContext("clinic_admin");
  return appRouter.createCaller(ctx);
}

describe("Core Features - Attendance Tracking", () => {
  it("should get attendance stats via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.appointment.getAttendanceStats({
      organizationId: 1,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("completed");
    expect(result).toHaveProperty("noShow");
    expect(result).toHaveProperty("attendanceRate");
  });

  it("should get waitlist entries via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.appointment.getWaitlist({
      organizationId: 1,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Core Features - Inventory Cost", () => {
  it("should list inventory transactions via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.inventory.listTransactions({
      organizationId: 1,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get cost analysis via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.inventory.getCostAnalysis({
      organizationId: 1,
      productId: 1,
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("averageCost");
    expect(result).toHaveProperty("totalCost");
    expect(result).toHaveProperty("totalQuantity");
  });
});

describe("Core Features - Revenue Target", () => {
  it("should list revenue targets via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.revenueTarget.list({
      organizationId: 1,
      year: 2024,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get achievement rate via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.revenueTarget.getAchievement({
      organizationId: 1,
      year: 2024,
      month: 1,
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("target");
    expect(result).toHaveProperty("actual");
    expect(result).toHaveProperty("achievementRate");
  });
});

describe("Core Features - Customer Source ROI", () => {
  it("should list marketing campaigns via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.marketing.listCampaigns({
      organizationId: 1,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get source ROI analysis via tRPC", async () => {
    const caller = createAuthenticatedCaller();
    const result = await caller.marketing.getSourceROI({
      organizationId: 1,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
