import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc'; // 假設 trpc context 定義在上一層

// 1. 定義資料結構 (Schema)
// 這是預約資料的基礎結構，用於輸入驗證
const AppointmentSchema = z.object({
  id: z.string().uuid().describe('預約紀錄的唯一 ID'),
  patientId: z.string().uuid().describe('病患 ID'),
  dateTime: z.string().datetime().describe('預約時間 (ISO 8601 格式)'), // 使用 string.datetime() 處理時間字串
  reason: z.string().min(1).max(255).describe('預約原因/備註'),
  status: z.enum(['scheduled', 'completed', 'cancelled']).describe('預約狀態'),
  // 為了資安，這裡不包含任何敏感的 Supabase Service Role 相關邏輯
});

// 2. 定義輸入驗證 (Input Schemas)
// 建立預約
const createAppointmentInput = AppointmentSchema.omit({ id: true, status: true }).extend({
  status: z.enum(['scheduled']).default('scheduled'),
});

// 更新預約 (部分更新，但 ID 必填)
const updateAppointmentInput = AppointmentSchema.partial().required({ id: true });

// 刪除預約
const deleteAppointmentInput = z.object({ id: z.string().uuid() });

// 查詢單一預約
const getAppointmentInput = z.object({ id: z.string().uuid() });

// 排程查詢與預約統計
const listAppointmentsInput = z.object({
  startDate: z.string().datetime().optional().describe('查詢起始時間'),
  endDate: z.string().datetime().optional().describe('查詢結束時間'),
  patientId: z.string().uuid().optional().describe('依病患 ID 過濾'),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional().describe('依狀態過濾'),
  limit: z.number().int().min(1).max(100).default(10).describe('每頁筆數限制'),
  cursor: z.string().optional().describe('分頁游標'), // 用於無限加載
});

// 3. 建立 Router
export const appointmentRouter = router({
  // 預約 CRUD - Create
  create: protectedProcedure
    .input(createAppointmentInput)
    .mutation(async ({ input, ctx }) => {
      // **資安鐵則**: 這裡應呼叫 Supabase Edge Function 或後端 API
      // 進行資料庫操作，以確保 RLS 生效，前端不直接操作敏感 Table。
      console.log('Creating appointment:', input);
      // 模擬資料庫操作
      const newAppointment = { id: 'mock-uuid-123', ...input, status: 'scheduled' };
      return newAppointment;
    }),

  // 預約 CRUD - Read (單一)
  get: protectedProcedure
    .input(getAppointmentInput)
    .query(async ({ input, ctx }) => {
      console.log('Getting appointment with ID:', input.id);
      // 模擬資料庫操作
      return { id: input.id, patientId: 'mock-patient-id', dateTime: new Date().toISOString(), reason: 'Checkup', status: 'scheduled' };
    }),

  // 預約 CRUD - Update
  update: protectedProcedure
    .input(updateAppointmentInput)
    .mutation(async ({ input, ctx }) => {
      console.log('Updating appointment:', input);
      // 模擬資料庫操作
      return { ...input, status: input.status || 'scheduled' };
    }),

  // 預約 CRUD - Delete
  delete: protectedProcedure
    .input(deleteAppointmentInput)
    .mutation(async ({ input, ctx }) => {
      console.log('Deleting appointment with ID:', input.id);
      // 模擬資料庫操作
      return { success: true, id: input.id };
    }),

  // 排程查詢與預約統計 - List/Query
  list: protectedProcedure
    .input(listAppointmentsInput)
    .query(async ({ input, ctx }) => {
      console.log('Listing appointments with filters:', input);
      // 模擬資料庫操作
      const mockData = [
        { id: 'mock-uuid-1', patientId: 'p1', dateTime: new Date().toISOString(), reason: 'Follow-up', status: 'scheduled' },
        { id: 'mock-uuid-2', patientId: 'p2', dateTime: new Date().toISOString(), reason: 'New Patient', status: 'completed' },
      ];
      return {
        items: mockData,
        nextCursor: input.limit < mockData.length ? 'next-cursor-token' : undefined,
        totalCount: 100, // 模擬總數，用於統計
      };
    }),
});

// 導出 Router 名稱，方便在主 Router 中合併
export type AppointmentRouter = typeof appointmentRouter;
