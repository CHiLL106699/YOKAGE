import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lineRichMenuRouter } from './routers/lineRichMenu';
import { TRPCError } from '@trpc/server';

/**
 * LINE Rich Menu tRPC Router 單元測試
 * 測試所有 API 端點的成功、失敗、邊界情況
 */

// Mock dependencies
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

vi.mock('../../drizzle/schema', () => ({
  lineRichMenus: {
    organizationId: 'organizationId',
    richMenuId: 'richMenuId',
    name: 'name',
    chatBarText: 'chatBarText',
    imageUrl: 'imageUrl',
    size: 'size',
    areas: 'areas',
    isDefault: 'isDefault',
    isActive: 'isActive',
    clickCount: 'clickCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

// Mock LINE API
global.fetch = vi.fn();

describe('lineRichMenuRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRichMenus', () => {
    it('應該成功列出所有圖文選單', async () => {
      const mockMenus = [
        {
          id: 1,
          organizationId: 60001,
          richMenuId: 'richmenu-123',
          name: '夢幻夜空圖文選單',
          chatBarText: '查看選單',
          imageUrl: 'https://example.com/image.png',
          size: { width: 2500, height: 1686 },
          areas: [],
          isDefault: true,
          isActive: true,
          clickCount: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockMenus),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.listRichMenus({ organizationId: 60001 });

      expect(result).toEqual(mockMenus);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('夢幻夜空圖文選單');
    });

    it('應該在資料庫連接失敗時拋出錯誤', async () => {
      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue(null);

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(
        caller.listRichMenus({ organizationId: 60001 })
      ).rejects.toThrow('資料庫連接失敗');
    });
  });

  describe('getRichMenu', () => {
    it('應該成功取得單一圖文選單', async () => {
      const mockMenu = {
        id: 1,
        organizationId: 60001,
        richMenuId: 'richmenu-123',
        name: '夢幻夜空圖文選單',
        chatBarText: '查看選單',
        imageUrl: 'https://example.com/image.png',
        size: { width: 2500, height: 1686 },
        areas: [],
        isDefault: true,
        isActive: true,
        clickCount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMenu]),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getRichMenu({ id: 1 });

      expect(result).toEqual(mockMenu);
      expect(result.name).toBe('夢幻夜空圖文選單');
    });

    it('應該在圖文選單不存在時拋出 NOT_FOUND 錯誤', async () => {
      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(caller.getRichMenu({ id: 999 })).rejects.toThrow('圖文選單不存在');
    });
  });

  describe('createRichMenu', () => {
    it('應該成功建立圖文選單', async () => {
      const mockRichMenuId = 'richmenu-new-123';

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ richMenuId: mockRichMenuId }),
      });

      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(undefined),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.createRichMenu({
        organizationId: 60001,
        name: '新圖文選單',
        chatBarText: '查看選單',
        imageUrl: 'https://example.com/image.png',
        size: { width: 2500, height: 1686 },
        areas: [],
      });

      expect(result.success).toBe(true);
      expect(result.richMenuId).toBe(mockRichMenuId);
    });

    it('應該在 LINE API 失敗時拋出錯誤', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        text: async () => 'LINE API Error',
      });

      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({});

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(
        caller.createRichMenu({
          organizationId: 60001,
          name: '新圖文選單',
          chatBarText: '查看選單',
          imageUrl: 'https://example.com/image.png',
          size: { width: 2500, height: 1686 },
          areas: [],
        })
      ).rejects.toThrow('LINE API Error');
    });
  });

  describe('deleteRichMenu', () => {
    it('應該成功刪除圖文選單', async () => {
      const mockMenu = {
        id: 1,
        richMenuId: 'richmenu-123',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMenu]),
        delete: vi.fn().mockReturnThis(),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.deleteRichMenu({ id: 1 });

      expect(result.success).toBe(true);
    });

    it('應該在圖文選單不存在時拋出 NOT_FOUND 錯誤', async () => {
      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(caller.deleteRichMenu({ id: 999 })).rejects.toThrow('圖文選單不存在');
    });
  });

  describe('setDefaultRichMenu', () => {
    it('應該成功設定預設圖文選單', async () => {
      const mockMenu = {
        id: 1,
        richMenuId: 'richmenu-123',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMenu]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.setDefaultRichMenu({ id: 1, organizationId: 60001 });

      expect(result.success).toBe(true);
    });
  });

  describe('getRichMenuStats', () => {
    it('應該成功取得圖文選單統計資料', async () => {
      const mockMenus = [
        {
          id: 1,
          organizationId: 60001,
          name: '圖文選單 A',
          isActive: true,
          isDefault: true,
          clickCount: 100,
        },
        {
          id: 2,
          organizationId: 60001,
          name: '圖文選單 B',
          isActive: true,
          isDefault: false,
          clickCount: 50,
        },
        {
          id: 3,
          organizationId: 60001,
          name: '圖文選單 C',
          isActive: false,
          isDefault: false,
          clickCount: 20,
        },
      ];

      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockMenus),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getRichMenuStats({ organizationId: 60001 });

      expect(result.totalMenus).toBe(3);
      expect(result.activeMenus).toBe(2);
      expect(result.defaultMenuName).toBe('圖文選單 A');
      expect(result.totalClicks).toBe(170);
      expect(result.clicksByMenu).toHaveLength(3);
    });

    it('應該在沒有圖文選單時回傳預設值', async () => {
      const { getDb } = await import('./db');
      (getDb as any).mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });

      const caller = lineRichMenuRouter.createCaller({
        user: { id: 1, role: 'clinic_admin' },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getRichMenuStats({ organizationId: 60001 });

      expect(result.totalMenus).toBe(0);
      expect(result.activeMenus).toBe(0);
      expect(result.defaultMenuName).toBe('未設定');
      expect(result.totalClicks).toBe(0);
    });
  });
});
