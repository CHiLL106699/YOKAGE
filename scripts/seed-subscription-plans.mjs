import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
// import * as schema from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function seedSubscriptionPlans() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { mode: 'default' });

  console.log('Seeding subscription plans...');

  // 參照官網 https://yochillsaas.com/pricing 的訂閱方案
  const plans = [
    {
      name: '基礎版',
      description: '適合小型診所，提供基本的診所管理功能',
      price: 2999,
      currency: 'TWD',
      billingPeriod: 'monthly',
      trialDays: 14,
      features: JSON.stringify([
        '最多 3 位員工帳號',
        '最多 500 位客戶資料',
        '基本預約管理',
        '客戶管理',
        '療程記錄',
        'LINE 通知',
        '基礎報表',
        '7x12 客服支援'
      ]),
      maxClinics: 1,
      maxUsers: 3,
      maxCustomers: 500,
      isActive: true
    },
    {
      name: '專業版',
      description: '適合中型診所，提供進階的診所管理功能',
      price: 5999,
      currency: 'TWD',
      billingPeriod: 'monthly',
      trialDays: 14,
      features: JSON.stringify([
        '最多 10 位員工帳號',
        '最多 2000 位客戶資料',
        '進階預約管理',
        '客戶管理與分析',
        '療程記錄與追蹤',
        'LINE 深度整合',
        '進階報表與儀表板',
        '庫存管理',
        '業績管理',
        '7x24 客服支援'
      ]),
      maxClinics: 1,
      maxUsers: 10,
      maxCustomers: 2000,
      isActive: true
    },
    {
      name: '企業版',
      description: '適合大型診所或連鎖診所，提供完整的診所管理功能',
      price: 9999,
      currency: 'TWD',
      billingPeriod: 'monthly',
      trialDays: 14,
      features: JSON.stringify([
        '無限員工帳號',
        '無限客戶資料',
        '完整預約管理',
        '客戶管理與深度分析',
        '療程記錄與智能追蹤',
        'LINE 完整整合（含小遊戲）',
        '完整報表與自訂儀表板',
        '庫存管理與自動補貨',
        '業績管理與預測',
        '多診所管理',
        'API 存取',
        '白標方案',
        '專屬客戶成功經理',
        '7x24 優先客服支援'
      ]),
      maxClinics: 999,
      maxUsers: 999,
      maxCustomers: 999999,
      isActive: true
    },
    {
      name: '旗艦版',
      description: '適合大型連鎖診所集團，提供企業級的診所管理功能',
      price: 19999,
      currency: 'TWD',
      billingPeriod: 'monthly',
      trialDays: 30,
      features: JSON.stringify([
        '企業版所有功能',
        '無限診所數量',
        '客製化開發',
        '專屬伺服器',
        '資料備份與災難復原',
        'SLA 保證',
        '專屬技術支援團隊',
        '現場培訓與導入服務',
        '優先功能開發'
      ]),
      maxClinics: 999999,
      maxUsers: 999999,
      maxCustomers: 999999999,
      isActive: true
    }
  ];

  for (const plan of plans) {
    try {
      const [result] = await connection.execute(
        `INSERT INTO subscriptionPlans (name, description, price, currency, billing_period, trial_days, features, max_clinics, max_users, max_customers, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
         description = VALUES(description),
         price = VALUES(price),
         features = VALUES(features),
         max_clinics = VALUES(max_clinics),
         max_users = VALUES(max_users),
         max_customers = VALUES(max_customers),
         updated_at = NOW()`,
        [
          plan.name,
          plan.description,
          plan.price,
          plan.currency,
          plan.billingPeriod,
          plan.trialDays,
          plan.features,
          plan.maxClinics,
          plan.maxUsers,
          plan.maxCustomers,
          plan.isActive
        ]
      );
      console.log(`✓ Created/Updated subscription plan: ${plan.name}`);
    } catch (error) {
      console.error(`✗ Failed to create/update subscription plan: ${plan.name}`, error);
    }
  }

  console.log('Subscription plans seeded successfully!');
  await connection.end();
}

seedSubscriptionPlans().catch((error) => {
  console.error('Error seeding subscription plans:', error);
  process.exit(1);
});
