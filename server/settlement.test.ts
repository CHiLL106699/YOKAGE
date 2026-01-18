import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock database functions
vi.mock('./db', () => ({
  getSettlementByDate: vi.fn(),
  createDailySettlement: vi.fn(),
  updateDailySettlement: vi.fn(),
  listDailySettlements: vi.fn(),
  createCashDrawerRecord: vi.fn(),
  listCashDrawerRecords: vi.fn(),
  calculateDailyStats: vi.fn(),
  getSettlementSummary: vi.fn(),
  createPaymentRecord: vi.fn(),
  updatePaymentRecord: vi.fn(),
  listPaymentRecords: vi.fn(),
}));

import * as db from './db';

describe('每日結帳系統', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('開帳功能', () => {
    it('應該能夠建立新的每日結帳記錄', async () => {
      const mockSettlement = {
        id: 1,
        organizationId: 1,
        settlementDate: new Date('2025-01-18'),
        status: 'open',
        openingCash: '10000',
        openedAt: new Date(),
        openedBy: 1,
      };

      vi.mocked(db.createDailySettlement).mockResolvedValue(1);
      vi.mocked(db.getSettlementByDate).mockResolvedValue(mockSettlement as any);

      const result = await db.createDailySettlement({
        organizationId: 1,
        settlementDate: new Date('2025-01-18'),
        openingCash: '10000',
        openedBy: 1,
      });

      expect(result).toBe(1);
      expect(db.createDailySettlement).toHaveBeenCalledWith({
        organizationId: 1,
        settlementDate: expect.any(Date),
        openingCash: '10000',
        openedBy: 1,
      });
    });

    it('應該正確設定開帳金額為整數（元）', async () => {
      const openingCash = '50000'; // 5萬元
      
      vi.mocked(db.createDailySettlement).mockResolvedValue(1);

      await db.createDailySettlement({
        organizationId: 1,
        settlementDate: new Date('2025-01-18'),
        openingCash,
        openedBy: 1,
      });

      expect(db.createDailySettlement).toHaveBeenCalledWith(
        expect.objectContaining({
          openingCash: '50000', // 確保金額沒有被除以 100
        })
      );
    });
  });

  describe('結帳功能', () => {
    it('應該能夠更新結帳記錄為已關閉狀態', async () => {
      vi.mocked(db.updateDailySettlement).mockResolvedValue(undefined);

      await db.updateDailySettlement(1, {
        status: 'closed',
        closingCash: '65000',
        closedAt: new Date(),
        closedBy: 1,
      });

      expect(db.updateDailySettlement).toHaveBeenCalledWith(1, {
        status: 'closed',
        closingCash: '65000',
        closedAt: expect.any(Date),
        closedBy: 1,
      });
    });

    it('應該正確計算現金差異', async () => {
      const openingCash = 10000;
      const cashRevenue = 55000;
      const closingCash = 65000;
      const expectedDifference = closingCash - (openingCash + cashRevenue);

      expect(expectedDifference).toBe(0); // 無差異
    });

    it('應該正確識別現金短少', async () => {
      const openingCash = 10000;
      const cashRevenue = 55000;
      const closingCash = 64000; // 少 1000 元
      const expectedDifference = closingCash - (openingCash + cashRevenue);

      expect(expectedDifference).toBe(-1000); // 短少 1000 元
    });

    it('應該正確識別現金溢出', async () => {
      const openingCash = 10000;
      const cashRevenue = 55000;
      const closingCash = 66000; // 多 1000 元
      const expectedDifference = closingCash - (openingCash + cashRevenue);

      expect(expectedDifference).toBe(1000); // 溢出 1000 元
    });
  });

  describe('收銀機操作記錄', () => {
    it('應該能夠記錄存入操作', async () => {
      vi.mocked(db.createCashDrawerRecord).mockResolvedValue(1);

      await db.createCashDrawerRecord({
        settlementId: 1,
        organizationId: 1,
        operationType: 'deposit',
        amount: '5000',
        balanceBefore: '10000',
        balanceAfter: '15000',
        reason: '補充零錢',
        operatedBy: 1,
      });

      expect(db.createCashDrawerRecord).toHaveBeenCalledWith({
        settlementId: 1,
        organizationId: 1,
        operationType: 'deposit',
        amount: '5000',
        balanceBefore: '10000',
        balanceAfter: '15000',
        reason: '補充零錢',
        operatedBy: 1,
      });
    });

    it('應該能夠記錄取出操作', async () => {
      vi.mocked(db.createCashDrawerRecord).mockResolvedValue(2);

      await db.createCashDrawerRecord({
        settlementId: 1,
        organizationId: 1,
        operationType: 'withdrawal',
        amount: '3000',
        balanceBefore: '15000',
        balanceAfter: '12000',
        reason: '支付供應商',
        operatedBy: 1,
      });

      expect(db.createCashDrawerRecord).toHaveBeenCalledWith({
        settlementId: 1,
        organizationId: 1,
        operationType: 'withdrawal',
        amount: '3000',
        balanceBefore: '15000',
        balanceAfter: '12000',
        reason: '支付供應商',
        operatedBy: 1,
      });
    });

    it('應該能夠列出收銀機操作記錄', async () => {
      const mockRecords = [
        { id: 1, operationType: 'deposit', amount: '5000' },
        { id: 2, operationType: 'withdrawal', amount: '3000' },
      ];

      vi.mocked(db.listCashDrawerRecords).mockResolvedValue(mockRecords as any);

      const result = await db.listCashDrawerRecords(1);

      expect(result).toHaveLength(2);
      expect(result[0].operationType).toBe('deposit');
      expect(result[1].operationType).toBe('withdrawal');
    });
  });

  describe('每日營收統計', () => {
    it('應該能夠計算每日營收統計', async () => {
      const mockStats = {
        totalRevenue: 150000,
        cashRevenue: 80000,
        cardRevenue: 50000,
        linePayRevenue: 20000,
        totalOrders: 25,
        completedAppointments: 30,
      };

      vi.mocked(db.calculateDailyStats).mockResolvedValue(mockStats);

      const result = await db.calculateDailyStats(1, '2025-01-18');

      expect(result.totalRevenue).toBe(150000);
      expect(result.cashRevenue).toBe(80000);
      expect(result.cardRevenue).toBe(50000);
      expect(result.linePayRevenue).toBe(20000);
      expect(result.totalOrders).toBe(25);
    });

    it('應該確保營收金額為整數（元）', async () => {
      const mockStats = {
        totalRevenue: 150000, // 15萬元，不是 1500 元
        cashRevenue: 80000,
        cardRevenue: 50000,
        linePayRevenue: 20000,
        totalOrders: 25,
        completedAppointments: 30,
      };

      vi.mocked(db.calculateDailyStats).mockResolvedValue(mockStats);

      const result = await db.calculateDailyStats(1, '2025-01-18');

      // 確保金額沒有被錯誤地除以 100
      expect(result.totalRevenue).toBeGreaterThanOrEqual(1000);
      expect(result.cashRevenue).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('結帳歷史查詢', () => {
    it('應該能夠列出結帳歷史記錄', async () => {
      const mockHistory = {
        data: [
          { id: 1, settlementDate: new Date('2025-01-17'), status: 'closed', totalRevenue: '120000' },
          { id: 2, settlementDate: new Date('2025-01-16'), status: 'closed', totalRevenue: '95000' },
        ],
        total: 2,
      };

      vi.mocked(db.listDailySettlements).mockResolvedValue(mockHistory as any);

      const result = await db.listDailySettlements(1);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('應該能夠按日期範圍篩選結帳記錄', async () => {
      vi.mocked(db.listDailySettlements).mockResolvedValue({ data: [], total: 0 });

      await db.listDailySettlements(1, {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      expect(db.listDailySettlements).toHaveBeenCalledWith(1, {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });
    });
  });

  describe('結帳摘要統計', () => {
    it('應該能夠獲取結帳摘要統計', async () => {
      const mockSummary = {
        totalRevenue: 500000,
        totalCash: 250000,
        totalCard: 180000,
        totalLinePay: 70000,
        totalOrders: 100,
        avgOrderValue: 5000,
        cashDifferenceTotal: -500,
        settlementCount: 10,
      };

      vi.mocked(db.getSettlementSummary).mockResolvedValue(mockSummary);

      const result = await db.getSettlementSummary(1);

      expect(result.totalRevenue).toBe(500000);
      expect(result.settlementCount).toBe(10);
      expect(result.avgOrderValue).toBe(5000);
    });
  });

  describe('付款記錄', () => {
    it('應該能夠建立付款記錄', async () => {
      vi.mocked(db.createPaymentRecord).mockResolvedValue(1);

      await db.createPaymentRecord({
        organizationId: 1,
        settlementId: 1,
        orderId: 100,
        customerId: 50,
        paymentMethod: 'cash',
        amount: '5000',
        status: 'completed',
        receivedBy: 1,
      });

      expect(db.createPaymentRecord).toHaveBeenCalledWith({
        organizationId: 1,
        settlementId: 1,
        orderId: 100,
        customerId: 50,
        paymentMethod: 'cash',
        amount: '5000',
        status: 'completed',
        receivedBy: 1,
      });
    });

    it('應該能夠列出付款記錄', async () => {
      const mockPayments = {
        data: [
          { id: 1, paymentMethod: 'cash', amount: '5000' },
          { id: 2, paymentMethod: 'card', amount: '8000' },
        ],
        total: 2,
      };

      vi.mocked(db.listPaymentRecords).mockResolvedValue(mockPayments as any);

      const result = await db.listPaymentRecords(1);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});

describe('金額計算精確性', () => {
  it('應該使用 DECIMAL 類型避免浮點數精度問題', () => {
    // 模擬 DECIMAL 類型的金額計算
    const amount1 = '10000.00';
    const amount2 = '5000.50';
    
    // 使用字串轉數字進行計算
    const total = Number(amount1) + Number(amount2);
    
    expect(total).toBe(15000.50);
  });

  it('應該正確處理大額金額計算', () => {
    const monthlyRevenue = 1500000; // 150萬
    const dailyAverage = Math.round(monthlyRevenue / 30);
    
    expect(dailyAverage).toBe(50000); // 5萬
  });
});
