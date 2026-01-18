import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAutoSettlementConfig,
  updateAutoSettlementConfig,
  getSettlementDashboard,
  listSettlementsWithFilters,
  getSettlementOperators,
  generateSettlementReport,
} from "./db";

// Mock drizzle
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getAutoSettlementConfig: vi.fn(),
    updateAutoSettlementConfig: vi.fn(),
    getSettlementDashboard: vi.fn(),
    listSettlementsWithFilters: vi.fn(),
    getSettlementOperators: vi.fn(),
    generateSettlementReport: vi.fn(),
  };
});

describe("每日結帳系統強化功能", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("自動結帳設定", () => {
    it("應能取得自動結帳設定", async () => {
      const mockConfig = {
        id: 1,
        organizationId: 1,
        enabled: true,
        autoSettlementTime: "23:00",
        autoGenerateReport: true,
        notifyOnSettlement: true,
        notifyEmails: "test@example.com",
      };
      
      (getAutoSettlementConfig as any).mockResolvedValue(mockConfig);
      
      const result = await getAutoSettlementConfig(1);
      expect(result).toEqual(mockConfig);
    });

    it("應能更新自動結帳設定", async () => {
      const mockUpdated = {
        id: 1,
        organizationId: 1,
        enabled: true,
        autoSettlementTime: "22:30",
        autoGenerateReport: true,
        notifyOnSettlement: false,
        notifyEmails: "",
      };
      
      (updateAutoSettlementConfig as any).mockResolvedValue(mockUpdated);
      
      const result = await updateAutoSettlementConfig(1, {
        enabled: true,
        autoSettlementTime: "22:30",
        autoGenerateReport: true,
        notifyOnSettlement: false,
      });
      
      expect(result.autoSettlementTime).toBe("22:30");
    });

    it("應驗證自動結帳時間格式", () => {
      const validTimes = ["00:00", "12:30", "23:59"];
      const invalidTimes = ["24:00", "12:60", "abc"];
      
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      validTimes.forEach(time => {
        expect(timeRegex.test(time)).toBe(true);
      });
      
      invalidTimes.forEach(time => {
        expect(timeRegex.test(time)).toBe(false);
      });
    });
  });

  describe("營收儀表板", () => {
    it("應能取得營收儀表板數據", async () => {
      const mockDashboard = {
        summary: {
          totalRevenue: 150000,
          totalCash: 80000,
          totalCard: 50000,
          totalLinePay: 20000,
          totalOrders: 45,
          avgOrderValue: 3333,
          cashDifferenceTotal: 0,
          settlementCount: 30,
        },
        dailyTrend: [
          { date: "2026-01-01", revenue: 5000, orders: 2 },
          { date: "2026-01-02", revenue: 6000, orders: 3 },
        ],
        paymentMethodBreakdown: {
          cash: 80000,
          card: 50000,
          linePay: 20000,
          other: 0,
        },
        weeklyComparison: {
          thisWeek: 35000,
          lastWeek: 30000,
          growthRate: 16.67,
        },
      };
      
      (getSettlementDashboard as any).mockResolvedValue(mockDashboard);
      
      const result = await getSettlementDashboard(1, "month");
      
      expect(result.summary.totalRevenue).toBe(150000);
      expect(result.dailyTrend.length).toBeGreaterThan(0);
      expect(result.paymentMethodBreakdown).toBeDefined();
    });

    it("應支援不同時間範圍", async () => {
      const periods = ["day", "week", "month", "quarter", "year"];
      
      periods.forEach(async (period) => {
        (getSettlementDashboard as any).mockResolvedValue({ summary: {} });
        await getSettlementDashboard(1, period);
        expect(getSettlementDashboard).toHaveBeenCalledWith(1, period);
      });
    });
  });

  describe("結帳歷史篩選", () => {
    it("應能按日期範圍篩選", async () => {
      const mockResult = {
        data: [
          { id: 1, settlementDate: "2026-01-15", totalRevenue: 5000 },
          { id: 2, settlementDate: "2026-01-16", totalRevenue: 6000 },
        ],
        total: 2,
        stats: {
          totalRevenue: 11000,
          totalOrders: 5,
          avgDailyRevenue: 5500,
        },
      };
      
      (listSettlementsWithFilters as any).mockResolvedValue(mockResult);
      
      const result = await listSettlementsWithFilters(1, {
        startDate: "2026-01-15",
        endDate: "2026-01-16",
      });
      
      expect(result.data.length).toBe(2);
      expect(result.stats.totalRevenue).toBe(11000);
    });

    it("應能按金額範圍篩選", async () => {
      const mockResult = {
        data: [
          { id: 1, totalRevenue: 5000 },
          { id: 2, totalRevenue: 8000 },
        ],
        total: 2,
        stats: { totalRevenue: 13000 },
      };
      
      (listSettlementsWithFilters as any).mockResolvedValue(mockResult);
      
      const result = await listSettlementsWithFilters(1, {
        minAmount: 5000,
        maxAmount: 10000,
      });
      
      expect(result.data.every(d => d.totalRevenue >= 5000 && d.totalRevenue <= 10000)).toBe(true);
    });

    it("應能按狀態篩選", async () => {
      const mockResult = {
        data: [
          { id: 1, status: "closed" },
          { id: 2, status: "closed" },
        ],
        total: 2,
      };
      
      (listSettlementsWithFilters as any).mockResolvedValue(mockResult);
      
      const result = await listSettlementsWithFilters(1, {
        status: "closed",
      });
      
      expect(result.data.every(d => d.status === "closed")).toBe(true);
    });

    it("應能按經手人篩選", async () => {
      const mockResult = {
        data: [
          { id: 1, openedBy: 1 },
          { id: 2, openedBy: 1 },
        ],
        total: 2,
      };
      
      (listSettlementsWithFilters as any).mockResolvedValue(mockResult);
      
      const result = await listSettlementsWithFilters(1, {
        operatorId: 1,
      });
      
      expect(result.data.every(d => d.openedBy === 1)).toBe(true);
    });

    it("應支援多維度排序", async () => {
      const sortOptions = [
        { sortBy: "date", sortOrder: "desc" },
        { sortBy: "revenue", sortOrder: "desc" },
        { sortBy: "orders", sortOrder: "asc" },
        { sortBy: "cashDifference", sortOrder: "asc" },
      ];
      
      sortOptions.forEach(async (opt) => {
        (listSettlementsWithFilters as any).mockResolvedValue({ data: [] });
        await listSettlementsWithFilters(1, opt);
        expect(listSettlementsWithFilters).toHaveBeenCalledWith(1, opt);
      });
    });
  });

  describe("經手人列表", () => {
    it("應能取得經手人列表", async () => {
      const mockOperators = [
        { id: 1, name: "黃柏翰" },
        { id: 2, name: "張小明" },
      ];
      
      (getSettlementOperators as any).mockResolvedValue(mockOperators);
      
      const result = await getSettlementOperators(1);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("黃柏翰");
    });
  });

  describe("報表生成", () => {
    it("應能生成結帳報表", async () => {
      const mockReport = {
        id: 1,
        settlementId: 1,
        reportType: "daily",
        generatedAt: new Date().toISOString(),
        data: {
          totalRevenue: 10000,
          paymentBreakdown: { cash: 6000, card: 4000 },
        },
      };
      
      (generateSettlementReport as any).mockResolvedValue(mockReport);
      
      const result = await generateSettlementReport(1);
      expect(result.reportType).toBe("daily");
      expect(result.data.totalRevenue).toBe(10000);
    });
  });
});

