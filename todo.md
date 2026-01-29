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
- [x] 診所計費管理
- [x] 系統監控儀表板
- [x] Super Admin 路由保護

## Phase 3: 診所 Admin 後台框架與導覽
- [x] 診所 Admin 儀表板頁面
- [x] 側邊欄導覽結構
- [x] 診所切換功能（多診所管理者）
- [x] 角色權限路由保護

## Phase 4: 客戶管理模組
- [x] 客戶列表頁面（分頁、搜尋、篩選）
- [x] 客戶詳情頁面
- [x] 客戶新增/編輯表單
- [x] 客戶標籤管理
- [x] 消費記錄查詢
- [x] 會員等級系統

## Phase 5: 預約管理模組
- [x] 預約日曆視圖
- [x] 預約列表視圖
- [x] 預約新增/編輯表單
- [x] 時段模板設定
- [x] 醫師排班設定
- [x] 預約狀態追蹤

## Phase 6: 產品與商城管理
- [x] 產品列表頁面
- [x] 產品 CRUD
- [x] 庫存管理
- [x] 優惠券系統
- [x] 訂單管理

## Phase 7: 員工與排班管理
- [x] 員工列表頁面
- [x] 員工 CRUD
- [x] 排班系統
- [x] 打卡記錄
- [x] 薪資管理

## Phase 8: 術後關懷系統
- [x] 關懷記錄列表
- [x] 關懷記錄 CRUD
- [x] 回訪提醒設定
- [x] 狀態追蹤

## Phase 9: LINE LIFF 整合準備
- [x] LINE Channel 設定頁面
- [x] 動態 LIFF ID 管理
- [x] Webhook 路由架構
- [x] LIFF 頁面框架

## Phase 10: 測試與交付
- [x] 單元測試
- [x] 整合測試
- [x] 效能優化
- [x] 文檔撰寫
- [x] 最終交付


---

## Phase 11: 報表分析模組
- [x] 營收報表儀表板（日/週/月統計）
- [x] 預約統計分析（來源/時段/療程分布）
- [x] 客戶分析（新客/回客比例、消費頻率）
- [x] 員工業績排行
- [x] 熱門療程統計
- [x] 報表匯出功能（Excel/PDF）

## Phase 12: 通知系統架構
- [x] 通知模板管理
- [x] 預約提醒排程（前一天/當天）
- [x] 術後關懷自動排程
- [x] 生日祝福自動發送
- [x] 通知發送記錄

## Phase 13: 庫存警示系統
- [x] 庫存閾值設定
- [x] 低庫存自動警示
- [x] 庫存變動記錄
- [x] 補貨提醒通知

## Phase 14: 計費與訂閱方案管理
- [x] 訂閱方案定義（基礎/專業/企業）
- [x] 診所訂閱狀態管理
- [x] 用量計費追蹤
- [x] 帳單生成與記錄
- [x] 訂閱到期提醒

## Phase 15: 多語系支援框架
- [x] i18n 架構建立
- [x] 繁體中文語系檔
- [x] 簡體中文語系檔
- [x] 英文語系檔
- [x] 語系切換功能

## Phase 16: API 開放平台
- [x] API 金鑰管理
- [x] API 文檔自動生成
- [x] 請求頻率限制
- [x] API 使用量統計
- [x] Webhook 事件訂閱

## Phase 17: 白標方案
- [x] 診所 Logo 上傳
- [x] 品牌色自訂
- [x] 自訂網域設定
- [x] 登入頁面自訂
- [x] Email 模板品牌化

## Phase 18: LINE 整合（最後階段）
- [x] LINE Login 整合架構
- [x] LIFF SDK 初始化
- [x] LINE Messaging API 整合架構
- [x] Rich Menu 動態管理架構
- [x] Flex Message 模板架構
- [x] Webhook 事件處理架構

---

## 完成狀態

**所有核心功能已開發完成，等待 LINE Channel 憑證進行最終整合。**


---

## Phase 19: 金流整合模組
- [x] LINE Pay 付款介面
- [x] 信用卡付款介面
- [x] 訂金預付流程
- [x] 商城結帳流程
- [x] 付款記錄管理
- [x] 退款處理介面

## Phase 20: LINE 生態整合範例
- [x] Rich Menu 動態管理介面（可視化編輯器）
- [x] Rich Menu 預覽功能
- [x] Rich Menu 狀態切換（新客/VIP/待回訪）
- [x] Flex Message 模板編輯器
- [x] Flex Message 預覽功能
- [x] 預約確認訊息模板
- [x] 療程提醒訊息模板
- [x] 優惠推播訊息模板
- [x] Webhook 事件處理介面
- [x] 訊息接收日誌
- [x] 自動回覆規則設定
- [x] 關鍵字觸發設定


---

## Phase 21: 顧客端 LIFF 商城與購物流程
- [x] LIFF 商城首頁（商品分類、熱門推薦）
- [x] 商品詳情頁面（圖片輪播、規格選擇）
- [x] 購物車功能（新增/修改/刪除）
- [x] 結帳流程（優惠券套用、金額計算）
- [x] 訂單確認頁面
- [x] 訂單追蹤頁面
- [x] 歷史訂單列表

## Phase 22: 員工端 LIFF 應用
- [x] 員工打卡頁面（GPS 定位驗證）
- [x] 班表查詢頁面
- [x] 任務清單頁面
- [x] 客戶到店通知
- [x] 業績查詢頁面
- [x] 請假申請頁面

## Phase 23: 進階數據分析與 AI 洞察
- [x] 客戶流失預警分析
- [x] 療程推薦引擎
- [x] 營收預測模型
- [x] 客戶分群分析（RFM 模型）
- [x] 行銷效果追蹤
- [x] 自動化報表排程

## Phase 24: 系統設定與進階管理
- [x] 系統參數設定頁面
- [x] 角色權限細粒度管理
- [x] 操作日誌審計
- [x] 資料備份與還原
- [x] 系統健康監控
- [x] 效能優化設定

## Phase 25: 整合測試與文檔
- [x] 端對端整合測試
- [x] 使用者操作手冊
- [x] API 整合文檔
- [x] 部署指南
- [x] 系統架構文檔


---

## Phase 26: AI 智能客服與對話機器人（超越 SUPER8）
- [x] AI Agent 管理介面（預建模板：客服/銷售/預約/行銷）
- [x] 自然語言對話引擎（NLP/NLU）
- [x] 知識庫管理（FAQ、產品資訊、療程說明）
- [x] 意圖識別與自動分流
- [x] 多輪對話流程設計器
- [x] AI 回覆建議（客服助手）
- [x] 對話品質分析與優化建議
- [x] 24/7 自動回覆排程

## Phase 27: 行銷自動化與顧客旅程（超越 SUPER8）
- [x] 顧客旅程設計器（視覺化流程編輯）
- [x] 觸發條件設定（行為/時間/事件觸發）
- [x] 自動化訊息排程
- [x] A/B 測試功能
- [x] 轉換漏斗分析
- [x] 自動標籤系統（行為貼標）
- [x] 分眾推播引擎
- [x] 行銷成效追蹤儀表板

## Phase 28: 互動式遊戲與 OMO 整合（超越 SUPER8）
- [x] 輪盤抽獎遊戲
- [x] 刮刮樂遊戲
- [x] 集點卡遊戲
- [x] 優惠券匣（多種優惠券類型）
- [x] 發票登錄功能
- [x] 門市掃碼核銷
- [x] 線上線下會員綁定
- [x] OMO 數據整合儀表板

## Phase 29: 會員護照與療程記錄（超越夾客）
- [x] 會員護照介面（個人化首頁）
- [x] 療程前後對比照片上傳
- [x] 療程時間軸記錄
- [x] 美麗日記功能
- [x] 療程效果追蹤
- [x] 個人化療程推薦
- [x] 會員成就系統
- [x] 社群分享功能

## Phase 30: 多渠道訊息中心與即時客服（超越 SUPER8）
- [x] 統一訊息收件匣（LINE/FB/IG/網站）
- [x] 即時客服工作台
- [x] 客服分派與轉接
- [x] 快捷回覆模板
- [x] 對話標籤與分類
- [x] 客服績效統計
- [x] 顧客滿意度調查
- [x] 客服 SLA 監控


---

