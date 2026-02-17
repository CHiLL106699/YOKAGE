import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// ============================================
// Lazy-loaded page components (Code Splitting)
// ============================================

// === 公開頁面 ===
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

// === Sprint 2: 超級管理員平台 (/admin/*) — 新頁面 ===
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTenants = React.lazy(() => import("./pages/admin/AdminTenants"));
const AdminTenantDetail = React.lazy(() => import("./pages/admin/AdminTenantDetail"));
const AdminRevenue = React.lazy(() => import("./pages/admin/AdminRevenue"));
const AdminUsers = React.lazy(() => import("./pages/admin/AdminUsers"));
const AdminSystem = React.lazy(() => import("./pages/admin/AdminSystem"));
const AdminLogs = React.lazy(() => import("./pages/admin/AdminLogs"));
const AdminUpgradeRequests = React.lazy(() => import("./pages/admin/AdminUpgradeRequests"));
const AdminProducts = React.lazy(() => import("./pages/admin/AdminProducts"));

// === Sprint 2: 租戶管理平台 (/dashboard/*) — 新頁面 ===
const DashboardAppointments = React.lazy(() => import("./pages/dashboard/DashboardAppointments"));
const DashboardCustomers = React.lazy(() => import("./pages/dashboard/DashboardCustomers"));
const DashboardStaff = React.lazy(() => import("./pages/dashboard/DashboardStaff"));
const DashboardSchedule = React.lazy(() => import("./pages/dashboard/DashboardSchedule"));
const DashboardInventory = React.lazy(() => import("./pages/dashboard/DashboardInventory"));
const DashboardMarketing = React.lazy(() => import("./pages/dashboard/DashboardMarketing"));
const DashboardGamification = React.lazy(() => import("./pages/dashboard/DashboardGamification"));
const DashboardReports = React.lazy(() => import("./pages/dashboard/DashboardReports"));
const DashboardSettings = React.lazy(() => import("./pages/dashboard/DashboardSettings"));

// === Super Admin (/admin/*) — 原有頁面 ===
const SuperAdminDashboard = React.lazy(() => import("./pages/SuperAdminDashboard"));
const OrganizationsPage = React.lazy(() => import("./pages/OrganizationsPage"));
const OrganizationDetailPage = React.lazy(() => import("./pages/OrganizationDetailPage"));
const SuperAdminSettingsPage = React.lazy(() => import("@/pages/SuperAdminSettingsPage"));
const SuperAdminVouchersPage = React.lazy(() => import("@/pages/SuperAdminVouchersPage"));
const SuperAdminUsersPage = React.lazy(() => import("@/pages/SuperAdminUsersPage"));
const SuperAdminMonitorPage = React.lazy(() => import("@/pages/SuperAdminMonitorPage"));
const SuperAdminNotificationsPage = React.lazy(() => import("@/pages/SuperAdminNotificationsPage"));
const SuperAdminBillingPage = React.lazy(() => import("@/pages/SuperAdminBillingPage"));
const SuperAdminApiDocsPage = React.lazy(() => import("@/pages/SuperAdminApiDocsPage"));
const SuperAdminWhiteLabelPage = React.lazy(() => import("@/pages/SuperAdminWhiteLabelPage"));

// === 租戶管理平台 (/dashboard/*) ===
const DashboardHome = React.lazy(() => import("@/pages/dashboard/DashboardHome"));
const InventoryDashboard = React.lazy(() => import("@/pages/dashboard/InventoryDashboard"));
const LineCrmDashboard = React.lazy(() => import("@/pages/dashboard/LineCrmDashboard"));
const BiDashboard = React.lazy(() => import("@/pages/dashboard/BiDashboard"));
const GamificationDashboard = React.lazy(() => import("@/pages/dashboard/GamificationDashboard"));
const HrDashboard = React.lazy(() => import("@/pages/dashboard/HrDashboard"));
const MultiBranchDashboard = React.lazy(() => import("@/pages/dashboard/MultiBranchDashboard"));
const CrmTagManagement = React.lazy(() => import("@/pages/dashboard/CrmTagManagement"));
const TagRulesManagement = React.lazy(() => import("@/pages/dashboard/TagRulesManagement"));
const LineWebhookManagement = React.lazy(() => import("@/pages/dashboard/LineWebhookManagement").then(m => ({ default: m.LineWebhookManagement })));
const RichMenuManagement = React.lazy(() => import("@/pages/dashboard/RichMenuManagement"));
const BroadcastCampaigns = React.lazy(() => import("@/pages/dashboard/BroadcastCampaigns"));
const AiChatbotSettings = React.lazy(() => import("@/pages/dashboard/AiChatbotSettings"));
const RichMenuTemplateMarket = React.lazy(() => import("@/pages/dashboard/RichMenuTemplateMarket"));

