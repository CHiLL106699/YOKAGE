import { getDb } from "../server/db";
import { customers, appointments, products, orders, staff, attendanceRecords, games, prizes, gamePlays, userPrizes } from "../drizzle/schema";
import { eq, ne } from "drizzle-orm";

/**
 * 清理測試資料腳本
 * 保留「伊美秘書」相關的測試資料
 */

async function cleanTestData() {
  console.log("開始清理測試資料...");
  const db = await getDb();

  try {
    // 1. 保留伊美秘書的客戶資料，刪除其他測試客戶
    const yiMeiCustomer = await db.query.customers.findFirst({
      where: eq(customers.name, "伊美秘書")
    });

    if (yiMeiCustomer) {
      console.log(`✓ 找到伊美秘書客戶 (ID: ${yiMeiCustomer.id})`);
      
      // 刪除其他客戶
      const deletedCustomers = await db.delete(customers)
        .where(ne(customers.id, yiMeiCustomer.id));
      console.log(`✓ 刪除了 ${deletedCustomers.rowsAffected} 個測試客戶`);
    } else {
      console.log("⚠ 未找到伊美秘書客戶，跳過客戶清理");
    }

    // 2. 清理測試預約（保留伊美秘書的預約）
    if (yiMeiCustomer) {
      const deletedAppointments = await db.delete(appointments)
        .where(ne(appointments.customerId, yiMeiCustomer.id));
      console.log(`✓ 刪除了 ${deletedAppointments.rowsAffected} 個測試預約`);
    }

    // 3. 清理測試產品（可選：保留所有產品或清空）
    // 這裡選擇保留所有產品，因為產品通常是系統設定的一部分
    console.log("✓ 保留所有產品資料");

    // 4. 清理測試訂單
    const deletedOrders = await db.delete(orders);
    console.log(`✓ 刪除了 ${deletedOrders.rowsAffected} 個測試訂單`);

    // 5. 清理測試員工（保留管理員）
    const deletedStaff = await db.delete(staff)
      .where(ne(staff.role, "admin"));
    console.log(`✓ 刪除了 ${deletedStaff.rowsAffected} 個測試員工`);

    // 6. 清理測試打卡記錄
    const deletedAttendance = await db.delete(attendanceRecords);
    console.log(`✓ 刪除了 ${deletedAttendance.rowsAffected} 個測試打卡記錄`);

    // 7. 清理測試遊戲資料
    const deletedGamePlays = await db.delete(gamePlays);
    console.log(`✓ 刪除了 ${deletedGamePlays.rowsAffected} 個測試遊戲記錄`);

    const deletedUserPrizes = await db.delete(userPrizes);
    console.log(`✓ 刪除了 ${deletedUserPrizes.rowsAffected} 個測試獎品記錄`);

    const deletedPrizes = await db.delete(prizes);
    console.log(`✓ 刪除了 ${deletedPrizes.rowsAffected} 個測試獎品`);

    const deletedGames = await db.delete(games);
    console.log(`✓ 刪除了 ${deletedGames.rowsAffected} 個測試遊戲`);

    console.log("\n✅ 測試資料清理完成！");
    console.log("保留的資料：");
    console.log("- 伊美秘書客戶及其相關預約");
    console.log("- 所有產品資料");
    console.log("- 管理員員工資料");

  } catch (error) {
    console.error("❌ 清理資料時發生錯誤:", error);
    throw error;
  }
}

// 執行清理
cleanTestData()
  .then(() => {
    console.log("\n腳本執行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n腳本執行失敗:", error);
    process.exit(1);
  });
