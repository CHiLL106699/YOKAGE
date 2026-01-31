import { z } from 'zod';
import { publicProcedure, router } from '../trpc'; // 假設 trpc context 在上一層

// --- Zod Schema for Settings ---
// 為了符合資安要求，所有輸入都必須經過嚴格驗證
const settingSchema = z.object({
  id: z.string().uuid().optional(), // 系統設定的唯一 ID
  key: z.string().min(1, '設定鍵值不可為空').max(100, '設定鍵值過長'),
  value: z.any(), // 允許任何類型的值，實際應用中應更精確定義
  description: z.string().max(255).optional(),
  user_id: z.string().uuid().optional(), // 用於使用者偏好設定 (RLS 應確保只能存取自己的)
  is_global: z.boolean().default(false), // 標記是否為全域設定
});

const createSettingSchema = settingSchema.omit({ id: true, user_id: true });
const updateSettingSchema = settingSchema.required({ id: true });
const getSettingSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().optional(),
  is_global: z.boolean().optional(),
});

// --- tRPC Router Implementation ---
export const settingsRouter = router({
  /**
   * 查詢單一設定值
   * 邏輯：根據 id 或 key 查詢。
   * 資安考量：必須確保 RLS 正常運作，使用者只能查詢全域設定或自己的偏好設定。
   */
  get: publicProcedure
    .input(getSettingSchema)
    .query(async ({ ctx, input }) => {
      // 這裡應實作 Supabase 查詢邏輯
      // 範例：
      // const { data, error } = await ctx.supabase
      //   .from('settings')
      //   .select('*')
      //   .or(`id.eq.${input.id},key.eq.${input.key}`)
      //   .eq('user_id', ctx.user.id) // RLS 輔助，確保安全性
      //   .single();

      console.log('Fetching setting with input:', input);
      // 模擬回傳結果
      return {
        id: input.id || 'mock-uuid-1',
        key: input.key || 'default_theme',
        value: 'dark',
        description: 'Mock setting value',
        is_global: input.is_global || false,
      };
    }),

  /**
   * 查詢設定列表
   * 邏輯：可根據 is_global 篩選，或列出所有使用者偏好設定。
   * 資安考量：嚴禁回傳其他使用者的私有設定。
   */
  list: publicProcedure
    .input(z.object({ is_global: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      // 這裡應實作 Supabase 查詢邏輯
      console.log('Listing settings with filter:', input);
      // 模擬回傳結果
      return [
        { id: 'mock-uuid-1', key: 'default_theme', value: 'dark', is_global: false, user_id: 'mock-user-id' },
        { id: 'mock-uuid-2', key: 'system_version', value: '1.0.0', is_global: true },
      ];
    }),

  /**
   * 建立新的設定
   * 邏輯：用於建立全域設定 (需 Service Role) 或使用者偏好設定 (需 RLS)。
   * 資安考量：前端呼叫此 API 必須經過嚴格的權限檢查。建議將全域設定的建立/修改移至 Edge Function 或 Service Role 專用後端。
   */
  create: publicProcedure
    .input(createSettingSchema)
    .mutation(async ({ ctx, input }) => {
      // 這裡應實作 Supabase 插入邏輯
      console.log('Creating setting:', input);
      // 模擬回傳結果
      return { ...input, id: 'mock-new-uuid', user_id: 'mock-user-id' };
    }),

  /**
   * 更新現有設定
   * 邏輯：根據 id 更新設定值。
   * 資安考量：必須確保使用者只能更新自己的偏好設定，或具有 Service Role 權限才能更新全域設定。
   */
  update: publicProcedure
    .input(updateSettingSchema)
    .mutation(async ({ ctx, input }) => {
      // 這裡應實作 Supabase 更新邏輯
      console.log('Updating setting:', input);
      // 模擬回傳結果
      return input;
    }),

  /**
   * 刪除設定
   * 邏輯：根據 id 刪除設定。
   * 資安考量：與 update 相同，嚴格的權限控制。
   */
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // 這裡應實作 Supabase 刪除邏輯
      console.log('Deleting setting with id:', input.id);
      // 模擬回傳結果
      return { success: true, id: input.id };
    }),
});

// 導出類型，供前端使用
export type SettingsRouter = typeof settingsRouter;
