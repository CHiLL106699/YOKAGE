# 架構分析與執行計畫

## 1. 任務目標

本次任務包含三項主要工作：
1.  **後端串接**：為三個 Super Admin 頁面（計費、API 文檔、白標方案）補上真實的後端 tRPC API，取代現有的靜態假資料。
2.  **安全修復**：修復 `/dashboard` 路由無需登入即可訪問的安全漏洞。
3.  **報告產出**：掃描專案並產出一份完整的網頁路徑對照報告。

## 2. 現有架構分析

-   **前端**：React + TypeScript + Vite，使用 `wouter` 進行路由管理，UI 元件庫為 `shadcn/ui`。
-   **後端**：tRPC + Drizzle ORM + PostgreSQL。tRPC Router 定義在 `server/routers.ts` 中。
-   **資料庫**：使用 Drizzle ORM 管理 Schema，主 Schema 文件為 `drizzle/schema.ts`。
-   **認證**：透過 `ProtectedRoute` 元件進行路由權限控制，角色分為 `super_admin`, `admin`, `staff`。

### 2.1. 任務一：後端串接分析

-   **目標頁面**：
    -   `client/src/pages/SuperAdminBillingPage.tsx`
    -   `client/src/pages/SuperAdminApiDocsPage.tsx`
    -   `client/src/pages/SuperAdminWhiteLabelPage.tsx`
-   **資料庫 Schema**：經分析 `drizzle/schema.ts`，目前缺乏對應 `invoices`, `api_keys`, `white_label_configs` 的資料表。現有的 `subscriptionPlans` 和 `organizationSubscriptions` 與計費相關，但不足以支援完整的帳單功能。
-   **tRPC Router**：`server/routers.ts` 中已存在 `superAdminRouter`，但缺少處理上述三個頁面所需資料的 procedures。

### 2.2. 任務二：安全漏洞分析

-   **問題描述**：使用者回報 `/dashboard` 路由可被未登入用戶訪問。
-   **程式碼分析**：`client/src/App.tsx` 中，所有 `/dashboard/*` 路由均已使用 `<ProtectedRoute>` 元件包裹，理論上應能阻擋未授權的訪問。`ProtectedRoute` 元件的邏輯是：在 `loading` 狀態結束後，若 `!isAuthenticated`，則重導向至 `/login`。
-   **潛在原因**：問題可能不在於路由定義，而在於 `useAuth` hook 的 `isAuthenticated` 狀態判斷邏輯有誤，或是在某些情況下 `loading` 狀態未能正確更新，導致保護邏輯被繞過。此外，`App.tsx` 中存在大量向後相容的 `/clinic/*` 和 `/super-admin/*` 路由，未使用 `ProtectedRoute`，這也可能是一個潛在的入口點，雖然使用者明確指出的是 `/dashboard`。

## 3. 執行計畫

我將依照以下步驟完成任務，並在每個主要階段後向您報告進度。

### 3.1. Phase 1: 資料庫 Schema 擴充

我將在 `drizzle/schema.ts` 中新增以下資料表以支援新功能：

1.  **`invoices` (帳單表)**：用於儲存所有產生的帳單紀錄。
    -   `id`, `organizationId`, `subscriptionId`, `amount`, `status` (`paid`, `pending`, `overdue`), `dueDate`, `paidAt`, `lineItems` (JSONB)
2.  **`api_keys` (API 金鑰表)**：用於管理診所或合作夥伴的 API 存取金鑰。
    -   `id`, `organizationId`, `name`, `keyHash` (儲存雜湊後的金鑰), `keyPrefix`, `status` (`active`, `revoked`), `lastUsedAt`, `requestCount`
3.  **`white_label_configs` (白標設定表)**：用於儲存每個客戶的白標客製化設定。
    -   `id`, `organizationId`, `plan`, `customDomain`, `domainStatus`, `primaryColor`, `logoUrl`, `isActive`

完成後，我會執行 `pnpm drizzle:generate` 來產生 SQL 遷移腳本。

### 3.2. Phase 2: tRPC 後端實作

我將在 `server/routers.ts` 的 `superAdminRouter` 中，新增對應的 tRPC procedures。