// === Clinic Admin (向後相容，保留 /clinic/* 路由) ===
const ClinicDashboard = React.lazy(() => import("./pages/ClinicDashboard"));
const CustomersPage = React.lazy(() => import("./pages/CustomersPage"));
const CustomerDetailPage = React.lazy(() => import("./pages/CustomerDetailPage"));
const AppointmentsPage = React.lazy(() => import("./pages/AppointmentsPage"));
const ProductsPage = React.lazy(() => import("./pages/ProductsPage"));
const StaffPage = React.lazy(() => import("./pages/StaffPage"));
const AftercarePage = React.lazy(() => import("./pages/AftercarePage"));
const LineSettingsPage = React.lazy(() => import("@/pages/LineSettingsPage"));
const SchedulePage = React.lazy(() => import("@/pages/SchedulePage"));
const AttendanceClockPage = React.lazy(() => import("@/pages/AttendanceClockPage"));
const AttendanceRecordsListPage = React.lazy(() => import("@/pages/AttendanceRecordsListPage"));
const AttendanceDashboardPage = React.lazy(() => import("@/pages/AttendanceDashboardPage"));
const AttendanceApprovalPage = React.lazy(() => import("@/pages/AttendanceApprovalPage"));
const CouponsPage = React.lazy(() => import("@/pages/CouponsPage"));
const OrdersPage = React.lazy(() => import("@/pages/OrdersPage"));
const ReportsPage = React.lazy(() => import("@/pages/ReportsPage"));
const NotificationsPage = React.lazy(() => import("@/pages/NotificationsPage"));
const InventoryPage = React.lazy(() => import("@/pages/InventoryPage"));
const LineIntegrationPage = React.lazy(() => import("@/pages/LineIntegrationPage"));
const PaymentPage = React.lazy(() => import("@/pages/PaymentPage"));
const RichMenuPage = React.lazy(() => import("@/pages/RichMenuPage"));
const FlexMessagePage = React.lazy(() => import("@/pages/FlexMessagePage"));
const LineRichMenuManagementPage = React.lazy(() => import("@/pages/LineRichMenuManagementPage"));
const LeaveRequestPage = React.lazy(() => import("@/pages/LeaveRequestPage"));
const LeaveApprovalPage = React.lazy(() => import("@/pages/LeaveApprovalPage"));
const WebhookPage = React.lazy(() => import("@/pages/WebhookPage"));
const SettlementPage = React.lazy(() => import("@/pages/SettlementPage"));
const CustomerMarketingPage = React.lazy(() => import("@/pages/CustomerMarketingPage"));
const PaymentSettingsPage = React.lazy(() => import("@/pages/PaymentSettingsPage"));
const DataImportPage = React.lazy(() => import("@/pages/DataImportPage"));
const AnalyticsPage = React.lazy(() => import("@/pages/AnalyticsPage"));
const SettingsPage = React.lazy(() => import("@/pages/SettingsPage"));

// === LIFF 顧客端 ===
const LiffBookingPage = React.lazy(() => import("@/pages/LiffBookingPage"));
const LiffMemberPage = React.lazy(() => import("@/pages/LiffMemberPage"));
const LiffShopPage = React.lazy(() => import("@/pages/LiffShopPage"));
const LiffCartPage = React.lazy(() => import("@/pages/LiffCartPage"));
const LiffCheckoutPage = React.lazy(() => import("@/pages/LiffCheckoutPage"));
const LiffOrdersPage = React.lazy(() => import("@/pages/LiffOrdersPage"));
const LiffOrderDetailPage = React.lazy(() => import("@/pages/LiffOrderDetailPage"));

