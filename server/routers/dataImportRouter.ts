/**
 * 資料匯入 Router
 * 支援 CSV/Excel 匯入客戶、產品、員工資料
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  importCustomers,
  importProducts,
  importStaff,
  getImportRecords,
  generateImportTemplate,
} from "../services/dataImport";

export const dataImportRouter = router({
  // 匯入客戶資料
  importCustomers: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      csvContent: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await importCustomers(
        input.organizationId,
        ctx.user!.id,
        input.csvContent,
        input.fileName
      );
    }),

  // 匯入產品資料
  importProducts: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      csvContent: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await importProducts(
        input.organizationId,
        ctx.user!.id,
        input.csvContent,
        input.fileName
      );
    }),

  // 匯入員工資料
  importStaff: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      csvContent: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await importStaff(
        input.organizationId,
        ctx.user!.id,
        input.csvContent,
        input.fileName
      );
    }),

  // 取得匯入記錄
  getImportRecords: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      type: z.enum(['customer', 'product', 'staff', 'appointment', 'order']).optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await getImportRecords(input.organizationId, {
        type: input.type,
        limit: input.limit,
      });
    }),

  // 取得匯入範本
  getTemplate: protectedProcedure
    .input(z.object({
      type: z.enum(['customer', 'product', 'staff']),
    }))
    .query(async ({ input }) => {
      return {
        content: generateImportTemplate(input.type),
        fileName: `${input.type}_import_template.csv`,
      };
    }),
});
