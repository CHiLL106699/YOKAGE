# YOKAGE 專案效能優化：架構分析與修改計畫

## 1. 總體目標

本計畫旨在對 YOKAGE 專案進行全面的前端效能優化，核心目標是降低初始載入的 Bundle 大小、提升頁面渲染速度與使用者體驗，並強化代碼品質與可維護性。所有修改將嚴格遵守「不破壞現有功能」及「確保穩定性」的最高原則。

## 2. 現狀分析 (Baseline)

在執行任何優化前，已對專案進行了初步分析與建置，以建立效能基準。詳細指標如下：

| 指標 (Metric) | 基準值 (Baseline Value) |
| :--- | :--- |
| **總體打包大小 (dist/public)** | 6.1 MB |
| **JavaScript 總大小** | 4811.63 KB |
| **CSS 總大小** | 230.15 KB |
| **JavaScript Chunks 數量** | 202 個 |
| **最大 Chunk (BiDashboard)** | 612.02 KB |
| **次大 Chunk (index-*.js)** | 461.05 KB |
| **Recharts 相關 Chunk** | 382.55 KB |
| **TypeScript `strict` 模式** | `true` (已啟用) |
| **TypeScript 編譯錯誤** | 0 個 |
| **`any` 型別使用量** | ~223 處 (`: any` + `as any`) |
| **`<img>` 缺少 `loading="lazy"`** | ~28+ 處 |
| **`console.log` (Client)** | 1 處 (位於代碼範例字串中) |

**關鍵發現：**

1.  **Vite 打包策略**：雖然已使用 `manualChunks`，但配置較為粗略，導致 `recharts` 等大型函式庫被打包進通用 chunk (`BiDashboard`, `generateCategoricalChart`)，造成單一檔案體積過大，嚴重影響頁面載入速度。
2.  **Code Splitting**：`App.tsx` 中已全面採用 `React.lazy()` 進行頁面級的代碼分割，但載入中的 `fallback` 僅為一個簡單的旋轉圖示，使用者體驗有待提升。
3.  **型別安全**：專案已啟用 TypeScript 的 `strict` 模式且無編譯錯誤，這是一個非常好的基礎。然而，代碼中存在大量 `any` 型別，削弱了 TypeScript 帶來的型別安全優勢，是潛在的重構目標。
4.  **圖片載入**：多處 `<img>` 標籤未實作懶載入 (`loading="lazy"`)，這會導致在首屏載入時，下載使用者可視範圍外的圖片，浪費頻寬並延遲頁面互動時間。

## 3. 預計修改方案與檔案清單

基於以上分析，我將分階段執行以下優化策略。我將遵循「文檔驅動」原則，先提交此計畫供您審批。**在您批准 (Approved) 之前，我不會進行任何代碼修改。**

### 階段一：Vite Build 配置與圖片懶載入

此階段專注於立竿見影的打包與資源載入優化。

| 任務 | 執行細節 | 預計修改檔案 |
| :--- | :--- | :--- |
| **優化 Vite Chunking** | 將 `recharts`、`html2canvas` 等大型、非所有頁面都需要的函式庫，從 `manualChunks` 中獨立出來，使其只在需要的頁面被載入。 | `vite.config.ts` |
| **全局圖片懶載入** | 透過全局搜索，為所有 `.tsx` 檔案中的 `<img>` 標籤添加 `loading="lazy"` 屬性。 | 全部的 `client/src/**/*.tsx` |
| **優化 Suspense Fallback** | 建立一個通用的 `PageSkeleton.tsx` 元件，提供比單純 `Loader2` 更友好的骨架屏載入效果，並在 `App.tsx` 中替換現有 fallback。 | `client/src/App.tsx`, `client/src/components/ui/PageSkeleton.tsx` (新增) |

### 階段二：提升代碼品質與型別安全

此階段專注於提升代碼的長期可維護性。

| 任務 | 執行細節 | 預計修改檔案 |
| :--- | :--- | :--- |
| **移除 `any` 型別** | 針對 `any` 使用最頻繁的檔案進行重構，優先處理與核心資料結構相關的頁面，例如 `CommissionManagementPage`、`ConsultationManagementPage` 等，為其定義明確的 TypeScript 型別。 | `client/src/pages/CommissionManagementPage.tsx`, `client/src/pages/ConsultationManagementPage.tsx`, `client/src/pages/AttendanceDashboardPage.tsx` 及其他 `any` 高頻檔案 |
| **清理未使用依賴** | 執行 `pnpm depcheck`，分析並移除 `package.json` 中不再被使用的依賴項。 | `package.json` |
| **清理 `console.log`** | 移除 `client/src/pages/ApiDocsPage.tsx` 中用於範例的 `console.log` 字串。 | `client/src/pages/ApiDocsPage.tsx` |

## 4. 驗收標準

1.  `pnpm build` 必須成功執行，無任何錯誤。
2.  `tsc --noEmit` 必須維持零錯誤。
3.  打包後的 **JavaScript 總大小**應有顯著下降。
4.  `BiDashboard`、`index` 等主要 chunk 的大小應顯著降低。
5.  所有圖片均已實現懶載入。
6.  `any` 型別的使用數量顯著減少。
7.  產出 `PHASE1_PERFORMANCE_REPORT.md` 報告，包含優化前後的 Bundle 大小對比、修改摘要及最終成果。
8.  所有變更 Push 至 `main` 分支。

