import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc'; // 假設 trpc 設定在上一層

// --- Schemas for Input Validation ---

// 優惠券基本結構 (用於建立和更新)
const CouponInputSchema = z.object({
  code: z.string().min(3, "優惠券代碼至少需要 3 個字元"),
  discount_type: z.enum(['percentage', 'fixed'], {
    required_error: "必須指定折扣類型",
    invalid_type_error: "折扣類型必須是 'percentage' 或 'fixed'",
  }),
  discount_value: z.number().positive("折扣值必須為正數"),
  expires_at: z.string().datetime().optional().nullable(), // 使用 string 處理日期，後端再轉換
  is_active: z.boolean().default(true),
  // 假設需要關聯到特定組織
  organization_id: z.string(),
});

// 優惠券更新結構 (ID 必填)
const UpdateCouponInputSchema = CouponInputSchema.extend({
  id: z.string(),
});

// 查詢優惠券使用記錄的過濾條件
const UsageRecordFilterSchema = z.object({
  coupon_id: z.string().optional(),
  user_id: z.string().optional(),
  used_at_start: z.string().datetime().optional(),
  used_at_end: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// --- Router Implementation ---

export const couponRouter = router({
  // 1. 建立優惠券 (Create)
  createCoupon: publicProcedure
    .input(CouponInputSchema)
    .mutation(async ({ input }) => {
      // 實際應用中，這裡應該呼叫一個服務層 (Service Layer) 進行業務邏輯處理和 Supabase 互動
      // 確保所有敏感操作都在後端處理，遵循資安原則
      console.log('Creating coupon with data:', input);
      // 模擬 Supabase 插入操作後的回傳
      const newCoupon = { id: `coupon_${Date.now()}`, ...input, created_at: new Date().toISOString() };
      return { success: true, coupon: newCoupon };
    }),

  // 2. 取得單一優惠券 (Read)
  getCoupon: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      console.log('Fetching coupon with ID:', input.id);
      // 模擬從 Supabase 查詢
      const mockCoupon = {
        id: input.id,
        code: 'SUMMER20',
        discount_type: 'percentage' as const,
        discount_value: 20,
        expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
        is_active: true,
        organization_id: 'org_abc',
      };
      return mockCoupon;
    }),

  // 3. 取得優惠券列表 (List/Query)
  listCoupons: publicProcedure
    .input(z.object({ organization_id: z.string(), limit: z.number().default(10), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      console.log('Fetching coupons for organization:', input.organization_id);
      // 模擬從 Supabase 查詢列表
      const mockCoupons: any[] = [
        // ... 模擬資料
      ];
      return { coupons: mockCoupons, total: 50 };
    }),

  // 4. 更新優惠券 (Update)
  updateCoupon: publicProcedure
    .input(UpdateCouponInputSchema)
    .mutation(async ({ input }) => {
      console.log('Updating coupon with ID:', input.id);
      // 模擬 Supabase 更新操作
      return { success: true, updatedCoupon: input };
    }),

  // 5. 刪除優惠券 (Delete)
  deleteCoupon: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      console.log('Deleting coupon with ID:', input.id);
      // 模擬 Supabase 刪除操作
      return { success: true, id: input.id };
    }),

  // 6. 查詢優惠券使用記錄 (Coupon Usage Record Query)
  listUsageRecords: publicProcedure
    .input(UsageRecordFilterSchema)
    .query(async ({ input }) => {
      // 這裡的查詢應該只回傳脫敏數據，例如不包含使用者敏感個資
      console.log('Fetching coupon usage records with filters:', input);
      // 模擬 Supabase 查詢
      const mockRecords = [
        { id: 'rec_1', coupon_id: 'coupon_1', user_id: 'user_a', used_at: new Date().toISOString(), order_id: 'order_123' },
        { id: 'rec_2', coupon_id: 'coupon_1', user_id: 'user_b', used_at: new Date().toISOString(), order_id: 'order_456' },
      ];
      return { records: mockRecords, total: 2 };
    }),
});

// 導出類型，方便前端使用
export type CouponRouter = typeof couponRouter;
