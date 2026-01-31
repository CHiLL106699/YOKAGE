import { z } from 'zod';
import { publicProcedure, router } from '../trpc'; // 假設 trpc 基礎結構已定義

/**
 * 報表相關的輸入/輸出 Schema 定義
 * 遵循資安優先原則，所有操作都在伺服器端進行，並假設 ctx 中包含 Supabase 客戶端
 */

// 報表設定的基礎結構
const ReportConfigSchema = z.object({
  reportName: z.string().min(1, '報表名稱不可為空'),
  description: z.string().optional(),
  parameters: z.record(z.any()).optional().describe('報表生成所需的參數，例如日期範圍、篩選條件'),
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
   * @security 必須在伺服器端透過 Supabase Service Role 或 RLS 確保只有授權使用者可操作
   */
  createReportConfig: publicProcedure // 應替換為 protectedProcedure
    .input(ReportConfigSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('Creating report config:', input);
      // 實作 Supabase 寫入邏輯 (例如: await ctx.supabase.from('report_configs').insert(input))
      // 確保 RLS 生效
      const newId = 'report-config-' + Math.random().toString(36).substring(2, 9);
      return { id: newId, ...input };
    }),

  /**
   * 讀取單一報表設定 (Read)
   * @security 必須確保 RLS 僅回傳使用者有權限查看的資料
   */
  getReportConfig: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      console.log('Fetching report config:', input.id);
      // 實作 Supabase 讀取邏輯 (例如: await ctx.supabase.from('report_configs').select('*').eq('id', input.id).single())
      // 確保回傳的 downloadUrl 是時效性連結 (Presigned URL) 或透過 Edge Function 代理
      return ReportResultSchema.parse({
        id: input.id,
        config: { reportName: '範例報表', parameters: { date: '2026-01-01' } },
        lastGeneratedAt: new Date(),
        downloadUrl: 'https://example.com/download/report.pdf',
        status: 'completed',
      });
    }),

  /**
   * 更新報表設定 (Update)
   * @security 必須確保 RLS 僅允許使用者修改自己建立或有權限修改的設定
   */
  updateReportConfig: publicProcedure
    .input(ReportConfigSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      console.log('Updating report config:', input.id);
      // 實作 Supabase 更新邏輯
      return { success: true, id: input.id };
    }),

  /**
   * 刪除報表設定 (Delete)
   * @security 必須確保 RLS 僅允許使用者刪除自己建立或有權限刪除的設定
   */
  deleteReportConfig: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      console.log('Deleting report config:', input.id);
      // 實作 Supabase 刪除邏輯
      return { success: true, id: input.id };
    }),

  // =================================================================
  // 2. 報表核心功能
  // =================================================================

  /**
   * 報表生成 (Report Generation)
   * @security 報表生成邏輯應在 Edge Function 或後端服務中執行，此處僅為觸發點
   */
  generateReport: publicProcedure
    .input(z.object({ reportConfigId: z.string().uuid(), force: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      console.log('Triggering report generation for config:', input.reportConfigId);
      // 實作觸發後端服務 (例如: Supabase Edge Function, Queue) 進行報表生成的邏輯
      // 避免長時間阻塞 tRPC 請求
      return { success: true, message: '報表生成任務已送出', taskId: 'task-' + Date.now() };
    }),

  /**
   * 報表下載 (Report Download)
   * @security 嚴禁直接暴露檔案路徑。必須透過此 API 取得一個短時效的下載連結 (Presigned URL)
   *           或透過 Edge Function 代理下載，確保每次下載都經過授權檢查。
   */
  getReportDownloadUrl: publicProcedure
    .input(z.object({ reportResultId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      console.log('Requesting download URL for result:', input.reportResultId);
      // 實作 Supabase Storage 取得 Presigned URL 的邏輯
      const presignedUrl = `https://storage.supabase.co/reports/${input.reportResultId}.pdf?token=temp_token`;
      return { downloadUrl: presignedUrl, expiresAt: new Date(Date.now() + 3600000) }; // 1 小時後過期
    }),

  /**
   * 報表排程 (Report Scheduling) - 啟動/停止排程
   * @security 應確保只有管理員或報表擁有者可以修改排程
   */
  toggleReportSchedule: publicProcedure
    .input(z.object({ reportConfigId: z.string().uuid(), enable: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      console.log(`Toggling schedule for config ${input.reportConfigId} to ${input.enable}`);
      // 實作更新 report_configs 表中的 schedule 狀態，並通知排程服務 (例如: cron job, Supabase Scheduled Functions)
      return { success: true, enabled: input.enable };
    }),
});

// 導出類型供前端使用
export type ReportRouter = typeof reportRouter;
