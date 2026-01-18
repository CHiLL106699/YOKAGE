/**
 * 員工佣金計算服務
 * 根據銷售業績、服務項目自動計算員工佣金
 */

import { getDb } from '../db';
import { staff, orders, orderItems, appointments, organizations, products } from '../../drizzle/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

// 佣金類型
export type CommissionType = 
  | 'sales'      // 銷售佣金
  | 'service'    // 服務佣金
  | 'referral'   // 推薦佣金
  | 'bonus';     // 獎金

// 佣金規則
export interface CommissionRule {
  id: string;
  name: string;
  type: CommissionType;
  calculationType: 'percentage' | 'fixed';
  value: number; // 百分比或固定金額
  minThreshold?: number; // 最低門檻
  maxCap?: number; // 上限
  productCategories?: string[]; // 適用產品類別
  isActive: boolean;
}

// 員工佣金記錄
export interface StaffCommission {
  staffId: number;
  staffName: string;
  organizationId: number;
  organizationName: string;
  period: string; // e.g., "2026-01"
  
  // 業績數據
  totalSales: number;
  totalServices: number;
  orderCount: number;
  appointmentCount: number;
  
  // 佣金明細
  salesCommission: number;
  serviceCommission: number;
  referralCommission: number;
  bonusCommission: number;
  totalCommission: number;
  
  // 佣金率
  effectiveRate: number; // 實際佣金率
  
  // 狀態
  status: 'pending' | 'approved' | 'paid';
}

// 佣金計算結果
export interface CommissionCalculationResult {
  success: boolean;
  calculatedAt: Date;
  period: string;
  organizationId?: number;
  totalStaff: number;
  totalCommission: number;
  staffCommissions: StaffCommission[];
  summary: {
    salesCommission: number;
    serviceCommission: number;
    referralCommission: number;
    bonusCommission: number;
  };
}

// 預設佣金規則
const DEFAULT_COMMISSION_RULES: CommissionRule[] = [
  {
    id: 'sales-standard',
    name: '標準銷售佣金',
    type: 'sales',
    calculationType: 'percentage',
    value: 10, // 10%
    isActive: true,
  },
  {
    id: 'service-standard',
    name: '標準服務佣金',
    type: 'service',
    calculationType: 'percentage',
    value: 15, // 15%
    isActive: true,
  },
  {
    id: 'referral-standard',
    name: '推薦獎勵',
    type: 'referral',
    calculationType: 'fixed',
    value: 500, // 每位推薦 $500
    isActive: true,
  },
  {
    id: 'bonus-monthly',
    name: '月度業績獎金',
    type: 'bonus',
    calculationType: 'percentage',
    value: 5, // 超過門檻額外 5%
    minThreshold: 100000, // 月業績超過 10 萬
    isActive: true,
  },
];

/**
 * 計算指定期間的員工佣金
 */
