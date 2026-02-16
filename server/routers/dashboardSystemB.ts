/**
 * 系統 B Dashboard Router (MySQL 版本)
 * 整合日期：2026-01-31
 * 
 * 此檔案包含系統 B 的 6 大核心模組 API：
 * 1. 庫存管理 (inventory)
 * 2. LINE CRM (crm)
 * 3. 營運分析 (bi)
 * 4. 遊戲化行銷 (gamification)
 * 5. 人資薪酬 (hr)
 * 6. 多店中樞 (multiBranch)
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { db } from '../db';
import {
  inventorySystemB,
  crmTagsSystemB,
  customerTagsSystemB,
  gamesSystemB,
  prizesSystemB,
  gameParticipationsSystemB,
  staffCommissionsSystemB,
  inventoryTransfersSystemB,
  products,
  customers,
  staff,
  organizations,
} from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// ============================================
// 1. 庫存管理 Router
// ============================================
export const inventoryRouter = router({
  /**
   * 取得庫存列表
   */
  list: publicProcedure
    .input(z.object({
      organizationId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const items = await db.select().from(inventorySystemB);
        return items;
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return [];
      }
    }),

  /**
   * 新增庫存
   */
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number(),
      quantity: z.number(),
      batchNumber: z.string().optional(),
      expiryDate: z.date().optional(),
      location: z.string().optional(),
      supplier: z.string().optional(),
      minStock: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(inventorySystemB).values({
        organizationId: input.organizationId,
        productId: input.productId,
        quantity: input.quantity,
        batchNumber: input.batchNumber,
        expiryDate: input.expiryDate?.toISOString().split('T')[0],
        location: input.location,
        supplier: input.supplier,
        minStock: input.minStock,
      });
      return { success: true };
    }),

  /**
   * 取得低庫存預警
   */
  lowStock: protectedProcedure
    .query(async () => {
      try {
        const items = await db
          .select()
          .from(inventorySystemB)
          .where(sql`${inventorySystemB.quantity} <= ${inventorySystemB.minStock}`);
        return items;
      } catch (error) {
        console.error("Failed to fetch low stock items:", error);
        return [];
      }
    }),
});

// ============================================
// 2. LINE CRM Router
// ============================================
export const crmRouter = router({
  /**
   * 取得 CRM 標籤列表
   */
  listTags: protectedProcedure
    .query(async () => {
      try {
        const tags = await db.select().from(crmTagsSystemB);
        return tags;
      } catch (error) {
        console.error("Failed to fetch CRM tags:", error);
        return [];
      }
    }),

  /**
   * 新增 CRM 標籤
   */
  createTag: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      color: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(crmTagsSystemB).values(input);
      return { success: true };
    }),

  /**
   * 取得客戶標籤
   */
  getCustomerTags: protectedProcedure
    .input(z.object({
      customerId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const tags = await db
          .select()
          .from(customerTagsSystemB)
          .where(eq(customerTagsSystemB.customerId, input.customerId));
        return tags;
      } catch (error) {
        console.error("Failed to fetch customer tags:", error);
        return [];
      }
    }),
});

// ============================================
// 3. 營運分析 Router (BI)
// ============================================
export const biRouter = router({
  /**
   * 取得營收趨勢
   */
  revenueTrend: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }).optional())
    .query(async ({ input }) => {
      // TODO: 實作營收趨勢查詢
      // 目前返回 Mock Data
      return {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [120000, 150000, 180000, 160000, 200000, 220000],
      };
    }),

  /**
   * 取得熱門療程排行
   */
  topServices: protectedProcedure
    .query(async () => {
      // TODO: 實作熱門療程查詢
      return [
        { name: '玻尿酸注射', count: 45, revenue: 135000 },
        { name: '肉毒桿菌', count: 38, revenue: 114000 },
        { name: '皮秒雷射', count: 32, revenue: 96000 },
      ];
    }),

  /**
   * 取得關鍵 KPI
   */
  kpi: protectedProcedure
    .query(async () => {
      // TODO: 實作 KPI 查詢
      return {
        todayRevenue: 45000,
        todayAppointments: 12,
        todayCustomers: 8,
        monthRevenue: 680000,
      };
    }),
});

