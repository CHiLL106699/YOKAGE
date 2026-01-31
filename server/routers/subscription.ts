import { z } from 'zod';
// 假設 trpc.ts 位於 server/trpc.ts 或 server/utils/trpc.ts，並導出 router, publicProcedure, protectedProcedure
// 由於專案結構未知，我們假設它在相對路徑 ../trpc
import { router, publicProcedure, protectedProcedure } from '../trpc';

// =================================================================
// 服務層抽象 (Service Layer Abstraction)
// 根據資安鐵則，所有敏感操作應透過抽象層或 Edge Function 處理
// 這裡使用一個模擬的 Service Layer 來體現架構設計
// =================================================================
const subscriptionService = {
  // 訂閱方案 (Plan)
  getPlans: async () => {
    console.log('Fetching all subscription plans from DB (Public data)');
    // 實際應呼叫 Supabase 讀取 plans table
    return [{ id: 'pro', name: '專業版', price: 999, features: ['Feature A', 'Feature B'] }];
  },
  createPlan: async (input: z.infer<typeof PlanSchema>) => {
    console.log('Creating new plan (Admin/Service Role required)', input);
    // 實際應呼叫 Service Layer 或 Edge Function 執行
    return { ...input, id: `plan_${Date.now()}` };
  },
  updatePlan: async (input: z.infer<typeof PlanSchema>) => {
    console.log('Updating plan (Admin/Service Role required)', input);
    // 實際應呼叫 Service Layer 或 Edge Function 執行
    return input;
  },
  deletePlan: async (id: string) => {
    console.log('Deleting plan (Admin/Service Role required)', id);
    // 實際應呼叫 Service Layer 或 Edge Function 執行
    return { success: true, id };
  },

  // 訂閱記錄 (Record)
  getRecord: async (userId: string) => {
    console.log(`Fetching subscription record for user: ${userId} (RLS enforced)`);
    // 實際應呼叫 Supabase 讀取 records table，RLS 應確保只返回該用戶的記錄
    return { userId, status: 'active', planId: 'pro', expiresAt: new Date(Date.now() + 86400000 * 30) };
  },
  cancelSubscription: async (userId: string, recordId: string) => {
    console.log(`Cancelling subscription ${recordId} for user ${userId} (Edge Function required)`);
    // 實際應呼叫 Supabase Edge Function 處理，使用 Service Role key 更新狀態
    return { success: true, recordId, newStatus: 'pending_cancellation' };
  },

  // 付款記錄 (Payment)
  getPaymentHistory: async (userId: string) => {
    console.log(`Fetching payment history for user: ${userId} (RLS enforced)`);
    // 實際應呼叫 Supabase 讀取 payments table，RLS 應確保只返回該用戶的記錄
    return [
      { id: 'pay_001', amount: 999, status: 'paid', date: new Date() },
      { id: 'pay_002', amount: 999, status: 'paid', date: new Date(Date.now() - 86400000 * 30) },
    ];
  },
};

// =================================================================
// Zod Schemas for Input Validation
// =================================================================

// 訂閱方案 (Subscription Plan)
const PlanSchema = z.object({
  id: z.string().describe('方案 ID，新增時可選'),
  name: z.string().min(1).describe('方案名稱'),
  price: z.number().positive().describe('方案價格'),
  features: z.array(z.string()).describe('方案特色列表'),
});

// 訂閱記錄 (Subscription Record)
const RecordQuerySchema = z.object({
  recordId: z.string().optional().describe('訂閱記錄 ID，若無則查詢最新一筆'),
});

const CancelSubscriptionSchema = z.object({
  recordId: z.string().describe('要取消的訂閱記錄 ID'),
});

// 付款記錄 (Payment Record)
const PaymentHistoryQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(10).describe('查詢筆數限制'),
  offset: z.number().int().min(0).default(0).describe('查詢偏移量'),
});

// =================================================================
// 1. 訂閱方案 Router (Subscription Plan Router)
// =================================================================
const subscriptionPlanRouter = router({
  /**
   * 取得所有訂閱方案 (公開)
   * @security publicProcedure: 方案資訊為公開資料，無 RLS 限制
   */
  getPlans: publicProcedure
    .query(async () => {
      return subscriptionService.getPlans();
    }),

  /**
   * 建立新訂閱方案 (管理員/Service Role)
   * @security protectedProcedure: 敏感操作，需驗證管理員權限或 Service Role 呼叫
   */
  createPlan: protectedProcedure
    .input(PlanSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      // 實際應在此處進行權限檢查 (e.g., ctx.user.role === 'admin')
      return subscriptionService.createPlan(input);
    }),

  /**
   * 更新訂閱方案 (管理員/Service Role)
   * @security protectedProcedure: 敏感操作，需驗證管理員權限或 Service Role 呼叫
   */
  updatePlan: protectedProcedure
    .input(PlanSchema.required({ id: true }))
    .mutation(async ({ input }) => {
      // 實際應在此處進行權限檢查
      return subscriptionService.updatePlan(input);
    }),

  /**
   * 刪除訂閱方案 (管理員/Service Role)
   * @security protectedProcedure: 敏感操作，需驗證管理員權限或 Service Role 呼叫
   */
  deletePlan: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // 實際應在此處進行權限檢查
      return subscriptionService.deletePlan(input.id);
    }),
});

// =================================================================
// 2. 訂閱記錄 Router (Subscription Record Router)
// =================================================================
const subscriptionRecordRouter = router({
  /**
   * 取得用戶訂閱記錄
   * @security protectedProcedure: 需登入，依賴 RLS 確保用戶只能查詢自己的記錄
   */
  getRecord: protectedProcedure
    .input(RecordQuerySchema)
    .query(async ({ ctx, input }) => {
      // ctx.user.id 應由 protectedProcedure 確保存在
      const userId = ctx.user.id;
      // 實際應呼叫 Service Layer 讀取，並依賴 RLS
      return subscriptionService.getRecord(userId);
    }),

  /**
   * 取消訂閱
   * @security protectedProcedure: 需登入，操作敏感 Table，必須透過 Edge Function 處理
   */
  cancelSubscription: protectedProcedure
    .input(CancelSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 呼叫 Service Layer，該 Service Layer 應觸發 Supabase Edge Function
      // 確保前端不直接操作敏感 Table
      return subscriptionService.cancelSubscription(userId, input.recordId);
    }),
});

// =================================================================
// 3. 付款記錄 Router (Payment Record Router)
// =================================================================
const paymentRecordRouter = router({
  /**
   * 取得用戶付款歷史記錄
   * @security protectedProcedure: 需登入，依賴 RLS 確保用戶只能查詢自己的記錄
   */
  getPaymentHistory: protectedProcedure
    .input(PaymentHistoryQuerySchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // 實際應呼叫 Service Layer 讀取，並依賴 RLS
      const history = await subscriptionService.getPaymentHistory(userId);
      // 確保返回的數據是脫敏的 (例如不包含完整的信用卡號)
      return history;
    }),
});

// =================================================================
// 主 Router (Main Router)
// =================================================================
export const subscriptionRouter = router({
  /**
   * 訂閱方案管理 (Plan Management)
   */
  plans: subscriptionPlanRouter,

  /**
   * 用戶訂閱記錄 (User Subscription Records)
   */
  records: subscriptionRecordRouter,

  /**
   * 用戶付款記錄 (User Payment History)
   */
  payments: paymentRecordRouter,
});

// 導出 Router 的類型，供前端使用
export type SubscriptionRouter = typeof subscriptionRouter;
