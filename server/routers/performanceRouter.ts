import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { performanceRecords, performanceTargets } from "../../drizzle/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export const performanceRouter = router({
  // 取得業績記錄列表
  list: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        staffId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const conditions = [eq(performanceRecords.clinicId, input.clinicId)];
      
      if (input.staffId) {
        conditions.push(eq(performanceRecords.staffId, input.staffId));
      }
      
      if (input.startDate) {
        conditions.push(gte(performanceRecords.recordDate, new Date(input.startDate)));
      }
      
      if (input.endDate) {
        conditions.push(lte(performanceRecords.recordDate, new Date(input.endDate)));
      }
      
      const records = await db
        .select()
        .from(performanceRecords)
        .where(and(...conditions))
        .orderBy(desc(performanceRecords.recordDate));
      
      return records;
    }),

  // 新增業績記錄
  create: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        staffId: z.string(),
        recordDate: z.string(),
        amount: z.string(),
        type: z.enum(["appointment", "treatment", "product", "manual"]),
        relatedId: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const id = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(performanceRecords).values({
        id,
        clinicId: input.clinicId,
        staffId: input.staffId,
        recordDate: new Date(input.recordDate),
        amount: input.amount,
        type: input.type,
        relatedId: input.relatedId,
        notes: input.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return { id };
    }),

  // 取得業績統計
  statistics: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        staffId: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const conditions = [
        eq(performanceRecords.clinicId, input.clinicId),
        gte(performanceRecords.recordDate, new Date(input.startDate)),
        lte(performanceRecords.recordDate, new Date(input.endDate)),
      ];
      
      if (input.staffId) {
        conditions.push(eq(performanceRecords.staffId, input.staffId));
      }
      
      const result = await db
        .select({
          totalAmount: sql<string>`COALESCE(SUM(${performanceRecords.amount}), 0)`,
          recordCount: sql<number>`COUNT(*)`,
        })
        .from(performanceRecords)
        .where(and(...conditions));
      
      return result[0] || { totalAmount: "0.00", recordCount: 0 };
    }),

  // 取得業績排名
  ranking: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const result = await db
        .select({
          staffId: performanceRecords.staffId,
          totalAmount: sql<string>`COALESCE(SUM(${performanceRecords.amount}), 0)`,
          recordCount: sql<number>`COUNT(*)`,
        })
        .from(performanceRecords)
        .where(
          and(
            eq(performanceRecords.clinicId, input.clinicId),
            gte(performanceRecords.recordDate, new Date(input.startDate)),
            lte(performanceRecords.recordDate, new Date(input.endDate))
          )
        )
        .groupBy(performanceRecords.staffId)
        .orderBy(desc(sql`totalAmount`))
        .limit(input.limit);
      
      return result;
    }),

  // 取得業績目標
  getTarget: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        staffId: z.string(),
        periodType: z.enum(["monthly", "quarterly", "yearly"]),
        year: z.number(),
        period: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const target = await db
        .select()
        .from(performanceTargets)
        .where(
          and(
            eq(performanceTargets.clinicId, input.clinicId),
            eq(performanceTargets.staffId, input.staffId),
            eq(performanceTargets.periodType, input.periodType),
            eq(performanceTargets.year, input.year),
            eq(performanceTargets.period, input.period)
          )
        )
        .limit(1);
      
      return target[0] || null;
    }),

  // 設定業績目標
  setTarget: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        staffId: z.string(),
        periodType: z.enum(["monthly", "quarterly", "yearly"]),
        year: z.number(),
        period: z.number(),
        targetAmount: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const id = `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 檢查是否已存在目標
      const existing = await db
        .select()
        .from(performanceTargets)
        .where(
          and(
            eq(performanceTargets.clinicId, input.clinicId),
            eq(performanceTargets.staffId, input.staffId),
            eq(performanceTargets.periodType, input.periodType),
            eq(performanceTargets.year, input.year),
            eq(performanceTargets.period, input.period)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        // 更新現有目標
        await db
          .update(performanceTargets)
          .set({
            targetAmount: input.targetAmount,
            notes: input.notes,
            updatedAt: new Date(),
          })
          .where(eq(performanceTargets.id, existing[0].id));
        
        return { id: existing[0].id };
      } else {
        // 新增目標
        await db.insert(performanceTargets).values({
          id,
          clinicId: input.clinicId,
          staffId: input.staffId,
          periodType: input.periodType,
          year: input.year,
          period: input.period,
          targetAmount: input.targetAmount,
          notes: input.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        return { id };
      }
    }),

  // 計算業績達成率
  achievementRate: protectedProcedure
    .input(
      z.object({
        clinicId: z.string(),
        staffId: z.string(),
        periodType: z.enum(["monthly", "quarterly", "yearly"]),
        year: z.number(),
        period: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // 取得目標
      const targetResult = await db
        .select()
        .from(performanceTargets)
        .where(
          and(
            eq(performanceTargets.clinicId, input.clinicId),
            eq(performanceTargets.staffId, input.staffId),
            eq(performanceTargets.periodType, input.periodType),
            eq(performanceTargets.year, input.year),
            eq(performanceTargets.period, input.period)
          )
        )
        .limit(1);
      
      const target = targetResult[0] || null;
      
      if (!target) {
        return { targetAmount: "0.00", actualAmount: "0.00", achievementRate: 0 };
      }
      
      // 計算日期範圍
      let startDate: Date;
      let endDate: Date;
      
      if (input.periodType === "monthly") {
        startDate = new Date(input.year, input.period - 1, 1);
        endDate = new Date(input.year, input.period, 0, 23, 59, 59);
      } else if (input.periodType === "quarterly") {
        const quarterStartMonth = (input.period - 1) * 3;
        startDate = new Date(input.year, quarterStartMonth, 1);
        endDate = new Date(input.year, quarterStartMonth + 3, 0, 23, 59, 59);
      } else {
        startDate = new Date(input.year, 0, 1);
        endDate = new Date(input.year, 11, 31, 23, 59, 59);
      }
      
      // 取得實際業績
      const statsResult = await db
        .select({
          totalAmount: sql<string>`COALESCE(SUM(${performanceRecords.amount}), 0)`,
          recordCount: sql<number>`COUNT(*)`,
        })
        .from(performanceRecords)
        .where(
          and(
            eq(performanceRecords.clinicId, input.clinicId),
            eq(performanceRecords.staffId, input.staffId),
            gte(performanceRecords.recordDate, startDate),
            lte(performanceRecords.recordDate, endDate)
          )
        );
      
      const stats = statsResult[0] || { totalAmount: "0.00", recordCount: 0 };
      
      const targetAmount = parseFloat(target.targetAmount);
      const actualAmount = parseFloat(stats.totalAmount);
      const achievementRate = targetAmount > 0 ? (actualAmount / targetAmount) * 100 : 0;
      
      return {
        targetAmount: target.targetAmount,
        actualAmount: stats.totalAmount,
        achievementRate: Math.round(achievementRate * 100) / 100,
      };
    }),
});
