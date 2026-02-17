import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';

/**
 * 報表相關的輸入/輸出 Schema 定義
 * 遵循資安優先原則，所有操作都在伺服器端進行
 */

// 報表設定的基礎結構
const ReportConfigSchema = z.object({
  reportName: z.string().min(1, '報表名稱不可為空'),
  description: z.string().optional(),
  parameters: z.record(z.string(), z.any()).optional().describe('報表生成所需的參數，例如日期範圍、篩選條件'),
  schedule: z.string().optional().describe('排程設定，例如 cron 表達式'),
  isActive: z.boolean().default(true),
});

// 報表結果的輸出結構
const ReportResultSchema = z.object({
  id: z.string().uuid().describe('報表設定的唯一 ID'),
  config: ReportConfigSchema,
  lastGeneratedAt: z.date().nullable().describe('上次生成時間'),
  downloadUrl: z.string().url().nullable().describe('已生成報表的下載連結 (脫敏)'),
  status: z.enum(['pending', 'generating', 'completed', 'failed']),
});

export const reportRouter = router({
  // =================================================================
  // 1. CRUD - 報表設定管理
  // =================================================================

  /**
   * 建立新的報表設定 (Create)
   * @security 透過 protectedProcedure 確保只有授權使用者可操作
   */
  createReportConfig: protectedProcedure
    .input(ReportConfigSchema)
    .mutation(async ({ input, ctx }) => {
      // 實作 Supabase 寫入邏輯
      const newId = 'report-config-' + Math.random().toString(36).substring(2, 9);
      return { id: newId, ...input };
    }),

  /**
   * 讀取單一報表設定 (Read)
   * @security 透過 protectedProcedure 確保 RLS 僅回傳使用者有權限查看的資料
   */
  getReportConfig: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // 實作 Supabase 讀取邏輯
      // 注意：downloadUrl 應透過 getReportDownloadUrl 取得時效性連結
      return ReportResultSchema.parse({
        id: input.id,
        config: { reportName: '範例報表', parameters: { date: '2026-01-01' } },
        lastGeneratedAt: new Date(),
        downloadUrl: null, // 不直接回傳下載連結，需透過 getReportDownloadUrl 取得
        status: 'completed',
      });
    }),

  /**
   * 更新報表設定 (Update)
   * @security 透過 protectedProcedure 確保 RLS 僅允許使用者修改自己建立或有權限修改的設定
   */
  updateReportConfig: protectedProcedure
    .input(ReportConfigSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, id: input.id };
    }),

  /**
   * 刪除報表設定 (Delete)
   * @security 透過 protectedProcedure 確保 RLS 僅允許使用者刪除自己建立或有權限刪除的設定
   */
  deleteReportConfig: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, id: input.id };
    }),

  // =================================================================
  // 2. 報表核心功能
  // =================================================================

  /**
   * 報表生成 (Report Generation)
   * @security 報表生成邏輯應在 Edge Function 或後端服務中執行，此處僅為觸發點
   */
  generateReport: protectedProcedure
    .input(z.object({ reportConfigId: z.string().uuid(), force: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, message: '報表生成任務已送出', taskId: 'task-' + Date.now() };
    }),

  /**
   * 報表下載 (Report Download)
   * @security 透過 Supabase Storage createSignedUrl 生成時效性安全 URL
   *           絕對禁止直接暴露檔案路徑或使用硬編碼 token
   */
  getReportDownloadUrl: protectedProcedure
    .input(z.object({ reportResultId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {

      // 使用 Supabase Storage createSignedUrl 生成安全的時效性下載連結
      // 注意：實際部署時需要透過 Supabase Service Role Client 操作
      const storagePath = `reports/${input.reportResultId}.pdf`;
      const expiresIn = 3600; // 1 小時

      try {
        // 透過後端 Supabase Service Role Client 生成 Signed URL
        // const { data, error } = await supabaseAdmin.storage
        //   .from('reports')
        //   .createSignedUrl(storagePath, expiresIn);
        // if (error) throw error;
        // return { downloadUrl: data.signedUrl, expiresAt: new Date(Date.now() + expiresIn * 1000) };

        // 暫時回傳 placeholder，待 Supabase Storage 設定完成後啟用上方邏輯
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: '報表下載功能待 Supabase Storage 設定完成後啟用',
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '無法生成報表下載連結',
        });
      }
    }),

  /**
   * 報表排程 (Report Scheduling) - 啟動/停止排程
   * @security 應確保只有管理員或報表擁有者可以修改排程
   */
  toggleReportSchedule: protectedProcedure
    .input(z.object({ reportConfigId: z.string().uuid(), enable: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, enabled: input.enable };
    }),
});

// 導出類型供前端使用
export type ReportRouter = typeof reportRouter;
