# LINE 整合設定指南

> **完整的 LINE Official Account 與 LIFF 整合步驟**

---

## 目錄

1. [前置準備](#1-前置準備)
2. [LINE Official Account 設定](#2-line-official-account-設定)
3. [Messaging API 設定](#3-messaging-api-設定)
4. [LIFF App 設定](#4-liff-app-設定)
5. [系統串接設定](#5-系統串接設定)
6. [Rich Menu 設定](#6-rich-menu-設定)
7. [Flex Message 設定](#7-flex-message-設定)
8. [Webhook 設定](#8-webhook-設定)
9. [測試與驗證](#9-測試與驗證)

---

## 1. 前置準備

### 1.1 需要的帳號

| 帳號 | 用途 | 申請網址 |
|------|------|----------|
| LINE Business ID | 管理官方帳號 | https://account.line.biz/ |
| LINE Developers | 開發者設定 | https://developers.line.biz/ |

### 1.2 需要取得的憑證

| 憑證 | 來源 | 用途 |
|------|------|------|
| Channel ID | LINE Developers | 識別 Channel |
| Channel Secret | LINE Developers | 驗證簽章 |
| Channel Access Token | LINE Developers | API 呼叫認證 |
| LIFF ID | LINE Developers | LIFF App 識別 |

---

## 2. LINE Official Account 設定

### 2.1 建立官方帳號

1. 前往 [LINE Official Account Manager](https://manager.line.biz/)
2. 點擊「建立帳號」
3. 選擇帳號類型：
   - **一般帳號**：免費，功能受限
   - **認證帳號**：需審核，可使用完整功能（建議）
4. 填寫帳號資訊：
   - 帳號名稱（診所名稱）
   - 帳號類別（醫療/美容）
   - 聯絡資訊
5. 完成建立

### 2.2 基本設定

在 LINE Official Account Manager 中設定：

| 設定項目 | 建議值 | 說明 |
|----------|--------|------|
| 加入好友的歡迎訊息 | 啟用 | 新好友自動發送歡迎訊息 |
| 自動回應訊息 | 停用 | 改用系統的智能回覆 |
| 聊天模式 | 聊天 | 允許一對一對話 |

---

## 3. Messaging API 設定

### 3.1 啟用 Messaging API

1. 在 LINE Official Account Manager 中
2. 點擊「設定」→「Messaging API」
3. 點擊「啟用 Messaging API」
4. 選擇或建立 Provider
5. 確認啟用

### 3.2 取得憑證

啟用後，前往 [LINE Developers Console](https://developers.line.biz/)：

1. 選擇對應的 Provider
2. 選擇對應的 Channel
3. 在「Basic settings」取得：
   - **Channel ID**
   - **Channel Secret**
4. 在「Messaging API」取得：
   - **Channel Access Token**（點擊 Issue 產生）

> ⚠️ **重要**：Channel Access Token 請選擇「Long-lived」類型

---

## 4. LIFF App 設定

### 4.1 建立 LIFF App

在 LINE Developers Console 中：

1. 選擇對應的 Channel
2. 點擊「LIFF」標籤
3. 點擊「Add」建立 LIFF App
4. 填寫設定：

| 設定項目 | 說明 | 建議值 |
|----------|------|--------|
| LIFF app name | 應用名稱 | YOChiLL 會員中心 |
| Size | 顯示大小 | Full（全螢幕） |
| Endpoint URL | 應用網址 | `https://your-domain.com/liff/member` |
| Scope | 權限範圍 | profile, openid |
| Bot link feature | 綁定官方帳號 | Aggressive |

### 4.2 建議的 LIFF App 配置

| LIFF App | Endpoint URL | 用途 |
|----------|--------------|------|
| 會員中心 | `/liff/member` | 查看會員資料、消費記錄 |
| 線上預約 | `/liff/booking` | 線上預約療程 |
| 商城 | `/liff/shop` | 瀏覽與購買產品 |
| 員工打卡 | `/liff/staff/clock` | 員工上下班打卡 |

---

## 5. 系統串接設定

### 5.1 在系統中設定 LINE Channel

**路徑**：`/clinic/line-settings`

1. 輸入 Channel ID
2. 輸入 Channel Secret
3. 輸入 Channel Access Token
4. 點擊「儲存設定」
5. 系統會自動驗證憑證有效性

### 5.2 設定 Webhook URL

1. 在系統中複製 Webhook URL
2. 回到 LINE Developers Console
3. 在「Messaging API」→「Webhook settings」
4. 貼上 Webhook URL
5. 啟用「Use webhook」
6. 點擊「Verify」測試連線

### 5.3 設定 LIFF ID

在系統的 LINE 設定頁面中：

1. 輸入各 LIFF App 的 ID
2. 系統會自動更新 LIFF 頁面的初始化設定

---

## 6. Rich Menu 設定

### 6.1 設計規格

| 規格 | 說明 |
|------|------|
| 圖片尺寸 | 2500×1686 px（大）或 2500×843 px（小） |
| 檔案格式 | JPEG 或 PNG |
| 檔案大小 | 最大 1 MB |

### 6.2 建立 Rich Menu

**路徑**：`/clinic/rich-menu`

1. 點擊「新增 Rich Menu」
2. 選擇版型：
   - 1×1（1 個區塊）
   - 1×2（2 個區塊）
   - 2×2（4 個區塊）
   - 2×3（6 個區塊）
3. 上傳背景圖片
4. 設定各區塊的動作：

| 動作類型 | 說明 | 範例 |
|----------|------|------|
| URI | 開啟網址 | `https://liff.line.me/{LIFF_ID}` |
| Message | 發送訊息 | `我要預約` |
| Postback | 觸發事件 | `action=booking` |

5. 設定顯示條件（可選）
6. 點擊「發布」

### 6.3 Rich Menu 切換策略

系統支援根據客戶狀態自動切換 Rich Menu：

| 客戶狀態 | Rich Menu | 重點功能 |
|----------|-----------|----------|
| 新客戶 | 新客歡迎版 | 了解療程、預約諮詢 |
| 一般會員 | 標準版 | 預約、商城、會員中心 |
| VIP 會員 | VIP 專屬版 | VIP 優惠、快速預約 |
| 待回訪 | 回訪提醒版 | 限時優惠、立即預約 |

---

## 7. Flex Message 設定

### 7.1 Flex Message 結構

```json
{
  "type": "flex",
  "altText": "預約確認",
  "contents": {
    "type": "bubble",
    "header": { ... },
    "body": { ... },
    "footer": { ... }
  }
}
```

### 7.2 常用模板

**路徑**：`/clinic/flex-message`

系統預設提供以下模板：

| 模板名稱 | 觸發時機 | 內容 |
|----------|----------|------|
| 預約確認 | 預約建立後 | 預約詳情、地址、注意事項 |
| 預約提醒 | 預約前 1 天 | 提醒明日預約、準備事項 |
| 療程完成 | 療程結束後 | 感謝光臨、滿意度調查連結 |
| 生日祝福 | 客戶生日 | 生日祝福、專屬優惠券 |
| 優惠推播 | 行銷活動 | 活動內容、立即預約按鈕 |

### 7.3 自訂模板

1. 點擊「新增模板」
2. 選擇基礎版型
3. 編輯內容：
   - 使用變數：`{{customer_name}}`、`{{appointment_date}}`
   - 設定按鈕動作
4. 預覽效果
5. 儲存模板

---

## 8. Webhook 設定

### 8.1 支援的事件類型

| 事件類型 | 說明 | 系統處理 |
|----------|------|----------|
| `message` | 用戶發送訊息 | AI 客服回覆 |
| `follow` | 加入好友 | 發送歡迎訊息、建立客戶資料 |
| `unfollow` | 封鎖帳號 | 記錄流失 |
| `postback` | 點擊按鈕 | 執行對應動作 |
| `memberJoined` | 加入群組 | 群組歡迎訊息 |

### 8.2 自動回覆規則

**路徑**：`/clinic/webhook`

設定關鍵字觸發的自動回覆：

| 關鍵字 | 回覆內容 | 動作 |
|--------|----------|------|
| 預約 | 預約引導訊息 | 開啟 LIFF 預約頁 |
| 價格 | 價目表 Flex Message | - |
| 營業時間 | 營業時間資訊 | - |
| 客服 | 轉接真人客服 | 通知客服人員 |

---

## 9. 測試與驗證

### 9.1 測試清單

| 測試項目 | 驗證方式 |
|----------|----------|
| Webhook 連線 | LINE Developers Console 的 Verify 按鈕 |
| 歡迎訊息 | 加入好友測試 |
| Rich Menu | 確認顯示與點擊動作 |
| LIFF App | 開啟 LIFF 頁面測試 |
| Flex Message | 手動發送測試訊息 |

### 9.2 常見問題

**Q：Webhook 驗證失敗？**
- 確認 URL 正確且可公開存取
- 確認伺服器正常運作
- 檢查 SSL 憑證是否有效

**Q：LIFF 無法開啟？**
- 確認 Endpoint URL 正確
- 確認 LIFF ID 設定正確
- 檢查 LIFF SDK 初始化

**Q：Rich Menu 不顯示？**
- 確認已發布
- 確認用戶符合顯示條件
- 等待幾分鐘讓設定生效

---

## 附錄：需要提供的憑證

當您準備好串接 LINE 時，請提供以下資訊：

```
Channel ID: _______________
Channel Secret: _______________
Channel Access Token: _______________
LIFF ID (會員中心): _______________
LIFF ID (預約): _______________
LIFF ID (商城): _______________
LIFF ID (員工打卡): _______________
```

---

*LINE 整合設定指南 - YOChiLL 醫美診所 SaaS 平台*
