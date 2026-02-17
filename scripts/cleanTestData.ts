import { getDb } from "../server/db";
import { customers, appointments, products, orders, staff, attendanceRecords, games, prizes, gamePlays, userPrizes } from "../drizzle/schema";
import { eq, ne } from "drizzle-orm";

/**
 * 清理測試資料腳本
 * 保留「伊美秘書」相關的測試資料
 */

async function cleanTestData() {
  const db = await getDb();

  try {
    // 1. 保留伊美秘書的客戶資料，刪除其他測試客戶
    const yiMeiCustomer = await db.query.customers.findFirst({
      where: eq(customers.name, "伊美秘書")
    });

    if (yiMeiCustomer) {
      
      // 刪除其他客戶
      const deletedCustomers = await db.delete(customers)
        .where(ne(customers.id, yiMeiCustomer.id));
    } else {
    }

    // 2. 清理測試預約（保留伊美秘書的預約）
    if (yiMeiCustomer) {
      const deletedAppointments = await db.delete(appointments)
        .where(ne(appointments.customerId, yiMeiCustomer.id));
    }

    // 3. 清理測試產品（可選：保留所有產品或清空）
    // 這裡選擇保留所有產品，因為產品通常是系統設定的一部分

    // 4. 清理測試訂單
    const deletedOrders = await db.delete(orders);

    // 5. 清理測試員工（保留管理員）
    const deletedStaff = await db.delete(staff)
      .where(ne(staff.role, "admin"));

    // 6. 清理測試打卡記錄
    const deletedAttendance = await db.delete(attendanceRecords);

    // 7. 清理測試遊戲資料
    const deletedGamePlays = await db.delete(gamePlays);

    const deletedUserPrizes = await db.delete(userPrizes);

    const deletedPrizes = await db.delete(prizes);

    const deletedGames = await db.delete(games);


  } catch (error) {
    console.error("❌ 清理資料時發生錯誤:", error);
    throw error;
  }
}

// 執行清理
cleanTestData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n腳本執行失敗:", error);
    process.exit(1);
  });
