import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc';

// --- Schemas for Input Validation ---

// Schema for sending a notification (Mutation Input)
const SendNotificationInput = z.object({
  recipientId: z.number().describe('接收通知的使用者 ID'),
  message: z.string().min(1).max(500).describe('通知內容'),
  type: z.enum(['system', 'line', 'email']).describe('通知類型'),
  relatedEntityId: z.number().optional().describe('相關實體 ID (例如: 訂單 ID)'),
});

// Schema for querying notification logs (Query Input)
const GetNotificationLogInput = z.object({
  page: z.number().int().min(1).default(1).describe('頁碼'),
  limit: z.number().int().min(1).max(100).default(10).describe('每頁筆數'),
  status: z.enum(['sent', 'failed', 'read']).optional().describe('通知狀態過濾'),
});

// Schema for updating notification settings (Mutation Input)
const UpdateSettingsInput = z.object({
  receiveLine: z.boolean().describe('是否接收 LINE 通知'),
  receiveEmail: z.boolean().describe('是否接收 Email 通知'),
  doNotDisturbStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().describe('勿擾模式開始時間 (HH:MM)'),
  doNotDisturbEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().describe('勿擾模式結束時間 (HH:MM)'),
});

// --- Router Definition ---

export const notificationRouter = router({
  /**
   * @procedure mutation
   * @description 發送通知。這是一個敏感操作，應由 Service Role 或 Edge Function 處理，
   *              此處僅為 tRPC 介面定義，實際發送邏輯應在後端服務中。
   */
  sendNotification: protectedProcedure
    .input(SendNotificationInput)
    .mutation(async ({ input, ctx }) => {
      // TODO: 實作實際的通知發送邏輯（LINE Messaging API 或其他服務）
      // 目前暫時返回成功訊息
      return { success: true, message: 'Notification request logged successfully.' };
    }),

  /**
   * @procedure query
   * @description 取得使用者的通知記錄。
   */
  getNotificationLog: protectedProcedure
    .input(GetNotificationLogInput)
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { page, limit } = input;

      // TODO: 實作實際的通知記錄查詢邏輯
      // 目前暫時返回空陣列
      return {
        logs: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
      };
    }),

  /**
   * @procedure mutation
   * @description 更新使用者的通知設定。
   */
  updateNotificationSettings: protectedProcedure
    .input(UpdateSettingsInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // TODO: 實作實際的通知設定更新邏輯
      // 目前暫時返回成功訊息
      return { success: true, message: 'Notification settings updated successfully.' };
    }),

  /**
   * @procedure query
   * @description 取得使用者的通知設定。
   */
  getNotificationSettings: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      // TODO: 實作實際的通知設定查詢邏輯
      // 目前暫時返回預設值
      return {
        user_id: userId,
        receive_line: true,
        receive_email: true,
        do_not_disturb_start: null,
        do_not_disturb_end: null,
      };
    }),
});

// 導出類型，供前端使用
export type NotificationRouter = typeof notificationRouter;
