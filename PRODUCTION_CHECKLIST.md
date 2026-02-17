# YOKAGE Production 就緒檢查清單

## Sprint 5: FLOS 功能整合

### 資安檢查

- [x] 前端無硬編碼 API Key、Token、密碼
- [x] 所有環境變數使用 `import.meta.env.VITE_*` 存取
- [x] 敏感操作（簽署、病歷 CRUD、打卡）均透過 tRPC protectedProcedure 保護
- [x] 簽名圖片以 Data URL 傳輸，不直接存取 Storage bucket
- [x] 所有 DB 操作透過 server-side router，前端不直接操作資料庫
- [x] GPS 座標僅在打卡時傳送至後端，不在前端持久化

### 效能優化

- [x] 所有 Sprint 5 頁面使用 `React.lazy()` + `Suspense` 載入
- [x] 圖片元素使用 `loading="lazy"` 屬性
- [x] tRPC 查詢透過 React Query 自動快取
- [x] Vite build 配置 `manualChunks` 分割 vendor 與功能模組
- [x] `chunkSizeWarningLimit` 設為 500KB
- [x] Production build 自動移除 `console.*` 和 `debugger`

### 代碼品質

- [x] `tsc --noEmit` 零錯誤
- [x] `pnpm build` 成功
- [x] 所有新增檔案有 JSDoc 註解
- [x] 無未使用的 import
- [x] 遵循既有的 coding convention

### 功能模組

#### 知情同意書管理

- [x] 模板 CRUD（建立、讀取、更新、軟刪除）
- [x] 模板分類篩選（treatment, surgery, anesthesia, photography, general）
- [x] Canvas 數位簽名板（支援滑鼠與觸控）
- [x] 簽署記錄查詢與詳情檢視
- [x] 見證人簽名支援

#### 電子病歷 EMR

- [x] 病歷列表（分頁、篩選）
- [x] 病歷詳情頁面
- [x] 新增/編輯病歷表單
- [x] 照片上傳與管理
- [x] Before/After 滑桿比對元件
- [x] 滿意度評分（1-5 星）

#### 智慧打卡系統

- [x] GPS 定位打卡（上班/下班）
- [x] 即時時鐘顯示
- [x] 今日打卡狀態查詢
- [x] 月曆視圖出勤記錄
- [x] 月統計摘要（出勤、遲到、早退、加班、補打卡）
- [x] 補打卡申請表單
- [x] 申請記錄查詢

### 部署注意事項

1. 確認 Supabase 資料庫已有以下 table：
   - `consent_form_templates`
   - `consent_signatures`
   - `treatment_records`
   - `treatment_photos`
   - `attendance_records`

2. 確認 RLS 政策已正確設定

3. 環境變數確認：
   - `VITE_OAUTH_PORTAL_URL`
   - `VITE_APP_ID`
   - `DATABASE_URL`

---

**最後更新：** 2026-02-17
**Sprint：** Sprint 5 - FLOS 功能整合
