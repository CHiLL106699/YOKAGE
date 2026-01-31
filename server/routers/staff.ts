import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { db } from '../db';
import { staff } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// --- Zod Schemas for Input Validation ---

// 員工基本資料建立（符合 schema.ts 的 staff 表結構）
const StaffCreateSchema = z.object({
  name: z.string().min(1, "員工姓名不能為空"),
  organizationId: z.number(),
  userId: z.number().optional(),
  employeeId: z.string().optional(),
  email: z.string().email("請輸入有效的電子郵件地址").optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  hireDate: z.date().optional(),
  salary: z.string().optional(), // decimal 欄位使用 string
  salaryType: z.enum(['monthly', 'hourly', 'commission']).optional(),
  avatar: z.string().optional(),
  skills: z.any().optional(),
  isActive: z.boolean().optional(),
});

// 員工資料更新
const StaffUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "員工姓名不能為空").optional(),
  userId: z.number().optional(),
  employeeId: z.string().optional(),
  email: z.string().email("請輸入有效的電子郵件地址").optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  hireDate: z.date().optional(),
  salary: z.string().optional(), // decimal 欄位使用 string
  salaryType: z.enum(['monthly', 'hourly', 'commission']).optional(),
  avatar: z.string().optional(),
  skills: z.any().optional(),
  isActive: z.boolean().optional(),
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
      // MySQL 的 insert 操作不支援 .returning()，需先插入後再查詢
      const [result] = await db.insert(staff).values(input);
      // 取得最後插入的 ID（Drizzle ORM 的 MySQL 語法）
      const [newStaff] = await db.select().from(staff).where(eq(staff.id, result.insertId));
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
      // MySQL 的 update 操作不支援 .returning()，需先更新後再查詢
      await db.update(staff)
        .set(updates)
        .where(eq(staff.id, id));
      const [updatedStaff] = await db.select().from(staff).where(eq(staff.id, id));
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
