# 架構分析與 API 串接計畫

**作者**: Manus AI
**日期**: 2026-02-17

## 1. 專案目標

本次任務目標是針對 `YOKAGE` 專案中 17 個指定的診所管理頁面，進行全面的後端 API 串接，將所有前端的 mock data（硬編碼資料）替換為對 tRPC API 的真實呼叫。同時，需要為串接的頁面加入適當的 Loading (載入中) 與 Error (錯誤處理) 狀態，確保使用者體驗的流暢性與健壯性。

## 2. 現有架構分析

在 Clone 專案並進行全面分析後，我們對現有架構的理解如下：

### 2.1. 後端 (tRPC)

- **tRPC 核心**: 專案採用 tRPC 作為 API 層，核心設定位於 `server/_core/trpc.ts`，定義了 `publicProcedure`、`protectedProcedure` 與 `adminProcedure`，確保了 API 的存取控制。
- **Router 結構**: 主要的 Router 聚合檔案為 `server/routers.ts`。此檔案匯集了大量的 router 模組。目前存在一個扁平化的 router 結構 (例如 `customerRouter`, `inventoryRouter`)，同時也正在導入一個新的三層式結構 (`core`, `pro`, `lineEnhanced`)。為了維持一致性與向後相容，本次開發將優先擴充現有的扁平化 router。
- **資料庫 (Drizzle ORM)**: 專案使用 Drizzle ORM 與 PostgreSQL 互動。主要的 schema 定義在 `drizzle/schema.ts`，這是一個非常龐大的檔案，定義了系統絕大多數的資料表。此外，`drizzle/` 目錄下還有針對特定功能的 schema 檔案。所有的資料庫操作邏輯被封裝在 `server/db.ts` 檔案中。

### 2.2. 前端 (React + Vite)

- **頁面元件**: 專案的前端頁面位於 `client/src/pages/`。本次需要修改的 17 個頁面均在此目錄或其子目錄下。
- **tRPC 客戶端**: tRPC 客戶端實例在 `client/src/lib/trpc.ts` 中建立，並提供 `trpc` 物件供前端元件使用，透過 `trpc.xxx.useQuery` 和 `trpc.xxx.useMutation` hooks 來呼叫後端 API。
- **UI 元件庫**: 專案已建立一套 UI 元件，位於 `client/src/components/ui/`。其中，`skeleton.tsx`、`skeleton-table.tsx` 和 `query-state.tsx` 提供了實現 Loading 與 Error 狀態所需的基本元件，應在 API 串接時加以利用。

## 3. Gap Analysis (差距分析)

透過對 17 個目標頁面與後端 router 的交叉比對，我們識別出現有 API 與前端需求之間的差距。

