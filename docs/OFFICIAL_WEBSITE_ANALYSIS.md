# YOChiLL 官網端分析報告

## 官網架構分析

### 基本資訊
- **官網網址**: https://yochillsaas.com
- **前端框架**: 原生 JavaScript（未使用 React/Vue/Angular/Next.js）
- **部署方式**: SaaS 雲端部署

### 功能模組
1. **首頁展示**：智慧營運儀表板、術後關懷追蹤、LINE 官方帳號整合
2. **方案價格**：月繳方案 (NT$2,200/月)、年繳方案 (NT$19,980/年)
3. **登入功能**：登入按鈕（待分析登入機制）
4. **免費試用**：14 天免費試用

### API 端點分析
- `https://manus-analytics.com/api/send`：Manus 分析服務
- `https://api.manus.im/api/user_behavior/batch_create_event_v2`：使用者行為追蹤

### 儲存機制
- **localStorage**: AMP_unsent_46ac3f9abb, AMP_remote_config_46ac3f9abb
- **sessionStorage**: 無
- **cookies**: 無

---

## 前後端連結互動機制設計

### 1. SSO 單一登入機制
**目標**：讓使用者在官網登入後，可直接進入後台系統，無需重複登入。

**實作方案**：
- **官網端**：登入後產生 JWT Token，儲存在 httpOnly Cookie
- **後台端**：驗證 JWT Token，建立 Session
- **跨域處理**：設定 CORS 允許 `yochillsaas.com` 與 `*.manus.space` 跨域請求

### 2. API 整合機制
**目標**：官網與後台系統共享資料，實現無縫整合。

**實作方案**：
- **官網 API 代理層**：建立 `/api/official/*` 端點，代理官網 API 請求
- **資料同步機制**：使用 Webhook 通知後台系統更新資料
- **快取策略**：使用 Redis 快取官網資料，減少 API 請求次數

### 3. LINE 官方帳號整合
**目標**：官網與後台系統共享 LINE 官方帳號，實現統一管理。

**實作方案**：
- **LINE Bot 統一管理**：後台系統提供 LINE Bot 管理介面
- **Webhook 統一處理**：所有 LINE Webhook 請求統一由後台系統處理
- **訊息模板共享**：官網與後台系統共享 LINE 訊息模板

---

## 技術實作清單

### Phase 1: SSO 單一登入
- [ ] 建立 JWT Token 驗證中間件
- [ ] 實作跨域 Cookie 處理
- [ ] 實作 Token 刷新機制
- [ ] 建立登入 API (`/api/auth/official-login`)

### Phase 2: API 整合
- [ ] 建立官網 API 代理層 (`/api/official/*`)
- [ ] 實作資料同步機制
- [ ] 實作 Webhook 通知
- [ ] 建立快取策略

### Phase 3: LINE 整合
- [ ] 統一 LINE Bot 管理介面
- [ ] 統一 Webhook 處理邏輯
- [ ] 建立訊息模板共享機制

### Phase 4: 測試驗證
- [ ] 測試 SSO 登入流程
- [ ] 測試資料同步功能
- [ ] 測試 API 整合穩定性
- [ ] 測試 LINE Bot 功能