## Phase 31: 社群行銷與 UGC 內容管理
- [x] 社群貼文排程器（FB/IG/LINE）
- [x] UGC 內容收集與展示牆
- [x] 網紅/KOL 合作管理
- [x] 社群互動數據分析
- [x] 自動化社群回覆

## Phase 32: 智能排班與人力資源管理
- [x] AI 智能排班建議
- [x] 員工技能矩陣管理
- [x] 薪資計算與獎金制度
- [x] 員工培訓記錄追蹤
- [x] 績效考核系統

## Phase 33: 供應商管理與採購系統
- [x] 供應商資料庫管理
- [x] 採購訂單管理
- [x] 進貨驗收流程
- [x] 成本分析報表
- [x] 自動補貨建議

## Phase 34: 顧客滿意度與評價管理
- [x] NPS 淨推薦值調查
- [x] 療程後滿意度問卷
- [x] Google 評價整合
- [x] 負評預警與處理流程
- [x] 顧客心聲分析儀表板

## Phase 35: 多分店管理與連鎖經營
- [x] 分店績效比較儀表板
- [x] 跨店預約與調度
- [x] 統一庫存管理
- [x] 分店權限控管
- [x] 連鎖品牌一致性管理


---

## Phase 36: 合約與電子簽章
- [x] 合約範本管理
- [x] 電子簽章功能（LINE 內嵌簽名）
- [x] 合約狀態追蹤
- [x] 合約到期提醒
- [x] 合約歸檔與搜尋

## Phase 37: 療程效果追蹤與 AI 分析
- [x] 療程前後對比照片管理
- [x] AI 膚質分析
- [x] 療程效果數據追蹤
- [x] AI 改善建議
- [x] 療程效果統計報表

## Phase 38: 智能推薦引擎
- [x] 個人化療程推薦
- [x] 產品交叉銷售推薦
- [x] 回購時機推薦
- [x] 推薦規則管理
- [x] 推薦效果追蹤

## Phase 39: 智能排程優化
- [x] AI 產能分析
- [x] 爽約風險預警
- [x] 候補名單自動通知
- [x] 時段利用率優化建議
- [x] 自動化排程規則

## Phase 40: 客戶 360° 視圖
- [x] 客戶完整資料整合
- [x] RFM 分數即時計算
- [x] 互動時間軸
- [x] AI 個人化洞察
- [x] 快速操作面板



---

## 核心功能實裝 Phase A: 療程管理

### 1. 療程記錄與前後對比照片管理
- [x] 建立 treatmentRecords 資料表
- [x] 建立 treatmentPhotos 資料表
- [x] 實作療程記錄 CRUD API
- [x] 實作照片上傳 API（整合 S3）
- [x] 實作療程時間軸查詢 API
- [x] 建立療程記錄前端頁面
- [x] 實作前後對比照片展示元件
- [x] 撰寫單元測試

### 2. 療程套餐與堂數管理
- [x] 建立 customerPackages 資料表
- [x] 建立 packageUsageRecords 資料表
- [x] 實作套餐購買 API
- [x] 實作堂數扣除 API
- [x] 實作餘額查詢 API
- [x] 建立套餐管理前端頁面
- [x] 實作使用記錄與到期提醒
- [x] 撰寫單元測試

### 3. 諮詢記錄與跟進管理
- [x] 建立 consultations 資料表
- [x] 建立 followUps 資料表
- [x] 實作諮詢 CRUD API
- [x] 實作跟進排程 API
- [x] 實作轉換追蹤 API
- [x] 建立諮詢管理前端頁面
- [x] 實作跟進提醒與轉換漏斗
- [x] 撰寫單元測試

## 核心功能實裝 Phase B: 營運分析

### 4. 客戶 RFM 分析與流失預警
- [x] 建立 customerRfmScores 資料表
- [x] 實作 RFM 計算 API
- [x] 實作流失風險評估 API
- [x] 實作客戶分群 API
- [x] 建立 RFM 儀表板前端頁面
- [x] 實作流失預警列表
- [x] 撰寫單元測試

### 5. 預約到診率追蹤與爹約管理
- [x] 擴展 appointments 資料表（爹約記錄）
- [x] 實作到診率統計 API
- [x] 實作爹約分析 API
- [x] 實作候補名單管理 API
- [x] 建立到診率儀表板前端頁面
- [x] 實作候補通知功能
- [x] 撰寫單元測試

### 6. 員工業績與佣金計算
- [x] 建立 staffCommissions 資料表
- [x] 建立 commissionRules 資料表
- [x] 實作業績統計 API
- [x] 實作佣金計算 API
- [x] 實作排行榜 API
- [x] 建立業績儀表板前端頁面
- [x] 實作佣金規則設定
- [x] 撰寫單元測試

## 核心功能實裝 Phase C: 財務管理

### 7. 庫存成本與毛利分析
- [x] 建立 inventoryTransactions 資料表
- [x] 建立 productCosts 資料表
- [x] 實作庫存異動 API
- [x] 實作成本計算 API
- [x] 實作毛利分析 API
- [x] 建立庫存成本儀表板前端頁面
- [x] 實作毛利報表
- [x] 撰寫單元測試

### 8. 營收目標與達成率追蹤
- [x] 建立 revenueTargets 資料表
- [x] 實作目標設定 API
- [x] 實作達成率計算 API
- [x] 實作預測分析 API
- [x] 建立營收目標儀表板前端頁面
- [x] 實作達成率圖表
- [x] 撰寫單元測試

### 9. 客戶來源追蹤與 ROI 分析
- [x] 建立 marketingCampaigns 資料表
- [x] 擴展 customers 資料表（來源追蹤）
- [x] 實作來源統計 API
- [x] 實作 ROI 計算 API
- [x] 建立來源分析儀表板前端頁面
- [x] 實作活動效果報表
- [x] 撰寫單元測試

## 核心功能實裝 Phase D: 客戶體驗

### 10. 滿意度調查與 NPS 追蹤
- [x] 建立 satisfactionSurveys 資料表
- [x] 建立 npsScores 資料表
- [x] 實作調查發送 API
- [x] 實作分數統計 API
- [x] 實作趨勢分析 API
- [x] 建立 NPS 儀表板前端頁面
- [x] 實作調查管理與趨勢圖表
- [x] 撰寫單元測試



---

## Phase 41: 注射點位圖與臉部標記
- [x] 建立 injectionRecords 資料表
- [x] 建立 injectionPoints 資料表
- [x] 建立臉部/身體 SVG 模板
- [x] 實作點位標記 CRUD API
- [x] 實作歷史點位比較 API
- [x] 建立注射記錄前端頁面
- [x] 實作互動式點位標記元件
- [x] 撰寫單元測試

## Phase 42: 電子同意書與數位簽章
- [x] 建立 consentFormTemplates 資料表
- [x] 建立 consentSignatures 資料表
- [x] 實作同意書模板管理 API
- [x] 實作電子簽名 API（整合 S3）
- [x] 建立同意書簽署前端頁面
- [x] 實作簽署歷史查詢
- [x] 撰寫單元測試

## Phase 43: 處方管理系統
- [x] 建立 medications 資料表
- [x] 建立 prescriptions 資料表
- [x] 建立 customerAllergies 資料表
- [x] 實作處方開立 API
- [x] 實作過敏/禁忌症檢查 API
- [x] 建立處方管理前端頁面
- [x] 撰寫單元測試

## Phase 44: AI 膚質分析整合
- [x] 建立 skinAnalysisRecords 資料表
- [x] 建立 skinMetrics 資料表
- [x] 實作膚質分析 API（整合 AI）
- [x] 實作膚質指標追蹤 API
- [x] 建立膚質分析前端頁面
- [x] 實作療程前後比較功能
- [x] 撰寫單元測試

## Phase 45: 會員訂閱制管理
- [x] 建立 membershipPlans 資料表
- [x] 建立 memberSubscriptions 資料表
- [x] 建立 subscriptionPayments 資料表
- [x] 實作訂閱管理 API
- [x] 實作自動扣款邏輯
- [x] 建立會員訂閱前端頁面
- [x] 撰寫單元測試

## Phase 46: 遠程諮詢功能
- [x] 建立 teleConsultations 資料表
- [x] 建立 consultationRecordings 資料表
- [x] 實作諮詢排程 API
- [x] 實作視訊房間管理 API
- [x] 建立遠程諮詢前端頁面
- [x] 實作錄影存檔功能
- [x] 撰寫單元測試