// === LIFF 員工端 ===
const LiffStaffClockPage = React.lazy(() => import("@/pages/LiffStaffClockPage"));
const LiffStaffTasksPage = React.lazy(() => import("@/pages/LiffStaffTasksPage"));
const LiffStaffSchedulePage = React.lazy(() => import("@/pages/LiffStaffSchedulePage"));
const LiffStaffLeavePage = React.lazy(() => import("@/pages/LiffStaffLeavePage"));

// === 進階功能頁面 ===
const AIChatbotPage = React.lazy(() => import("@/pages/AIChatbotPage"));
const MarketingAutomationPage = React.lazy(() => import("@/pages/MarketingAutomationPage"));
const GamificationPage = React.lazy(() => import("@/pages/GamificationPage"));
const MemberPassportPage = React.lazy(() => import("@/pages/MemberPassportPage"));
const MessageCenterPage = React.lazy(() => import("@/pages/MessageCenterPage"));
const SocialMarketingPage = React.lazy(() => import("@/pages/SocialMarketingPage"));
const HRManagementPage = React.lazy(() => import("@/pages/HRManagementPage"));
const SupplierManagementPage = React.lazy(() => import("@/pages/SupplierManagementPage"));
const ReviewManagementPage = React.lazy(() => import("@/pages/ReviewManagementPage"));
const MultiBranchPage = React.lazy(() => import("@/pages/MultiBranchPage"));
const ContractManagementPage = React.lazy(() => import("@/pages/ContractManagementPage"));
const TreatmentTrackingPage = React.lazy(() => import("@/pages/TreatmentTrackingPage"));
const RecommendationEnginePage = React.lazy(() => import("@/pages/RecommendationEnginePage"));
const SmartSchedulingPage = React.lazy(() => import("@/pages/SmartSchedulingPage"));
const Customer360Page = React.lazy(() => import("@/pages/Customer360Page"));
const TreatmentRecordsPage = React.lazy(() => import("@/pages/TreatmentRecordsPage"));
const CustomerPackagesPage = React.lazy(() => import("@/pages/CustomerPackagesPage"));
const ConsultationManagementPage = React.lazy(() => import("@/pages/ConsultationManagementPage"));
const RFMAnalysisPage = React.lazy(() => import("@/pages/RFMAnalysisPage"));
const CommissionManagementPage = React.lazy(() => import("@/pages/CommissionManagementPage"));
const CommissionAllocationPage = React.lazy(() => import("@/pages/CommissionAllocationPage"));
const IntelligentSchedulingPage = React.lazy(() => import("@/pages/IntelligentSchedulingPage"));
const PrizeRecordsPage = React.lazy(() => import("@/pages/PrizeRecordsPage"));
const SatisfactionSurveyPage = React.lazy(() => import("@/pages/SatisfactionSurveyPage"));
const AttendanceTrackingPage = React.lazy(() => import("@/pages/AttendanceTrackingPage"));
const InventoryCostPage = React.lazy(() => import("@/pages/InventoryCostPage"));
const RevenueTargetPage = React.lazy(() => import("@/pages/RevenueTargetPage"));
const CustomerSourceROIPage = React.lazy(() => import("@/pages/CustomerSourceROIPage"));
const InjectionMappingPage = React.lazy(() => import("@/pages/InjectionMappingPage"));
const ConsentFormPage = React.lazy(() => import("@/pages/ConsentFormPage"));
const PrescriptionPage = React.lazy(() => import("@/pages/PrescriptionPage"));
const SkinAnalysisPage = React.lazy(() => import("@/pages/SkinAnalysisPage"));
const SubscriptionPage = React.lazy(() => import("@/pages/SubscriptionPage"));
const TeleconsultPage = React.lazy(() => import("@/pages/TeleconsultPage"));
const ReferralPage = React.lazy(() => import("@/pages/ReferralPage"));
const SocialIntegrationPage = React.lazy(() => import("@/pages/SocialIntegrationPage"));
const VouchersPage = React.lazy(() => import("@/pages/VouchersPage"));
const MyVouchersPage = React.lazy(() => import("@/pages/liff/MyVouchersPage"));
const VoucherRedemptionPage = React.lazy(() => import("@/pages/VoucherRedemptionPage"));
const VoucherReportsPage = React.lazy(() => import("@/pages/VoucherReportsPage"));
const AttendanceSettingsPage = React.lazy(() => import("@/pages/AttendanceSettingsPage"));
const GameManagementPage = React.lazy(() => import("@/pages/GameManagementPage"));
const IchibanKujiGame = React.lazy(() => import("@/pages/IchibanKujiGame"));
const SlotMachineGame = React.lazy(() => import("@/pages/SlotMachineGame"));
const PachinkoGame = React.lazy(() => import("@/pages/PachinkoGame"));
const UserPrizesPage = React.lazy(() => import("@/pages/UserPrizesPage"));
const CouponManagementPage = React.lazy(() => import("@/pages/CouponManagementPage"));
const BillingPage = React.lazy(() => import("@/pages/BillingPage"));
const ApiDocsPage = React.lazy(() => import("@/pages/ApiDocsPage"));
const WhiteLabelPage = React.lazy(() => import("@/pages/WhiteLabelPage"));

