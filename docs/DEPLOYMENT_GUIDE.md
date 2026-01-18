# YOChiLL SaaS 平台部署指南

> **版本**：v2.0  
> **最後更新**：2026-01-18  
> **適用對象**：DevOps 工程師、系統管理員

---

## 概述

本文檔詳細說明 YOChiLL SaaS 平台的部署流程，包含環境需求、設定步驟、資料庫遷移、以及生產環境最佳實踐。

---

## 系統需求

### 硬體需求

| 環境 | CPU | 記憶體 | 儲存空間 |
|------|-----|--------|----------|
| 開發環境 | 2 核心 | 4 GB | 20 GB |
| 測試環境 | 4 核心 | 8 GB | 50 GB |
| 生產環境 | 8+ 核心 | 16+ GB | 100+ GB |

### 軟體需求

| 軟體 | 版本需求 | 說明 |
|------|----------|------|
| Node.js | 22.x LTS | JavaScript 執行環境 |
| pnpm | 9.x | 套件管理工具 |
| MySQL/TiDB | 8.0+ / 7.x | 資料庫 |

---

## 環境變數設定

### 必要環境變數

以下環境變數為系統運作所必需，部署前務必正確設定：

```bash
# 應用程式設定
VITE_APP_ID=your-app-id
VITE_APP_TITLE=YOChiLL 醫美診所
VITE_APP_LOGO=/logo.png

# 資料庫連線
DATABASE_URL=mysql://user:password@host:3306/database

# 認證設定
JWT_SECRET=your-jwt-secret-key-at-least-32-characters
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# 擁有者資訊
OWNER_OPEN_ID=owner-open-id
OWNER_NAME=擁有者名稱

# Manus Forge API
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key

# 分析追蹤
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### LINE 整合環境變數

若需啟用 LINE 整合功能，請設定以下變數：

```bash
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_USER_ID=default-line-user-id
```

### 環境變數安全注意事項

1. **永遠不要**將環境變數提交到版本控制系統
2. 使用 `.env.example` 作為範本，實際值存放於 `.env.local`
3. 生產環境建議使用 Secret Manager 服務管理敏感資訊
4. `JWT_SECRET` 至少需要 32 個字元，建議使用隨機產生的字串

---

## 部署流程

### 1. 取得原始碼

```bash
# 從 GitHub 克隆專案
gh repo clone YOYO1069/flos-clinic-management-system yochill-saas
cd yochill-saas
```

### 2. 安裝依賴

```bash
# 安裝所有依賴套件
pnpm install
```

### 3. 設定環境變數

```bash
# 複製環境變數範本
cp .env.example .env.local

# 編輯環境變數
nano .env.local
```

### 4. 資料庫遷移

```bash
# 產生遷移檔案並推送到資料庫
pnpm db:push
```

### 5. 建置專案

```bash
# 建置生產版本
pnpm build
```

### 6. 啟動服務

```bash
# 啟動生產伺服器
pnpm start
```

---

## 資料庫設定

### 資料庫結構

系統使用 Drizzle ORM 管理資料庫結構，主要資料表如下：

| 資料表 | 說明 |
|--------|------|
| `user` | 系統使用者（管理員、員工） |
| `customer` | 客戶資料 |
| `appointment` | 預約記錄 |
| `product` | 產品/服務項目 |
| `order` | 訂單記錄 |
| `order_item` | 訂單明細 |
| `staff` | 員工資料 |
| `schedule` | 排班記錄 |
| `attendance` | 打卡記錄 |
| `treatment_record` | 療程記錄 |
| `customer_package` | 客戶套餐 |
| `coupon` | 優惠券 |
| `notification` | 通知記錄 |

### 資料庫遷移指令

```bash
# 產生遷移檔案
pnpm drizzle-kit generate

# 執行遷移
pnpm drizzle-kit migrate

# 推送 schema 變更（開發環境）
pnpm db:push

# 檢視資料庫狀態
pnpm drizzle-kit studio
```

### 資料庫備份

建議定期執行資料庫備份：

```bash
# MySQL 備份
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql

