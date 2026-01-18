/**
 * RFM 分析服務
 * 根據 Recency（最近消費）、Frequency（消費頻率）、Monetary（消費金額）
 * 對客戶進行分群，產出可行動的報表
 */

import { getDb } from '../db';
import { customers, orders, appointments, organizations } from '../../drizzle/schema';
import { eq, and, desc, sql, gte, isNotNull } from 'drizzle-orm';

// RFM 分數定義（1-5 分）
type RFMScore = 1 | 2 | 3 | 4 | 5;

// 客戶分群類型
export type CustomerSegment = 
  | 'champions'      // 冠軍客戶：高R高F高M
  | 'loyal'          // 忠誠客戶：高F高M
  | 'potential'      // 潛力客戶：高R中F中M
  | 'new'            // 新客戶：高R低F低M
  | 'promising'      // 有望客戶：中R中F中M
  | 'need_attention' // 需關注：中R中F低M
  | 'about_to_sleep' // 即將沉睡：低R中F中M
  | 'at_risk'        // 流失風險：低R高F高M
  | 'hibernating'    // 沉睡客戶：低R低F低M
  | 'lost';          // 流失客戶：極低R

export interface RFMCustomer {
  customerId: number;
  customerName: string;
  lineUserId: string | null;
  organizationId: number;
  organizationName: string;
  
  // 原始數據
  lastOrderDate: Date | null;
  orderCount: number;
  totalSpent: number;
  
  // RFM 分數
  recencyScore: RFMScore;
  frequencyScore: RFMScore;
  monetaryScore: RFMScore;
  rfmScore: string; // e.g., "5-4-5"
  totalScore: number; // 總分
  
  // 分群
  segment: CustomerSegment;
  segmentLabel: string;
  
  // 建議行動
  recommendedAction: string;
}

export interface RFMAnalysisResult {
  success: boolean;
  analyzedAt: Date;
  totalCustomers: number;
  segmentDistribution: Record<CustomerSegment, number>;
  customers: RFMCustomer[];
  insights: {
    title: string;
    description: string;
    actionItems: string[];
  }[];
}

/**
 * 計算 RFM 分數
 */
function calculateRFMScore(
  value: number,
  thresholds: [number, number, number, number]
): RFMScore {
  if (value >= thresholds[3]) return 5;
  if (value >= thresholds[2]) return 4;
  if (value >= thresholds[1]) return 3;
  if (value >= thresholds[0]) return 2;
  return 1;
}

/**
 * 計算 Recency 分數（天數越少分數越高）
 */
function calculateRecencyScore(daysSinceLastOrder: number): RFMScore {
  if (daysSinceLastOrder <= 7) return 5;
  if (daysSinceLastOrder <= 30) return 4;
  if (daysSinceLastOrder <= 60) return 3;
  if (daysSinceLastOrder <= 90) return 2;
  return 1;
}

/**
 * 根據 RFM 分數判斷客戶分群
 */
function determineSegment(r: RFMScore, f: RFMScore, m: RFMScore): CustomerSegment {
  const rfm = `${r}${f}${m}`;
  
  // 冠軍客戶：高R高F高M
  if (r >= 4 && f >= 4 && m >= 4) return 'champions';
  
  // 忠誠客戶：高F高M（不論R）
  if (f >= 4 && m >= 4) return 'loyal';
  
  // 流失風險：低R但高F高M（曾經是好客戶）
  if (r <= 2 && f >= 3 && m >= 3) return 'at_risk';
  
  // 新客戶：高R低F低M
  if (r >= 4 && f <= 2 && m <= 2) return 'new';
  
  // 潛力客戶：高R中F中M
  if (r >= 4 && f >= 2 && m >= 2) return 'potential';
  
  // 有望客戶：中R中F中M
  if (r >= 3 && f >= 3 && m >= 3) return 'promising';
  
  // 需關注：中R中F低M
  if (r >= 3 && f >= 3 && m <= 2) return 'need_attention';
  
  // 即將沉睡：低R中F中M
  if (r <= 2 && f >= 3 && m >= 2) return 'about_to_sleep';
  
  // 沉睡客戶：低R低F低M
  if (r <= 2 && f <= 2) return 'hibernating';
  
  // 流失客戶
  return 'lost';
}

/**
 * 取得分群標籤
 */
function getSegmentLabel(segment: CustomerSegment): string {
  const labels: Record<CustomerSegment, string> = {
    champions: '🏆 冠軍客戶',
    loyal: '💎 忠誠客戶',
    potential: '⭐ 潛力客戶',
    new: '🌱 新客戶',
    promising: '📈 有望客戶',
    need_attention: '⚠️ 需關注',
    about_to_sleep: '😴 即將沉睡',
    at_risk: '🚨 流失風險',
    hibernating: '💤 沉睡客戶',
    lost: '❌ 流失客戶',
  };
  return labels[segment];
}