| 前端頁面 (Component) | 需要的 Router | 現有 Router | 現有 Procedures | 差距分析 & 執行策略 |
| :--- | :--- | :--- | :--- | :--- |
| `FlexMessagePage.tsx` | `flexMessage` | **不存在** | N/A | **需新建** `flexMessageRouter`，包含 `list`, `create`, `update`, `delete`, `sendTest` procedures。 |
| `InventoryPage.tsx` | `inventory` | `inventoryRouter` | `listTransactions`, `createTransaction`, `getCostAnalysis`, `getGrossMargin` | **需擴充** `inventoryRouter`，新增 `listItems`, `getStats`, `updateItem` procedures。 |
| `LineIntegrationPage.tsx` | `lineIntegration` | `lineSettingsRouter`, `lineMessagingRouter` | `getStatus`, `saveConfig`, `verifyChannel`, `sendMessage` 等 | **需新建** `lineIntegrationRouter` 作為 Facade，整合 `lineSettings` 和 `lineMessaging` 的功能，並新增 `listRichMenus`, `listLiffApps` procedures。 |
| `NotificationsPage.tsx` | `notification` | `notificationRouter` | `sendNotification`, `getNotificationLog`, `updateNotificationSettings`, `getNotificationSettings` | **需擴充** `notificationRouter`，新增 `listTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate`, `getStats` procedures。 |
| `PaymentPage.tsx` | `payment`, `order` | `paymentRouter`, `orderRouter` | `createPayment`, `verifyPayment`, `getTransactions`, `list` (order) | **需擴充** `paymentRouter`，新增 `getPendingOrders` procedure。 |
| `RichMenuPage.tsx` | `richMenu` | `richMenuRouter` | `list`, `getById`, `create`, `update`, `delete`, `assignToCustomer` | **需擴充** `richMenuRouter`，新增 `updateStatus` 和 `duplicate` procedures。 |
| `WebhookPage.tsx` | `webhook` | `lineWebhookRouter` | `processWebhookEvent`, `listEvents` | **需新建** `webhookRouter` 用於通用 Webhook 管理，包含 `listRules`, `createRule`, `updateRule`, `deleteRule`, `getLogs`, `getStats`。`lineWebhookRouter` 專用於接收 LINE 事件。 |
| `DashboardHome.tsx` | `dashboard` | `clinicRouter` | `stats` | **需新建** `dashboardRouter`，提供更全面的儀表板數據，如 `getOverviewStats`, `getRevenueChart`, `getRecentActivities`。 |
| `DashboardAppointments.tsx` | `appointment` | `appointmentRouter` | `list`, `get`, `create`, `update` | 現有 router 已滿足基本需求，可直接串接。 |
| `DashboardCustomers.tsx` | `customer` | `customerRouter` | `list`, `get`, `create`, `update`, `delete` | 現有 router 已滿足基本需求，可直接串接。 |
| `HrDashboard.tsx` | `staff`, `attendance` | `staffRouter`, `attendanceRouter` | `list` (staff), `clockIn`, `getMonthlySummary` (attendance) | **需擴充** `staffRouter` 新增 `getStats` procedure。`attendanceRouter` 已有部分功能，可直接使用。Payroll 功能超出本次範圍。 |
| `DashboardMarketing.tsx` | `broadcast`, `marketing` | `broadcastRouter`, `marketingRouter` | `list` (broadcast), `listCampaigns` | **需擴充** `marketingRouter`，新增 `getStats` 和管理 `segments` 的 procedures。 |
| `MultiBranchDashboard.tsx` | `branch` | `organizationRouter` | `current`, `list` | **需新建** `branchRouter` (或擴充 `organizationRouter`)，專門處理多分支機構的數據統計與查詢，如 `listBranches`, `getBranchStats`。 |
| `DashboardReports.tsx` | `reports` | `reportRouter` | `revenue`, `appointmentStats`, `customerStats` | **需擴充** `reportRouter`，新增 `listGeneratedReports` 和 `exportReport` procedures。 |
| `DashboardSchedule.tsx` | `schedule`, `staff` | `scheduleRouter`, `staffRouter` | `list` (schedule), `create` (schedule), `list` (staff) | 現有 router 已滿足基本需求，可直接串接。 |
| `DashboardSettings.tsx` | `clinicSettings` | `settingsRouter` | `get`, `list`, `create`, `update` | **需新建** `clinicSettingsRouter`，專門處理診所營業時間、服務項目等設定，現有 `settingsRouter` 較為通用。 |
| `DashboardStaff.tsx` | `staff` | `staffRouter` | `list`, `get`, `create`, `update` | **需擴充** `staffRouter`，新增 `getStats` procedure。 |

## 4. 執行計畫

基於以上分析，我將遵循「文檔驅動開發」的原則，在獲得您的批准後，按以下階段執行：

1.  **Phase 3: 後端開發 (Schema & Router)**
    -   根據上表的 Gap Analysis，為所有需要新建或擴充的 Router 建立對應的 Drizzle Schema (如果需要) 與 tRPC procedures。
    -   所有新建的 procedure 將先以返回 mock data 的形式完成，以定義 API 的輸入輸出契約。
    -   完成後，將提交一個包含所有後端變更的 PR 供您檢視。

2.  **Phase 4: 前端串接**
    -   在後端 API 契約確立後，將開始並行處理 17 個前端頁面的修改。
    -   使用 `trpc.xxx.useQuery` 和 `trpc.xxx.useMutation` hooks 替換所有 mock data。
    -   使用已有的 `QueryLoading` 和 `QueryError` 元件（或 `SkeletonTable`）來處理頁面的載入中與錯誤狀態。

3.  **Phase 5: 驗證與交付**
    -   確保 `tsc --noEmit` 檢查無任何 TypeScript 錯誤。
    -   執行 `pnpm build` 確保專案可以成功建置。
    -   將所有變更 push 到 `main` 分支。
    -   產出最終的修改報告 `PHASE1_CLINIC_REPORT.md`。

請檢視此架構分析與執行計畫。若您批准，我將立即開始 Phase 3 的後端開發工作。
