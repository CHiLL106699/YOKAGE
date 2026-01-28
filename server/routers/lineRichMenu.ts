import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { lineRichMenus } from '../../drizzle/schema';

/**
 * LINE Rich Menu tRPC Router
 * 提供圖文選單的 CRUD 操作與 LINE API 整合
 */

// LINE Messaging API Client
const LINE_API_BASE = 'https://api.line.me/v2/bot';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

async function callLineAPI(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${LINE_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `LINE API Error: ${error}`,
    });
  }

  return response.json();
}

export const lineRichMenuRouter = router({
  /**
   * 列出所有圖文選單
   */
  listRichMenus: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const menus = await db
        .select()
        .from(lineRichMenus)
        .where(eq(lineRichMenus.organizationId, input.organizationId))
        .orderBy(desc(lineRichMenus.createdAt));

      return menus;
    }),

  /**
   * 取得單一圖文選單
   */
  getRichMenu: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const [menu] = await db
        .select()
        .from(lineRichMenus)
        .where(eq(lineRichMenus.id, input.id))
        .limit(1);

      if (!menu) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '圖文選單不存在' });
      }

      return menu;
    }),

  /**
   * 建立圖文選單
   */
  createRichMenu: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1).max(255),
      chatBarText: z.string().min(1).max(14),
      imageUrl: z.string().url(),
      size: z.object({
        width: z.number(),
        height: z.number(),
      }),
      areas: z.array(z.object({
        bounds: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
        action: z.object({
          type: z.string(),
          uri: z.string().optional(),
          text: z.string().optional(),
        }),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 呼叫 LINE API 建立圖文選單
      const lineResponse = await callLineAPI('/richmenu', 'POST', {
        size: input.size,
        selected: false,
        name: input.name,
        chatBarText: input.chatBarText,
        areas: input.areas,
      });

      const richMenuId = lineResponse.richMenuId;

      // 上傳圖片到 LINE（這裡假設圖片已經上傳到 S3，實際應該從 S3 下載後上傳到 LINE）
      // 注意：LINE API 需要 multipart/form-data 格式上傳圖片，這裡簡化處理

      // 儲存到資料庫
      await db.insert(lineRichMenus).values({
        organizationId: input.organizationId,
        richMenuId,
        name: input.name,
        chatBarText: input.chatBarText,
        imageUrl: input.imageUrl,
        size: input.size,
        areas: input.areas,
        isDefault: false,
        isActive: true,
        clickCount: 0,
      });

      return { success: true, richMenuId };
    }),

  /**
   * 更新圖文選單
   */
  updateRichMenu: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      chatBarText: z.string().min(1).max(14).optional(),
      imageUrl: z.string().url().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const { id, ...updateData } = input;

      await db
        .update(lineRichMenus)
        .set(updateData)
        .where(eq(lineRichMenus.id, id));

      return { success: true };
    }),

  /**
   * 刪除圖文選單
   */
  deleteRichMenu: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 取得圖文選單資訊
      const [menu] = await db
        .select()
        .from(lineRichMenus)
        .where(eq(lineRichMenus.id, input.id))
        .limit(1);

      if (!menu) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '圖文選單不存在' });
      }

      // 呼叫 LINE API 刪除圖文選單
      await callLineAPI(`/richmenu/${menu.richMenuId}`, 'DELETE');

      // 從資料庫刪除
      await db
        .delete(lineRichMenus)
        .where(eq(lineRichMenus.id, input.id));

      return { success: true };
    }),

  /**
   * 設定預設圖文選單
   */
  setDefaultRichMenu: protectedProcedure
    .input(z.object({
      id: z.number(),
      organizationId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      // 取得圖文選單資訊
      const [menu] = await db
        .select()
        .from(lineRichMenus)
        .where(eq(lineRichMenus.id, input.id))
        .limit(1);

      if (!menu) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '圖文選單不存在' });
      }

      // 取消其他圖文選單的預設狀態
      await db
        .update(lineRichMenus)
        .set({ isDefault: false })
        .where(eq(lineRichMenus.organizationId, input.organizationId));

      // 設定為預設圖文選單
      await db
        .update(lineRichMenus)
        .set({ isDefault: true })
        .where(eq(lineRichMenus.id, input.id));

      // 呼叫 LINE API 設定預設圖文選單
      await callLineAPI(`/user/all/richmenu/${menu.richMenuId}`, 'POST');

      return { success: true };
    }),

  /**
   * 連結圖文選單到特定用戶
   */
  linkRichMenuToUser: protectedProcedure
    .input(z.object({
      richMenuId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // 呼叫 LINE API 連結圖文選單到用戶
      await callLineAPI(`/user/${input.userId}/richmenu/${input.richMenuId}`, 'POST');

      return { success: true };
    }),

  /**
   * 取得圖文選單統計資料
   */
  getRichMenuStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '資料庫連接失敗' });

      const menus = await db
        .select()
        .from(lineRichMenus)
        .where(eq(lineRichMenus.organizationId, input.organizationId));

      const totalMenus = menus.length;
      const activeMenus = menus.filter(m => m.isActive).length;
      const defaultMenu = menus.find(m => m.isDefault);
      const totalClicks = menus.reduce((sum, m) => sum + m.clickCount, 0);

      return {
        totalMenus,
        activeMenus,
        defaultMenuName: defaultMenu?.name || '未設定',
        totalClicks,
        clicksByMenu: menus.map(m => ({
          name: m.name,
          clicks: m.clickCount,
        })),
      };
    }),
});