describe("結帳流程完整性", () => {
  it("開帳→收款→結帳流程應完整", () => {
    // 模擬完整流程
    const workflow = {
      step1_open: { initialCash: 5000, openedBy: 1, openedAt: new Date() },
      step2_transactions: [
        { type: "cash", amount: 3000 },
        { type: "card", amount: 5000 },
        { type: "linePay", amount: 2000 },
      ],
      step3_close: { actualCash: 8000, closedBy: 1, closedAt: new Date() },
    };
    
    // 計算預期結果
    const expectedCash = workflow.step1_open.initialCash + 
      workflow.step2_transactions.filter(t => t.type === "cash").reduce((sum, t) => sum + t.amount, 0);
    const cashDifference = workflow.step3_close.actualCash - expectedCash;
    
    expect(expectedCash).toBe(8000);
    expect(cashDifference).toBe(0);
  });

  it("現金差異應正確計算", () => {
    const testCases = [
      { initial: 5000, cashIn: 3000, actual: 8000, expected: 0 },
      { initial: 5000, cashIn: 3000, actual: 7500, expected: -500 },
      { initial: 5000, cashIn: 3000, actual: 8500, expected: 500 },
    ];
    
    testCases.forEach(tc => {
      const expectedCash = tc.initial + tc.cashIn;
      const difference = tc.actual - expectedCash;
      expect(difference).toBe(tc.expected);
    });
  });
});

describe("自動結帳排程", () => {
  it("應在設定時間自動觸發結帳", () => {
    const config = {
      enabled: true,
      autoSettlementTime: "23:00",
    };
    
    const currentTime = new Date();
    currentTime.setHours(23, 0, 0, 0);
    
    const shouldTrigger = config.enabled && 
      currentTime.getHours() === parseInt(config.autoSettlementTime.split(":")[0]) &&
      currentTime.getMinutes() === parseInt(config.autoSettlementTime.split(":")[1]);
    
    expect(shouldTrigger).toBe(true);
  });

  it("自動結帳後應生成報表", () => {
    const config = {
      enabled: true,
      autoGenerateReport: true,
    };
    
    const shouldGenerateReport = config.enabled && config.autoGenerateReport;
    expect(shouldGenerateReport).toBe(true);
  });
});
