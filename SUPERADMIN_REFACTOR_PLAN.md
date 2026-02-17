# Super Admin 後端串接：架構分析與執行計畫

## 1. 任務目標

將 9 個 Super Admin 前端頁面中的所有 mock/硬編碼資料，替換為對後端 tRPC API 的真實呼叫，並確保系統穩定性與可維護性。

## 2. 架構分析

### 2.1. 後端 (tRPC)

- **現狀**: `server/routers.ts` 中的 `superAdminRouter` 已包含大部分所需 procedure，例如 `stats`, `listOrganizations`, `listAllUsers`, `getAuditLogs`, `billingStats`, `revenueByMonth`, `planDistribution`, `apiUsageStats` 等。
- **缺口**: 部分前端頁面需要的特定數據（如營收頁面的「模組營收」、「新舊戶 vs 流失率」、「頂級租戶」）目前沒有直接對應的 procedure。
- **策略**: 
    1.  優先利用現有 procedures。
    2.  針對缺少的數據點，在 `superAdminRouter` 中新增專門的 procedure。
    3.  所有資料庫操作將通過 `server/db.ts` 執行，並利用 `drizzle` ORM 和 `pgTable` schema。

### 2.2. 前端 (React + TypeScript)

- **現狀**: 所有 9 個頁面 (`AdminDashboard.tsx`, `AdminLogs.tsx` 等) 皆使用 `useState` 搭配硬編碼的 `mock...` 陣列來模擬資料，並透過 `setTimeout` 模擬非同步載入。
- **缺口**: 未與後端 tRPC 連接，沒有真實的資料流、載入狀態管理和錯誤處理機制。
- **策略**:
    1.  引入 `trpc` client (`client/src/lib/trpc.ts`)。
    2.  在每個頁面元件中，使用 `trpc.superAdmin.[procedureName].useQuery` hook 替換 `useState` 和 `useEffect` 模擬載入的邏輯。
    3.  利用 `useQuery` 回傳的 `data`, `isLoading`, `error` 狀態，無縫接軌現有的 `LoadingSkeleton` 和 `ErrorDisplay` 元件。

### 2.3. 頁面對應 API 清單

| 頁面路徑                | 頁面檔案                  | 主要 Mock Data              | 對應 tRPC Procedure (superAdmin...)     | 執行策略                                       |
| ----------------------- | ------------------------- | --------------------------- | --------------------------------------- | ---------------------------------------------- |
| `/admin`                | `AdminDashboard.tsx`      | `stats`, `monthlyRevenue`   | `stats`, `revenueByMonth`, `planDistribution`, `getAuditLogs` | 直接替換。新增 `tenantGrowthTrend`。           |
| `/admin/logs`           | `AdminLogs.tsx`           | `mockLogs`                  | `getAuditLogs`                          | 替換。為 `getAuditLogs` 增加篩選功能。         |
| `/admin/revenue`        | `AdminRevenue.tsx`        | `mockKpiData`, `mockTopTenants` | `billingStats`, `revenueByMonth`        | 替換。新增 `revenueByModule`, `tenantChurn` 等。 |
| `/admin/system`         | `AdminSystem.tsx`         | `mockSettings`              | `getSystemSettings`, `saveSystemSetting`| 直接替換。                                     |
| `/admin/tenants`        | `AdminTenants.tsx`        | `mockTenants`               | `listOrganizations`                     | 直接替換。                                     |
| `/admin/tenants/:id`    | `AdminTenantDetail.tsx`   | `mockTenant`, `mockUsage`   | `getOrganization`, `getTenantUsage`     | 直接替換。新增 `getTenantUsage`。              |
| `/admin/users`          | `AdminUsers.tsx`          | `mockUsers`                 | `listAllUsers`, `updateUser`            | 直接替換。                                     |
| `/super-admin/api-docs` | `ApiDocsPage.tsx`         | `mockApiKeys`               | `listApiKeys`, `createApiKey`           | 直接替換。                                     |
| `/super-admin/billing`  | `BillingPage.tsx`         | `billingHistory`, `plans`   | `listInvoices`, `listSubscriptions`     | 直接替換。                                     |

## 3. 執行計畫

我將直接進入實作階段，因為這是一個低風險、高回報的重構任務。

1.  **Phase 3: 補齊後端 API** - 在 `server/routers.ts` 和 `server/db.ts` 中，新增上述分析出的缺失 procedures。
2.  **Phase 4: 串接前端頁面** - 逐一修改 9 個前端頁面檔案，移除 mock data，並使用 `trpc.useQuery` 進行串接。
3.  **Phase 5: 驗證與建置** - 執行 `pnpm check` (`tsc --noEmit`) 和 `pnpm build`，確保零錯誤。
4.  **Phase 6: 交付** - 將修改後的代碼 push 到 `main` 分支，並產出最終的修改報告。

此計畫將確保在不破壞現有功能的情況下，高效、安全地完成後端數據串接。
