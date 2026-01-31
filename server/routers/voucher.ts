import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc"; // 假設 trpc.ts 在上一層目錄

// --- Zod Schemas for Input Validation ---

// 建立票券的輸入驗證
const createVoucherInput = z.object({
  name: z.string().min(1, "票券名稱不可為空"),
  type: z.enum(["discount", "freebie", "cash"]), // 假設的票券類型
  value: z.number().min(0),
  expiry_date: z.string().datetime().or(z.date()), // 接受 ISO 8601 字串或 Date 物件
  // TODO: 根據實際需求增加更多欄位，例如數量、適用對象等
});

// 更新票券的輸入驗證
const updateVoucherInput = z.object({
  id: z.string().uuid("ID 格式錯誤"),
  name: z.string().min(1, "票券名稱不可為空").optional(),
  type: z.enum(["discount", "freebie", "cash"]).optional(),
  value: z.number().min(0).optional(),
  expiry_date: z.string().datetime().or(z.date()).optional(),
  // TODO: 根據實際需求增加更多欄位
});

// 查詢單一票券或刪除的輸入驗證
const voucherIdInput = z.object({
  id: z.string().uuid("ID 格式錯誤"),
});

// 列表查詢的輸入驗證
const listVoucherInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  status: z.enum(["active", "expired", "redeemed"]).optional(),
  // TODO: 增加更多過濾條件
});

// --- Router Implementation ---

export const voucherRouter = router({
  // 1. 建立票券 (Create)
  create: protectedProcedure
    .input(createVoucherInput)
    .mutation(async ({ ctx, input }) => {
      // TODO: 實作 Supabase 插入邏輯
      console.log("Creating voucher with input:", input);
      // 範例: const { data, error } = await ctx.supabase.from('voucher').insert([input]).select().single();
      // 由於 Supabase client 尚未在 ctx 中定義，先回傳 Mock 資料
      return { id: "mock-uuid-create", ...input, message: "Voucher created successfully (MOCK)" };
    }),

  // 2. 取得票券列表 (List/Read)
  list: protectedProcedure
    .input(listVoucherInput)
    .query(async ({ ctx, input }) => {
      // TODO: 實作 Supabase 查詢邏輯
      console.log("Listing vouchers with input:", input);
      const mockVouchers = [
        { id: "mock-uuid-1", name: "10% Off", type: "discount", value: 10, expiry_date: new Date().toISOString() },
        { id: "mock-uuid-2", name: "Free Drink", type: "freebie", value: 0, expiry_date: new Date().toISOString() },
      ];
      return { vouchers: mockVouchers, total: 2, message: "Vouchers listed successfully (MOCK)" };
    }),

  // 3. 依 ID 取得單一票券 (Read One)
  getById: protectedProcedure
    .input(voucherIdInput)
    .query(async ({ ctx, input }) => {
      // TODO: 實作 Supabase 查詢單一邏輯
      console.log("Getting voucher by ID:", input.id);
      // 範例: const { data, error } = await ctx.supabase.from('voucher').select('*').eq('id', input.id).single();
      return { id: input.id, name: "Single Mock Voucher", type: "cash", value: 100, expiry_date: new Date().toISOString(), message: "Voucher retrieved successfully (MOCK)" };
    }),

  // 4. 更新票券 (Update)
  update: protectedProcedure
    .input(updateVoucherInput)
    .mutation(async ({ ctx, input }) => {
      // TODO: 實作 Supabase 更新邏輯
      console.log("Updating voucher with input:", input);
      // 範例: const { data, error } = await ctx.supabase.from('voucher').update(input).eq('id', input.id).select().single();
      return { voucherId: input.id, ...input, message: "Voucher updated successfully (MOCK)" };
    }),

  // 5. 刪除票券 (Delete)
  delete: protectedProcedure
    .input(voucherIdInput)
    .mutation(async ({ ctx, input }) => {
      // TODO: 實作 Supabase 刪除邏輯
      console.log("Deleting voucher with ID:", input.id);
      // 範例: const { error } = await ctx.supabase.from('voucher').delete().eq('id', input.id);
      return { id: input.id, message: "Voucher deleted successfully (MOCK)" };
    }),

  // --- 票券核銷 (Redeem) ---
  redeem: protectedProcedure
    .input(z.object({ voucherId: z.string().uuid(), userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: 實作票券核銷邏輯
      // 1. 檢查票券是否存在、是否有效、是否已核銷
      // 2. 執行核銷操作 (通常是更新狀態並記錄核銷時間/使用者)
      // 3. 確保交易原子性 (例如使用 Supabase Edge Function 或 Transaction)
      console.log("Redeeming voucher:", input.voucherId, "for user:", input.userId);
      return { success: true, message: "Voucher redeemed successfully (STUB)" };
    }),

  // --- 票券統計 (Stats) ---
  stats: protectedProcedure
    .input(z.object({ startDate: z.string().datetime().optional(), endDate: z.string().datetime().optional() }))
    .query(async ({ ctx, input }) => {
      // TODO: 實作票券統計邏輯
      // 1. 查詢已發行、已核銷、已過期等數量
      // 2. 依時間範圍、類型等進行分組統計
      console.log("Generating voucher stats for period:", input.startDate, "to", input.endDate);
      return {
        totalIssued: 100,
        totalRedeemed: 45,
        totalExpired: 5,
        message: "Voucher statistics generated (STUB)",
      };
    }),
});
