import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { db } from '../db';
import { orders, appointments, customers } from '../../drizzle/schema';
import { eq, gte, lte, sql } from 'drizzle-orm';

export const biExportRouter = router({
  exportCsv: publicProcedure
    .input(
      z.object({
        organizationId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        dataType: z.enum(['revenue', 'appointments', 'customers']),
      })
    )
    .mutation(async ({ input }) => {
      const { organizationId, startDate, endDate, dataType } = input;

      let csvData = '';
      let headers = '';
      let rows: string[] = [];

      if (dataType === 'revenue') {
        // 查詢營收數據
        const revenueData = await db
          .select({
            date: sql<string>`DATE(${orders.createdAt})`,
            totalAmount: sql<number>`SUM(${orders.total})`,
            orderCount: sql<number>`COUNT(*)`,
          })
          .from(orders)
          .where(
            sql`${orders.organizationId} = ${organizationId} AND ${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`
          )
          .groupBy(sql`DATE(${orders.createdAt})`)
          .orderBy(sql`DATE(${orders.createdAt})`);

        headers = '日期,總營收(元),訂單數量\n';
        rows = revenueData.map(
          (row) => `${row.date},${row.totalAmount},${row.orderCount}`
        );
      } else if (dataType === 'appointments') {
        // 查詢預約數據
        const appointmentData = await db
          .select({
            date: sql<string>`DATE(${appointments.startTime})`,
            totalAppointments: sql<number>`COUNT(*)`,
            confirmedCount: sql<number>`SUM(CASE WHEN ${appointments.status} = 'confirmed' THEN 1 ELSE 0 END)`,
            cancelledCount: sql<number>`SUM(CASE WHEN ${appointments.status} = 'cancelled' THEN 1 ELSE 0 END)`,
          })
          .from(appointments)
          .where(
            sql`${appointments.organizationId} = ${organizationId} AND ${appointments.startTime} >= ${startDate} AND ${appointments.startTime} <= ${endDate}`
          )
          .groupBy(sql`DATE(${appointments.startTime})`)
          .orderBy(sql`DATE(${appointments.startTime})`);

        headers = '日期,總預約數,已確認,已取消\n';
        rows = appointmentData.map(
          (row) =>
            `${row.date},${row.totalAppointments},${row.confirmedCount},${row.cancelledCount}`
        );
      } else if (dataType === 'customers') {
        // 查詢客戶數據
        const customerData = await db
          .select({
            date: sql<string>`DATE(${customers.createdAt})`,
            newCustomers: sql<number>`COUNT(*)`,
          })
          .from(customers)
          .where(
            sql`${customers.organizationId} = ${organizationId} AND ${customers.createdAt} >= ${startDate} AND ${customers.createdAt} <= ${endDate}`
          )
          .groupBy(sql`DATE(${customers.createdAt})`)
          .orderBy(sql`DATE(${customers.createdAt})`);

        headers = '日期,新客戶數\n';
        rows = customerData.map((row) => `${row.date},${row.newCustomers}`);
      }

      csvData = headers + rows.join('\n');

      // 返回 CSV 字串（前端會轉換為 Blob 下載）
      return {
        success: true,
        data: csvData,
        filename: `${dataType}_${startDate}_${endDate}.csv`,
      };
    }),

  exportPdf: publicProcedure
    .input(
      z.object({
        organizationId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;

      // 查詢所有數據
      const revenueData = await db
        .select({
          date: sql<string>`DATE(${orders.createdAt})`,
          totalAmount: sql<number>`SUM(${orders.total})`,
        })
        .from(orders)
        .where(
          sql`${orders.organizationId} = ${organizationId} AND ${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`
        )
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      const appointmentData = await db
        .select({
          date: sql<string>`DATE(${appointments.startTime})`,
          totalAppointments: sql<number>`COUNT(*)`,
        })
        .from(appointments)
        .where(
          sql`${appointments.organizationId} = ${organizationId} AND ${appointments.startTime} >= ${startDate} AND ${appointments.startTime} <= ${endDate}`
        )
        .groupBy(sql`DATE(${appointments.startTime})`)
        .orderBy(sql`DATE(${appointments.startTime})`);

      // 返回數據（前端會使用 jsPDF 生成 PDF）
      return {
        success: true,
        data: {
          revenue: revenueData,
          appointments: appointmentData,
          period: { startDate, endDate },
        },
        filename: `bi_report_${startDate}_${endDate}.pdf`,
      };
    }),
});