// === 員工平台 (/staff/*) ===
const StaffHomePage = React.lazy(() => import("@/pages/staff/StaffHome"));
const StaffSchedulePage = React.lazy(() => import("@/pages/staff/StaffSchedule"));
const StaffAppointmentsPage = React.lazy(() => import("@/pages/staff/StaffAppointments"));
const StaffClockPage = React.lazy(() => import("@/pages/staff/StaffClock"));
const StaffCustomersPage = React.lazy(() => import("@/pages/staff/StaffCustomers"));
const StaffPerformancePage = React.lazy(() => import("@/pages/staff/StaffPerformance"));
// === Sprint 5: FLOS 功能整合 ===
const ConsentTemplatePage = React.lazy(() => import("@/pages/dashboard/ConsentTemplatePage"));
const ConsentSignPage = React.lazy(() => import("@/pages/dashboard/ConsentSignPage"));
const ConsentRecordsPage = React.lazy(() => import("@/pages/dashboard/ConsentRecordsPage"));
const EmrListPage = React.lazy(() => import("@/pages/dashboard/EmrListPage"));
const EmrDetailPage = React.lazy(() => import("@/pages/dashboard/EmrDetailPage"));
const EmrFormPage = React.lazy(() => import("@/pages/dashboard/EmrFormPage"));
const StaffClockEnhanced = React.lazy(() => import("@/pages/staff/StaffClockEnhanced"));
const AttendanceCalendarPage = React.lazy(() => import("@/pages/staff/AttendanceCalendarPage"));
const AttendanceRequestPage = React.lazy(() => import("@/pages/staff/AttendanceRequestPage"));

