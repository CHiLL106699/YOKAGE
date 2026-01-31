import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { db } from '../db';
import { staff } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// --- Zod Schemas for Input Validation ---

// 員工基本資料建立
const StaffCreateSchema = z.object({
  name: z.string().min(1, "員工姓名不能為空"),
  email: z.string().email("請輸入有效的電子郵件地址").optional(),
  phone: z.string().optional(),
  clinicId: z.number(),
  position: z.string().optional(),
  salary: z.number().optional(),
});

// 員工資料更新
const StaffUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "員工姓名不能為空").optional(),
  email: z.string().email("請輸入有效的電子郵件地址").optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  salary: z.number().optional(),
}).refine(data => data.name || data.email || data.phone || data.position || data.salary, {
  message: "至少需要提供一個更新欄位",
});

// --- Staff Router ---

export const staffRouter = router({
  // ----------------------------------------------------------------
  // 1. Staff CRUD Operations (員工基本資料管理)
  // ----------------------------------------------------------------

  /**
   * 查詢所有員工列表
   * @security 必須是已登入使用者 (protectedProcedure)
   */
  list: protectedProcedure
    .query(async () => {
      const staffList = await db.select().from(staff);
      return staffList;
    }),

  /**
   * 根據 ID 查詢單一員工資料
   * @security 必須是已登入使用者
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [staffMember] = await db.select().from(staff).where(eq(staff.id, input.id));
      if (!staffMember) {
        throw new Error("找不到該員工");
      }
      return staffMember;
    }),

  /**
   * 建立新員工
   * @security 必須是已登入使用者，且應有管理員權限
   */
  create: protectedProcedure
    .input(StaffCreateSchema)
    .mutation(async ({ input }) => {
      const [newStaff] = await db.insert(staff).values(input).returning();
      return newStaff;
    }),

  /**
   * 更新員工資料
   * @security 必須是已登入使用者
   */
  update: protectedProcedure
    .input(StaffUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const [updatedStaff] = await db.update(staff)
        .set(updates)
        .where(eq(staff.id, id))
        .returning();
      return updatedStaff;
    }),

  /**
   * 刪除員工
   * @security 必須是已登入使用者，且應有管理員權限
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(staff).where(eq(staff.id, input.id));
      return { success: true, staffId: input.id };
    }),

  /**
   * 取得員工總數
   * @security 必須是已登入使用者
   */
  getCount: protectedProcedure
    .query(async () => {
      const staffList = await db.select().from(staff);
      return { count: staffList.length };
    }),
});

// 導出類型，供前端使用
export type StaffRouter = typeof staffRouter;
