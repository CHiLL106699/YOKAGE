import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';

// ----------------------------------------------------------------
// Zod Schemas for Input/Output Validation
// ----------------------------------------------------------------

// 聊天記錄 (Chat History) - 代表一個聊天會話
const ChatHistorySchema = z.object({
  id: z.string(),
  userId: z.string(), // 必須包含 userId 以便 RLS 隔離
  title: z.string().optional(),
  createdAt: z.string(), // 簡化為 string
  updatedAt: z.string(), // 簡化為 string
});

// 聊天訊息 (Chat Message) - 代表會話中的單條訊息
const ChatMessageSchema = z.object({
  id: z.string(),
  historyId: z.string(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  createdAt: z.string(), // 簡化為 string
});

// 聊天設定 (Chat Settings) - 使用者專屬設定
const ChatSettingsSchema = z.object({
  userId: z.string(), // 必須包含 userId 以便 RLS 隔離
  model: z.string().default('gpt-4o-mini'),
  temperature: z.number().min(0).max(1).default(0.7),
  systemPrompt: z.string().optional(),
});

// ----------------------------------------------------------------
// Router Implementation
// ----------------------------------------------------------------

export const aiChatRouter = router({
  // ----------------------------------------------------------------
  // 聊天記錄 (Chat History) CRUD
  // ----------------------------------------------------------------

  // 查詢所有聊天記錄 (List)
  listHistory: publicProcedure
    .input(z.object({ userId: z.string() })) // 實際應從 context 取得，此處為模擬
    .query(({ input }) => {
      console.log('Fetching chat history for user:', input.userId);
      // 模擬資料庫查詢
      return [
        { id: 'h1', userId: input.userId, title: '初次對話', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'h2', userId: input.userId, title: '技術討論', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
    }),

  // 取得單一聊天記錄的詳細訊息 (Read)
  getHistoryMessages: publicProcedure
    .input(z.object({ historyId: z.string(), userId: z.string() })) // 實際應從 context 取得 userId
    .query(({ input }) => {
      console.log('Fetching messages for history ID:', input.historyId);
      // 模擬資料庫查詢
      return [
        { id: 'm1', historyId: input.historyId, role: 'user', content: '你好，請介紹一下 tRPC', createdAt: new Date().toISOString() },
        { id: 'm2', historyId: input.historyId, role: 'ai', content: 'tRPC 是一個端到端的類型安全 API 框架...', createdAt: new Date().toISOString() },
      ];
    }),

  // 建立新的聊天記錄 (Create)
  createHistory: publicProcedure
    .input(z.object({ userId: z.string(), title: z.string().optional() }))
    .mutation(({ input }) => {
      console.log('Creating new chat history for user:', input.userId);
      // 模擬資料庫寫入
      const newHistory = { id: `h-${Date.now()}`, userId: input.userId, title: input.title || '新對話', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      return newHistory;
    }),

  // 更新聊天記錄標題 (Update)
  updateHistory: publicProcedure
    .input(z.object({ historyId: z.string(), userId: z.string(), title: z.string() }))
    .mutation(({ input }) => {
      console.log('Updating chat history title:', input.historyId);
      // 模擬資料庫更新
      return { id: input.historyId, userId: input.userId, title: input.title, updatedAt: new Date().toISOString() };
    }),

  // 刪除聊天記錄 (Delete)
  deleteHistory: publicProcedure
    .input(z.object({ historyId: z.string(), userId: z.string() }))
    .mutation(({ input }) => {
      console.log('Deleting chat history ID:', input.historyId);
      // 模擬資料庫刪除
      return { id: input.historyId, success: true };
    }),

  // ----------------------------------------------------------------
  // AI 回應 (AI Response) - 包含聊天記錄的寫入
  // ----------------------------------------------------------------

  // 傳送訊息並取得 AI 回應 (Mutation)
  sendMessage: publicProcedure
    .input(z.object({
      historyId: z.string(),
      userId: z.string(),
      message: z.string(),
      settings: ChatSettingsSchema.partial().optional(), // 可選的設定覆蓋
    }))
    .mutation(({ input }) => {
      console.log(`User ${input.userId} sending message to history ${input.historyId}: ${input.message}`);
      // 1. 寫入使用者訊息到資料庫 (模擬)
      const userMessage = { id: `m-u-${Date.now()}`, historyId: input.historyId, role: 'user' as const, content: input.message, createdAt: new Date().toISOString() };

      // 2. 呼叫 AI 服務 (模擬)
      const aiResponseContent = `這是對 "${input.message.substring(0, 10)}..." 的 AI 回應。`;

      // 3. 寫入 AI 回應到資料庫 (模擬)
      const aiMessage = { id: `m-a-${Date.now() + 1}`, historyId: input.historyId, role: 'ai' as const, content: aiResponseContent, createdAt: new Date().toISOString() };

      // 4. 回傳 AI 回應訊息
      return {
        userMessage,
        aiMessage,
        settingsUsed: input.settings || ChatSettingsSchema.parse({ userId: input.userId }),
      };
    }),

  // ----------------------------------------------------------------
  // 聊天設定 (Chat Settings) CRUD
  // ----------------------------------------------------------------

  // 取得使用者聊天設定 (Read)
  getSettings: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      console.log('Fetching chat settings for user:', input.userId);
      // 模擬資料庫查詢
      return ChatSettingsSchema.parse({ userId: input.userId });
    }),

  // 更新使用者聊天設定 (Update/Upsert)
  updateSettings: publicProcedure
    .input(ChatSettingsSchema.partial().extend({ userId: z.string() }))
    .mutation(({ input }) => {
      console.log('Updating chat settings for user:', input.userId);
      // 模擬資料庫更新/新增
      return { ...ChatSettingsSchema.parse({ userId: input.userId }), ...input, updatedAt: new Date().toISOString() };
    }),
});

// ----------------------------------------------------------------
// 資安提示：
// 實際應用中，所有 publicProcedure 都應替換為 protectedProcedure，
// 並在 context 中驗證使用者身份 (userId)，確保所有資料操作都
// 嚴格遵守 RLS (Row Level Security) 原則，防止跨用戶資料洩漏。
// ----------------------------------------------------------------