// ============================================
// Loading Fallback
// ============================================
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* ======== 公開路由 ======== */}
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />

        {/* ======== /admin/* — 超級管理員平台 (Sprint 2 新路由) ======== */}
        <Route path="/admin">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/tenants">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminTenants />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/tenants/:id">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminTenantDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/revenue">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminRevenue />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/users">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/system">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminSystem />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/logs">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminLogs />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/upgrades">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminUpgradeRequests />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/products">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminProducts />
          </ProtectedRoute>
        </Route>

        {/* ======== /admin/* — 超級管理員平台 (原有路由保留) ======== */}
        <Route path="/admin/organizations">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <OrganizationsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/organizations/:id">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <OrganizationDetailPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/settings">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminSettingsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/vouchers">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminVouchersPage />
          </ProtectedRoute>
        </Route>
        {/* SuperAdminUsersPage 已合併至 AdminUsers，避免 /admin/users 路由重複 */}
        <Route path="/admin/monitor">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminMonitorPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/notifications">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminNotificationsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/billing">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminBillingPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/api-docs">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminApiDocsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/white-label">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminWhiteLabelPage />
          </ProtectedRoute>
        </Route>

        {/* ======== /dashboard/* — 租戶管理平台 (Sprint 2 新路由) ======== */}
        <Route path="/dashboard">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardHome />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/appointments">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardAppointments />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/customers">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardCustomers />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/staff">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardStaff />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/schedule">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardSchedule />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/marketing">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardMarketing />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/reports">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardReports />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/settings">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <DashboardSettings />
          </ProtectedRoute>
        </Route>

        {/* ======== /dashboard/* — 租戶管理平台 (原有路由保留) ======== */}
        <Route path="/dashboard/inventory">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <InventoryDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/crm">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <LineCrmDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/crm/tags">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <CrmTagManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/crm/tag-rules">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <TagRulesManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/line-webhook">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <LineWebhookManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/rich-menu">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <RichMenuManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/rich-menu/market">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <RichMenuTemplateMarket />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/broadcast">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <BroadcastCampaigns />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/ai-chatbot">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <AiChatbotSettings />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/bi">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <BiDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/gamification">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <GamificationDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/hr">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <HrDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/multi-branch">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <MultiBranchDashboard />
          </ProtectedRoute>
        </Route>

        {/* ======== Sprint 5: 知情同意書 & EMR (/dashboard/*) ======== */}
        <Route path="/dashboard/consent-templates">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <ConsentTemplatePage />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/consent-sign">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <ConsentSignPage />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/consent-records">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <ConsentRecordsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/emr">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <EmrListPage />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/emr/new">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <EmrFormPage />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/emr/edit/:id">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <EmrFormPage />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard/emr/:id">
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <EmrDetailPage />
          </ProtectedRoute>
        </Route>
        {/* ======== /staff/* — 員工平台 ======== */}
        <Route path="/staff">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <StaffHomePage />
          </ProtectedRoute>
        </Route>
        <Route path="/staff/schedule">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <StaffSchedulePage />
          </ProtectedRoute>
        </Route>
        <Route path="/staff/appointments">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <StaffAppointmentsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/staff/clock">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <StaffClockPage />
          </ProtectedRoute>
        </Route>
        <Route path="/staff/customers">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <StaffCustomersPage />
          </ProtectedRoute>
        </Route>
        <Route path="/staff/performance">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <StaffPerformancePage />
          </ProtectedRoute>
        </Route>
        {/* ======== Sprint 5: 智慧打卡系統強化 ======== */}
        <Route path="/staff/clock-enhanced">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <StaffClockEnhanced />
          </ProtectedRoute>
        </Route>
        <Route path="/staff/attendance">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <AttendanceCalendarPage />
          </ProtectedRoute>
        </Route>
        <Route path="/staff/attendance-request">
          <ProtectedRoute allowedRoles={["super_admin", "admin", "staff"]}>
            <AttendanceRequestPage />
          </ProtectedRoute>
        </Route>
        {/* ======== 向後相容：/super-admin/* (重導至 /admin/*) ======== */}
        <Route path="/super-admin">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/organizations">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <OrganizationsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/organizations/:id">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <OrganizationDetailPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/billing">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <BillingPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/api-docs">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <ApiDocsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/white-label">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <WhiteLabelPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/settings">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminSettingsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/vouchers">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminVouchersPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/users">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminUsersPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/monitor">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminMonitorPage />
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin/notifications">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminNotificationsPage />
          </ProtectedRoute>
        </Route>

        {/* ======== 向後相容：/clinic/* 路由 ======== */}
        <Route path="/clinic"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ClinicDashboard /></ProtectedRoute></Route>
        <Route path="/clinic/customers"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CustomersPage /></ProtectedRoute></Route>
        <Route path="/clinic/customers/:id"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CustomerDetailPage /></ProtectedRoute></Route>
        <Route path="/clinic/appointments"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AppointmentsPage /></ProtectedRoute></Route>
        <Route path="/clinic/products"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ProductsPage /></ProtectedRoute></Route>
        <Route path="/clinic/staff"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><StaffPage /></ProtectedRoute></Route>
        <Route path="/clinic/aftercare"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AftercarePage /></ProtectedRoute></Route>
        <Route path="/clinic/line-settings"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><LineSettingsPage /></ProtectedRoute></Route>
        <Route path="/clinic/schedule"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SchedulePage /></ProtectedRoute></Route>
        <Route path="/clinic/attendance"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AttendanceClockPage /></ProtectedRoute></Route>
        <Route path="/clinic/attendance/records"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AttendanceRecordsListPage /></ProtectedRoute></Route>
        <Route path="/clinic/attendance/dashboard"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AttendanceDashboardPage /></ProtectedRoute></Route>
        <Route path="/clinic/attendance/approval"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AttendanceApprovalPage /></ProtectedRoute></Route>
        <Route path="/clinic/coupons"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CouponsPage /></ProtectedRoute></Route>
        <Route path="/clinic/orders"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><OrdersPage /></ProtectedRoute></Route>
        <Route path="/clinic/reports"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ReportsPage /></ProtectedRoute></Route>
        <Route path="/clinic/notifications"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><NotificationsPage /></ProtectedRoute></Route>
        <Route path="/clinic/inventory"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><InventoryPage /></ProtectedRoute></Route>
        <Route path="/clinic/line-integration"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><LineIntegrationPage /></ProtectedRoute></Route>
        <Route path="/clinic/payment"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><PaymentPage /></ProtectedRoute></Route>
        <Route path="/clinic/settlement"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SettlementPage /></ProtectedRoute></Route>
        <Route path="/clinic/marketing"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CustomerMarketingPage /></ProtectedRoute></Route>
        <Route path="/clinic/payment-settings"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><PaymentSettingsPage /></ProtectedRoute></Route>
        <Route path="/clinic/data-import"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><DataImportPage /></ProtectedRoute></Route>
        <Route path="/clinic/rich-menu"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><RichMenuPage /></ProtectedRoute></Route>
        <Route path="/clinic/line-rich-menu"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><LineRichMenuManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/leave-request"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><LeaveRequestPage /></ProtectedRoute></Route>
        <Route path="/clinic/leave-approval"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><LeaveApprovalPage /></ProtectedRoute></Route>
        <Route path="/clinic/flex-message"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><FlexMessagePage /></ProtectedRoute></Route>
        <Route path="/clinic/webhook"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><WebhookPage /></ProtectedRoute></Route>
        <Route path="/clinic/analytics"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AnalyticsPage /></ProtectedRoute></Route>
        <Route path="/clinic/settings"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SettingsPage /></ProtectedRoute></Route>
        <Route path="/clinic/ai-chatbot"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AIChatbotPage /></ProtectedRoute></Route>
        <Route path="/clinic/marketing-automation"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><MarketingAutomationPage /></ProtectedRoute></Route>
        <Route path="/clinic/gamification"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><GamificationPage /></ProtectedRoute></Route>
        <Route path="/clinic/member-passport"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><MemberPassportPage /></ProtectedRoute></Route>
        <Route path="/clinic/message-center"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><MessageCenterPage /></ProtectedRoute></Route>
        <Route path="/clinic/customer-marketing"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CustomerMarketingPage /></ProtectedRoute></Route>
        <Route path="/clinic/social-marketing"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SocialMarketingPage /></ProtectedRoute></Route>
        <Route path="/clinic/attendance-settings"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AttendanceSettingsPage /></ProtectedRoute></Route>
        <Route path="/clinic/game-management"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><GameManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/games/ichiban-kuji"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><IchibanKujiGame /></ProtectedRoute></Route>
        <Route path="/clinic/games/slot-machine"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SlotMachineGame /></ProtectedRoute></Route>
        <Route path="/clinic/games/pachinko"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><PachinkoGame /></ProtectedRoute></Route>
        <Route path="/clinic/user-prizes"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><UserPrizesPage /></ProtectedRoute></Route>
        <Route path="/clinic/coupon-management"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CouponManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/hr-management"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><HRManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/supplier-management"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SupplierManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/review-management"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ReviewManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/multi-branch"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><MultiBranchPage /></ProtectedRoute></Route>
        <Route path="/clinic/contract-management"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ContractManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/treatment-tracking"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><TreatmentTrackingPage /></ProtectedRoute></Route>
        <Route path="/clinic/recommendation-engine"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><RecommendationEnginePage /></ProtectedRoute></Route>
        <Route path="/clinic/smart-scheduling"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SmartSchedulingPage /></ProtectedRoute></Route>
        <Route path="/clinic/customer-360"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><Customer360Page /></ProtectedRoute></Route>
        <Route path="/clinic/treatment-records"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><TreatmentRecordsPage /></ProtectedRoute></Route>
        <Route path="/clinic/customer-packages"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CustomerPackagesPage /></ProtectedRoute></Route>
        <Route path="/clinic/consultation"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ConsultationManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/rfm-analysis"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><RFMAnalysisPage /></ProtectedRoute></Route>
        <Route path="/clinic/commission"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CommissionManagementPage /></ProtectedRoute></Route>
        <Route path="/clinic/commission-allocation"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CommissionAllocationPage /></ProtectedRoute></Route>
        <Route path="/clinic/intelligent-scheduling"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><IntelligentSchedulingPage /></ProtectedRoute></Route>
        <Route path="/clinic/prize-records"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><PrizeRecordsPage /></ProtectedRoute></Route>
        <Route path="/clinic/satisfaction"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SatisfactionSurveyPage /></ProtectedRoute></Route>
        <Route path="/clinic/attendance-tracking"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><AttendanceTrackingPage /></ProtectedRoute></Route>
        <Route path="/clinic/inventory-cost"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><InventoryCostPage /></ProtectedRoute></Route>
        <Route path="/clinic/revenue-target"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><RevenueTargetPage /></ProtectedRoute></Route>
        <Route path="/clinic/customer-source-roi"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><CustomerSourceROIPage /></ProtectedRoute></Route>
        <Route path="/clinic/injection-mapping"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><InjectionMappingPage /></ProtectedRoute></Route>
        <Route path="/clinic/consent-form"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ConsentFormPage /></ProtectedRoute></Route>
        <Route path="/clinic/prescription"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><PrescriptionPage /></ProtectedRoute></Route>
        <Route path="/clinic/skin-analysis"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SkinAnalysisPage /></ProtectedRoute></Route>
        <Route path="/clinic/subscription"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SubscriptionPage /></ProtectedRoute></Route>
        <Route path="/clinic/teleconsult"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><TeleconsultPage /></ProtectedRoute></Route>
        <Route path="/clinic/referral"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><ReferralPage /></ProtectedRoute></Route>
        <Route path="/clinic/social-integration"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><SocialIntegrationPage /></ProtectedRoute></Route>
        <Route path="/clinic/vouchers"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><VouchersPage /></ProtectedRoute></Route>
        <Route path="/clinic/voucher-redemption"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><VoucherRedemptionPage /></ProtectedRoute></Route>
        <Route path="/clinic/voucher-reports"><ProtectedRoute allowedRoles={["super_admin", "admin"]}><VoucherReportsPage /></ProtectedRoute></Route>

        {/* ======== LIFF 路由 ======== */}
        <Route path="/liff/booking" component={LiffBookingPage} />
        <Route path="/liff/member" component={LiffMemberPage} />
        <Route path="/liff/shop" component={LiffShopPage} />
        <Route path="/liff/cart" component={LiffCartPage} />
        <Route path="/liff/checkout" component={LiffCheckoutPage} />
        <Route path="/liff/orders" component={LiffOrdersPage} />
        <Route path="/liff/orders/:id" component={LiffOrderDetailPage} />
        <Route path="/liff/staff/clock" component={LiffStaffClockPage} />
        <Route path="/liff/staff/tasks" component={LiffStaffTasksPage} />
        <Route path="/liff/staff/schedule" component={LiffStaffSchedulePage} />
        <Route path="/liff/staff/leave" component={LiffStaffLeavePage} />
        <Route path="/liff/my-vouchers" component={MyVouchersPage} />

        {/* ======== 404 ======== */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
