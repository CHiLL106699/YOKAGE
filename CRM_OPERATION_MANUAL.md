# YOChiLL CRM 系統操作手冊

## 目錄
1. [系統架構](#系統架構)
2. [三層權限架構](#三層權限架構)
3. [超級管理員操作指南](#超級管理員操作指南)
4. [診所管理者操作指南](#診所管理者操作指南)
5. [客戶端功能說明](#客戶端功能說明)
6. [LINE Messaging API 設定](#line-messaging-api-設定)
7. [自動化標籤系統](#自動化標籤系統)
8. [常見問題](#常見問題)

---

## 系統架構

YOChiLL CRM 系統採用三層權限架構，確保資料安全與權限隔離：

```
超級管理員（你）
    ↓
診所管理者（診所單位）
    ↓
客戶（診所的顧客）
```

### 核心功能模組
1. **客戶資料管理**：客戶基本資料、標籤分類、互動歷史記錄
2. **自動化標籤系統**：根據客戶行為自動分配標籤（VIP、流失風險、新客、忠誠客戶）
3. **LINE Messaging API 整合**：發送/接收 LINE 訊息、批量發送、Flex Message 支援
4. **互動歷史記錄**：記錄所有客戶互動（電話、面談、LINE 對話、預約、療程、備註）

---

## 三層權限架構

### 1. 超級管理員（Super Admin）
**角色**：系統最高權限管理者（你）

**權限**：
- 管理所有診所（新增、編輯、刪除診所）
- 查看所有診所的客戶資料
- 設定 LINE Bot（Channel Access Token、Channel Secret）
- 管理標籤規則（新增、編輯、刪除自動化標籤規則）
- 查看系統整體數據與報表

**操作路徑**：
- 超級管理員 Dashboard：`/super-admin`
- 診所管理：`/super-admin/organizations`
- LINE Bot 設定：`/dashboard/crm` → 設定 → LINE Messaging 設定

---

### 2. 診所管理者（Clinic Manager）
**角色**：各診所的管理者（你對應的診所單位）

**權限**：
- 管理自己診所的客戶資料（新增、編輯、刪除客戶）
- 發送 LINE 訊息給客戶（單一發送、批量發送）
- 查看客戶互動歷史記錄
- 新增客戶互動記錄（電話、面談、LINE 對話、預約、療程、備註）
- 管理客戶標籤（新增、移除標籤）
- 查看自己診所的數據報表

**操作路徑**：
- CRM Dashboard：`/dashboard/crm`
- 標籤管理：`/dashboard/crm/tags`
- 標籤規則管理：`/dashboard/crm/tag-rules`

---

### 3. 客戶（Customer）
**角色**：診所的顧客

**權限**：
- 接收診所發送的 LINE 訊息
- 預約療程（透過 LINE LIFF）
- 查看自己的會員資訊
- 查看自己的療程記錄

**操作路徑**：
- LINE Bot（接收訊息）
- LIFF 預約頁面：`/liff/booking`
- LIFF 會員頁面：`/liff/member`

---

## 超級管理員操作指南

### 1. 設定 LINE Bot（首次設定）

#### 步驟 1：取得 LINE Messaging API 憑證
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 建立 Provider 與 Messaging API Channel
3. 取得以下憑證：
   - **Channel Access Token**（長期有效的 Token）
   - **Channel Secret**

#### 步驟 2：在系統中設定 LINE Bot
1. 登入系統，前往 `/dashboard/crm`
2. 點擊右上角「設定」按鈕
3. 選擇「LINE Messaging 設定」
4. 填寫以下資訊：
   - **診所 ID**：選擇要設定的診所
   - **Channel Access Token**：貼上從 LINE Developers 取得的 Token
   - **Channel Secret**：貼上從 LINE Developers 取得的 Secret
   - **Webhook URL**（選填）：系統自動生成，用於接收 LINE 訊息
5. 點擊「儲存」

#### 步驟 3：設定 LINE Webhook
1. 回到 LINE Developers Console
2. 進入 Messaging API 設定頁面
3. 找到「Webhook URL」欄位
4. 填入系統提供的 Webhook URL（例如：`https://yourdomain.com/api/line/webhook?organizationId=1`）
5. 啟用「Use webhook」
6. 點擊「Verify」測試連線

---

### 2. 管理診所

#### 新增診所
1. 前往 `/super-admin/organizations`
2. 點擊「新增診所」
3. 填寫診所資訊（名稱、地址、電話、Email）
4. 點擊「儲存」

#### 編輯診所
1. 前往 `/super-admin/organizations`
2. 點擊診所名稱進入詳細頁面
3. 點擊「編輯」按鈕
4. 修改診所資訊
5. 點擊「儲存」

#### 刪除診所
1. 前往 `/super-admin/organizations`
2. 點擊診所名稱進入詳細頁面
3. 點擊「刪除」按鈕
4. 確認刪除（⚠️ 刪除診所將同時刪除該診所的所有客戶資料）

---

### 3. 管理標籤規則（自動化標籤系統）

#### 新增標籤規則
1. 前往 `/dashboard/crm/tag-rules`
2. 點擊「新增規則」
3. 填寫規則資訊：
   - **標籤**：選擇要自動分配的標籤
   - **規則名稱**：例如「VIP 客戶自動標籤」
   - **規則說明**：說明規則的用途
   - **規則類型**：選擇觸發條件（消費金額、到店次數、最後到店時間、會員等級）
   - **條件**：選擇比較運算子（大於等於、小於等於、大於、小於、等於）
   - **數值**：填寫觸發數值（例如：100000）
4. 點擊「新增」

#### 執行標籤規則
1. 前往 `/dashboard/crm/tag-rules`
2. 點擊「立即執行規則」
3. 系統將自動為符合條件的客戶分配標籤
4. 顯示執行結果（成功分配數量）

#### 刪除標籤規則
1. 前往 `/dashboard/crm/tag-rules`
2. 找到要刪除的規則
3. 點擊「刪除」按鈕
4. 確認刪除

---

## 診所管理者操作指南

### 1. 管理客戶資料

#### 新增客戶
1. 前往 `/dashboard/crm`
2. 點擊「新增客戶」按鈕
3. 填寫客戶資訊：
   - **姓名**（必填）
   - **電話**
   - **Email**
   - **LINE User ID**（用於發送 LINE 訊息）
   - **性別**
   - **生日**
   - **地址**
   - **來源**（例如：FB 廣告、朋友介紹）
   - **會員等級**（bronze、silver、gold、platinum）
   - **備註**
4. 點擊「儲存」

#### 編輯客戶
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 點擊「編輯」按鈕
4. 修改客戶資訊
5. 點擊「儲存」

#### 刪除客戶
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 點擊「刪除」按鈕
4. 確認刪除（⚠️ 刪除客戶將同時刪除該客戶的所有互動記錄）

---

### 2. 管理客戶標籤

#### 新增標籤
1. 前往 `/dashboard/crm/tags`
2. 點擊「新增標籤」
3. 填寫標籤資訊：
   - **標籤名稱**（例如：VIP、新客、流失風險）
   - **標籤顏色**（選擇顏色）
   - **標籤說明**
4. 點擊「儲存」

#### 為客戶分配標籤
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 點擊「新增標籤」按鈕
4. 選擇要分配的標籤
5. 點擊「新增」

#### 移除客戶標籤
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 找到要移除的標籤
4. 點擊標籤旁的「X」按鈕

---

### 3. 發送 LINE 訊息

#### 發送單一訊息
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 點擊「發送 LINE 訊息」按鈕
4. 選擇訊息類型：
   - **文字訊息**：輸入要發送的文字內容
   - **Flex Message**：輸入 Flex Message JSON（進階功能）
5. 點擊「發送」

#### 批量發送訊息
1. 前往 `/dashboard/crm`
2. 勾選要發送訊息的客戶（可使用標籤篩選）
3. 點擊「批量發送訊息」按鈕
4. 選擇訊息類型並輸入內容
5. 點擊「發送」
6. 系統將顯示發送結果（成功/失敗數量）

---

### 4. 管理互動歷史記錄

#### 新增互動記錄
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 切換到「互動歷史」Tab
4. 點擊「新增記錄」按鈕
5. 填寫互動資訊：
   - **類型**：選擇互動類型（電話、面談、LINE 對話、預約、療程、備註）
   - **標題**：例如「電話諮詢」
   - **內容**：記錄詳細內容
6. 點擊「新增」

#### 查看互動歷史
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 切換到「互動歷史」Tab
4. 查看所有互動記錄（按時間倒序排列）

#### 刪除互動記錄
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 切換到「互動歷史」Tab
4. 找到要刪除的記錄
5. 點擊「刪除」按鈕
6. 確認刪除

---

### 5. 搜尋與篩選客戶

#### 搜尋客戶
1. 前往 `/dashboard/crm`
2. 在搜尋框中輸入關鍵字（姓名、電話、Email）
3. 系統將即時顯示符合條件的客戶

#### 按標籤篩選客戶
1. 前往 `/dashboard/crm`
2. 點擊「標籤篩選」下拉選單
3. 選擇要篩選的標籤
4. 系統將顯示擁有該標籤的客戶

---

## 客戶端功能說明

### 1. 接收 LINE 訊息
- 客戶將透過 LINE Bot 接收診所發送的訊息
- 支援文字訊息與 Flex Message（圖文訊息）

### 2. 預約療程
- 客戶可透過 LINE LIFF 預約療程
- 操作路徑：LINE Bot → 預約療程 → 選擇日期與時間

### 3. 查看會員資訊
- 客戶可透過 LINE LIFF 查看自己的會員資訊
- 操作路徑：LINE Bot → 會員中心

---

## LINE Messaging API 設定

### 1. 取得 LINE Messaging API 憑證

#### 步驟 1：建立 LINE Developers 帳號
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 使用 LINE 帳號登入
3. 建立 Provider（提供者）

#### 步驟 2：建立 Messaging API Channel
1. 在 Provider 頁面中，點擊「Create a new channel」
2. 選擇「Messaging API」
3. 填寫 Channel 資訊：
   - **Channel name**：例如「YOChiLL CRM Bot」
   - **Channel description**：例如「診所客戶管理系統」
   - **Category**：選擇「Medical/Healthcare」
   - **Subcategory**：選擇「Clinic」
4. 同意條款並點擊「Create」

#### 步驟 3：取得憑證
1. 進入 Channel 設定頁面
2. 切換到「Messaging API」Tab
3. 找到「Channel access token」區塊
4. 點擊「Issue」生成 Token（⚠️ 請妥善保管，不要洩漏）
5. 找到「Channel secret」區塊
6. 複製 Channel Secret

---

### 2. 設定 Webhook

#### 步驟 1：在系統中設定 LINE Bot
1. 登入系統，前往 `/dashboard/crm`
2. 點擊右上角「設定」按鈕
3. 選擇「LINE Messaging 設定」
4. 填寫 Channel Access Token 與 Channel Secret
5. 點擊「儲存」
6. 系統將自動生成 Webhook URL

#### 步驟 2：在 LINE Developers Console 設定 Webhook
1. 回到 LINE Developers Console
2. 進入 Channel 設定頁面
3. 切換到「Messaging API」Tab
4. 找到「Webhook settings」區塊
5. 填入系統提供的 Webhook URL（例如：`https://yourdomain.com/api/line/webhook?organizationId=1`）
6. 啟用「Use webhook」
7. 點擊「Verify」測試連線（應顯示「Success」）

---

### 3. 設定 LINE Bot 基本資訊

#### 步驟 1：設定回應模式
1. 在 LINE Developers Console 中，進入 Channel 設定頁面
2. 切換到「Messaging API」Tab
3. 找到「Response settings」區塊
4. 關閉「Auto-reply messages」（自動回覆訊息）
5. 關閉「Greeting messages」（歡迎訊息）
6. 啟用「Webhooks」

#### 步驟 2：設定 LINE Bot 資訊
1. 切換到「Basic settings」Tab
2. 上傳 Bot 頭像
3. 填寫 Bot 名稱與描述

---

## 自動化標籤系統

### 1. 標籤規則類型

#### 消費金額（spending）
- **說明**：根據客戶累計消費金額自動分配標籤
- **範例**：消費金額 >= 100,000 → 自動分配「VIP」標籤

#### 到店次數（visit_count）
- **說明**：根據客戶到店次數自動分配標籤
- **範例**：到店次數 >= 10 → 自動分配「忠誠客戶」標籤

#### 最後到店時間（last_visit）
- **說明**：根據客戶最後到店時間自動分配標籤
- **範例**：最後到店時間 >= 90 天 → 自動分配「流失風險」標籤

#### 會員等級（member_level）
- **說明**：根據客戶會員等級自動分配標籤
- **範例**：會員等級 == platinum → 自動分配「白金會員」標籤

---

### 2. 預設標籤規則建議

#### VIP 客戶
- **規則類型**：消費金額
- **條件**：>= 100,000
- **標籤**：VIP

#### 流失風險
- **規則類型**：最後到店時間
- **條件**：>= 90（天）
- **標籤**：流失風險

#### 新客
- **規則類型**：到店次數
- **條件**：<= 1
- **標籤**：新客

#### 忠誠客戶
- **規則類型**：到店次數
- **條件**：>= 10
- **標籤**：忠誠客戶

---

### 3. 執行標籤規則

#### 手動執行
1. 前往 `/dashboard/crm/tag-rules`
2. 點擊「立即執行規則」
3. 系統將自動為符合條件的客戶分配標籤

#### 自動執行（未來功能）
- 系統將每日自動執行標籤規則
- 執行時間：每日凌晨 2:00

---

## 常見問題

### 1. 為什麼發送 LINE 訊息失敗？

#### 可能原因 1：客戶未綁定 LINE User ID
- **解決方法**：確保客戶資料中已填寫正確的 LINE User ID

#### 可能原因 2：LINE Bot 設定錯誤
- **解決方法**：檢查 Channel Access Token 與 Channel Secret 是否正確

#### 可能原因 3：客戶已封鎖 LINE Bot
- **解決方法**：請客戶解除封鎖

---

### 2. 如何取得客戶的 LINE User ID？

#### 方法 1：透過 LINE Bot 自動取得
1. 客戶加入 LINE Bot 好友
2. 系統自動透過 Webhook 取得 LINE User ID
3. 系統自動將 LINE User ID 綁定到客戶資料

#### 方法 2：手動輸入
1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 點擊「編輯」按鈕
4. 填寫 LINE User ID
5. 點擊「儲存」

---

### 3. 如何查看 LINE 訊息發送記錄？

1. 前往 `/dashboard/crm`
2. 點擊客戶名稱進入詳細頁面
3. 切換到「互動歷史」Tab
4. 查看類型為「LINE 對話」的記錄

---

### 4. 如何停用自動化標籤規則？

1. 前往 `/dashboard/crm/tag-rules`
2. 找到要停用的規則
3. 點擊「刪除」按鈕
4. 確認刪除

---

### 5. 如何批量匯入客戶資料？

#### 未來功能（即將推出）
- 支援 CSV 檔案匯入
- 支援 Excel 檔案匯入
- 自動檢測重複客戶

---

## 技術支援

如有任何問題，請聯繫技術支援：
- **Email**：support@yochill.com
- **電話**：02-1234-5678
- **LINE**：@yochill_support

---

**版本**：v1.0.0  
**最後更新**：2026-02-01