// ============================================
// 4. 遊戲化行銷 Router
// ============================================
export const gamificationRouter = router({
  /**
   * 取得遊戲活動列表
   */
  listGames: protectedProcedure
    .query(async () => {
      try {
        const games = await db.select().from(gamesSystemB);
        return games;
      } catch (error) {
        console.error("Failed to fetch games:", error);
        return [];
      }
    }),

  /**
   * 新增遊戲活動
   */
  createGame: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      type: z.enum(['ichiban_kuji', 'slot_machine', 'wheel']),
      description: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      costPoints: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(gamesSystemB).values({
        organizationId: input.organizationId,
        name: input.name,
        type: input.type,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        costPoints: input.costPoints,
      });
      return { success: true };
    }),

  /**
   * 取得獎品列表
   */
  listPrizes: protectedProcedure
    .input(z.object({
      gameId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const prizes = await db
          .select()
          .from(prizesSystemB)
          .where(eq(prizesSystemB.gameId, input.gameId));
        return prizes;
      } catch (error) {
        console.error("Failed to fetch prizes:", error);
        return [];
      }
    }),
});

// ============================================
// 5. 人資薪酬 Router
// ============================================
export const hrRouter = router({
  /**
   * 取得員工業績列表
   */
  listCommissions: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      period: z.string().optional(), // YYYY-MM
    }).optional())
    .query(async ({ input }) => {
      try {
        const commissions = await db
          .select()
          .from(staffCommissionsSystemB)
          .orderBy(desc(staffCommissionsSystemB.period));
        return commissions;
      } catch (error) {
        console.error("Failed to fetch commissions:", error);
        return [];
      }
    }),

  /**
   * 計算員工業績
   */
  calculateCommission: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      period: z.string(), // YYYY-MM
      totalSales: z.number(),
      commissionRate: z.number(), // 0.1 = 10%
    }))
    .mutation(async ({ input }) => {
      const commissionAmount = input.totalSales * input.commissionRate;
      await db.insert(staffCommissionsSystemB).values({
        organizationId: input.organizationId,
        staffId: input.staffId,
        period: input.period,
        totalSales: input.totalSales.toString(),
        commissionAmount: commissionAmount.toString(),
        status: 'calculated',
      });
      return { success: true };
    }),
});

// ============================================
// 6. 多店中樞 Router
// ============================================
export const multiBranchRouter = router({
  /**
   * 取得跨店調撥單列表
   */
  listTransfers: protectedProcedure
    .query(async () => {
      try {
        const transfers = await db
          .select()
          .from(inventoryTransfersSystemB)
          .orderBy(desc(inventoryTransfersSystemB.createdAt));
        return transfers;
      } catch (error) {
        console.error("Failed to fetch transfers:", error);
        return [];
      }
    }),

  /**
   * 新增跨店調撥單
   */
  createTransfer: protectedProcedure
    .input(z.object({
      fromOrgId: z.number(),
      toOrgId: z.number(),
      productId: z.number(),
      quantity: z.number(),
      requestedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(inventoryTransfersSystemB).values({
        fromOrgId: input.fromOrgId,
        toOrgId: input.toOrgId,
        productId: input.productId,
        quantity: input.quantity,
        requestedBy: input.requestedBy,
        notes: input.notes,
        status: 'pending',
      });
      return { success: true };
    }),

  /**
   * 取得跨店營收比較
   */
  revenueComparison: protectedProcedure
    .query(async () => {
      // TODO: 實作跨店營收比較查詢
      return [
        { name: '台北旗艦店', revenue: 450000, growth: 12.5 },
        { name: '台中分店', revenue: 320000, growth: 8.3 },
        { name: '高雄分店', revenue: 280000, growth: -2.1 },
      ];
    }),
});

// ============================================
// 統一導出
// ============================================
export const dashboardSystemBRouter = router({
  inventory: inventoryRouter,
  crm: crmRouter,
  bi: biRouter,
  gamification: gamificationRouter,
  hr: hrRouter,
  multiBranch: multiBranchRouter,
});
