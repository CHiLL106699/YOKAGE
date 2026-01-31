import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// 1. Define the input schemas for the procedures
const UploadFileInput = z.object({
  // 在實際應用中，前端會傳遞檔案元數據，後端處理檔案上傳和儲存
  fileName: z.string().min(1, "檔案名稱不能為空"),
  fileSize: z.number().int().positive("檔案大小必須大於 0"),
  fileType: z.string().min(1, "檔案類型不能為空"),
});

const RecordIdInput = z.object({
  recordId: z.string().uuid("記錄 ID 格式不正確"),
});

const FinalizeImportInput = z.object({
  recordId: z.string().uuid("記錄 ID 格式不正確"),
  targetTable: z.string().min(1, "目標資料表不能為空"),
});

// 2. Define the output schemas (簡化)
const ImportRecordOutput = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  createdAt: z.date(),
});

// 3. Create the router
export const dataImportRouter = router({
  // Mutation: 處理檔案上傳的元數據，並建立匯入記錄
  uploadFile: protectedProcedure
    .input(UploadFileInput)
    .mutation(async ({ ctx, input }) => {
      // **資安優先**: 檔案上傳的實際處理邏輯 (如 Supabase Storage) 必須在後端使用 Service Role 權限進行。
      // 前端只傳遞元數據，後端返回一個預簽名 URL 或上傳憑證。
      console.log(`User ${ctx.user.user.id} is uploading file: ${input.fileName}`);

      // Placeholder for Supabase DB operation: Create a new import_records entry
      // const { data, error } = await ctx.supabase.from('import_records').insert({...}).select().single();
      
      // Mock successful record creation
      const newRecordId = "mock-record-id-" + Date.now().toString(); // 實際應為 UUID
      
      return {
        status: "success",
        recordId: newRecordId,
        message: "匯入記錄已建立，請繼續上傳檔案。",
      };
    }),

  // Mutation: 解析檔案內容，驗證數據，並寫入 imported_data
  processData: protectedProcedure
    .input(RecordIdInput)
    .mutation(async ({ ctx, input }) => {
      // **資安優先**: 確保只有記錄所有者可以觸發解析。
      // 實際的檔案讀取、解析和數據驗證邏輯應在後端執行。
      console.log(`Processing data for record: ${input.recordId}`);

      // Placeholder for Supabase DB operation: Read file, parse, validate, and insert into imported_data
      // const { data, error } = await ctx.supabase.rpc('process_import_file', { record_id: input.recordId });

      // Mock successful processing
      return {
        status: "success",
        message: `記錄 ${input.recordId} 的數據已解析並驗證完成。`,
      };
    }),

  // Mutation: 將 imported_data 寫入最終業務表，並更新狀態
  finalizeImport: protectedProcedure
    .input(FinalizeImportInput)
    .mutation(async ({ ctx, input }) => {
      // **資安優先**: 這是最高權限操作，必須嚴格檢查用戶權限，並使用 Supabase Service Role 執行。
      console.log(`Finalizing import for record: ${input.recordId} into table: ${input.targetTable}`);

      // Placeholder for Supabase DB operation: Transaction to move data from imported_data to targetTable
      // const { data, error } = await ctx.supabase.rpc('finalize_data_import', { record_id: input.recordId, target_table: input.targetTable });

      // Mock successful finalization
      return {
        status: "success",
        message: `數據已成功匯入目標資料表 ${input.targetTable}。`,
      };
    }),

  // Query: 查詢匯入記錄列表
  getRecords: protectedProcedure
    .query(async ({ ctx }) => {
      // **資安優先**: 必須強制加入 user_id 篩選條件，確保用戶只能看到自己的記錄。
      // const { data, error } = await ctx.supabase.from('import_records').select('*').eq('user_id', ctx.user.user.id);

      // Mock data
      const mockRecords = [
        { id: "mock-uuid-1", fileName: "users_20240101.csv", status: "COMPLETED", createdAt: new Date() },
        { id: "mock-uuid-2", fileName: "products_20240102.xlsx", status: "FAILED", createdAt: new Date() },
      ];

      return mockRecords;
    }),

  // Query: 查詢單一匯入記錄的詳細信息
  getRecordDetails: protectedProcedure
    .input(RecordIdInput)
    .query(async ({ ctx, input }) => {
      // **資安優先**: 必須檢查 record_id 是否屬於當前用戶。
      // const { data, error } = await ctx.supabase.from('import_records').select('*').eq('id', input.recordId).eq('user_id', ctx.user.user.id).single();

      // Mock data
      const mockDetail = {
        id: input.recordId,
        fileName: "mock_file.csv",
        status: "PROCESSING",
        createdAt: new Date(),
        processedRows: 100,
        errorRows: 5,
        validationErrors: [{ row: 10, error: "Invalid email" }],
      };

      return mockDetail;
    }),
});