-   **計費管理 (`billing`)**:
    -   `billingStats`: 查詢總收入、活躍訂閱數等統計數據。
    -   `listInvoices`: 查詢帳單列表，支援分頁與篩選。
    -   `getInvoiceDetails`: 查詢單一帳單詳情。
    -   `createManualInvoice`: 手動建立帳單。
    -   `listSubscriptionPlans`: 查詢所有訂閱方案。
    -   `updateSubscriptionPlan`: 更新訂閱方案。

-   **API 文檔 (`apiKeys`)**:
    -   `listApiKeys`: 查詢所有 API 金鑰。
    -   `createApiKey`: 建立新的 API 金鑰。
    -   `revokeApiKey`: 撤銷 API 金鑰。
    -   `getApiUsageStats`: 查詢 API 使用統計。

-   **白標方案 (`whiteLabel`)**:
    -   `listWhiteLabelClients`: 查詢所有白標客戶及其設定。
    -   `getWhiteLabelConfig`: 查詢單一客戶的白標設定。
    -   `updateWhiteLabelConfig`: 更新客戶的白標設定。
    -   `verifyDns`: 驗證自訂網域的 DNS 設定。

### 3.3. Phase 3: 前端 API 串接

我將修改以下三個前端頁面，移除 `mockData`，改為呼叫 Phase 2 中建立的 tRPC hooks (`trpc.superAdmin.*.useQuery`, `trpc.superAdmin.*.useMutation`) 來取得與更新資料。

-   `SuperAdminBillingPage.tsx`
-   `SuperAdminApiDocsPage.tsx`
-   `SuperAdminWhiteLabelPage.tsx`

### 3.4. Phase 4: 安全漏洞修復

我將深入調試 `useAuth` hook 與 `ProtectedRoute` 元件的行為。我會先在 `App.tsx` 中，將所有向後相容的 `/clinic/*` 和 `/super-admin/*` 路由也用 `ProtectedRoute` 包裹起來，以消除潛在的繞過路徑。如果問題依舊存在，我將專注於 `useAuth` 的狀態管理，確保 `isAuthenticated` 能在用戶登出後被即時、正確地更新。

### 3.5. Phase 5: 測試與驗證

1.  執行 `pnpm tsc --noEmit` 確保沒有 TypeScript 類型錯誤。
2.  執行 `pnpm build` 確保專案可以成功建置。
3.  手動測試所有修改過的功能，確保 API 串接正常、資料顯示正確、安全漏洞已修復。

### 3.6. Phase 6: 產出報告與交付

完成所有開發與測試後，我將撰寫一個腳本來掃描 `client/src/App.tsx`，解析所有路由定義，並根據分析結果產生 `YOKAGE_PAGES_REPORT.md` 報告。報告將包含所有要求的欄位，並按模組進行分類。

最終，我會將所有程式碼變更 push 到 `main` 分支，並交付產出的報告。

## 4. 資料流向圖

```mermaid
graph TD
    subgraph Browser (Client)
        A[React UI Pages] -- tRPC Hook --> B(tRPC Client)
    end

    subgraph Server
        B -- HTTP Request --> C(tRPC Server)
        C -- Procedure Call --> D{superAdminRouter}
        D -- DB Query --> E(Drizzle ORM)
    end

    subgraph Database
        E -- SQL --> F[(PostgreSQL)]
    end

    F -- SQL Result --> E
    E -- Data --> D
    D -- Procedure Result --> C
    C -- HTTP Response --> B
    B -- Data/State --> A
```

## 5. 預期修改的檔案清單

-   `drizzle/schema.ts` (新增資料表)
-   `drizzle/migrations/*` (新的遷移檔案)
-   `server/routers.ts` (新增 tRPC procedures)
-   `server/db.ts` (可能需要新增對應的資料庫查詢函式)
-   `client/src/pages/SuperAdminBillingPage.tsx` (串接 API)
-   `client/src/pages/SuperAdminApiDocsPage.tsx` (串接 API)
-   `client/src/pages/SuperAdminWhiteLabelPage.tsx` (串接 API)
-   `client/src/App.tsx` (修復安全漏洞)
-   `client/src/_core/hooks/useAuth.ts` (可能需要調試)
-   `YOKAGE_PAGES_REPORT.md` (最終產出的報告)

此計畫已準備就緒，待您批准後即可開始執行。
