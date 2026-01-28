import { mysqlTable, int, varchar, text, boolean, timestamp, json } from 'drizzle-orm/mysql-core';

/**
 * LINE 圖文選單資料表
 * 儲存診所的 LINE 圖文選單設定
 */
export const lineRichMenus = mysqlTable('line_rich_menus', {
  id: int('id').primaryKey().autoincrement(),
  organizationId: int('organization_id').notNull(), // 診所 ID
  richMenuId: varchar('rich_menu_id', { length: 255 }).notNull().unique(), // LINE Rich Menu ID
  name: varchar('name', { length: 255 }).notNull(), // 圖文選單名稱
  chatBarText: varchar('chat_bar_text', { length: 14 }).notNull(), // 選單列文字（最多 14 字元）
  imageUrl: text('image_url').notNull(), // 圖片 URL
  size: json('size').notNull().$type<{ width: number; height: number }>(), // 圖片尺寸
  areas: json('areas').notNull().$type<Array<{
    bounds: { x: number; y: number; width: number; height: number };
    action: { type: string; uri?: string; text?: string };
  }>>(), // 按鈕區域配置
  isDefault: boolean('is_default').notNull().default(false), // 是否為預設圖文選單
  isActive: boolean('is_active').notNull().default(true), // 是否啟用
  clickCount: int('click_count').notNull().default(0), // 點擊次數
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type LineRichMenu = typeof lineRichMenus.$inferSelect;
export type InsertLineRichMenu = typeof lineRichMenus.$inferInsert;
