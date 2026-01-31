import { z } from 'zod';
import { publicProcedure, router } from '../trpc'; // 假設 trpc context setup 位於此路徑

// --- Schemas ---

// 客戶基本資訊 Schema (用於新增)
const CustomerCreateSchema = z.object({
  name: z.string().min(1, '客戶名稱不能為空'),
  phone: z.string().optional(),
  email: z.string().email('電子郵件格式不正確').optional(),
  // 這裡可以根據實際的 Supabase customers table 欄位進行擴充
});

// 客戶 ID Schema
const CustomerIdSchema = z.object({
  id: z.string().uuid('客戶 ID 格式不正確'),
});

// 客戶更新資訊 Schema (ID 必填，其他欄位選填)
const CustomerUpdateSchema = CustomerIdSchema.extend({
  name: z.string().min(1, '客戶名稱不能為空').optional(),
  phone: z.string().optional(),
  email: z.string().email('電子郵件格式不正確').optional(),
}).partial().required({ id: true });

// 客戶標籤操作 Schema
const CustomerTagSchema = CustomerIdSchema.extend({
  tag: z.string().min(1, '標籤名稱不能為空'),
});

// --- Router ---

/**
 * 客戶管理 Router
 * 包含客戶 CRUD、客戶 360 資訊、客戶標籤功能
 */
export const customerRouter = router({
  // 1. 客戶 CRUD 操作

  /** 建立新客戶 */
  createCustomer: publicProcedure
    .input(CustomerCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // 實際 Supabase 呼叫應在此處進行
      // const { supabase } = ctx;
      // const { data, error } = await supabase.from('customers').insert([input]).select();
      // if (error) throw new Error(error.message);
      
      // 模擬回傳
      console.log('Creating customer with data:', input);
      return { message: '客戶建立成功', customer: { id: 'simulated-uuid-123', ...input } };
    }),

  /** 查詢客戶列表 (支援分頁/過濾) */
  listCustomers: publicProcedure
    .query(async ({ ctx }) => {
      // 實際 Supabase 呼叫應在此處進行
      // const { supabase } = ctx;
      // const { data, error } = await supabase.from('customers').select('*').limit(10);
      // if (error) throw new Error(error.message);

      // 模擬回傳
      return { 
        message: '客戶列表查詢成功', 
        customers: [
          { id: 'simulated-uuid-123', name: '王小明', phone: '0912345678', email: 'test@example.com' },
          { id: 'simulated-uuid-456', name: '陳大華', phone: '0987654321', email: 'chen@example.com' },
        ] 
      };
    }),

  /** 查詢單一客戶詳細資訊 */
  getCustomer: publicProcedure
    .input(CustomerIdSchema)
    .query(async ({ input, ctx }) => {
      // 實際 Supabase 呼叫應在此處進行
      // const { supabase } = ctx;
      // const { data, error } = await supabase.from('customers').select('*').eq('id', input.id).single();
      // if (error) throw new Error(error.message);

      // 模擬回傳
      return { 
        message: `客戶 ${input.id} 查詢成功`, 
        customer: { id: input.id, name: '王小明', phone: '0912345678', email: 'test@example.com' } 
      };
    }),

  /** 更新客戶資訊 */
  updateCustomer: publicProcedure
    .input(CustomerUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      // 實際 Supabase 呼叫應在此處進行
      // const { supabase } = ctx;
      // const { id, ...updates } = input;
      // const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
      // if (error) throw new Error(error.message);

      // 模擬回傳
      console.log(`Updating customer ${input.id} with data:`, input);
      return { message: `客戶 ${input.id} 更新成功`, customer: input };
    }),

  /** 刪除客戶 */
  deleteCustomer: publicProcedure
    .input(CustomerIdSchema)
    .mutation(async ({ input, ctx }) => {
      // 實際 Supabase 呼叫應在此處進行
      // const { supabase } = ctx;
      // const { error } = await supabase.from('customers').delete().eq('id', input.id);
      // if (error) throw new Error(error.message);

      // 模擬回傳
      return { message: `客戶 ${input.id} 刪除成功` };
    }),

  // 2. 客戶 360 資訊

  /** 查詢客戶 360 資訊 (整合病歷、預約等) */
  getCustomer360: publicProcedure
    .input(CustomerIdSchema)
    .query(async ({ input, ctx }) => {
      // 實際應進行多表 JOIN 或多次查詢以整合資料
      // 模擬回傳
      return {
        message: `客戶 ${input.id} 360 資訊查詢成功`,
        customer: { id: input.id, name: '王小明' },
        appointments: [{ date: '2026-01-30', status: 'completed' }],
        medicalRecords: [{ date: '2025-12-01', diagnosis: '感冒' }],
        tags: ['VIP', '高頻次'],
      };
    }),

  // 3. 客戶標籤管理

  /** 為客戶新增標籤 */
  addTagToCustomer: publicProcedure
    .input(CustomerTagSchema)
    .mutation(async ({ input, ctx }) => {
      // 實際應操作 customer_tags 關聯表
      // 模擬回傳
      return { message: `已為客戶 ${input.id} 新增標籤: ${input.tag}` };
    }),

  /** 移除客戶標籤 */
  removeTagFromCustomer: publicProcedure
    .input(CustomerTagSchema)
    .mutation(async ({ input, ctx }) => {
      // 實際應操作 customer_tags 關聯表
      // 模擬回傳
      return { message: `已從客戶 ${input.id} 移除標籤: ${input.tag}` };
    }),

  /** 查詢所有可用標籤 */
  listCustomerTags: publicProcedure
    .query(async ({ ctx }) => {
      // 實際應查詢 tags 表
      // 模擬回傳
      return { message: '客戶標籤列表查詢成功', tags: ['VIP', '高頻次', '新客', '潛在客戶'] };
    }),
});
