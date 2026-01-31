import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc'; // 假設 trpc 實例在 ../trpc

// --- Zod Schemas for Input Validation ---

// 員工基本資料建立
const StaffCreateSchema = z.object({
  name: z.string().min(1, "員工姓名不能為空"),
  email: z.string().email("請輸入有效的電子郵件地址"),
  roleId: z.string().uuid("請提供有效的角色 ID"),
});

// 員工資料更新
const StaffUpdateSchema = z.object({
  id: z.string().uuid("請提供有效的員工 ID"),
  name: z.string().min(1, "員工姓名不能為空").optional(),
  email: z.string().email("請輸入有效的電子郵件地址").optional(),
  roleId: z.string().uuid("請提供有效的角色 ID").optional(),
}).refine(data => data.name || data.email || data.roleId, {
  message: "至少需要提供一個更新欄位",
});

// 員工角色更新
const StaffRoleUpdateSchema = z.object({
  staffId: z.string().uuid("請提供有效的員工 ID"),
  newRoleId: z.string().uuid("請提供有效的角色 ID"),
});

// --- Staff Router ---

export const staffRouter = router({
  // ----------------------------------------------------------------
  // 1. Staff CRUD Operations (員工基本資料管理)
  // ----------------------------------------------------------------

  /**
   * 查詢所有員工列表
   * @security 必須是已登入使用者 (protectedProcedure)，RLS 會自動過濾資料。
   */
  getAllStaffs: protectedProcedure
    .query(async ({ ctx }) => {
      // 假設 ctx.supabase 已經配置好，並且 RLS 已在 'staffs' 表上啟用
      // 僅選擇脫敏欄位，避免洩露敏感資訊
      const { data, error } = await ctx.supabase
        .from('staffs')
        .select('id, name, email, role_id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all staffs:", error);
        throw new Error("無法取得員工列表");
      }

      return data;
    }),

  /**
   * 根據 ID 查詢單一員工資料
   * @security 必須是已登入使用者，RLS 確保只能查詢有權限的資料。
   */
  getStaffById: protectedProcedure
    .input(z.object({ id: z.string().uuid("請提供有效的員工 ID") }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('staffs')
        .select('id, name, email, role_id, created_at')
        .eq('id', input.id)
        .single();

      if (error) {
        console.error(`Error fetching staff ${input.id}:`, error);
        throw new Error("找不到該員工或無權存取");
      }

      return data;
    }),

  /**
   * 建立新員工
   * @security 必須是已登入使用者，且應有管理員權限 (假設 RLS 或後續 Middleware 會檢查)。
   */
  createStaff: protectedProcedure
    .input(StaffCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // 實際應用中，這裡可能需要一個 Middleware 來檢查呼叫者是否為 Admin
      // 為了資安，我們假設 RLS 已經配置為只有特定角色可以 INSERT
      const { data, error } = await ctx.supabase
        .from('staffs')
        .insert([{
          name: input.name,
          email: input.email,
          role_id: input.roleId,
          // 密碼等敏感資訊應在 Supabase Auth 或 Edge Function 中處理，避免前端傳輸
        }])
        .select('id, name, email, role_id, created_at') // 僅回傳脫敏數據
        .single();

      if (error) {
        console.error("Error creating staff:", error);
        throw new Error("建立員工失敗");
      }

      return data;
    }),

  /**
   * 更新員工資料
   * @security 必須是已登入使用者，RLS 確保只能更新有權限的資料。
   */
  updateStaff: protectedProcedure
    .input(StaffUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;

      const { data, error } = await ctx.supabase
        .from('staffs')
        .update(updates)
        .eq('id', id)
        .select('id, name, email, role_id, created_at')
        .single();

      if (error) {
        console.error(`Error updating staff ${id}:`, error);
        throw new Error("更新員工資料失敗");
      }

      return data;
    }),

  /**
   * 刪除員工
   * @security 必須是已登入使用者，且應有管理員權限。
   */
  deleteStaff: protectedProcedure
    .input(z.object({ id: z.string().uuid("請提供有效的員工 ID") }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from('staffs')
        .delete()
        .eq('id', input.id);

      if (error) {
        console.error(`Error deleting staff ${input.id}:`, error);
        throw new Error("刪除員工失敗");
      }

      return { success: true, staffId: input.id };
    }),

  // ----------------------------------------------------------------
  // 2. Role Management (員工角色管理)
  // ----------------------------------------------------------------

  /**
   * 查詢所有角色列表
   * @security 必須是已登入使用者。
   */
  getAllRoles: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('roles')
        .select('id, name, permissions');

      if (error) {
        console.error("Error fetching all roles:", error);
        throw new Error("無法取得角色列表");
      }

      return data;
    }),

  /**
   * 更新員工角色
   * @security 必須是已登入使用者，且應有角色管理權限。
   */
  updateStaffRole: protectedProcedure
    .input(StaffRoleUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from('staffs')
        .update({ role_id: input.newRoleId })
        .eq('id', input.staffId);

      if (error) {
        console.error(`Error updating staff role for ${input.staffId}:`, error);
        throw new Error("更新員工角色失敗");
      }

      return { success: true, staffId: input.staffId, newRoleId: input.newRoleId };
    }),

  // ----------------------------------------------------------------
  // 3. Staff Statistics (員工統計)
  // ----------------------------------------------------------------

  /**
   * 取得員工總數
   * @security 必須是已登入使用者，且應有統計數據查看權限。
   */
  getStaffCount: protectedProcedure
    .query(async ({ ctx }) => {
      // 使用 count 函數，並確保 RLS 適用於 count
      const { count, error } = await ctx.supabase
        .from('staffs')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error("Error fetching staff count:", error);
        throw new Error("無法取得員工總數");
      }

      return { count: count ?? 0 };
    }),
});

// 導出類型，供前端使用
export type StaffRouter = typeof staffRouter;
