import { db } from './db';
import { customers } from '../drizzle/schema';

async function seedCustomers() {
  console.log('開始填充客戶種子資料...');

  const testCustomers = [
    {
      organizationId: 1,
      name: '林小美',
      phone: '0912-345-678',
      email: 'lin.xiaomei@example.com',
      gender: 'female' as const,
      birthday: new Date('1990-05-15'),
      lineUserId: 'U1234567890abcdef',
      memberLevel: 'gold' as const,
      totalSpent: '85000.00',
      visitCount: 12,
      notes: 'VIP 客戶，偏好皮秒雷射療程',
      source: 'LINE 官方帳號',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      organizationId: 1,
      name: '陳大文',
      phone: '0923-456-789',
      email: 'chen.dawen@example.com',
      gender: 'male' as const,
      birthday: new Date('1985-08-20'),
      lineUserId: 'U2345678901bcdefg',
      memberLevel: 'silver' as const,
      totalSpent: '35000.00',
      visitCount: 5,
      notes: '新客戶，對肉毒桿菌療程感興趣',
      source: 'Facebook 廣告',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      organizationId: 1,
      name: '張雅婷',
      phone: '0934-567-890',
      email: 'zhang.yating@example.com',
      gender: 'female' as const,
      birthday: new Date('1992-03-10'),
      lineUserId: 'U3456789012cdefgh',
      memberLevel: 'platinum' as const,
      totalSpent: '120000.00',
      visitCount: 18,
      notes: '忠誠客戶，定期回診玻尿酸療程',
      source: '朋友推薦',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      organizationId: 1,
      name: '王志豪',
      phone: '0945-678-901',
      email: 'wang.zhihao@example.com',
      gender: 'male' as const,
      birthday: new Date('1988-11-25'),
      lineUserId: 'U4567890123defghi',
      memberLevel: 'bronze' as const,
      totalSpent: '8000.00',
      visitCount: 2,
      notes: '潛在客戶，曾諮詢過營業時間',
      source: 'Google 搜尋',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      organizationId: 1,
      name: '李美玲',
      phone: '0956-789-012',
      email: 'li.meiling@example.com',
      gender: 'female' as const,
      birthday: new Date('1995-07-08'),
      lineUserId: 'U5678901234efghij',
      memberLevel: 'diamond' as const,
      totalSpent: '250000.00',
      visitCount: 25,
      notes: '鑽石會員，定期進行全臉保養療程',
      source: 'LINE 官方帳號',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const customer of testCustomers) {
    await db.insert(customers).values(customer);
    console.log(`✓ 已新增客戶: ${customer.name}`);
  }

  console.log('\n✅ 客戶種子資料填充完成！');
}

seedCustomers().catch(console.error);