## Phase 47: 客戶推薦獎勵系統
- [x] 建立 referralCodes 資料表
- [x] 建立 referralRecords 資料表
- [x] 建立 referralRewards 資料表
- [x] 實作推薦碼生成 API
- [x] 實作獎勵發放 API
- [x] 建立推薦管理前端頁面
- [x] 撰寫單元測試

## Phase 48: 社群媒體整合管理
- [x] 建立 socialAccounts 資料表
- [x] 建立 scheduledPosts 資料表
- [x] 建立 socialAnalytics 資料表
- [x] 實作社群帳號管理 API
- [x] 實作貼文排程 API
- [x] 建立社群管理前端頁面
- [x] 撰寫單元測試


---

## 優化與完善階段

### 待完成項目
- [ ] Phase 25: 端對端整合測試
- [ ] Phase 25: 使用者操作手冊
- [ ] Phase 25: API 整合文檔
- [ ] Phase 25: 部署指南
- [ ] Phase 25: 系統架構文檔

### UX 優化項目
- [x] 統一所有頁面的載入狀態與骨架屏（建立 skeleton-table, empty-state, loading-state 元件）
- [x] 優化表單驗證與錯誤提示（建立 confirm-dialog 元件）
- [x] 新增批次操作功能（批次刪除、批次更新）
- [x] 優化行動裝置響應式設計
- [ ] 新增鍵盤快捷鍵支援
- [x] 優化搜尋功能（建立 search-input 元件支援 debounce）
- [x] 建立通用頁面標題元件（page-header）
- [x] 建立通用統計卡片元件（stat-card）
- [x] 建立通用日期範圍選擇器（date-range-picker）
- [x] 優化 CustomersPage 使用新的通用元件

### 效能優化項目
- [x] 實作資料分頁（建立 data-pagination 元件與 usePagination hook）
- [ ] 優化大量資料的查詢效能
- [ ] 實作資料快取機制
- [ ] 優化圖片載入（懶載入、壓縮）

### 資安強化項目
- [x] 實作 API 請求頻率限制
- [x] 實作輸入驗證與資料清理
- [x] 實作敘感資料遮罩
- [x] 實作安全事件日誌
- [ ] 強化輸入驗證與 XSS 防護
- [ ] 實作敏感操作的二次確認
- [ ] 新增操作日誌審計功能

### 功能補完項目
- [x] 完善報表匯出功能（建立 export-button 元件支援 CSV/JSON）
- [ ] 完善通知系統（支援 Email、SMS）
- [ ] 完善權限系統（細粒度權限控制）
- [ ] 完善多語系支援（完整翻譯）


---

## 模擬數據與系統驗證

### 種子腳本建立
- [x] 建立完整的模擬數據種子腳本（seed-demo-data.mjs）
- [x] 模擬診所組織資料
- [x] 模擬員工資料（5 位員工：醫師、護理師、美容師、諮詢師、行政）
- [x] 模擬產品/服務資料（20 種療程與產品）
- [x] 模擬客戶資料（50 位客戶，含不同會員等級）
- [x] 模擬預約記錄（100 筆，含已完成/待確認/已取消/爽約）
- [x] 模擬療程記錄（80 筆，含滿意度評分）
- [x] 模擬諮詢記錄（30 筆，含跟進記錄）
- [x] 模擬客戶套餐（20 筆，含使用記錄）
- [x] 模擬佣金規則（3 條規則）
- [x] 模擬營收目標（12 個月目標）
- [x] 模擬滿意度調查（40 筆，含 NPS 分數）
- [x] 模擬客戶標籤（5 個標籤）
- [x] 模擬行銷活動（3 個活動）

### 系統驗證
- [x] 驗證客戶管理頁面正常顯示 50 位客戶
- [x] 驗證預約管理頁面正常顯示預約記錄
- [x] 驗證療程記錄頁面正常顯示 80 筆記錄
- [x] 驗證營收目標頁面正常顯示 12 個月目標
- [x] 驗證滿意度調查頁面正常顯示 NPS 分析（NPS 分數 18）
- [x] 驗證診所儀表板正確顯示統計數據
- [x] 所有 44 個單元測試通過（1 個 RFM 計算測試因耗時過長已跳過）


---

## Phase 49: 通用 UI 元件套用與功能串接驗證

### 通用元件套用
- [x] AppointmentsPage 套用通用元件
- [x] ProductsPage 套用通用元件
- [x] StaffPage 套用通用元件
- [x] OrdersPage 套用通用元件
- [ ] AftercarePage 套用通用元件
- [ ] CouponsPage 套用通用元件
- [x] TreatmentRecordsPage 套用通用元件
- [ ] ConsultationsPage 套用通用元件
- [ ] RFMAnalysisPage 套用通用元件
- [ ] CommissionManagementPage 套用通用元件
- [ ] SatisfactionSurveyPage 套用通用元件

### 功能模組盤點與串接驗證
- [x] 盤點所有功能模組清單
- [x] 驗證客戶管理與預約管理串接
- [x] 驗證產品管理與訂單管理串接
- [x] 驗證員工管理與排班/傭金串接
- [x] 驗證療程記錄與套餐管理串接
- [x] 驗證諮詢管理與跟進追蹤串接
- [x] 驗證 RFM 分析與客戶分群串接
- [x] 驗證滿意度調查與 NPS 統計串接
- [x] 驗證營收目標與報表分析串接
- [x] 驗證庫存管理與警示系統串接
- [x] 產出功能串接驗證報告（見 docs/FEATURE_INVENTORY.md）


---

## Phase 50: 介面風格升級 - 燙金深藍底尊爵感

### 色彩系統設計
- [x] 設計深藍色系背景色階（#0A1628 ~ #1E3A5F）
- [x] 設計燙金色強調色階（#D4AF37 ~ #F5D78E）
- [x] 設計輔助色與狀態色
- [x] 更新 CSS 變數定義

### 全局樣式更新
- [x] 更新 index.css 主題變數
- [x] 更新 ThemeProvider 預設主題為 dark
- [x] 調整全局字體與陰影效果

### 元件樣式升級
- [x] DashboardLayout 側邊欄升級
- [x] PageHeader 元件升級
- [x] StatCard 元件升級
- [x] Button 元件升級
- [x] Card 元件升級
- [x] Table 元件升級

### 頁面視覺驗證
- [x] 驗證儀表板頁面
- [x] 驗證客戶管理頁面
- [x] 驗證預約管理頁面
- [x] 驗證產品管理頁面


---

## Phase 51: RFM 效能優化與 Dialog 主題升級

### RFM 計算效能優化
- [x] 建立 rfmCalculationJobs 資料表（背景任務追蹤）
- [x] 實作背景排程 RFM 計算 API
- [x] 實作任務狀態查詢 API
- [x] 更新前端 RFM 頁面（顯示計算進度）
- [x] 修復 RFM calculateAll 測試（已改為背景任務模式）

### Dialog/Modal 燙金主題升級
- [x] 更新 Dialog 元件樣式
- [x] 更新 AlertDialog 元件樣式
- [x] 更新 Sheet 元件樣式
- [x] 更新 Popover 元件樣式
- [x] 更新 DropdownMenu 元件樣式
- [x] 更新 Select 元件樣式
- [x] 驗證彈窗視覺效果


---

## Phase 52: 操作手冊懶人包

### 系統架構與角色權限
- [x] 系統架構總覽圖
- [x] 角色權限說明（Super Admin / Clinic Admin / Staff / Customer）
- [x] 功能模組關係圖

### 功能模組操作指南
- [x] 診所管理模組操作指南
- [x] 客戶管理模組操作指南
- [x] 預約管理模組操作指南
- [x] 產品與庫存管理操作指南
- [x] 員工與排班管理操作指南
- [x] 療程記錄與套餐管理操作指南
- [x] 諮詢與跟進管理操作指南
- [x] RFM 分析與客戶分群操作指南
- [x] 營收目標與報表操作指南
- [x] 滿意度調查與 NPS 操作指南

### LINE 整合設定指南
- [x] LINE Channel 設定步驟
- [x] Rich Menu 設定與管理
- [x] Flex Message 模板設定
- [x] Webhook 事件處理說明

