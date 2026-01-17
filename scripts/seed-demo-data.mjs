/**
 * YOChiLL 醫美診所 SaaS 平台 - 模擬數據種子腳本
 * 
 * 此腳本會建立完整的模擬數據，包含：
 * - 1 個診所組織
 * - 5 位員工
 * - 50 位客戶
 * - 20 種產品/服務
 * - 100 筆預約記錄
 * - 80 筆療程記錄
 * - 30 筆諮詢記錄
 * - 各種統計數據
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL 環境變數未設定');
  process.exit(1);
}

// 解析 DATABASE_URL
const url = new URL(DATABASE_URL);
const dbConfig = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
};

// 模擬數據生成器
const faker = {
  // 中文姓名
  names: ['王小明', '李美玲', '張雅婷', '陳志豪', '林淑芬', '黃建華', '吳佳蓉', '劉俊傑', '蔡雅琪', '楊宗翰',
          '周怡君', '許家豪', '鄭雅文', '謝明哲', '曾淑惠', '蕭志偉', '葉佳玲', '呂建宏', '賴美君', '郭俊宏',
          '洪雅婷', '詹志明', '廖淑娟', '鍾建志', '游美玲', '施俊豪', '姚雅芳', '余建華', '潘淑芬', '盧志豪',
          '何美玲', '江建宏', '孫雅婷', '高志明', '田淑惠', '范俊傑', '石雅琪', '古宗翰', '紀怡君', '簡家豪',
          '童雅文', '康明哲', '溫淑惠', '彭志偉', '董佳玲', '袁建宏', '翁美君', '戴俊宏', '魏雅婷', '龔志明'],
  
  // 員工姓名
  staffNames: ['陳醫師', '林護理師', '王美容師', '張諮詢師', '李行政'],
  
  // 員工職位
  positions: ['主治醫師', '護理師', '美容師', '諮詢師', '行政人員'],
  
  // 產品類別
  productCategories: ['微整形', '雷射治療', '皮膚護理', '身體雕塑', '保養品'],
  
  // 產品名稱
  products: [
    { name: '玻尿酸填充', category: '微整形', price: 15000, duration: 60, type: 'service' },
    { name: '肉毒桿菌除皺', category: '微整形', price: 8000, duration: 30, type: 'service' },
    { name: '皮秒雷射', category: '雷射治療', price: 12000, duration: 45, type: 'service' },
    { name: '淨膚雷射', category: '雷射治療', price: 3500, duration: 30, type: 'service' },
    { name: '飛梭雷射', category: '雷射治療', price: 8000, duration: 45, type: 'service' },
    { name: '水飛梭', category: '皮膚護理', price: 2500, duration: 60, type: 'service' },
    { name: '杏仁酸煥膚', category: '皮膚護理', price: 1800, duration: 45, type: 'service' },
    { name: '保濕導入', category: '皮膚護理', price: 1500, duration: 30, type: 'service' },
    { name: '冷凍溶脂', category: '身體雕塑', price: 25000, duration: 90, type: 'service' },
    { name: '電波拉皮', category: '身體雕塑', price: 35000, duration: 120, type: 'service' },
    { name: '音波拉提', category: '身體雕塑', price: 28000, duration: 90, type: 'service' },
    { name: '童顏針', category: '微整形', price: 18000, duration: 60, type: 'service' },
    { name: '埋線拉提', category: '微整形', price: 45000, duration: 120, type: 'service' },
    { name: '玻尿酸隆鼻', category: '微整形', price: 20000, duration: 45, type: 'service' },
    { name: '保濕精華液', category: '保養品', price: 2800, duration: null, type: 'product', stock: 50 },
    { name: '美白面膜組', category: '保養品', price: 1500, duration: null, type: 'product', stock: 100 },
    { name: '抗皺眼霜', category: '保養品', price: 3200, duration: null, type: 'product', stock: 30 },
    { name: '防曬乳SPF50', category: '保養品', price: 980, duration: null, type: 'product', stock: 80 },
    { name: '玻尿酸套餐(3次)', category: '微整形', price: 40000, duration: 60, type: 'package' },
    { name: '淨膚雷射療程(6次)', category: '雷射治療', price: 18000, duration: 30, type: 'package' },
  ],
  
  // 客戶來源
  sources: ['LINE', 'Facebook', 'Instagram', 'Google', '朋友推薦', '路過', '官網', '電話預約'],
  
  // 隨機電話
  randomPhone: () => `09${Math.floor(10000000 + Math.random() * 90000000)}`,
  
  // 隨機 Email
  randomEmail: (name) => `${name.toLowerCase().replace(/[^a-z]/g, '')}${Math.floor(Math.random() * 1000)}@example.com`,
  
  // 隨機日期 (過去 N 天內)
  randomPastDate: (days) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    return date.toISOString().split('T')[0];
  },
  
  // 隨機未來日期 (未來 N 天內)
  randomFutureDate: (days) => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * days));
    return date.toISOString().split('T')[0];
  },
  
  // 隨機時間
  randomTime: () => {
    const hours = 9 + Math.floor(Math.random() * 10); // 09:00 - 18:00
    const minutes = Math.random() > 0.5 ? '00' : '30';
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  },
  
  // 隨機選擇
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  
  // 隨機數字範圍
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // 隨機金額
  randomAmount: (min, max) => Math.floor(Math.random() * (max - min + 1) / 100) * 100 + min,
};

async function seedDatabase() {
  console.log('🌱 開始建立模擬數據...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 建立診所組織
    console.log('📍 建立診所組織...');
    const [orgResult] = await connection.execute(`
      INSERT INTO organizations (name, slug, address, phone, email, timezone, currency, subscriptionPlan, subscriptionStatus, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `, ['YOChiLL 醫美診所', 'yochill-clinic', '台北市大安區忠孝東路四段100號5樓', '02-2771-8888', 'info@yochill.com', 'Asia/Taipei', 'TWD', 'pro', 'active', true]);
    
    // 取得組織 ID
    const [[org]] = await connection.execute('SELECT id FROM organizations WHERE slug = ?', ['yochill-clinic']);
    const organizationId = org?.id || 1;
    console.log(`   ✅ 組織 ID: ${organizationId}`);
    
    // 2. 建立員工
    console.log('\n👥 建立員工資料...');
    const staffIds = [];
    for (let i = 0; i < faker.staffNames.length; i++) {
      const [result] = await connection.execute(`
        INSERT INTO staff (organizationId, employeeId, name, phone, email, position, department, hireDate, salary, salaryType, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        `EMP${String(i + 1).padStart(3, '0')}`,
        faker.staffNames[i],
        faker.randomPhone(),
        faker.randomEmail(faker.staffNames[i]),
        faker.positions[i],
        i === 0 ? '醫療部' : i < 3 ? '美容部' : '行政部',
        faker.randomPastDate(365 * 2),
        faker.randomAmount(35000, 80000),
        i === 0 ? 'commission' : 'monthly',
        true
      ]);
      staffIds.push(result.insertId);
    }
    console.log(`   ✅ 建立 ${staffIds.length} 位員工`);
    
    // 3. 建立產品/服務
    console.log('\n📦 建立產品/服務...');
    const productIds = [];
    for (const product of faker.products) {
      const [result] = await connection.execute(`
        INSERT INTO products (organizationId, name, description, category, type, price, costPrice, duration, stock, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        product.name,
        `${product.name}專業療程，由專業醫師/美容師操作`,
        product.category,
        product.type,
        product.price,
        Math.floor(product.price * 0.3),
        product.duration,
        product.stock || null,
        true
      ]);
      productIds.push(result.insertId);
    }
    console.log(`   ✅ 建立 ${productIds.length} 種產品/服務`);
    
    // 4. 建立客戶
    console.log('\n👤 建立客戶資料...');
    const customerIds = [];
    const memberLevels = ['bronze', 'bronze', 'bronze', 'silver', 'silver', 'gold', 'platinum', 'diamond'];
    for (let i = 0; i < 50; i++) {
      const name = faker.names[i];
      const gender = Math.random() > 0.3 ? 'female' : 'male';
      const visitCount = faker.randomInt(1, 20);
      const totalSpent = visitCount * faker.randomAmount(3000, 15000);
      const memberLevel = totalSpent > 200000 ? 'diamond' : totalSpent > 100000 ? 'platinum' : totalSpent > 50000 ? 'gold' : totalSpent > 20000 ? 'silver' : 'bronze';
      
      const [result] = await connection.execute(`
        INSERT INTO customers (organizationId, name, phone, email, gender, birthday, address, memberLevel, totalSpent, visitCount, source, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        name,
        faker.randomPhone(),
        faker.randomEmail(name),
        gender,
        `${faker.randomInt(1970, 2000)}-${String(faker.randomInt(1, 12)).padStart(2, '0')}-${String(faker.randomInt(1, 28)).padStart(2, '0')}`,
        `台北市${faker.pick(['大安區', '信義區', '中山區', '松山區', '內湖區'])}`,
        memberLevel,
        totalSpent,
        visitCount,
        faker.pick(faker.sources),
        true
      ]);
      customerIds.push(result.insertId);
    }
    console.log(`   ✅ 建立 ${customerIds.length} 位客戶`);
    
    // 5. 建立預約記錄
    console.log('\n📅 建立預約記錄...');
    const appointmentStatuses = ['completed', 'completed', 'completed', 'completed', 'confirmed', 'pending', 'cancelled', 'no_show'];
    let appointmentCount = 0;
    
    // 過去的預約 (已完成)
    for (let i = 0; i < 80; i++) {
      const customerId = faker.pick(customerIds);
      const staffId = faker.pick(staffIds);
      const productId = faker.pick(productIds);
      const status = faker.pick(['completed', 'completed', 'completed', 'cancelled', 'no_show']);
      
      await connection.execute(`
        INSERT INTO appointments (organizationId, customerId, staffId, productId, appointmentDate, startTime, endTime, status, source, reminderSent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        customerId,
        staffId,
        productId,
        faker.randomPastDate(90),
        faker.randomTime(),
        faker.randomTime(),
        status,
        faker.pick(faker.sources),
        true
      ]);
      appointmentCount++;
    }
    
    // 未來的預約
    for (let i = 0; i < 20; i++) {
      const customerId = faker.pick(customerIds);
      const staffId = faker.pick(staffIds);
      const productId = faker.pick(productIds);
      
      await connection.execute(`
        INSERT INTO appointments (organizationId, customerId, staffId, productId, appointmentDate, startTime, endTime, status, source, reminderSent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        customerId,
        staffId,
        productId,
        faker.randomFutureDate(30),
        faker.randomTime(),
        faker.randomTime(),
        faker.pick(['pending', 'confirmed']),
        faker.pick(faker.sources),
        false
      ]);
      appointmentCount++;
    }
    console.log(`   ✅ 建立 ${appointmentCount} 筆預約記錄`);
    
    // 6. 建立療程記錄
    console.log('\n💉 建立療程記錄...');
    let treatmentCount = 0;
    for (let i = 0; i < 80; i++) {
      const customerId = faker.pick(customerIds);
      const staffId = faker.pick(staffIds);
      const productId = faker.pick(productIds.slice(0, 14)); // 只選服務類產品
      
      await connection.execute(`
        INSERT INTO treatmentRecords (organizationId, customerId, staffId, productId, treatmentDate, notes, satisfactionScore)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        customerId,
        staffId,
        productId,
        new Date(faker.randomPastDate(180)),
        '療程順利完成，客戶反應良好',
        faker.randomInt(3, 5)
      ]);
      treatmentCount++;
    }
    console.log(`   ✅ 建立 ${treatmentCount} 筆療程記錄`);
    
    // 7. 建立諮詢記錄
    console.log('\n💬 建立諮詢記錄...');
    const consultationStatuses = ['completed', 'converted', 'pending', 'cancelled'];
    let consultationCount = 0;
    for (let i = 0; i < 30; i++) {
      const customerId = faker.pick(customerIds);
      const staffId = faker.pick(staffIds);
      const status = faker.pick(consultationStatuses);
      
      await connection.execute(`
        INSERT INTO consultations (organizationId, customerId, staffId, consultationType, consultationDate, status, interestedProducts, notes, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        customerId,
        staffId,
        faker.pick(['walk_in', 'phone', 'online', 'referral']),
        new Date(faker.randomPastDate(60)),
        faker.pick(['new', 'contacted', 'scheduled', 'converted', 'lost']),
        JSON.stringify([faker.pick(['微整形', '雷射治療', '皮膚護理', '身體雕塑'])]),
        '客戶對療程有興趣，需要進一步說明',
        faker.pick(faker.sources)
      ]);
      consultationCount++;
    }
    console.log(`   ✅ 建立 ${consultationCount} 筆諮詢記錄`);
    
    // 8. 建立客戶套餐
    console.log('\n🎁 建立客戶套餐...');
    let packageCount = 0;
    for (let i = 0; i < 20; i++) {
      const customerId = faker.pick(customerIds);
      const productId = faker.pick(productIds.slice(18, 20)); // 套餐類產品
      const totalSessions = faker.pick([3, 6, 10]);
      const usedSessions = faker.randomInt(0, totalSessions);
      
      const remainingSessions = totalSessions - usedSessions;
      const purchasePrice = faker.randomAmount(15000, 50000);
      await connection.execute(`
        INSERT INTO customerPackages (organizationId, customerId, productId, packageName, totalSessions, usedSessions, remainingSessions, purchasePrice, purchaseDate, expiryDate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        customerId,
        productId,
        `${faker.pick(['玻尿酸', '淨膚雷射', '水飛梭'])}療程套餐`,
        totalSessions,
        usedSessions,
        remainingSessions,
        purchasePrice,
        new Date(faker.randomPastDate(180)),
        new Date(faker.randomFutureDate(180)),
        usedSessions >= totalSessions ? 'completed' : 'active'
      ]);
      packageCount++;
    }
    console.log(`   ✅ 建立 ${packageCount} 筆客戶套餐`);
    
    // 9. 建立佣金規則
    console.log('\n💰 建立佣金規則...');
    await connection.execute(`
      INSERT INTO commissionRules (organizationId, name, commissionType, commissionValue, minSalesAmount, isActive)
      VALUES 
        (?, '基本佣金', 'percentage', 10.00, 0, true),
        (?, '高額服務佣金', 'percentage', 15.00, 20000, true),
        (?, '產品銷售佣金', 'percentage', 5.00, 0, true)
    `, [organizationId, organizationId, organizationId]);
    console.log(`   ✅ 建立 3 條佣金規則`);
    
    // 10. 建立營收目標
    console.log('\n🎯 建立營收目標...');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    for (let month = 1; month <= 12; month++) {
      const targetAmount = faker.randomAmount(800000, 1500000);
      const actualAmount = month < currentMonth ? faker.randomAmount(600000, 1600000) : 0;
      const achievementRate = targetAmount > 0 ? ((actualAmount / targetAmount) * 100).toFixed(2) : 0;
      
      await connection.execute(`
        INSERT INTO revenueTargets (organizationId, targetType, targetYear, targetMonth, targetAmount, actualAmount, achievementRate, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        'monthly',
        currentYear,
        month,
        targetAmount,
        actualAmount,
        achievementRate,
        `${currentYear}年${month}月營收目標`
      ]);
    }
    console.log(`   ✅ 建立 12 個月營收目標`);
    
    // 11. 建立滿意度調查
    console.log('\n⭐ 建立滿意度調查...');
    let surveyCount = 0;
    for (let i = 0; i < 40; i++) {
      const customerId = faker.pick(customerIds);
      const npsScore = faker.randomInt(6, 10);
      
      await connection.execute(`
        INSERT INTO satisfactionSurveys (organizationId, customerId, surveyType, overallScore, npsScore, serviceScore, staffScore, facilityScore, valueScore, feedback, completedAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        customerId,
        faker.pick(['post_treatment', 'general', 'nps']),
        faker.randomInt(3, 5),
        npsScore,
        faker.randomInt(3, 5),
        faker.randomInt(4, 5),
        faker.randomInt(3, 5),
        faker.randomInt(3, 5),
        npsScore >= 9 ? '服務很好，會推薦給朋友！' : npsScore >= 7 ? '整體滿意，希望價格可以更優惠' : '還可以，但等待時間有點久',
        new Date(faker.randomPastDate(90)),
        'completed'
      ]);
      surveyCount++;
    }
    console.log(`   ✅ 建立 ${surveyCount} 筆滿意度調查`);
    
    // 12. 建立客戶標籤
    console.log('\n🏷️ 建立客戶標籤...');
    const tags = [
      { name: 'VIP客戶', color: '#f59e0b' },
      { name: '敏感肌', color: '#ef4444' },
      { name: '首次體驗', color: '#10b981' },
      { name: '回購客', color: '#6366f1' },
      { name: '待回訪', color: '#8b5cf6' },
    ];
    const tagIds = [];
    for (const tag of tags) {
      const [result] = await connection.execute(`
        INSERT INTO customerTags (organizationId, name, color, description)
        VALUES (?, ?, ?, ?)
      `, [organizationId, tag.name, tag.color, `${tag.name}標籤`]);
      tagIds.push(result.insertId);
    }
    
    // 為客戶添加標籤
    for (const customerId of customerIds) {
      const numTags = faker.randomInt(0, 3);
      const selectedTags = [...tagIds].sort(() => Math.random() - 0.5).slice(0, numTags);
      for (const tagId of selectedTags) {
        await connection.execute(`
          INSERT INTO customerTagRelations (customerId, tagId) VALUES (?, ?)
        `, [customerId, tagId]);
      }
    }
    console.log(`   ✅ 建立 ${tags.length} 個標籤並分配給客戶`);
    
    // 13. 建立行銷活動
    console.log('\n📣 建立行銷活動...');
    const campaigns = [
      { name: '新春優惠活動', type: 'event', budget: 50000, startDate: '2025-01-15', endDate: '2025-02-15' },
      { name: '母親節特惠', type: 'line', budget: 80000, startDate: '2025-05-01', endDate: '2025-05-15' },
      { name: '週年慶活動', type: 'facebook', budget: 100000, startDate: '2025-09-01', endDate: '2025-09-30' },
    ];
    for (const campaign of campaigns) {
      const campaignStatus = new Date(campaign.startDate) > new Date() ? 'draft' : new Date(campaign.endDate) < new Date() ? 'completed' : 'active';
      await connection.execute(`
        INSERT INTO marketingCampaigns (organizationId, name, description, campaignType, budget, startDate, endDate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        organizationId,
        campaign.name,
        `${campaign.name}，全館療程享優惠`,
        campaign.type,
        campaign.budget,
        campaign.startDate,
        campaign.endDate,
        campaignStatus
      ]);
    }
    console.log(`   ✅ 建立 ${campaigns.length} 個行銷活動`);
    
    console.log('\n✨ 模擬數據建立完成！\n');
    console.log('📊 數據統計：');
    console.log(`   - 診所組織: 1`);
    console.log(`   - 員工: ${staffIds.length}`);
    console.log(`   - 客戶: ${customerIds.length}`);
    console.log(`   - 產品/服務: ${productIds.length}`);
    console.log(`   - 預約記錄: ${appointmentCount}`);
    console.log(`   - 療程記錄: ${treatmentCount}`);
    console.log(`   - 諮詢記錄: ${consultationCount}`);
    console.log(`   - 客戶套餐: ${packageCount}`);
    console.log(`   - 滿意度調查: ${surveyCount}`);
    
  } catch (error) {
    console.error('❌ 建立模擬數據時發生錯誤:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 執行種子腳本
seedDatabase().catch(console.error);
