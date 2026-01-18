/**
 * 療程到期自動提醒服務
 * 掃描即將到期的療程套餐，並發送 LINE 提醒
 */

import { getDb } from '../db';
import { customerPackages, customers, organizations, users } from '../../drizzle/schema';
import { eq, and, lte, gte, isNull, sql } from 'drizzle-orm';
import {
  pushFlexMessage,
  createTreatmentExpiryFlexMessage,
} from './lineMessaging';

interface TreatmentReminderResult {
  success: boolean;
  totalScanned: number;
  remindersSent: number;
  errors: string[];
  details: {
    customerId: number;
    customerName: string;
    packageName: string;
    expiryDate: string;
    lineMessageSent: boolean;
    error?: string;
  }[];
}

/**
 * 掃描即將到期的療程套餐
 * @param daysBeforeExpiry 到期前幾天開始提醒
 * @param organizationId 診所 ID（可選，不指定則掃描所有診所）
 */
export async function scanExpiringTreatments(
  daysBeforeExpiry: number = 3,
  organizationId?: number
): Promise<{
  customerId: number;
  customerName: string;
  lineUserId: string | null;
  packageId: number;
  packageName: string;
  remainingSessions: number;
  expiryDate: Date | null;
  organizationId: number;
  organizationName: string;
}[]> {
  const now = new Date();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);

  // 設定日期範圍（今天到 N 天後）
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

  const conditions = [
    lte(customerPackages.expiryDate, endOfTargetDate),
    gte(customerPackages.expiryDate, startOfToday),
    sql`${customerPackages.remainingSessions} > 0`,
    eq(customerPackages.status, 'active'),
  ];

  if (organizationId) {
    conditions.push(eq(customers.organizationId, organizationId));
  }

  const db = await getDb();
  if (!db) {
    return [];
  }

  const expiringPackages = await db
    .select({
      customerId: customers.id,
      customerName: customers.name,
      lineUserId: customers.lineUserId,
      packageId: customerPackages.id,
      packageName: customerPackages.packageName,
      remainingSessions: customerPackages.remainingSessions,
      expiryDate: customerPackages.expiryDate,
      organizationId: organizations.id,
      organizationName: organizations.name,
    })
    .from(customerPackages)
    .innerJoin(customers, eq(customerPackages.customerId, customers.id))
    .innerJoin(organizations, eq(customers.organizationId, organizations.id))
    .where(and(...conditions));

  return expiringPackages;
}

/**
 * 發送療程到期提醒
 */
export async function sendTreatmentExpiryReminders(
  daysBeforeExpiry: number = 3,
  organizationId?: number
): Promise<TreatmentReminderResult> {
  const result: TreatmentReminderResult = {
    success: true,
    totalScanned: 0,
    remindersSent: 0,
    errors: [],
    details: [],
  };

  try {
    // 掃描即將到期的療程
    const expiringPackages = await scanExpiringTreatments(daysBeforeExpiry, organizationId);
    result.totalScanned = expiringPackages.length;

    for (const pkg of expiringPackages) {
      const detail: TreatmentReminderResult['details'][0] = {
        customerId: pkg.customerId,
        customerName: pkg.customerName,
        packageName: pkg.packageName,
        expiryDate: pkg.expiryDate ? pkg.expiryDate.toISOString().split('T')[0] : 'N/A',
        lineMessageSent: false,
      };

      // 檢查客戶是否有綁定 LINE
      if (!pkg.lineUserId) {
        detail.error = '客戶未綁定 LINE';
        result.details.push(detail);
        continue;
      }

      try {
        // 建立 Flex Message
        const flexContent = createTreatmentExpiryFlexMessage({
          customerName: pkg.customerName,
          treatmentName: pkg.packageName,
          expiryDate: pkg.expiryDate ? pkg.expiryDate.toLocaleDateString('zh-TW') : 'N/A',
          remainingSessions: pkg.remainingSessions,
          clinicName: pkg.organizationName,
        });

        // 發送 LINE 訊息
        const sendResult = await pushFlexMessage(
          pkg.lineUserId,
          '療程到期提醒',
          flexContent
        );

        if (sendResult.success) {
          detail.lineMessageSent = true;
          result.remindersSent++;
        } else {
          detail.error = sendResult.error;
          result.errors.push(`客戶 ${pkg.customerName}: ${sendResult.error}`);
        }
      } catch (error) {
        detail.error = error instanceof Error ? error.message : '發送失敗';
        result.errors.push(`客戶 ${pkg.customerName}: ${detail.error}`);
      }

      result.details.push(detail);
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : '掃描失敗');
  }

  return result;
}

/**
 * 取得療程到期提醒統計
 */
export async function getTreatmentReminderStats(organizationId?: number): Promise<{
  expiringIn3Days: number;
  expiringIn7Days: number;
  expiringIn14Days: number;
  expiringIn30Days: number;
}> {
  const [in3Days] = await scanExpiringTreatments(3, organizationId).then(r => [r.length]);
  const [in7Days] = await scanExpiringTreatments(7, organizationId).then(r => [r.length]);
  const [in14Days] = await scanExpiringTreatments(14, organizationId).then(r => [r.length]);
  const [in30Days] = await scanExpiringTreatments(30, organizationId).then(r => [r.length]);

  return {
    expiringIn3Days: in3Days,
    expiringIn7Days: in7Days,
    expiringIn14Days: in14Days,
    expiringIn30Days: in30Days,
  };
}

export default {
  scanExpiringTreatments,
  sendTreatmentExpiryReminders,
  getTreatmentReminderStats,
};
