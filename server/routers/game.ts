import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc'; // 假設 trpc 核心設定在上一層

/**
 * 遊戲管理 (Game Management) Router
 * 包含遊戲的基本 CRUD 操作
 */
const gameManagementRouter = router({
  // 1. 建立遊戲 (Create Game)
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1, '遊戲名稱不可為空'),
      description: z.string().optional(),
      startDate: z.string().datetime('開始時間格式錯誤'),
      endDate: z.string().datetime('結束時間格式錯誤'),
      status: z.enum(['draft', 'active', 'archived']).default('draft'),
    }))
    .mutation(async ({ input, ctx }) => {
      // 實作 Supabase 寫入邏輯，應透過 Edge Function 或 Service Role 處理敏感操作
      // 這裡僅為邏輯驗證，實際應回傳 Supabase 寫入結果
      return { success: true, gameId: `game-${Date.now()}` };
    }),

  // 2. 查詢遊戲列表 (Read Game List)
  list: publicProcedure
    .input(z.object({
      status: z.enum(['draft', 'active', 'archived', 'all']).default('active'),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(10),
    }))
    .query(async ({ input, ctx }) => {
      // 實作 Supabase 查詢邏輯 (RLS 應確保資料安全)
      return {
        total: 1,
        games: [{
          id: 'game-1',
          name: 'LINE 遊戲範例',
          status: 'active',
          createdAt: new Date().toISOString(),
        }],
      };
    }),

  // 3. 取得單一遊戲 (Read Single Game)
  get: publicProcedure
    .input(z.object({ id: z.string().uuid('遊戲 ID 格式錯誤') }))
    .query(async ({ input, ctx }) => {
      // 實作 Supabase 查詢邏輯
      return {
        id: input.id,
        name: 'LINE 遊戲範例',
        description: '這是一個 LINE 遊戲範例',
        status: 'active',
        prizes: [],
      };
    }),

  // 4. 更新遊戲 (Update Game)
  update: publicProcedure
    .input(z.object({
      id: z.string().uuid('遊戲 ID 格式錯誤'),
      name: z.string().min(1, '遊戲名稱不可為空').optional(),
      description: z.string().optional(),
      status: z.enum(['draft', 'active', 'archived']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 實作 Supabase 更新邏輯
      return { success: true };
    }),

  // 5. 刪除遊戲 (Delete Game)
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid('遊戲 ID 格式錯誤') }))
    .mutation(async ({ input, ctx }) => {
      // 實作 Supabase 刪除邏輯
      return { success: true };
    }),
});

/**
 * 獎品管理 (Prize Management) Router
 * 包含獎品的基本 CRUD 操作
 */
const prizeManagementRouter = router({
  // 1. 建立獎品 (Create Prize)
  create: publicProcedure
    .input(z.object({
      gameId: z.string().uuid('遊戲 ID 格式錯誤'),
      name: z.string().min(1, '獎品名稱不可為空'),
      quantity: z.number().int().min(0, '數量不可為負'),
      probability: z.number().min(0).max(1, '機率必須在 0 到 1 之間'),
    }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, prizeId: `prize-${Date.now()}` };
    }),

  // 2. 查詢獎品列表 (Read Prize List by Game)
  listByGame: publicProcedure
    .input(z.object({ gameId: z.string().uuid('遊戲 ID 格式錯誤') }))
    .query(async ({ input, ctx }) => {
      return [{ id: 'prize-1', name: '一等獎', quantity: 10 }];
    }),

  // 3. 更新獎品 (Update Prize)
  update: publicProcedure
    .input(z.object({
      id: z.string().uuid('獎品 ID 格式錯誤'),
      name: z.string().min(1, '獎品名稱不可為空').optional(),
      quantity: z.number().int().min(0, '數量不可為負').optional(),
      probability: z.number().min(0).max(1, '機率必須在 0 到 1 之間').optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return { success: true };
    }),

  // 4. 刪除獎品 (Delete Prize)
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid('獎品 ID 格式錯誤') }))
    .mutation(async ({ input, ctx }) => {
      return { success: true };
    }),
});

/**
 * 遊戲記錄 (Game Record) Router
 * 包含遊戲記錄的查詢功能
 */
const gameRecordRouter = router({
  // 1. 查詢用戶遊戲記錄 (Read User Records)
  listByUser: publicProcedure
    .input(z.object({
      userId: z.string().min(1, '用戶 ID 不可為空'),
      gameId: z.string().uuid('遊戲 ID 格式錯誤').optional(),
      page: z.number().int().min(1).default(1),
    }))
    .query(async ({ input, ctx }) => {
      // 實作 Supabase 查詢邏輯 (RLS 應確保用戶只能查詢自己的記錄)
      return {
        total: 1,
        records: [{
          id: 'record-1',
          gameName: 'LINE 遊戲範例',
          result: '中獎',
          prizeName: '一等獎',
          timestamp: new Date().toISOString(),
        }],
      };
    }),

  // 2. 查詢遊戲中獎記錄 (Read Game Winners - 需 Service Role 權限)
  listWinners: publicProcedure
    .input(z.object({
      gameId: z.string().uuid('遊戲 ID 格式錯誤'),
      page: z.number().int().min(1).default(1),
    }))
    .query(async ({ input, ctx }) => {
      // **資安提醒**: 此 API 應僅限後台或 Service Role 呼叫，前端嚴禁直接呼叫
      return {
        total: 1,
        winners: [{
          recordId: 'record-1',
          userName: 'Tech Lead',
          prizeName: '一等獎',
          timestamp: new Date().toISOString(),
        }],
      };
    }),
});

/**
 * 匯出主要的 gameRouter
 */
export const gameRouter = router({
  game: gameManagementRouter,
  prize: prizeManagementRouter,
  record: gameRecordRouter,
});

// 匯出型別供前端使用
export type GameRouter = typeof gameRouter;
