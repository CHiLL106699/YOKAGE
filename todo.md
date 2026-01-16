# YOChiLL 醫美診所 SaaS 平台 - 開發進度追蹤

## Phase 1: 多租戶資料庫 Schema 與基礎架構
- [x] 建立 organizations 表（診所/租戶）
- [x] 建立 organizationUsers 表（使用者與診所關聯）
- [x] 擴展 users 表支援多角色（super_admin, clinic_admin, staff, customer）
- [x] 建立 customers 表（客戶資料）
- [x] 建立 customerTags 表（客戶標籤）
- [x] 建立 appointments 表（預約）
- [x] 建立 appointmentSlots 表（時段模板）
- [x] 建立 products 表（產品）
- [x] 建立 orders 表（訂單）
- [x] 建立 orderItems 表（訂單項目）
- [x] 建立 coupons 表（優惠券）
- [x] 建立 staff 表（員工）
- [x] 建立 schedules 表（排班）
- [x] 建立 attendanceRecords 表（打卡記錄）
- [x] 建立 aftercareRecords 表（術後關懷）
- [x] 建立 lineChannels 表（LINE Channel 設定）
- [x] 執行資料庫遷移

## Phase 2: Super Admin 後台與診所管理
- [x] Super Admin 儀表板頁面
- [x] 診所列表與 CRUD
- [ ] 診所計費管理
- [x] 系統監控儀表板
- [x] Super Admin 路由保護

## Phase 3: 診所 Admin 後台框架與導覽
- [x] 診所 Admin 儀表板頁面
- [x] 側邊欄導覽結構
- [ ] 診所切換功能（多診所管理者）
- [x] 角色權限路由保護

## Phase 4: 客戶管理模組
- [x] 客戶列表頁面（分頁、搜尋、篩選）
- [ ] 客戶詳情頁面
- [x] 客戶新增/編輯表單
- [ ] 客戶標籤管理
- [ ] 消費記錄查詢
- [x] 會員等級系統

## Phase 5: 預約管理模組
- [x] 預約日曆視圖
- [x] 預約列表視圖
- [x] 預約新增/編輯表單
- [ ] 時段模板設定
- [ ] 醫師排班設定
- [x] 預約狀態追蹤

## Phase 6: 產品與商城管理
- [x] 產品列表頁面
- [x] 產品 CRUD
- [ ] 庫存管理
- [ ] 優惠券系統
- [ ] 訂單管理

## Phase 7: 員工與排班管理
- [x] 員工列表頁面
- [x] 員工 CRUD
- [ ] 排班系統
- [ ] 打卡記錄
- [ ] 薪資管理

## Phase 8: 術後關懷系統
- [x] 關懷記錄列表
- [x] 關懷記錄 CRUD
- [ ] 回訪提醒設定
- [x] 狀態追蹤

## Phase 9: LINE LIFF 整合準備
- [x] LINE Channel 設定頁面
- [x] 動態 LIFF ID 管理
- [x] Webhook 路由架構
- [ ] LIFF 頁面框架

## Phase 10: 測試與交付
- [x] 單元測試
- [ ] 整合測試
- [ ] 效能優化
- [ ] 文檔撰寫
- [ ] 最終交付