export async function calculateCommissions(
  startDate: Date,
  endDate: Date,
  organizationId?: number,
  rules: CommissionRule[] = DEFAULT_COMMISSION_RULES
): Promise<CommissionCalculationResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      calculatedAt: new Date(),
      period: `${startDate.toISOString().slice(0, 7)}`,
      organizationId,
      totalStaff: 0,
      totalCommission: 0,
      staffCommissions: [],
      summary: {
        salesCommission: 0,
        serviceCommission: 0,
        referralCommission: 0,
        bonusCommission: 0,
      },
    };
  }

  const period = startDate.toISOString().slice(0, 7);

  // 查詢員工銷售業績
  const conditions = [
    gte(orders.createdAt, startDate),
    lte(orders.createdAt, endDate),
    eq(orders.status, 'completed'),
  ];

  if (organizationId) {
    conditions.push(eq(orders.organizationId, organizationId));
  }

  // 銷售業績統計（透過預約關聯員工）
  const salesStats = await db
    .select({
      staffId: appointments.staffId,
      staffName: staff.name,
      organizationId: organizations.id,
      organizationName: organizations.name,
      totalSales: sql<number>`COALESCE(SUM(${orders.total}), 0)`.as('totalSales'),
      orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`.as('orderCount'),
    })
    .from(orders)
    .leftJoin(appointments, eq(orders.customerId, appointments.customerId))
    .innerJoin(staff, eq(appointments.staffId, staff.id))
    .innerJoin(organizations, eq(orders.organizationId, organizations.id))
    .where(and(...conditions))
    .groupBy(appointments.staffId, staff.name, organizations.id, organizations.name);

  // 服務業績統計（預約完成）
  const serviceConditions = [
    gte(appointments.appointmentDate, startDate),
    lte(appointments.appointmentDate, endDate),
    eq(appointments.status, 'completed'),
  ];

  if (organizationId) {
    serviceConditions.push(eq(appointments.organizationId, organizationId));
  }

  const serviceStats = await db
    .select({
      staffId: appointments.staffId,
      totalServices: sql<number>`COUNT(*)`.as('totalServices'),
      appointmentCount: sql<number>`COUNT(DISTINCT ${appointments.id})`.as('appointmentCount'),
    })
    .from(appointments)
    .where(and(...serviceConditions))
    .groupBy(appointments.staffId);

  // 合併數據並計算佣金
  const serviceMap = new Map(serviceStats.map(s => [s.staffId, s]));
  
  const staffCommissions: StaffCommission[] = salesStats.map(sale => {
    const service = serviceMap.get(sale.staffId) || { totalServices: 0, appointmentCount: 0 };
    
    // 計算各類佣金
    let salesCommission = 0;
    let serviceCommission = 0;
    let referralCommission = 0;
    let bonusCommission = 0;

    for (const rule of rules) {
      if (!rule.isActive) continue;

      switch (rule.type) {
        case 'sales':
          if (rule.calculationType === 'percentage') {
            salesCommission = sale.totalSales * (rule.value / 100);
          } else {
            salesCommission = rule.value * sale.orderCount;
          }
          if (rule.maxCap) salesCommission = Math.min(salesCommission, rule.maxCap);
          break;

        case 'service':
          if (rule.calculationType === 'percentage') {
            // 假設服務收入為銷售額的一部分
            serviceCommission = sale.totalSales * 0.3 * (rule.value / 100);
          } else {
            serviceCommission = rule.value * service.appointmentCount;
          }
          if (rule.maxCap) serviceCommission = Math.min(serviceCommission, rule.maxCap);
          break;

        case 'bonus':
          if (rule.minThreshold && sale.totalSales >= rule.minThreshold) {
            if (rule.calculationType === 'percentage') {
              bonusCommission = (sale.totalSales - rule.minThreshold) * (rule.value / 100);
            } else {
              bonusCommission = rule.value;
            }
          }
          break;
      }
    }

    const totalCommission = salesCommission + serviceCommission + referralCommission + bonusCommission;
    const effectiveRate = sale.totalSales > 0 ? (totalCommission / sale.totalSales) * 100 : 0;

    return {
      staffId: sale.staffId!,
      staffName: sale.staffName,
      organizationId: sale.organizationId,
      organizationName: sale.organizationName,
      period,
      totalSales: sale.totalSales,
      totalServices: service.totalServices,
      orderCount: sale.orderCount,
      appointmentCount: service.appointmentCount,
      salesCommission: Math.round(salesCommission),
      serviceCommission: Math.round(serviceCommission),
      referralCommission: Math.round(referralCommission),
      bonusCommission: Math.round(bonusCommission),
      totalCommission: Math.round(totalCommission),
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      status: 'pending' as const,
    };
  });

  // 計算總計
  const summary = staffCommissions.reduce(
    (acc, sc) => ({
      salesCommission: acc.salesCommission + sc.salesCommission,
      serviceCommission: acc.serviceCommission + sc.serviceCommission,
      referralCommission: acc.referralCommission + sc.referralCommission,
      bonusCommission: acc.bonusCommission + sc.bonusCommission,
    }),
    { salesCommission: 0, serviceCommission: 0, referralCommission: 0, bonusCommission: 0 }
  );

  return {
    success: true,
    calculatedAt: new Date(),
    period,
    organizationId,
    totalStaff: staffCommissions.length,
    totalCommission: staffCommissions.reduce((sum, sc) => sum + sc.totalCommission, 0),
    staffCommissions: staffCommissions.sort((a, b) => b.totalCommission - a.totalCommission),
    summary,
  };
}

/**
 * 計算本月佣金
 */
export async function calculateCurrentMonthCommissions(
  organizationId?: number
): Promise<CommissionCalculationResult> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return calculateCommissions(startDate, endDate, organizationId);
}

/**
 * 取得員工佣金排行榜
 */
export async function getCommissionLeaderboard(
  startDate: Date,
  endDate: Date,
  organizationId?: number,
  limit: number = 10
): Promise<{
  period: string;
  leaderboard: {
    rank: number;
    staffId: number;
    staffName: string;
    totalSales: number;
    totalCommission: number;
    effectiveRate: number;
  }[];
}> {
  const result = await calculateCommissions(startDate, endDate, organizationId);
  
  return {
    period: result.period,
    leaderboard: result.staffCommissions
      .slice(0, limit)
      .map((sc, index) => ({
        rank: index + 1,
        staffId: sc.staffId,
        staffName: sc.staffName,
        totalSales: sc.totalSales,
        totalCommission: sc.totalCommission,
        effectiveRate: sc.effectiveRate,
      })),
  };
}

/**
 * 取得佣金統計摘要
 */
export async function getCommissionSummary(
  organizationId?: number
): Promise<{
  currentMonth: {
    totalCommission: number;
    totalStaff: number;
    avgCommission: number;
  };
  lastMonth: {
    totalCommission: number;
    totalStaff: number;
    avgCommission: number;
  };
  growth: {
    commissionGrowth: number;
    commissionGrowthPercent: number;
  };
}> {
  const now = new Date();
  
  // 本月
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const currentResult = await calculateCommissions(currentMonthStart, currentMonthEnd, organizationId);
  
  // 上月
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const lastResult = await calculateCommissions(lastMonthStart, lastMonthEnd, organizationId);

  const currentTotal = currentResult.totalCommission;
  const lastTotal = lastResult.totalCommission;
  const growth = currentTotal - lastTotal;
  const growthPercent = lastTotal > 0 ? (growth / lastTotal) * 100 : 0;

  return {
    currentMonth: {
      totalCommission: currentTotal,
      totalStaff: currentResult.totalStaff,
      avgCommission: currentResult.totalStaff > 0 ? Math.round(currentTotal / currentResult.totalStaff) : 0,
    },
    lastMonth: {
      totalCommission: lastTotal,
      totalStaff: lastResult.totalStaff,
      avgCommission: lastResult.totalStaff > 0 ? Math.round(lastTotal / lastResult.totalStaff) : 0,
    },
    growth: {
      commissionGrowth: growth,
      commissionGrowthPercent: Math.round(growthPercent * 100) / 100,
    },
  };
}

export default {
  calculateCommissions,
  calculateCurrentMonthCommissions,
  getCommissionLeaderboard,
  getCommissionSummary,
  DEFAULT_COMMISSION_RULES,
};