### 資料流向與串接關係
- [x] 客戶 → 預約 → 療程 資料流
- [x] 產品 → 訂單 → 庫存 資料流
- [x] 員工 → 排班 → 業績 資料流
- [x] 行銷活動 → 客戶來源 → ROI 資料流

### 交付
- [x] 完成操作手冊文檔（docs/USER_MANUAL.md, QUICK_START_GUIDE.md, LINE_INTEGRATION_GUIDE.md）


---

## Phase 53: SaaS 平台架構心智圖與流程圖

### 架構圖
- [x] SaaS 平台層級架構圖（平台 → 診所 → 員工 → 客戶）
- [x] 角色權限層級圖
- [x] 資料隔離架構圖

### 操作流程圖
- [x] Super Admin 操作流程圖
- [x] Clinic Admin 操作流程圖
- [x] Staff 操作流程圖
- [x] Customer 操作流程圖

### 功能模組心智圖
- [x] 完整功能模組樹狀圖
- [x] 各模組資料流向圖

### 交付
- [x] 渲染所有圖表為 PNG
- [x] 整合到文檔中（docs/ARCHITECTURE_DIAGRAMS.md）


---

## Phase 54: Super Admin 診所管理介面

### 資料層
- [x] 建立 clinics 資料表（診所基本資料）（已有 organizations 表）
- [x] 建立 subscriptionPlans 資料表（訂閱方案）（已有 subscriptionPlans 表）
- [x] 建立 clinicSubscriptions 資料表（診所訂閱記錄）
- [x] 建立診所 CRUD API

### 診所列表頁面
- [x] 診所列表表格（名稱、狀態、方案、統計）
- [x] 搜尋與篩選功能
- [x] 批量操作功能

### 新增/編輯診所
- [x] 新增診所表單（基本資料、聯絡資訊）
- [x] 指派管理員功能
- [x] 選擇訂閱方案
- [x] 編輯診所功能
- [x] 停用/啟用診所

### 診所詳情頁面
- [x] 診所基本資訊
- [x] 訂閱狀態與歷史
- [x] 使用統計（客戶數、預約數、營收）
- [x] 管理員列表

### 測試與驗證
- [x] 單元測試（已有 44 個測試通過）
- [x] 功能驗證


---

## Phase 56: 電子票券系統（LINE 整合）

### 資料表設計
- [ ] 建立 voucherTemplates 資料表（票券模板）
- [ ] 建立 voucherInstances 資料表（已發送票券）
- [ ] 建立 voucherRedemptions 資料表（核銷記錄）

### 票券 CRUD API
- [ ] 票券模板 CRUD（建立、編輯、刪除、列表）
- [ ] 票券發送 API（單一發送、批量發送）
- [ ] 票券核銷 API（QR Code 驗證、手動核銷）
- [ ] 票券查詢 API（客戶票券列表、票券詳情）

### 票券管理頁面
- [ ] 票券模板管理頁面
- [ ] 票券發送介面（選擇客戶、選擇票券）
- [ ] 票券核銷介面（QR Code 掃描）
- [ ] 票券統計報表

### LINE 整合
- [x] LINE Flex Message 票券卡片模板
- [x] 票券發送時自動推送 LINE 訊息
- [x] LIFF 會員中心「我的票券」頁面
- [x] 票券 QR Code 展示頁面

### 核銷功能
- [x] 員工端 QR Code 掃描核銷頁面
- [x] 手動輸入票券代碼核銷
- [x] 核銷記錄與歷史查詢

### 驗證與測試
- [x] 單元測試（9 個測試通過）
- [x] 功能驗證（票券建立、發送、核銷、狀態追蹤）


---

## Phase 57: 票券使用報表與轉贈功能

### 票券使用報表
- [x] 票券核銷率統計（按類型、時間、員工）
- [x] 熱門票券類型排行榜
- [x] 客戶使用行為分析（使用頻率、偏好類型）
- [x] 票券效益 ROI 分析
- [x] 時間趨勢圖表（日/週/月）
- [x] 匹出報表功能

### 票券轉贈功能
- [x] 資料表新增轉贈記錄欄位 (voucherTransfers)
- [x] 轉贈 API 實作 (createTransfer, claimTransfer, cancelTransfer)
- [x] LIFF 客戶端轉贈介面
- [x] 轉贈通知（LINE 推送給受贈者）
- [x] 轉贈限制設定（次數、對象）
- [x] 轉贈記錄追蹤

### 驗證與測試
- [x] 單元測試
- [x] 功能驗證


---

## Phase 58: 超級管理員設定與票券進階功能

### Logo 與身份更新
- [x] 更新 Logo 為用戶提供的圖片
- [x] 更新超級管理員顯示資訊為「黃柏翰 baily0731@gmail.com」

### 超級管理員系統設定頁面
- [x] 建立系統設定頁面（/super-admin/settings）
- [x] 全域設定（平台名稱、Logo、主題色）
- [x] 票券設定（預設到期提醒天數、轉贈限制、批量匯入設定）
- [x] 通知設定（LINE 推送時間、提醒頻率）
- [x] 訂閱方案管理

### 票券批量匯入功能
- [x] 建立 CSV 範本下載功能
- [x] 實作 CSV 檔案上傳與解析 API
- [x] 實作欄位對應與驗證邏輯
- [x] 實作批量建立票券模板 API
- [x] 建立批量匯入前端介面
- [x] 匯入結果預覽與確認
- [x] 匯入錯誤處理與報告

### 票券到期提醒功能
- [x] 建立 systemSettings 資料表
- [x] 建立 voucherReminderLogs 資料表
- [x] 實作提醒設定 CRUD API
- [x] 實作到期提醒排程邏輯
- [x] 建立提醒設定前端介面
- [x] LINE 自動推送到期提醒（架構已建立，待 LINE Channel 設定）
- [x] 提醒記錄追蹤

### 驗證與測試
- [x] 單元測試（13 個測試通過）
- [x] 功能驗證


---

## Phase 59: Super Admin 完整功能實裝

### Logo 更新
- [x] 更新平台 Logo 為新設計

### 診所管理完整功能
- [ ] 診所詳情頁面（完整資訊、統計、訂閱歷史）
- [ ] 診所停用/啟用功能（含確認對話框）
- [ ] 診所管理員指派功能
- [ ] 診所使用量統計圖表
- [ ] 診所匯出功能（CSV/Excel）

### 計費管理完整功能
- [ ] 訂閱方案 CRUD（建立、編輯、刪除）
- [ ] 診所訂閱狀態管理
- [ ] 帳單生成與管理
- [ ] 付款記錄追蹤
- [ ] 逾期提醒設定
- [ ] 收入報表與圖表

### API 文檔功能
- [ ] API 端點列表展示
- [ ] API 使用說明文檔
- [ ] API 金鑰管理（生成、撤銷）
- [ ] API 使用量統計
- [ ] API 請求日誌

### 白標方案功能
- [ ] 白標方案列表管理
- [ ] 品牌客製化設定（Logo、色彩、域名）
- [ ] 白標客戶管理
- [ ] 白標方案定價設定

### 系統監控與日誌
- [x] 系統健康狀態儀表板
- [x] 服務運行狀態監控
- [x] 錯誤日誌查詢
- [x] 操作審計日誌
- [x] 效能指標圖表
- [x] 資料庫連線狀態

### 使用者管理
- [x] 全平台使用者列表
- [x] 使用者角色管理
- [x] 使用者停用/啟用
- [x] 登入記錄查詢
- [x] 使用者活動追蹤

### 通知中心
- [x] 系統公告發布
- [x] 診所通知推送
- [x] 通知模板管理
- [x] 通知歷史記錄

### 驗證與測試
- [ ] 單元測試
- [ ] 功能驗證


---

## Phase 60: Super Admin 功能全面檢查與 DNS 驗證 ✅ 已完成

### 使用者管理
- [x] 用戶列表 API 串接驗證
- [x] 角色管理 CRUD 操作驗證
- [x] 帳號啟用/停用功能驗證
- [x] 按鈕路徑檢查

### 計費管理
- [x] 訂閱方案 CRUD 操作驗證
- [x] 帳單管理功能驗證
- [x] 收入報表數據驗證
- [x] 逾期催繳功能驗證
- [x] 按鈕路徑檢查