/**
 * 取得建議行動
 */
function getRecommendedAction(segment: CustomerSegment): string {
  const actions: Record<CustomerSegment, string> = {
    champions: '提供 VIP 專屬優惠、優先預約權、推薦獎勵計畫',
    loyal: '維持關係、提供忠誠度獎勵、邀請體驗新療程',
    potential: '提供升級優惠、推薦高價值療程、建立長期關係',
    new: '發送歡迎優惠、介紹熱門療程、建立首次回訪',
    promising: '提供限時優惠、推薦套餐組合、增加消費頻率',
    need_attention: '了解需求變化、提供客製化方案、重建價值認知',
    about_to_sleep: '發送喚醒優惠、提醒療程效果、限時回歸折扣',
    at_risk: '緊急關懷電話、大幅優惠挽回、了解流失原因',
    hibernating: '發送強力喚醒優惠、重新介紹服務、考慮放棄成本',
    lost: '最後嘗試喚醒、分析流失原因、調整行銷策略',
  };
  return actions[segment];
}

/**
 * 執行 RFM 分析
 */
export async function performRFMAnalysis(
  organizationId?: number,
  lookbackDays: number = 365
): Promise<RFMAnalysisResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      analyzedAt: new Date(),
      totalCustomers: 0,
      segmentDistribution: {} as Record<CustomerSegment, number>,
      customers: [],
      insights: [],
    };
  }

  const now = new Date();
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  // 查詢客戶的訂單統計
  const conditions = organizationId 
    ? [eq(customers.organizationId, organizationId)]
    : [];

  const customerStats = await db
    .select({
      customerId: customers.id,
      customerName: customers.name,
      lineUserId: customers.lineUserId,
      organizationId: organizations.id,
      organizationName: organizations.name,
      lastOrderDate: sql<Date>`MAX(${orders.createdAt})`.as('lastOrderDate'),
      orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`.as('orderCount'),
      totalSpent: sql<number>`COALESCE(SUM(${orders.total}), 0)`.as('totalSpent'),
    })
    .from(customers)
    .leftJoin(orders, and(
      eq(orders.customerId, customers.id),
      gte(orders.createdAt, lookbackDate),
      eq(orders.status, 'completed')
    ))
    .innerJoin(organizations, eq(customers.organizationId, organizations.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(customers.id, customers.name, customers.lineUserId, organizations.id, organizations.name);

  // 計算 RFM 分數閾值（基於四分位數）
  const orderCounts = customerStats.map(c => c.orderCount).sort((a, b) => a - b);
  const totalSpents = customerStats.map(c => c.totalSpent).sort((a, b) => a - b);

  const getQuartiles = (arr: number[]): [number, number, number, number] => {
    const q1 = arr[Math.floor(arr.length * 0.25)] || 0;
    const q2 = arr[Math.floor(arr.length * 0.5)] || 0;
    const q3 = arr[Math.floor(arr.length * 0.75)] || 0;
    const q4 = arr[arr.length - 1] || 0;
    return [q1, q2, q3, q4];
  };

  const frequencyThresholds = getQuartiles(orderCounts);
  const monetaryThresholds = getQuartiles(totalSpents);

  // 計算每個客戶的 RFM 分數
  const segmentDistribution: Record<CustomerSegment, number> = {
    champions: 0,
    loyal: 0,
    potential: 0,
    new: 0,
    promising: 0,
    need_attention: 0,
    about_to_sleep: 0,
    at_risk: 0,
    hibernating: 0,
    lost: 0,
  };

  const rfmCustomers: RFMCustomer[] = customerStats.map(customer => {
    const daysSinceLastOrder = customer.lastOrderDate
      ? Math.floor((now.getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const recencyScore = calculateRecencyScore(daysSinceLastOrder);
    const frequencyScore = calculateRFMScore(customer.orderCount, frequencyThresholds);
    const monetaryScore = calculateRFMScore(customer.totalSpent, monetaryThresholds);
    
    const segment = determineSegment(recencyScore, frequencyScore, monetaryScore);
    segmentDistribution[segment]++;

    return {
      customerId: customer.customerId,
      customerName: customer.customerName,
      lineUserId: customer.lineUserId,
      organizationId: customer.organizationId,
      organizationName: customer.organizationName,
      lastOrderDate: customer.lastOrderDate,
      orderCount: customer.orderCount,
      totalSpent: customer.totalSpent,
      recencyScore,
      frequencyScore,
      monetaryScore,
      rfmScore: `${recencyScore}-${frequencyScore}-${monetaryScore}`,
      totalScore: recencyScore + frequencyScore + monetaryScore,
      segment,
      segmentLabel: getSegmentLabel(segment),
      recommendedAction: getRecommendedAction(segment),
    };
  });

  // 產生洞察報告
  const insights = generateInsights(rfmCustomers, segmentDistribution);

  return {
    success: true,
    analyzedAt: now,
    totalCustomers: rfmCustomers.length,
    segmentDistribution,
    customers: rfmCustomers.sort((a, b) => b.totalScore - a.totalScore),
    insights,
  };
}

/**
 * 產生洞察報告
 */
function generateInsights(
  customers: RFMCustomer[],
  distribution: Record<CustomerSegment, number>
): RFMAnalysisResult['insights'] {
  const insights: RFMAnalysisResult['insights'] = [];
  const total = customers.length || 1;

  // 冠軍客戶洞察
  if (distribution.champions > 0) {
    const championsPercent = ((distribution.champions / total) * 100).toFixed(1);
    const championsRevenue = customers
      .filter(c => c.segment === 'champions')
      .reduce((sum, c) => sum + c.totalSpent, 0);
    
    insights.push({
      title: '🏆 冠軍客戶分析',
      description: `您有 ${distribution.champions} 位冠軍客戶（佔 ${championsPercent}%），貢獻營收 $${championsRevenue.toLocaleString()}`,
      actionItems: [
        '提供 VIP 專屬優惠維持忠誠度',
        '邀請參與推薦獎勵計畫',
        '優先通知新療程上市',
      ],
    });
  }

  // 流失風險洞察
  if (distribution.at_risk > 0) {
    const atRiskPercent = ((distribution.at_risk / total) * 100).toFixed(1);
    
    insights.push({
      title: '🚨 流失風險警示',
      description: `有 ${distribution.at_risk} 位高價值客戶面臨流失風險（佔 ${atRiskPercent}%），需要立即關注`,
      actionItems: [
        '立即發送專屬回歸優惠',
        '安排客服電話關懷',
        '了解未回訪原因並改善',
      ],
    });
  }

  // 沉睡客戶洞察
  const dormantCount = distribution.hibernating + distribution.about_to_sleep;
  if (dormantCount > 0) {
    const dormantPercent = ((dormantCount / total) * 100).toFixed(1);
    
    insights.push({
      title: '😴 沉睡客戶喚醒機會',
      description: `有 ${dormantCount} 位客戶處於沉睡狀態（佔 ${dormantPercent}%），可透過喚醒活動重新激活`,
      actionItems: [
        '發送限時回歸優惠（建議 7 天有效期）',
        '推送療程效果提醒',
        '提供首次回訪專屬折扣',
      ],
    });
  }

  // 新客戶培養洞察
  if (distribution.new > 0) {
    insights.push({
      title: '🌱 新客戶培養計畫',
      description: `有 ${distribution.new} 位新客戶，是建立長期關係的關鍵時期`,
      actionItems: [
        '發送歡迎禮遇與療程介紹',
        '安排專人跟進首次體驗反饋',
        '提供第二次消費優惠促進回購',
      ],
    });
  }

  return insights;
}

/**
 * 取得特定分群的客戶列表
 */
export async function getCustomersBySegment(
  segment: CustomerSegment,
  organizationId?: number
): Promise<RFMCustomer[]> {
  const result = await performRFMAnalysis(organizationId);
  return result.customers.filter(c => c.segment === segment);
}

/**
 * 取得 RFM 分析摘要
 */
export async function getRFMSummary(organizationId?: number): Promise<{
  totalCustomers: number;
  segmentDistribution: Record<CustomerSegment, number>;
  topSegments: { segment: CustomerSegment; label: string; count: number; percentage: string }[];
  actionPriority: { segment: CustomerSegment; label: string; count: number; urgency: 'high' | 'medium' | 'low' }[];
}> {
  const result = await performRFMAnalysis(organizationId);
  const total = result.totalCustomers || 1;

  const topSegments = Object.entries(result.segmentDistribution)
    .map(([segment, count]) => ({
      segment: segment as CustomerSegment,
      label: getSegmentLabel(segment as CustomerSegment),
      count,
      percentage: ((count / total) * 100).toFixed(1) + '%',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const urgencyMap: Record<CustomerSegment, 'high' | 'medium' | 'low'> = {
    at_risk: 'high',
    about_to_sleep: 'high',
    need_attention: 'medium',
    hibernating: 'medium',
    lost: 'low',
    new: 'medium',
    potential: 'low',
    promising: 'low',
    loyal: 'low',
    champions: 'low',
  };

  const actionPriority = Object.entries(result.segmentDistribution)
    .filter(([_, count]) => count > 0)
    .map(([segment, count]) => ({
      segment: segment as CustomerSegment,
      label: getSegmentLabel(segment as CustomerSegment),
      count,
      urgency: urgencyMap[segment as CustomerSegment],
    }))
    .sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

  return {
    totalCustomers: result.totalCustomers,
    segmentDistribution: result.segmentDistribution,
    topSegments,
    actionPriority,
  };
}

export default {
  performRFMAnalysis,
  getCustomersBySegment,
  getRFMSummary,
};
