import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from './db';
import { inventorySystemB, crmTagsSystemB, gamesSystemB, inventoryTransfersSystemB } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Dashboard System B CRUD Operations', () => {
  let testInventoryId: number;
  let testTagId: number;
  let testGameId: number;
  let testTransferId: number;

  beforeAll(async () => {
    // 清理測試資料
    await db.delete(inventorySystemB).where(eq(inventorySystemB.productId, 999));
    await db.delete(crmTagsSystemB).where(eq(crmTagsSystemB.name, 'Test Tag'));
    await db.delete(gamesSystemB).where(eq(gamesSystemB.name, 'Test Game'));
  });

  describe('Inventory CRUD', () => {
    it('should create inventory item', async () => {
      const [result] = await db.insert(inventorySystemB).values({
        productId: 999,
        organizationId: 1,
        location: 'Test Location',
        quantity: 100,
        minStock: 10,
        expiryDate: new Date('2025-12-31'),
      }).returning();
      expect(result).toBeDefined();
      testInventoryId = result.id;
    });

    it('should read inventory item', async () => {
      const items = await db.select().from(inventorySystemB).where(eq(inventorySystemB.id, testInventoryId));
      expect(items.length).toBe(1);
      expect(items[0].productId).toBe(999);
    });

    it('should update inventory item', async () => {
      await db.update(inventorySystemB)
        .set({ quantity: 150 })
        .where(eq(inventorySystemB.id, testInventoryId));
      
      const items = await db.select().from(inventorySystemB).where(eq(inventorySystemB.id, testInventoryId));
      expect(items[0].quantity).toBe(150);
    });

    it('should delete inventory item', async () => {
      await db.delete(inventorySystemB).where(eq(inventorySystemB.id, testInventoryId));
      const items = await db.select().from(inventorySystemB).where(eq(inventorySystemB.id, testInventoryId));
      expect(items.length).toBe(0);
    });
  });

  describe('CRM Tags CRUD', () => {
    it('should create CRM tag', async () => {
      const [result] = await db.insert(crmTagsSystemB).values({
        name: 'Test Tag',
        color: '#FF0000',
        organizationId: 1,
      }).returning();
      expect(result).toBeDefined();
      testTagId = result.id;
    });

    it('should read CRM tag', async () => {
      const tags = await db.select().from(crmTagsSystemB).where(eq(crmTagsSystemB.id, testTagId));
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe('Test Tag');
    });

    it('should update CRM tag', async () => {
      await db.update(crmTagsSystemB)
        .set({ color: '#00FF00' })
        .where(eq(crmTagsSystemB.id, testTagId));
      
      const tags = await db.select().from(crmTagsSystemB).where(eq(crmTagsSystemB.id, testTagId));
      expect(tags[0].color).toBe('#00FF00');
    });

    it('should delete CRM tag', async () => {
      await db.delete(crmTagsSystemB).where(eq(crmTagsSystemB.id, testTagId));
      const tags = await db.select().from(crmTagsSystemB).where(eq(crmTagsSystemB.id, testTagId));
      expect(tags.length).toBe(0);
    });
  });

  describe('Games CRUD', () => {
    it('should create game', async () => {
      const [result] = await db.insert(gamesSystemB).values({
        name: 'Test Game',
        type: 'ichiban_kuji',
        organizationId: 1,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active',
      }).returning();
      expect(result).toBeDefined();
      testGameId = result.id;
    });

    it('should read game', async () => {
      const games = await db.select().from(gamesSystemB).where(eq(gamesSystemB.id, testGameId));
      expect(games.length).toBe(1);
      expect(games[0].name).toBe('Test Game');
    });

    it('should update game', async () => {
      await db.update(gamesSystemB)
        .set({ status: 'paused' })
        .where(eq(gamesSystemB.id, testGameId));
      
      const games = await db.select().from(gamesSystemB).where(eq(gamesSystemB.id, testGameId));
      expect(games[0].status).toBe('paused');
    });

    it('should delete game', async () => {
      await db.delete(gamesSystemB).where(eq(gamesSystemB.id, testGameId));
      const games = await db.select().from(gamesSystemB).where(eq(gamesSystemB.id, testGameId));
      expect(games.length).toBe(0);
    });
  });

  afterAll(async () => {
    // 清理測試資料
    await db.delete(inventorySystemB).where(eq(inventorySystemB.productId, 999));
    await db.delete(crmTagsSystemB).where(eq(crmTagsSystemB.name, 'Test Tag'));
    await db.delete(gamesSystemB).where(eq(gamesSystemB.name, 'Test Game'));
  });
});
