-- ============================================
-- YOKAGE Phase 4: 種子資料 SQL 腳本
-- 日期: 2026-02-28
-- 目標: 為「伊美秘書」診所建立完整初始資料
-- ============================================

-- ============================================
-- 0. 建立 staff_accounts 表（schema 中遺漏，auth.login 需要）
-- ============================================
CREATE TABLE IF NOT EXISTS staff_accounts (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- 1. 租戶 (tenants)
-- ============================================
INSERT INTO tenants (name, slug, address, phone, email, timezone, currency, business_hours, plan_type, source_product, subscription_plan, subscription_status, is_active)
VALUES (
  '伊美秘書',
  'imei-secretary',
  '台北市大安區忠孝東路四段100號5樓',
  '02-2771-8888',
  'info@imei.clinic',
  'Asia/Taipei',
  'TWD',
  '{"mon":{"open":"09:00","close":"21:00"},"tue":{"open":"09:00","close":"21:00"},"wed":{"open":"09:00","close":"21:00"},"thu":{"open":"09:00","close":"21:00"},"fri":{"open":"09:00","close":"21:00"},"sat":{"open":"10:00","close":"18:00"},"sun":{"open":"休診","close":"休診"}}',
  'yokage_pro',
  'yokage',
  'pro',
  'active',
  true
);

-- ============================================
-- 2. 員工 (staff) — 使用 currval 取得 tenant id
-- ============================================
-- 管理員：陳道
INSERT INTO staff (organization_id, name, phone, email, position, department, hire_date, salary, salary_type, is_active)
VALUES (
  currval('tenants_id_seq'),
  '陳道',
  '0912-345-678',
  'admin@imei.clinic',
  '院長',
  '管理部',
  '2024-01-01',
  120000.00,
  'monthly',
  true
);

-- 護理師：王小美
INSERT INTO staff (organization_id, name, phone, email, position, department, hire_date, salary, salary_type, is_active)
VALUES (
  currval('tenants_id_seq'),
  '王小美',
  '0923-456-789',
  'nurse@imei.clinic',
  '護理師',
  '護理部',
  '2024-03-15',
  55000.00,
  'monthly',
  true
);

-- 美容師：李小華
INSERT INTO staff (organization_id, name, phone, email, position, department, hire_date, salary, salary_type, is_active)
VALUES (
  currval('tenants_id_seq'),
  '李小華',
  '0934-567-890',
  'therapist@imei.clinic',
  '美容師',
  '美容部',
  '2024-06-01',
  48000.00,
  'monthly',
  true
);

-- ============================================
-- 3. 員工帳號 (staff_accounts)
-- ============================================
-- admin@imei.clinic / imei_admin_2026 (bcrypt hash)
INSERT INTO staff_accounts (staff_id, username, password_hash, role, is_active)
VALUES (
  (SELECT id FROM staff WHERE email = 'admin@imei.clinic' AND organization_id = currval('tenants_id_seq') LIMIT 1),
  'admin@imei.clinic',
  '$2b$12$6BWwSl/T1TGZdFHkqMT6BuvucA1DZPy4FCxqphNWG0PssF/mRxzRW',
  'admin',
  true
);

-- ============================================
-- 4. 產品/療程 (products)
-- ============================================
INSERT INTO products (organization_id, name, description, category, type, price, cost_price, duration, is_active, sort_order) VALUES
(currval('tenants_id_seq'), '玻尿酸注射', '使用高品質玻尿酸進行面部填充，改善法令紋、淚溝等問題', '注射類', 'service', 8000.00, 3000.00, 60, true, 1),
(currval('tenants_id_seq'), '肉毒桿菌', '肉毒桿菌素注射，用於除皺、瘦臉、改善國字臉', '注射類', 'service', 5000.00, 1800.00, 30, true, 2),
(currval('tenants_id_seq'), '雷射美白', 'C6淨膚雷射，改善膚色不均、淡化斑點', '雷射類', 'service', 3500.00, 800.00, 45, true, 3),
(currval('tenants_id_seq'), '皮秒雷射', '蜂巢皮秒雷射，深層淡斑、縮毛孔、改善膚質', '雷射類', 'service', 12000.00, 4000.00, 60, true, 4),
(currval('tenants_id_seq'), '音波拉提', 'HIFU音波拉提，緊緻肌膚、改善鬆弛下垂', '拉提類', 'service', 25000.00, 10000.00, 90, true, 5);

-- ============================================
-- 5. 測試客戶 (customers)
-- ============================================
INSERT INTO customers (organization_id, name, phone, email, gender, birthday, member_level, total_spent, visit_count, source, is_active) VALUES
(currval('tenants_id_seq'), '張美玲', '0911-111-111', 'meiling@test.com', 'female', '1990-05-15', 'gold', 85000.00, 12, 'LINE', true),
(currval('tenants_id_seq'), '林雅婷', '0922-222-222', 'yating@test.com', 'female', '1988-08-22', 'silver', 35000.00, 6, 'Instagram', true),
(currval('tenants_id_seq'), '陳怡君', '0933-333-333', 'yijun@test.com', 'female', '1995-01-10', 'bronze', 12000.00, 3, '朋友介紹', true),
(currval('tenants_id_seq'), '王志明', '0944-444-444', 'zhiming@test.com', 'male', '1985-11-30', 'silver', 40000.00, 8, 'Google搜尋', true),
(currval('tenants_id_seq'), '李佳穎', '0955-555-555', 'jiaying@test.com', 'female', '1992-03-18', 'gold', 120000.00, 15, 'LINE', true),
(currval('tenants_id_seq'), '黃淑芬', '0966-666-666', 'shufen@test.com', 'female', '1978-07-25', 'platinum', 250000.00, 30, '舊客回訪', true),
(currval('tenants_id_seq'), '吳建宏', '0977-777-777', 'jianhong@test.com', 'male', '1990-12-05', 'bronze', 5000.00, 1, 'Facebook', true),
(currval('tenants_id_seq'), '趙雅琪', '0988-888-888', 'yaqi@test.com', 'female', '1993-09-14', 'silver', 28000.00, 5, 'Instagram', true),
(currval('tenants_id_seq'), '周美華', '0911-999-999', 'meihua@test.com', 'female', '1982-04-08', 'gold', 95000.00, 18, 'LINE', true),
(currval('tenants_id_seq'), '鄭小萱', '0922-000-000', 'xiaoxuan@test.com', 'female', '1998-06-20', 'bronze', 3500.00, 1, 'Google搜尋', true);

-- ============================================
-- 6. 測試預約 (appointments) — 未來日期
-- ============================================
-- 取得 staff 和 customer IDs 動態引用
INSERT INTO appointments (organization_id, customer_id, staff_id, product_id, appointment_date, start_time, end_time, status, notes, source) VALUES
-- 預約 1: 張美玲 - 玻尿酸注射 (陳道醫師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'meiling@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'admin@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '玻尿酸注射' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-05', '10:00', '11:00', 'confirmed', '回診補打玻尿酸', 'LINE'),

-- 預約 2: 林雅婷 - 皮秒雷射 (李小華美容師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'yating@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'therapist@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '皮秒雷射' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-05', '14:00', '15:00', 'pending', '首次皮秒雷射', 'Instagram'),

-- 預約 3: 陳怡君 - 雷射美白 (王小美護理師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'yijun@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'nurse@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '雷射美白' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-06', '11:00', '11:45', 'confirmed', '第二次雷射美白療程', '朋友介紹'),

-- 預約 4: 王志明 - 肉毒桿菌 (陳道醫師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'zhiming@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'admin@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '肉毒桿菌' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-07', '09:30', '10:00', 'pending', '瘦臉肉毒', 'Google搜尋'),

-- 預約 5: 李佳穎 - 音波拉提 (陳道醫師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'jiaying@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'admin@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '音波拉提' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-08', '10:00', '11:30', 'confirmed', 'VIP客戶音波拉提', 'LINE'),

-- 預約 6: 黃淑芬 - 玻尿酸注射 (陳道醫師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'shufen@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'admin@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '玻尿酸注射' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-10', '15:00', '16:00', 'confirmed', '定期回診', '舊客回訪'),

-- 預約 7: 趙雅琪 - 雷射美白 (李小華美容師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'yaqi@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'therapist@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '雷射美白' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-10', '11:00', '11:45', 'pending', '淡斑療程', 'Instagram'),

-- 預約 8: 周美華 - 皮秒雷射 (王小美護理師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'meihua@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'nurse@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '皮秒雷射' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-12', '14:00', '15:00', 'confirmed', '第三次皮秒療程', 'LINE'),

-- 預約 9: 鄭小萱 - 肉毒桿菌 (陳道醫師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'xiaoxuan@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'admin@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '肉毒桿菌' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-15', '16:00', '16:30', 'pending', '首次諮詢+施打', 'Google搜尋'),

-- 預約 10: 吳建宏 - 雷射美白 (李小華美容師)
(currval('tenants_id_seq'),
 (SELECT id FROM customers WHERE email = 'jianhong@test.com' LIMIT 1),
 (SELECT id FROM staff WHERE email = 'therapist@imei.clinic' LIMIT 1),
 (SELECT id FROM products WHERE name = '雷射美白' AND organization_id = currval('tenants_id_seq') LIMIT 1),
 '2026-03-15', '10:00', '10:45', 'pending', '首次體驗', 'Facebook');

-- ============================================
-- 驗證：列出所有新建資料的摘要
-- ============================================
SELECT 'tenants' AS table_name, COUNT(*) AS row_count FROM tenants
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'staff_accounts', COUNT(*) FROM staff_accounts
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
ORDER BY table_name;