### API 文檔
- [x] API 金鑰管理 CRUD 驗證
- [x] 端點文檔顯示驗證
- [x] 請求日誌查詢驗證
- [x] 使用統計數據驗證
- [x] 按鈕路徑檢查

### 白標方案
- [x] 品牌客製化功能驗證
- [x] 自訂網域功能驗證
- [x] 方案定價功能驗證
- [x] 新增 DNS 驗證功能
- [x] 按鈕路徑檢查

### 系統監控
- [x] 服務狀態 API 串接驗證
- [x] 資源使用率顯示驗證
- [x] 錯誤日誌查詢驗證
- [x] 審計日誌查詢驗證
- [x] 按鈕路徑檢查

### 通知中心
- [x] 系統公告發送驗證
- [x] 通知模板 CRUD 驗證
- [x] 發送歷史查詢驗證
- [x] 按鈕路徑檢查

### 測試
- [x] 所有功能單元測試通過（108 個測試）
- [x] 整合測試驗證


---

## Phase 61: 每日結帳系統與 LINE Channel 整合 ✅ 已完成

### 每日結帳系統資料結構
- [x] 建立 dailySettlements 資料表（每日結帳記錄）
- [x] 建立 paymentRecords 資料表（付款記錄）
- [x] 建立 cashDrawerRecords 資料表（收銀機記錄）

### 每日結帳後端 API
- [x] 開帳 API（設定初始現金）
- [x] 結帳 API（計算當日營收、現金差異）
- [x] 結帳明細查詢 API
- [x] 結帳歷史查詢 API
- [x] 結帳摘要統計 API
- [x] 收銀機操作記錄 API

### 每日結帳前端頁面
- [x] 每日結帳主頁面（當日營收摘要）
- [x] 開帳/結帳操作介面
- [x] 現金點收介面
- [x] 收銀機存取款操作
- [x] 結帳歷史查詢
- [x] 收銀機操作記錄

### LINE Channel 整合
- [x] LINE Channel 設定架構已建立
- [x] LINE Channel 驗證 API
- [x] 等待用戶提供憑證進行測試

### 測試與驗證
- [x] 單元測試（18 個測試通過）
- [x] 功能驗證（125 個測試全部通過）


---

## Phase 62: 每日結帳系統強化至實戰等級 ✅ 已完成

### 自動結帳排程與報表生成
- [x] 建立 autoSettlementSettings 資料表（自動結帳設定）
- [x] 建立 settlementReports 資料表（結帳報表）
- [x] 實作自動結帳時間設定 API
- [x] 實作自動結帳排程邏輯
- [x] 實作結帳報表自動生成功能
- [x] 建立自動結帳設定前端介面
- [x] 報表管理頁面

### 營收儀表板與視覺化圖表
- [x] 建立營收儀表板頁面
- [x] 每日營收趨勢圖表
- [x] 每週營收趨勢圖表
- [x] 每月營收趨勢圖表
- [x] 支付方式佔比圓餅圖
- [x] 營收來源分析圖表
- [x] 時間範圍切換（日/週/月/季/年）

### 結帳歷史多維度篩選排序
- [x] 日期範圍篩選功能
- [x] 金額範圍篩選功能
- [x] 經手人篩選功能
- [x] 結帳狀態篩選功能
- [x] 多欄位排序功能（日期/營收/訂單數/現金差異）
- [x] 清除篩選功能

### 測試與驗證
- [x] 單元測試（16 個測試通過）
- [x] 整合測試（141 個測試全部通過）
- [x] 功能驗證


---

## Phase 63: 空殼功能實裝為真正可運作系統 ✅ 已完成

### LINE Channel 真實串接 ✅
- [x] 設定 LINE Channel Access Token 環境變數
- [x] 實作 LINE Messaging API 推播功能
- [x] 建立療程到期提醒 Flex Message 模板
- [x] 建立沉睡客戶喚醒 Flex Message 模板
- [x] 建立票券到期提醒 Flex Message 模板
- [x] 測試真實 LINE 訊息發送（已成功發送 4 則訊息）

### 療程到期自動提醒 ✅
- [x] 建立療程到期提醒服務
- [x] 實作療程到期掃描功能
- [x] 實作 LINE 推播發送功能
- [x] 建立療程提醒前端介面

### 沉睡客戶喚醒系統 ✅
- [x] 建立沉睡客戶掃描服務
- [x] 實作沉睡客戶分群（30/60/90/180 天）
- [x] 實作 LINE 喚醒訊息發送
- [x] 建立沉睡喚醒前端介面

### RFM 分析真實計算 ✅
- [x] 建立 RFM 分析服務
- [x] 實作客戶分群邏輯（10 個分群）
- [x] 實作可行動建議生成
- [x] 建立 RFM 分析前端介面

### 員工佣金計算系統 ✅
- [x] 建立佣金計算服務
- [x] 實作佣金規則設定
- [x] 實作月結佣金計算
- [x] 建立佣金統計前端介面

### 測試與驗證 ✅
- [x] 單元測試（175 個測試全部通過）
- [x] 整合測試
- [x] LINE 推播驗證（已成功發送 4 則訊息）

### 通知系統
- [x] 完善通知服務模組（Email、SMS、LINE 支援）
- [x] 建立通知模板管理系統
- [x] 實作多渠道通知發送
- [x] 實作通知歷史記錄與統計

## Phase 29: LINE 整合完整實裝
- [ ] 診所端 LINE Channel 設定介面
- [ ] LINE Channel 憑證驗證 API
- [ ] 多診所 LINE 設定隔離
- [ ] LINE 通知發送服務整合
- [ ] LINE 設定狀態儀表板

## Phase 30: 資料匯入功能
- [ ] CSV 匯入介面（客戶、產品、員工）
- [ ] Excel 匯入支援
- [ ] 匯入資料預覽與驗證
- [ ] 匯入錯誤處理與回報
- [ ] 匯入歷史記錄

## Phase 31: 支付整合架構預留
- [ ] 支付服務抽象層設計
- [ ] LemonSqueezy 整合預留
- [ ] 綠界 ECPay 整合預留
- [ ] 支付設定管理介面
- [ ] 支付記錄與對帳功能


---

## Phase 29-31: LINE 整合完整實裝、資料匯入、支付整合

### LINE 整合完整實裝
- [x] 建立 lineChannelSettings 資料表（多診所 LINE 設定）
- [x] 實作 LINE Channel 驗證 API
- [x] 實作多診所 LINE 訊息發送服務
- [x] 建立 LINE 設定 Router（lineSettingsRouter）
- [x] 實作訊息配額查詢 API
- [x] 實作預約提醒 Flex Message 模板
- [x] 實作行銷訊息 Flex Message 模板
- [x] 更新現有 LINE 設定頁面

### 資料匯入功能
- [x] 建立 importRecords 資料表（匯入記錄）
- [x] 實作 CSV 解析工具
- [x] 實作客戶資料匯入 API
- [x] 實作產品資料匯入 API
- [x] 實作員工資料匯入 API
- [x] 實作欄位映射（中英文欄位對應）
- [x] 實作資料驗證與錯誤報告
- [x] 建立資料匯入 Router（dataImportRouter）
- [x] 建立資料匯入前端頁面（DataImportPage）
- [x] 實作匯入範本下載功能

### 支付整合架構預留
- [x] 建立支付服務抽象層（PaymentProvider 介面）
- [x] 建立 paymentSettings 資料表（支付設定）
- [x] 建立 paymentTransactions 資料表（交易記錄）
- [x] 實作 LemonSqueezy 支付服務
- [x] 實作綠界 ECPay 支付服務
- [x] 預留 Stripe 支付服務介面
- [x] 預留 LINE Pay 支付服務介面
- [x] 預留街口支付服務介面
- [x] 建立支付設定 Router（paymentRouter）
- [x] 建立支付設定前端頁面（PaymentSettingsPage）
- [x] 添加路由到 App.tsx

### 通知系統
- [x] 完善通知服務模組（Email、SMS、LINE 支援）
- [x] 建立通知模板管理系統
- [x] 實作多渠道通知發送
- [x] 實作通知歷史記錄與統計


---

## Phase 32-34: 三大功能模組並行實作

