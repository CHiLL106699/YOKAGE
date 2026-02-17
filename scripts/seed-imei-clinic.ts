import { getDb } from '../server/db';
import { 
  organizations, 
  users, 
  organizationUsers, 
  staff, 
  customers, 
  appointments,
  lineChannels,
  lemonsqueezyPlans
} from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * 建立「伊美秘書」測試診所初始資料
 * 
 * 包含：
 * - 診所資訊
 * - 4 個訂閱方案
 * - 7 個員工（醫生 x2、護理師 x3、櫃檯 x2）
 * - 15 個客戶（VIP x5、一般 x10）
 * - 15 個預約（過去 x10、未來 x5）
 * - LINE Channel 設定
 */

async function seedImeiClinic() {

  const db = await getDb();
  if (!db) {
    throw new Error('無法連接到資料庫');
  }

  try {
    // 1. 建立診所
    
    // 檢查診所是否已存在
    let [clinic] = await db.select().from(organizations).where(eq(organizations.slug, 'imei-secretary')).limit(1);
    
    if (!clinic) {
      await db.insert(organizations).values({
        name: '伊美秘書',
        slug: 'imei-secretary',
        type: 'clinic',
        address: '台北市信義區信義路五段 7 號',
        phone: '02-2345-6789',
        email: 'contact@imei-secretary.com',
        website: 'https://imei-secretary.com',
        description: '伊美秘書醫美診所，專注於提供高品質的醫美服務，讓美麗自然發生。',
        settings: JSON.stringify({
          businessHours: {
            monday: { open: '10:00', close: '20:00' },
            tuesday: { open: '10:00', close: '20:00' },
            wednesday: { open: '10:00', close: '20:00' },
            thursday: { open: '10:00', close: '20:00' },
            friday: { open: '10:00', close: '20:00' },
            saturday: { open: '10:00', close: '20:00' },
            sunday: { closed: true }
          }
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      [clinic] = await db.select().from(organizations).where(eq(organizations.slug, 'imei-secretary')).limit(1);
    } else {
    };

    // 2. 建立訂閱方案
    const plans = [
      {
        name: '基礎版',
        description: '適合小型診所，提供基本功能',
        price: 2999,
        interval: 'month' as const,
        lemonSqueezyProductId: 'test-product-basic',
        lemonSqueezyVariantId: 'test-variant-basic',
        isActive: true
      },
      {
        name: '專業版',
        description: '適合中型診所，提供進階功能',
        price: 5999,
        interval: 'month' as const,
        lemonSqueezyProductId: 'test-product-pro',
        lemonSqueezyVariantId: 'test-variant-pro',
        isActive: true
      },
      {
        name: '企業版',
        description: '適合大型診所或連鎖品牌',
        price: 9999,
        interval: 'month' as const,
        lemonSqueezyProductId: 'test-product-enterprise',
        lemonSqueezyVariantId: 'test-variant-enterprise',
        isActive: true
      },
      {
        name: '旗艦版',
        description: '適合大型連鎖品牌，無限制使用',
        price: 19999,
        interval: 'month' as const,
        lemonSqueezyProductId: 'test-product-flagship',
        lemonSqueezyVariantId: 'test-variant-flagship',
        isActive: true
      }
    ];

    await db.insert(lemonsqueezyPlans).values(
      plans.map(plan => ({
        ...plan,
        organizationId: clinic.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    const createdPlans = await db.select().from(lemonsqueezyPlans).where(eq(lemonsqueezyPlans.organizationId, clinic.id));


    // 3. 建立員工
    const staffData = [
      { name: '王醫師', role: 'doctor', email: 'dr.wang@imei-secretary.com', phone: '0912-345-001' },
      { name: '李醫師', role: 'doctor', email: 'dr.lee@imei-secretary.com', phone: '0912-345-002' },
      { name: '陳護理師', role: 'nurse', email: 'nurse.chen@imei-secretary.com', phone: '0912-345-003' },
      { name: '林護理師', role: 'nurse', email: 'nurse.lin@imei-secretary.com', phone: '0912-345-004' },
      { name: '張護理師', role: 'nurse', email: 'nurse.chang@imei-secretary.com', phone: '0912-345-005' },
      { name: '劉櫃檯', role: 'receptionist', email: 'reception.liu@imei-secretary.com', phone: '0912-345-006' },
      { name: '黃櫃檯', role: 'receptionist', email: 'reception.huang@imei-secretary.com', phone: '0912-345-007' }
    ];

    await db.insert(staff).values(
      staffData.map(s => ({
        organizationId: clinic.id,
        name: s.name,
        role: s.role,
        email: s.email,
        phone: s.phone,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    const createdStaff = await db.select().from(staff).where(eq(staff.organizationId, clinic.id));


    // 4. 建立客戶
    const customerData = [
      // VIP 客戶 (diamond/platinum)
      { name: '陳小姐', phone: '0912-111-001', email: 'chen@example.com', memberLevel: 'diamond' },
      { name: '林小姐', phone: '0912-111-002', email: 'lin@example.com', memberLevel: 'diamond' },
      { name: '張小姐', phone: '0912-111-003', email: 'chang@example.com', memberLevel: 'platinum' },
      { name: '劉小姐', phone: '0912-111-004', email: 'liu@example.com', memberLevel: 'platinum' },
      { name: '黃小姐', phone: '0912-111-005', email: 'huang@example.com', memberLevel: 'gold' },
      // 一般客戶 (bronze/silver)
      { name: '王先生', phone: '0912-222-001', email: 'wang@example.com', memberLevel: 'silver' },
      { name: '李先生', phone: '0912-222-002', email: 'lee@example.com', memberLevel: 'silver' },
      { name: '趙先生', phone: '0912-222-003', email: 'zhao@example.com', memberLevel: 'bronze' },
      { name: '錢先生', phone: '0912-222-004', email: 'qian@example.com', memberLevel: 'bronze' },
      { name: '孫先生', phone: '0912-222-005', email: 'sun@example.com', memberLevel: 'bronze' },
      { name: '周先生', phone: '0912-222-006', email: 'zhou@example.com', memberLevel: 'bronze' },
      { name: '吳先生', phone: '0912-222-007', email: 'wu@example.com', memberLevel: 'bronze' },
      { name: '鄭先生', phone: '0912-222-008', email: 'zheng@example.com', memberLevel: 'bronze' },
      { name: '馬先生', phone: '0912-222-009', email: 'ma@example.com', memberLevel: 'bronze' },
      { name: '朱先生', phone: '0912-222-010', email: 'zhu@example.com', memberLevel: 'bronze' }
    ];

    await db.insert(customers).values(
      customerData.map(c => ({
        organizationId: clinic.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        memberLevel: c.memberLevel,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    const createdCustomers = await db.select().from(customers).where(eq(customers.organizationId, clinic.id));


    // 5. 建立預約
    const now = new Date();
    const appointmentData = [
      // 過去預約（10 個）
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: createdCustomers[i].id,
        staffId: createdStaff[i % 2].id, // 輪流分配給兩位醫師
        appointmentDate: new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000), // 過去 1-10 天
        startTime: '10:00',
        endTime: '11:00',
        status: 'completed' as const,
        notes: `過去預約 ${i + 1}`
      })),
      // 未來預約（5 個）
      ...Array.from({ length: 5 }, (_, i) => ({
        customerId: createdCustomers[i + 10].id,
        staffId: createdStaff[i % 2].id,
        appointmentDate: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000), // 未來 1-5 天
        startTime: '14:00',
        endTime: '15:00',
        status: 'confirmed' as const,
        notes: `未來預約 ${i + 1}`
      }))
    ];

    await db.insert(appointments).values(
      appointmentData.map(a => ({
        organizationId: clinic.id,
        customerId: a.customerId,
        staffId: a.staffId,
        appointmentDate: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        notes: a.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    const createdAppointments = await db.select().from(appointments).where(eq(appointments.organizationId, clinic.id));


    // 6. 配置 LINE Channel 設定
    const lineChannelId = process.env.LINE_CHANNEL_ID;
    const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;
    const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!lineChannelId || !lineChannelSecret || !lineChannelAccessToken) {
      console.warn('⚠️ LINE Channel 環境變數未設定，跳過 LINE Channel 設定');
    } else {
      await db.insert(lineChannels).values({
        organizationId: clinic.id,
        channelName: '伊美秘書 LINE 官方帳號',
        channelId: lineChannelId,
        channelSecret: lineChannelSecret,
        accessToken: lineChannelAccessToken,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const [lineChannel] = await db.select().from(lineChannels).where(eq(lineChannels.organizationId, clinic.id)).limit(1);

    }


  } catch (error) {
    console.error('❌ 建立測試資料失敗：', error);
    throw error;
  }
}

// 執行腳本
seedImeiClinic()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 腳本執行失敗：', error);
    process.exit(1);
  });
