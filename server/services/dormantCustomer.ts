/**
 * 沉睡客戶喚醒服務
 * 掃描長時間未回診的客戶，並發送 LINE 喚醒訊息
 */

import { getDb } from '../db';
import { customers, appointments, organizations } from '../../drizzle/schema';
import { eq, and, lte, gte, desc, sql, isNotNull } from 'drizzle-orm';
import {
  pushFlexMessage,
  createDormantCustomerFlexMessage,
} from './lineMessaging';

interface DormantCustomerResult {
  success: boolean;
  totalScanned: number;
  remindersSent: number;
  errors: string[];
  details: {
    customerId: number;
    customerName: string;
    lastVisitDate: string | null;
    daysSinceLastVisit: number;
    lineMessageSent: boolean;
    error?: string;
  }[];
}

interface DormantCustomer {
  customerId: number;
  customerName: string;
  lineUserId: string | null;
  lastVisitDate: Date | null;
  daysSinceLastVisit: number;
  organizationId: number;
  organizationName: string;
  totalVisits: number;
  totalSpent: number;
}

/**
 * 掃描沉睡客戶
 * @param minDaysSinceLastVisit 最少多少天未回診才算沉睡
 * @param maxDaysSinceLastVisit 最多多少天（超過可能已流失）
 * @param organizationId 診所 ID（可選）
 */
export async function scanDormantCustomers(
  minDaysSinceLastVisit: number = 30,
  maxDaysSinceLastVisit: number = 180,
  organizationId?: number
): Promise<DormantCustomer[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const now = new Date();
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - maxDaysSinceLastVisit);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - minDaysSinceLastVisit);

  // 子查詢：取得每個客戶的最後預約日期
  const lastAppointmentSubquery = db
    .select({
      customerId: appointments.customerId,
      lastVisitDate: sql<Date>`MAX(${appointments.appointmentDate})`.as('lastVisitDate'),
      totalVisits: sql<number>`COUNT(*)`.as('totalVisits'),
    })
    .from(appointments)
    .where(eq(appointments.status, 'completed'))
    .groupBy(appointments.customerId)
    .as('lastAppointment');

  const conditions = [
    isNotNull(customers.lineUserId),
    lte(lastAppointmentSubquery.lastVisitDate, maxDate),
    gte(lastAppointmentSubquery.lastVisitDate, minDate),
  ];

  if (organizationId) {
    conditions.push(eq(customers.organizationId, organizationId));
  }

  const dormantCustomers = await db
    .select({
      customerId: customers.id,
      customerName: customers.name,
      lineUserId: customers.lineUserId,
      lastVisitDate: lastAppointmentSubquery.lastVisitDate,
      totalVisits: lastAppointmentSubquery.totalVisits,
      organizationId: organizations.id,
      organizationName: organizations.name,
    })
    .from(customers)
    .innerJoin(lastAppointmentSubquery, eq(customers.id, lastAppointmentSubquery.customerId))
    .innerJoin(organizations, eq(customers.organizationId, organizations.id))
    .where(and(...conditions));

  // 計算距離上次回診的天數
  return dormantCustomers.map(c => ({
    ...c,
    daysSinceLastVisit: c.lastVisitDate 
      ? Math.floor((now.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999,
    totalSpent: 0, // 可以後續加入消費金額計算
  }));
}

/**
 * 取得沉睡客戶分群統計
 */
export async function getDormantCustomerStats(organizationId?: number): Promise<{
  dormant30Days: number;
  dormant60Days: number;
  dormant90Days: number;
  dormant180Days: number;
  totalDormant: number;
}> {
  const [d30] = await scanDormantCustomers(30, 60, organizationId).then(r => [r.length]);
  const [d60] = await scanDormantCustomers(60, 90, organizationId).then(r => [r.length]);
  const [d90] = await scanDormantCustomers(90, 180, organizationId).then(r => [r.length]);
  const [d180] = await scanDormantCustomers(180, 365, organizationId).then(r => [r.length]);

  return {
    dormant30Days: d30,
    dormant60Days: d60,
    dormant90Days: d90,
    dormant180Days: d180,
    totalDormant: d30 + d60 + d90 + d180,
  };
}

/**
 * 發送沉睡客戶喚醒訊息
 */
export async function sendDormantCustomerReminders(
  minDaysSinceLastVisit: number = 30,
  maxDaysSinceLastVisit: number = 180,
  organizationId?: number,
  specialOffer?: string
): Promise<DormantCustomerResult> {
  const result: DormantCustomerResult = {
    success: true,
    totalScanned: 0,
    remindersSent: 0,
    errors: [],
    details: [],
  };

  try {
    const dormantCustomers = await scanDormantCustomers(
      minDaysSinceLastVisit,
      maxDaysSinceLastVisit,
      organizationId
    );
    result.totalScanned = dormantCustomers.length;

    for (const customer of dormantCustomers) {
      const detail: DormantCustomerResult['details'][0] = {
        customerId: customer.customerId,
        customerName: customer.customerName,
        lastVisitDate: customer.lastVisitDate?.toISOString().split('T')[0] || null,
        daysSinceLastVisit: customer.daysSinceLastVisit,
        lineMessageSent: false,
      };

      if (!customer.lineUserId) {
        detail.error = '客戶未綁定 LINE';
        result.details.push(detail);
        continue;
      }

      try {
        const flexContent = createDormantCustomerFlexMessage({
          customerName: customer.customerName,
          lastVisitDate: customer.lastVisitDate?.toLocaleDateString('zh-TW') || 'N/A',
          daysSinceLastVisit: customer.daysSinceLastVisit,
          specialOffer,
          clinicName: customer.organizationName,
        });

        const sendResult = await pushFlexMessage(
          customer.lineUserId,
          '我們想念您',
          flexContent
        );

        if (sendResult.success) {
          detail.lineMessageSent = true;
          result.remindersSent++;
        } else {
          detail.error = sendResult.error;
          result.errors.push(`客戶 ${customer.customerName}: ${sendResult.error}`);
        }
      } catch (error) {
        detail.error = error instanceof Error ? error.message : '發送失敗';
        result.errors.push(`客戶 ${customer.customerName}: ${detail.error}`);
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

export default {
  scanDormantCustomers,
  getDormantCustomerStats,
  sendDormantCustomerReminders,
};