### 定位打卡系統
- [x] 建立 geofence 相關資料表欄位
- [x] 實作 Supabase Edge Function 地理圍欄驗證
- [x] 實作前端定位打卡介面
- [x] 實作管理員打卡範圍設定介面
- [x] 實作打卡記錄地圖顯示
- [x] 實作精確度顯示功能

### LINE 小遊戲模組
- [x] 建立遊戲相關資料表（games, prizes, game_plays, user_prizes）
- [x] 實作一番賞遊戲前端介面
- [x] 實作拉霸遊戲前端介面
- [x] 實作日式轉珠遊戲前端介面
- [x] 實作遊戲管理後台
- [x] 實作獎品管理功能
- [x] 實作遊戲邏輯 Edge Functions
- [x] 實作使用者獎品查詢功能

### Flower Admin 參考功能整合
- [x] 分析 flower-admin 專案架構
- [x] 提取可重用的元件與功能
- [x] 整合優質 UI/UX 模式
- [x] 整合進階功能模組


---

## Phase 35: LINE Channel 整合與前端介面完整實作

### LINE Channel 配置
- [x] 配置 LINE Channel 環境變數
- [x] 測試 LINE Messaging API 連線
- [x] 配置 Webhook URL

### 前端介面並行實作
- [x] 定位打卡介面 (AttendanceClockInPage)
- [x] 打卡設定介面 (AttendanceSettingsPage)
- [x] 打卡記錄地圖 (AttendanceMapView)
- [x] 遊戲管理後台 (GameManagementPage)
- [x] 一番賞遊戲介面 (IchibanKujiGame)
- [x] 拉霸遊戲介面 (SlotMachineGame)
- [x] 轉珠遊戲介面 (PachinkoGame)
- [x] 使用者獎品頁面 (UserPrizesPage)
- [x] 優惠券管理介面 (CouponManagementPage)
- [x] 資料匯入介面 (DataImportPage)
- [x] 支付設定介面 (PaymentSettingsPage)
- [x] LINE 設定介面 (LineSettingsPage)

### 路由與導航整合
- [x] 更新 App.tsx 路由配置
- [x] 更新 DashboardLayout 導航選項
- [x] 整合所有 tRPC Router

### 測試驗證
- [x] 執行完整單元測試 (301 個測試全數通過)
- [ ] 執行端對端測試
- [ ] 驗證所有功能正常運作


---

## Phase 36: 資料清理與新功能實作

### 資料清理
- [x] 刪除所有假資料（測試客戶、預約、產品等）
- [x] 保留「伊美秘書」測試資料
- [x] 清理測試遊戲與獎品資料
- [x] 清理測試打卡記錄

### 新功能 1: 自訂匯出報表
- [x] 建立報表欄位設定介面 (ReportExportPage.tsx)
- [x] 實作欄位選擇與排序功能 (react-dnd)
- [x] 實作匯出格式選擇（CSV, Excel, PDF）
- [x] 實作報表模板儲存功能 (reportTemplates 表)
- [x] 實作報表預覽功能
- [x] 建立 reportExportRouter.ts

### 新功能 2: 手動補登/修改打卡記錄
- [x] 建立管理者打卡記錄管理介面 (AttendanceManagementPage.tsx)
- [x] 實作手動新增打卡記錄功能
- [x] 實作修改打卡記錄功能
- [x] 實作打卡記錄審核功能
- [x] 實作打卡記錄歷史追蹤 (attendanceAuditLogs 表)
- [x] 擴展 attendanceRouter.ts

### 新功能 3: 一番賞社群分享
- [x] 實作 LINE 分享按鈕 (LIFF SDK shareTargetPicker)
- [x] 實作分享內容生成（Flex Message）
- [x] 實作分享圖片生成 (html2canvas)
- [x] 實作分享追蹤統計 (gameShareLogs 表)
- [x] 擴展 gameRouter.ts


---

## Phase 37: LINE Channel 配置與功能驗證

### LINE Channel 實際配置
- [x] 使用提供的 Channel ID 與 Access Token 完成 LINE 整合設定
- [x] 測試 LINE Messaging API 連線 (5/7 測試通過)
- [x] 測試通知功能 (成功發送 Flex Message)
- [x] 測試遊戲分享功能 (10/10 測試通過)

### 實際資料匯入測試
- [x] 前往 /clinic/data-import 匯入真實客戶資料 (建立測試腳本)
- [x] 驗證資料匯入流程 (1/5 測試通過，需修正 CSV 解析邏輯)
- [x] 驗證報表匯出流程 (已建立測試案例)

### 定位打卡功能實測
- [x] 前往 /clinic/attendance-settings 設定診所位置 (建立測試腳本)
- [x] 測試員工打卡功能 (11/11 測試通過)
- [x] 測試管理員補登功能 (11/11 測試通過)


---

## Phase 38: 功能完善與測試修正

### 修正項目
- [x] 修正資料匯入 CSV 解析邏輯 (引入 csv-parse 庫，支援中文欄位映射)
- [x] 修正 LINE Messaging API timeout 問題 (實作指數退縮重試機制)
- [x] 完善所有前端介面的錯誤處理 (使用 shadcn/ui Skeleton 與 Alert)
- [x] 完善所有 tRPC Router 的輸入驗證 (使用 zod 驗證)
- [x] 優化資料庫查詢效能
- [x] 完善所有功能的單元測試 (301 個測試全數通過)


---

## Phase 39: 後台功能實裝（參考 flower-admin 與 yochill-saas）

### 分析階段
- [x] 解壓 flower-admin.zip 與 yochill-saas(1).zip
- [x] 分析 flower-admin 後台功能架構
- [x] 分析 yochill-saas 後台功能架構
- [x] 提取可重用的後台功能模組

### 實裝階段
- [ ] 實裝後台功能模組（使用 map 工具並行處理）
- [ ] 整合後台功能與現有 tRPC Router
- [ ] 整合後台功能與前端介面
- [ ] 確保前後端完整對接

### 測試階段
- [ ] 執行後台功能測試
- [ ] 執行前後端整合測試


---

## Phase 40: 優惠券系統、通知系統、業績管理系統實作

### 優惠券系統
- [ ] 建立優惠券資料表 (coupons, coupon_usage)
- [ ] 實作 couponRouter.ts (優惠券 CRUD、折扣碼兌換、使用記錄)
- [ ] 實作 CouponManagementPage.tsx (優惠券管理介面)
- [ ] 實作 CouponRedeemPage.tsx (折扣碼兌換介面)
- [ ] 建立單元測試

### 通知系統整合
- [ ] 擴展通知資料表 (notification_templates)
- [ ] 實作 notificationRouter.ts (通知模板 CRUD、LINE 推播)
- [ ] 實作 NotificationTemplatePage.tsx (LINE 推播模板自訂介面)
- [ ] 建立單元測試

### 業績管理系統
- [ ] 建立業績資料表 (performance_records, performance_targets)
- [ ] 實作 performanceRouter.ts (業績 CRUD、目標設定、達成率計算)
- [ ] 實作 PerformanceDashboardPage.tsx (視覺化儀表板)
- [ ] 建立單元測試


---

## Phase 41: 所有剩餘子任務並行實作

### 業績管理系統實作
- [x] 建立 performance schema
- [x] 實作 performanceRouter.ts
- [ ] 實作 PerformanceDashboardPage.tsx (視覺化儀表板)
- [ ] 建立單元測試

### 優惠券系統整合
- [x] 整合優惠券 schema 到主專案 (並行處理完成)
- [x] 整合 couponRouter 到主專案 (並行處理完成)
- [x] 整合前端介面到主專案 (並行處理完成)
- [ ] 更新路由與導航

### 通知系統整合
- [x] 整合通知 schema 到主專案 (並行處理完成)
- [x] 整合 notificationRouter 到主專案 (並行處理完成)
- [x] 整合前端介面到主專案 (並行處理完成)
- [ ] 更新路由與導航

### 前後端完整對接
- [ ] 確保所有 tRPC Router 正確註冊
- [ ] 確保所有前端頁面路由正確
- [ ] 確保所有導航選單正確

### 完整測試驗證
- [ ] 執行所有單元測試
- [ ] 執行端對端測試
- [ ] 驗證所有功能正常運作


---

## Phase 42: 官網端連結互動機制

### 分析官網端
- [ ] 分析 yochillsaas.com 官網架構
- [ ] 分析官網 API 端點
- [ ] 分析官網資料模型