# 還原備份
mysql -u user -p database < backup_20240118.sql
```

---

## Manus 平台部署

YOChiLL SaaS 平台原生支援 Manus 平台部署，提供以下優勢：

1. **一鍵部署**：透過 Manus 管理介面即可完成部署
2. **自動擴展**：根據流量自動調整資源
3. **SSL 憑證**：自動配置 HTTPS
4. **自訂網域**：支援綁定自有網域

### 部署步驟

1. 在 Manus 管理介面建立 Checkpoint
2. 點擊「Publish」按鈕
3. 等待部署完成
4. 設定自訂網域（選用）

### 環境變數設定

在 Manus 管理介面的「Settings > Secrets」中設定環境變數：

1. 點擊「Add Secret」
2. 輸入變數名稱與值
3. 儲存設定
4. 重新部署以套用變更

---

## 生產環境最佳實踐

### 效能優化

1. **啟用 Gzip 壓縮**：減少傳輸資料量
2. **設定 CDN**：加速靜態資源載入
3. **資料庫索引**：確保常用查詢欄位有適當索引
4. **連線池**：使用資料庫連線池管理連線

### 安全強化

1. **HTTPS 強制**：所有流量必須透過 HTTPS
2. **CORS 設定**：限制允許的來源網域
3. **速率限制**：防止 API 濫用
4. **輸入驗證**：所有使用者輸入都需驗證
5. **敏感資料加密**：密碼、Token 等敏感資料需加密儲存

### 監控與日誌

1. **應用程式日誌**：記錄錯誤與重要事件
2. **效能監控**：追蹤回應時間與資源使用
3. **錯誤追蹤**：使用 Sentry 等工具追蹤錯誤
4. **健康檢查**：定期檢查服務狀態

### 備份策略

| 類型 | 頻率 | 保留期限 |
|------|------|----------|
| 資料庫完整備份 | 每日 | 30 天 |
| 資料庫增量備份 | 每小時 | 7 天 |
| 檔案儲存備份 | 每日 | 30 天 |
| 設定檔備份 | 每次變更 | 永久 |

---

## 故障排除

### 常見問題

#### 1. 資料庫連線失敗

**症狀**：啟動時出現 `ECONNREFUSED` 錯誤

**解決方案**：
1. 確認資料庫服務已啟動
2. 檢查 `DATABASE_URL` 格式是否正確
3. 確認防火牆允許資料庫連線

#### 2. 認證失敗

**症狀**：登入後無法存取受保護的 API

**解決方案**：
1. 確認 `JWT_SECRET` 設定正確
2. 檢查 Cookie 是否正確設定
3. 確認 `OAUTH_SERVER_URL` 可連線

#### 3. LINE 通知發送失敗

**症狀**：LINE 通知無法送達

**解決方案**：
1. 確認 `LINE_CHANNEL_ACCESS_TOKEN` 有效
2. 檢查 LINE 用戶是否已加入官方帳號
3. 確認訊息格式符合 LINE API 規範

#### 4. 建置失敗

**症狀**：`pnpm build` 出現錯誤

**解決方案**：
1. 清除 node_modules 並重新安裝：`rm -rf node_modules && pnpm install`
2. 檢查 TypeScript 錯誤：`pnpm tsc --noEmit`
3. 確認所有環境變數已設定

---

## 版本更新

### 更新步驟

1. **備份資料庫**：執行完整備份
2. **拉取最新代碼**：`git pull origin main`
3. **安裝依賴**：`pnpm install`
4. **執行遷移**：`pnpm db:push`
5. **建置專案**：`pnpm build`
6. **重啟服務**：重新啟動應用程式

### 回滾步驟

若更新後發生問題，可執行回滾：

1. **還原資料庫**：從備份還原
2. **切換版本**：`git checkout <previous-version>`
3. **重新安裝**：`pnpm install`
4. **重新建置**：`pnpm build`
5. **重啟服務**：重新啟動應用程式

---

## 聯絡支援

如遇到無法解決的問題，請透過以下管道尋求協助：

- **技術文件**：`/docs` 目錄
- **問題回報**：GitHub Issues
- **Manus 支援**：https://help.manus.im

---

*部署指南 - YOChiLL 醫美診所 SaaS 平台 v2.0*
