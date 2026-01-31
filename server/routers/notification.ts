import { z } from 'zod';
import { t } from '../_core/trpc'; // 假設 trpc 實例從 '../trpc' 導入
import { supabase } from '../../utils/supabaseClient'; // 假設 Supabase 客戶端從 '../../utils/supabaseClient' 導入

// --- Schemas for Input Validation ---

// 假設我們有一個 'notification_logs' table
const NotificationLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  message: z.string(),
  type: z.enum(['system', 'line', 'email']),
  status: z.enum(['sent', 'failed', 'read']),
  created_at: z.string().datetime(),
  read_at: z.string().datetime().nullable(),
});

// 假設我們有一個 'notification_settings' table
const NotificationSettingsSchema = z.object({
  user_id: z.string().uuid(),
  receive_line: z.boolean(),
  receive_email: z.boolean(),
  do_not_disturb_start: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  do_not_disturb_end: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
});

// Schema for sending a notification (Mutation Input)
const SendNotificationInput = z.object({
  recipientId: z.string().uuid().describe('接收通知的使用者 ID'),
  message: z.string().min(1).max(500).describe('通知內容'),
  type: z.enum(['system', 'line', 'email']).describe('通知類型'),
  relatedEntityId: z.string().optional().describe('相關實體 ID (例如: 訂單 ID)'),
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

export const notificationRouter = t.router({
  /**
   * @procedure mutation
   * @description 發送通知。這是一個敏感操作，應由 Service Role 或 Edge Function 處理，
   *              此處僅為 tRPC 介面定義，實際發送邏輯應在後端服務中。
   *              為了資安，這裡模擬一個簡單的記錄流程。
   */
  sendNotification: t.procedure
    .input(SendNotificationInput)
    .mutation(async ({ input, ctx }) => {
      // 確保只有授權使用者可以呼叫
      if (!ctx.session?.user?.id) {
        throw new Error('Unauthorized');
      }

      // 實際的通知發送邏輯 (例如呼叫 Supabase Edge Function 或其他後端服務)
      // 這裡僅模擬將發送請求記錄到 notification_logs table
      const { data, error } = await supabase
        .from('notification_logs')
        .insert({
          user_id: input.recipientId, // 接收者 ID
          message: input.message,
          type: input.type,
          status: 'sent', // 假設發送成功
          related_entity_id: input.relatedEntityId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging notification:', error);
        throw new Error('Failed to log notification request.');
      }

      return { success: true, logId: data.id, message: 'Notification request logged successfully.' };
    }),

  /**
   * @procedure query
   * @description 取得使用者的通知記錄。
   *              嚴格遵守 RLS 原則，只查詢當前登入使用者的記錄。
   */
  getNotificationLog: t.procedure
    .input(GetNotificationLogInput)
    .query(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const { page, limit, status } = input;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('notification_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId) // RLS: 確保只查自己的記錄
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching notification log:', error);
        throw new Error('Failed to fetch notification log.');
      }

      return {
        logs: data,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    }),

  /**
   * @procedure mutation
   * @description 更新使用者的通知設定。
   *              嚴格遵守 RLS 原則，只更新當前登入使用者的設定。
   */
  updateNotificationSettings: t.procedure
    .input(UpdateSettingsInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const updateData = {
        user_id: userId,
        receive_line: input.receiveLine,
        receive_email: input.receiveEmail,
        do_not_disturb_start: input.doNotDisturbStart || null,
        do_not_disturb_end: input.doNotDisturbEnd || null,
      };

      // 使用 upsert 確保如果設定不存在則創建，存在則更新
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert(updateData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating notification settings:', error);
        throw new Error('Failed to update notification settings.');
      }

      return { success: true, settings: data, message: 'Notification settings updated successfully.' };
    }),

  /**
   * @procedure query
   * @description 取得使用者的通知設定。
   *              嚴格遵守 RLS 原則，只查詢當前登入使用者的設定。
   */
  getNotificationSettings: t.procedure
    .query(async ({ ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId) // RLS: 確保只查自己的設定
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Error fetching notification settings:', error);
        throw new Error('Failed to fetch notification settings.');
      }

      // 如果沒有找到設定，返回預設值
      if (!data) {
        return {
          user_id: userId,
          receive_line: true,
          receive_email: true,
          do_not_disturb_start: null,
          do_not_disturb_end: null,
        };
      }

      return data;
    }),
});

// 導出類型，供前端使用
export type NotificationRouter = typeof notificationRouter;