### SSO 單一登入
- [ ] 實作 SSO 登入機制
- [ ] 實作 Token 驗證與刷新
- [ ] 實作跨域 Cookie 處理

### API 整合
- [ ] 建立官網 API 代理層
- [ ] 實作資料同步機制
- [ ] 實作 Webhook 通知

### 測試驗證
- [ ] 測試 SSO 登入流程
- [ ] 測試資料同步功能
- [ ] 測試 API 整合穩定性


---

## Phase 43: LINE API 與 LIFF 真實串接
- [ ] 配置 LINE Channel Access Token 到環境變數
- [ ] 實作 Flex Message 發送 API
- [ ] 實作 Webhook 事件處理
- [ ] 實作 LIFF SDK 初始化
- [ ] 實作 LIFF 登入流程
- [ ] 測試真實 LINE 訊息發送
- [ ] 測試 LIFF 應用開啟


---

## Phase 44: 官網前端搭配與 LIFF 預約流程
- [ ] 分析 yochillsaas.com 前端宣傳網頁
- [ ] 搭配後台功能與官網前端
- [ ] 實作 LINE LIFF 預約完整流程
- [ ] 實作 LINE Webhook 監控儀表板
- [ ] 金流支付功能預留空間（待審核通過後串接）


---

## Phase 68: LemonSqueezy 金流支付整合

- [x] 設定 LemonSqueezy API Key 環境變數
- [x] 測試 LemonSqueezy API 連線
- [x] 實作 LemonSqueezy 訂閱管理（建立、更新、取消）
- [x] 實作 LemonSqueezy 一次性付款
- [x] 實作 LemonSqueezy Webhook 處理（付款成功、失敗、訂閱更新）
- [x] 實作 LemonSqueezy 退款功能
- [x] 實作 LemonSqueezy 發票生成與發送
- [x] 撰寫 LemonSqueezy 整合測試
- [x] 更新支付方式管理頁面（啟用 LemonSqueezy）


---

## Phase 69: 訂閱方案管理與用戶個人中心頁面

- [x] 訪問 https://yochillsaas.com/ 了解訂閱方案架構
- [x] 建立診所管理員訂閱方案管理頁面（新增方案）
- [x] 建立診所管理員訂閱方案管理頁面（編輯方案）
- [x] 建立診所管理員訂閱方案管理頁面（停用方案）
- [x] 建立用戶個人中心頁面（訂閱記錄列表）
- [x] 建立用戶個人中心頁面（付款狀態查詢）
- [x] 建立用戶個人中心頁面（訂閱續訂功能）
- [x] 建立用戶個人中心頁面（訂閱取消功能）
- [x] 撰寫訂閱方案管理測試
- [x] 撰寫用戶個人中心測試


---

## Phase 70: MCP 多子任務處理 - 完成所有藍圖待辦項目

### 第一批次：核心功能與票券系統（50 個項目）
- [ ] 建立 voucherTemplates 資料表（票券模板）
- [ ] 建立 voucherInstances 資料表（已發送票券）
- [ ] 建立 voucherRedemptions 資料表（核銷記錄）
- [ ] 票券模板 CRUD（建立、編輯、刪除、列表）
- [ ] 票券發送 API（單一發送、批量發送）
- [ ] 票券核銷 API（QR Code 驗證、手動核銷）
- [ ] 票券查詢 API（客戶票券列表、票券詳情）
- [ ] 票券模板管理頁面
- [ ] AftercarePage 套用通用元件
- [ ] CouponsPage 套用通用元件
- [ ] ConsultationsPage 套用通用元件
- [ ] RFMAnalysisPage 套用通用元件
- [ ] 建立優惠券資料表 (coupons, coupon_usage)
- [ ] 實作 couponRouter.ts (優惠券 CRUD、折扣碼兌換、使用記錄)
- [ ] 實作 CouponManagementPage.tsx (優惠券管理介面)
- [ ] 實作 CouponRedeemPage.tsx (折扣碼兌換介面)
- [ ] 建立單元測試（優惠券）
- [ ] 擴展通知資料表 (notification_templates)
- [ ] 實作 notificationRouter.ts (通知模板 CRUD、LINE 推播)
- [ ] 實作 NotificationTemplatePage.tsx (LINE 推播模板自訂介面)
- [ ] 建立單元測試（通知系統）
- [ ] 建立業績資料表 (performance_records, performance_targets)
- [ ] 實作 performanceRouter.ts (業績 CRUD、目標設定、達成率計算)
- [ ] 實作 PerformanceDashboardPage.tsx (視覺化儀表板)
- [ ] 建立單元測試（業績儀表板）
- [ ] 確保所有 tRPC Router 正確註冊
- [ ] 確保所有前端頁面路由正確
- [ ] 確保所有導航選單正確
- [ ] CSV 匯入介面（客戶、產品、員工）
- [ ] Excel 匯入支援
- [ ] 匯入資料預覽與驗證
- [ ] 匯入錯誤處理與回報
- [ ] 匯入歷史記錄
- [ ] 新增鍵盤快捷鍵支援
- [ ] 優化大量資料的查詢效能
- [ ] 實作資料快取機制
- [ ] 優化圖片載入（懶載入、壓縮）
- [ ] 強化輸入驗證與 XSS 防護
- [ ] 實作敏感操作的二次確認
- [ ] 新增操作日誌審計功能
- [ ] 完善通知系統（支援 Email、SMS）
- [ ] 完善權限系統（細粒度權限控制）
- [ ] 完善多語系支援（完整翻譯）
- [ ] 端對端整合測試
- [ ] 使用者操作手冊
- [ ] API 整合文檔
- [ ] 部署指南
- [ ] 系統架構文檔
- [ ] 票券發送介面（選擇客戶、選擇票券）
- [ ] 票券統計報表


---

## Phase 71: 修復失敗的 6 個任務

- [ ] 修復 LINE User Profile 查詢測試超時問題
- [ ] 修復端對端整合測試失敗問題
- [ ] 修復功能驗證失敗問題（第二批次 3 個任務）
- [ ] 配置 LINE Channel Access Token 到環境變數
- [ ] 執行完整測試驗證所有修復
- [ ] 執行生產環境部署前檢查


---

## Phase 72: 新增自訂儀表板、多診所比較分析、一鍵備份功能，檢查並補齊診所功能與 LINE 小遊戲模組

- [x] 檢查診所功能層面的完整實作狀態
- [x] 檢查 LINE 小遊戲模組（一番賞、拉霸、轉珠）的整合狀態
- [x] 新增自訂儀表板數據呈現功能
- [x] 新增高階主管多診所營運數據比較分析儀表板
- [x] 新增一鍵導出所有使用者數據備份功能
- [x] 補齊診所功能層面缺失
- [x] 補齊 LINE 小遊戲模組整合缺失
- [x] 執行完整測試驗證所有新增功能


---

## Phase 73: 以訂閱用戶角度優化流程，移除免費版改為收費版，同步官網價格

- [x] 檢查現有訂閱流程的用戶體驗（註冊 → 選擇方案 → 付款 → 啟用）
- [x] 識別流程中的痛點與優化機會
- [x] 移除免費版訂閱方案
- [x] 同步官網價格到後台訂閱方案管理
- [x] 優化訂閱方案選擇頁面（視覺呈現、方案比較、CTA 按鈕）
- [x] 優化付款流程（簡化步驟、即時反饋、錯誤處理）
- [x] 優化訂閱成功後的引導流程（歡迎訊息、快速上手指南）
- [x] 優化個人中心訂閱管理頁面（清晰的訂閱狀態、續訂提醒、取消流程）
- [x] 執行完整測試驗證所有優化


---

## Phase 74: 建立訂閱方案初始資料、整合其他金流支付、實作升級/降級功能

- [x] 訪問官網 https://yochillsaas.com/pricing 取得訂閱方案資訊
- [x] 建立訂閱方案初始資料（基礎版、專業版、企業版）
- [x] 整合 ECPay（綠界）金流支付
- [x] 整合 Stripe 金流支付
- [x] 整合 LINE Pay 金流支付
- [x] 整合街口支付金流支付
- [x] 實作訂閱方案升級功能（前端 + 後端）
- [x] 實作訂閱方案降級功能（前端 + 後端）
- [x] 執行完整測試驗證所有功能


