import { db } from "./db";
import {
  inventorySystemB,
  crmTagsSystemB,
  gamesSystemB,
  prizesSystemB,
  staffCommissionsSystemB,
  inventoryTransfersSystemB,
} from "../drizzle/schema";

async function seedSystemB() {
  console.log("🌱 Starting System B seed...");

  try {
    // 假設 organizationId = 1 (系統 A 的第一個組織)
    const orgId = 1;

    // 1. 庫存資料
    console.log("📦 Creating Inventory...");
    await db.insert(inventorySystemB).values({
      organizationId: orgId,
      productId: 1,
      quantity: 150,
      batchNumber: "BATCH-20231001",
      expiryDate: new Date("2025-10-01"),
      location: "A區冷藏櫃",
      supplier: "台灣醫美供應商",
      minStock: 20,
      status: "in_stock",
    });
    
    await db.insert(inventorySystemB).values({
      organizationId: orgId,
      productId: 2,
      quantity: 8,
      batchNumber: "BATCH-20231115",
      expiryDate: new Date("2024-11-15"),
      location: "A區冷藏櫃",
      supplier: "台灣醫美供應商",
      minStock: 10,
      status: "low_stock",
    });

    // 2. CRM 標籤
    console.log("🏷️ Creating CRM Tags...");
    await db.insert(crmTagsSystemB).values({
      organizationId: orgId,
      name: "VIP 客戶",
      color: "#FFD700",
      category: "customer_level",
    });
    
    await db.insert(crmTagsSystemB).values({
      organizationId: orgId,
      name: "潛在客戶",
      color: "#87CEEB",
      category: "customer_level",
    });

    // 3. 遊戲活動
    console.log("🎮 Creating Games...");
    await db.insert(gamesSystemB).values({
      organizationId: orgId,
      name: "新春開運一番賞",
      type: "ichiban_kuji",
      description: "新春限定活動，抽取豪華獎品！",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-02-29"),
      costPoints: 100,
      status: "active",
    });

    // 4. 獎品
    console.log("🎁 Creating Prizes...");
    await db.insert(prizesSystemB).values({
      gameId: 1,
      name: "A賞：頂級保養品組",
      type: "physical",
      quantity: 5,
      remainingQuantity: 5,
      probability: "0.05",
      imageUrl: "/prizes/a-prize.jpg",
      value: "5000",
    });
    
    await db.insert(prizesSystemB).values({
      gameId: 1,
      name: "B賞：醫美療程券",
      type: "coupon",
      quantity: 10,
      remainingQuantity: 10,
      probability: "0.10",
      imageUrl: "/prizes/b-prize.jpg",
      value: "3000",
    });

    // 5. 員工業績
    console.log("💰 Creating Staff Commissions...");
    await db.insert(staffCommissionsSystemB).values({
      organizationId: orgId,
      staffId: 1,
      period: "2024-01",
      totalSales: "500000",
      commissionAmount: "50000",
      status: "calculated",
    });

    // 6. 跨店調撥
    console.log("🚚 Creating Inventory Transfers...");
    await db.insert(inventoryTransfersSystemB).values({
      fromOrgId: 1,
      toOrgId: 2,
      productId: 1,
      quantity: 20,
      requestedBy: 1,
      notes: "台中分店補貨",
      status: "pending",
    });

    console.log("✅ System B seed completed!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

seedSystemB()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