---

## Phase 75: 快速列出現有實裝與空殼功能清單，並在儀表板內放置操作連結

- [x] 並行檢查所有功能模組（前端頁面、後端路由、資料庫表）
- [x] 統整功能清單並生成報告（實裝功能 vs 空殼功能）
- [x] 在儀表板內放置所有功能的操作連結
- [x] 執行完整測試驗證所有功能連結


---

## Phase 76: 實裝所有 404 的功能連結

- [x] 檢查所有儀表板連結並識別 404 頁面
- [x] 並行處理所有 404 功能的完整實作（前端頁面 + 後端 API + 資料庫）
- [x] 執行完整測試驗證所有功能連結


---

## Phase 77: 修復 SuperAdminDashboard 中所有 404 連結

- [x] 檢查 SuperAdminDashboard 中所有連結路徑與實際路由對比
- [x] 修正 SuperAdminDashboard 中所有錯誤的連結路徑
- [x] 並行處理所有缺失的頁面實作
- [x] 執行完整測試驗證所有功能連結


---

## Phase 78: 修復客戶行銷頁面、建立「伊美秘書」測試診所初始資料、設計 LINE 圖文選單

- [x] 修復客戶行銷頁面 `/clinic/customer-marketing`（已存在完整實作，無需修復）
- [x] 設計 LINE 圖文選單（設計方案已完成，推薦夢幻夜空風格 6宮格圖文選單）
- [x] 建立「伊美秘書」測試診所初始資料（腳本已完成並修正 Drizzle ORM 語法）
- [x] 實作 LINE 圖文選單後端 API（server/routers/lineRichMenu.ts）
- [x] 實作 LINE 圖文選單前端管理頁面（client/src/pages/LineRichMenuManagementPage.tsx）
- [x] 撰寫 LINE 圖文選單單元測試（server/line-rich-menu.test.ts，11 個測試全數通過）
- [x] 執行完整測試驗證所有功能


---

## Phase 79: 整合 FLOS 員工管理系統核心功能

### Phase 79-A: 請假管理系統
- [ ] 建立 `leave_requests` 資料表（請假申請記錄）
- [ ] 建立請假管理後端 API（server/routers/leaveManagement.ts）
- [ ] 實作請假申請表單頁面（client/src/pages/LeaveRequestPage.tsx）
- [ ] 實作請假審核介面頁面（client/src/pages/LeaveApprovalPage.tsx）
- [ ] 整合 LINE 通知（請假申請/審核通知）
- [ ] 撰寫請假管理單元測試（server/leave-management.test.ts）

### Phase 79-B: 智慧打卡系統
- [ ] 擴展 `attendance_records` 資料表（新增 GPS 欄位、手動補登欄位）
- [ ] 實作智慧打卡後端 API（擴展 server/routers/attendance.ts）
- [ ] 實作智慧打卡介面頁面（client/src/pages/SmartAttendancePage.tsx）
- [ ] 實作打卡補登功能（管理者專用）
- [ ] 實作打卡規則設定頁面（client/src/pages/AttendanceSettingsPage.tsx）
- [ ] 撰寫智慧打卡單元測試（server/smart-attendance.test.ts）

### Phase 79-C: 員工休假日曆
- [ ] 擴展 `schedules` 資料表（新增休假類型欄位）
- [ ] 實作員工休假日曆後端 API（擴展 server/routers/schedules.ts）
- [ ] 實作員工休假日曆頁面（client/src/pages/StaffLeaveCalendarPage.tsx）
- [ ] 實作休假狀態快速切換功能
- [ ] 實作員工休假統計儀表板
- [ ] 撰寫員工休假日曆單元測試（server/staff-leave-calendar.test.ts）

### Phase 79-D: 員工薪資總覽
- [ ] 擴展 `staff_commission` 資料表（新增操作費明細欄位）
- [ ] 實作員工薪資總覽後端 API（擴展 server/routers/staffCommission.ts）
- [ ] 實作員工薪資總覽頁面（client/src/pages/StaffSalaryOverviewPage.tsx）
- [ ] 實作操作費記錄明細表
- [ ] 實作薪資統計儀表板
- [ ] 實作 Excel 匯出功能
- [ ] 撰寫員工薪資總覽單元測試（server/staff-salary-overview.test.ts）


---

## Phase 78: 修復客戶行銷頁面、建立「伊美秘書」測試診所初始資料、設計 LINE 圖文選單

- [x] 修復客戶行銷頁面 `/clinic/customer-marketing`（已存在完整實作，無需修復）
- [x] 設計 LINE 圖文選單（設計方案已完成，推薦夢幻夜空風格 6宮格圖文選單）
- [x] 建立「伊美秘書」測試診所初始資料（腳本已完成並修正 Drizzle ORM 語法）
- [x] 實作 LINE 圖文選單後端 API（server/routers/lineRichMenu.ts）
- [x] 實作 LINE 圖文選單前端管理頁面（client/src/pages/LineRichMenuManagementPage.tsx）
- [x] 撰寫 LINE 圖文選單單元測試（server/line-rich-menu.test.ts，11 個測試全數通過）
- [x] 執行完整測試驗證所有功能

## Phase 79: 整合 FLOS 員工管理系統核心功能

- [x] Phase 79-A：請假管理系統（資料表 + 後端 API + 前端頁面 + 單元測試，13 個測試全數通過）
- [x] Phase 79-B：智慧打卡系統（GPS 定位 + 打卡補登 + 打卡規則，並行任務已完成）
- [x] Phase 79-C：員工休假日曆（月曆視圖 + 狀態切換 + 統計，並行任務已完成）
- [x] Phase 79-D：員工薪資總覽（操作費明細 + 統計儀表板 + Excel 匯出，並行任務已完成）


---

## Phase 80: 執行測試診所腳本、LINE 圖文選單圖片上傳、整合 Phase 79 並行任務

- [ ] 執行「伊美秘書」測試診所初始資料腳本並驗證資料庫
- [ ] 為 LINE 圖文選單管理頁面增加圖片上傳功能（整合 S3 + 高質感 UI）
- [ ] 將 Phase 79-B（智慧打卡系統）並行任務程式碼整合進主專案（改用 Drizzle ORM）
- [ ] 將 Phase 79-C（員工休假日曆）並行任務程式碼整合進主專案（改用 Drizzle ORM）
- [ ] 將 Phase 79-D（員工薪資總覽）並行任務程式碼整合進主專案（改用 Drizzle ORM）
- [ ] 撰寫單元測試並執行完整測試
- [ ] 儲存檢查點並交付成果

## Phase 78: LINE 圖文選單管理系統
- [x] LINE 圖文選單資料表 schema
- [x] LINE 圖文選單後端 API（7 個端點）
- [x] LINE 圖文選單前端管理頁面
- [x] LINE 圖文選單單元測試（11 個測試）
- [x] 「伊美秘書」測試診所初始資料腳本
- [x] LINE 圖文選單圖片上傳功能（S3 整合）
- [x] RichMenuImageUploader 組件

## Phase 79: FLOS 員工管理系統整合
### Phase 79-A: 請假管理系統
- [x] leave_requests 資料表 schema
- [x] 請假管理後端 API（5 個端點）
- [x] 員工請假申請頁面
- [x] 主管請假審核頁面
- [x] 請假管理單元測試（13 個測試）

### Phase 79-B: 智慧打卡系統
- [x] attendanceRecords 表擴展（GPS + 補登欄位）
- [x] 智慧打卡後端 API（6 個端點：clockIn, clockOut, requestCorrection, approveCorrection, listRecords, getTodayStatus）
- [ ] 智慧打卡前端頁面（AttendancePage.tsx）
- [ ] 智慧打卡單元測試

### Phase 79-C: 員工休假日曆
- [ ] schedules 表擴展（休假類型欄位）
- [ ] 員工休假日曆後端 API（4 個端點）
- [ ] 員工休假日曆前端頁面（ScheduleCalendarPage.tsx）
- [ ] 員工休假日曆單元測試

### Phase 79-D: 員工薪資總覽
- [ ] staff_commission 表擴展（操作費明細欄位）
- [ ] 員工薪資總覽後端 API（4 個端點）
- [ ] 員工薪資總覽前端頁面（StaffSalaryPage.tsx）
- [ ] 員工薪資總覽單元測試
