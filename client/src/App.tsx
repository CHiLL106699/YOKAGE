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
        <Route path="/admin/users">
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminUsersPage />
          </ProtectedRoute>
        </Route>
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
        <Route path="/super-admin" component={SuperAdminDashboard} />
        <Route path="/super-admin/organizations" component={OrganizationsPage} />
        <Route path="/super-admin/organizations/:id" component={OrganizationDetailPage} />
        <Route path="/super-admin/billing" component={BillingPage} />
        <Route path="/super-admin/api-docs" component={ApiDocsPage} />
        <Route path="/super-admin/white-label" component={WhiteLabelPage} />
        <Route path="/super-admin/settings" component={SuperAdminSettingsPage} />
        <Route path="/super-admin/vouchers" component={SuperAdminVouchersPage} />
        <Route path="/super-admin/users" component={SuperAdminUsersPage} />
        <Route path="/super-admin/monitor" component={SuperAdminMonitorPage} />
        <Route path="/super-admin/notifications" component={SuperAdminNotificationsPage} />

        {/* ======== 向後相容：/clinic/* 路由 ======== */}
        <Route path="/clinic" component={ClinicDashboard} />
        <Route path="/clinic/customers" component={CustomersPage} />
        <Route path="/clinic/customers/:id" component={CustomerDetailPage} />
        <Route path="/clinic/appointments" component={AppointmentsPage} />
        <Route path="/clinic/products" component={ProductsPage} />
        <Route path="/clinic/staff" component={StaffPage} />
        <Route path="/clinic/aftercare" component={AftercarePage} />
        <Route path="/clinic/line-settings" component={LineSettingsPage} />
        <Route path="/clinic/schedule" component={SchedulePage} />
        <Route path="/clinic/attendance" component={AttendanceClockPage} />
        <Route path="/clinic/attendance/records" component={AttendanceRecordsListPage} />
        <Route path="/clinic/attendance/dashboard" component={AttendanceDashboardPage} />
        <Route path="/clinic/attendance/approval" component={AttendanceApprovalPage} />
        <Route path="/clinic/coupons" component={CouponsPage} />
        <Route path="/clinic/orders" component={OrdersPage} />
        <Route path="/clinic/reports" component={ReportsPage} />
        <Route path="/clinic/notifications" component={NotificationsPage} />
        <Route path="/clinic/inventory" component={InventoryPage} />
        <Route path="/clinic/line-integration" component={LineIntegrationPage} />
        <Route path="/clinic/payment" component={PaymentPage} />
        <Route path="/clinic/settlement" component={SettlementPage} />
        <Route path="/clinic/marketing" component={CustomerMarketingPage} />
        <Route path="/clinic/payment-settings" component={PaymentSettingsPage} />
        <Route path="/clinic/data-import" component={DataImportPage} />
        <Route path="/clinic/rich-menu" component={RichMenuPage} />
        <Route path="/clinic/line-rich-menu" component={LineRichMenuManagementPage} />
        <Route path="/clinic/leave-request" component={LeaveRequestPage} />
        <Route path="/clinic/leave-approval" component={LeaveApprovalPage} />
        <Route path="/clinic/flex-message" component={FlexMessagePage} />
        <Route path="/clinic/webhook" component={WebhookPage} />
        <Route path="/clinic/analytics" component={AnalyticsPage} />
        <Route path="/clinic/settings" component={SettingsPage} />
        <Route path="/clinic/ai-chatbot" component={AIChatbotPage} />
        <Route path="/clinic/marketing-automation" component={MarketingAutomationPage} />
        <Route path="/clinic/gamification" component={GamificationPage} />
        <Route path="/clinic/member-passport" component={MemberPassportPage} />
        <Route path="/clinic/message-center" component={MessageCenterPage} />
        <Route path="/clinic/customer-marketing" component={CustomerMarketingPage} />
        <Route path="/clinic/social-marketing" component={SocialMarketingPage} />
        <Route path="/clinic/attendance-settings" component={AttendanceSettingsPage} />
        <Route path="/clinic/game-management" component={GameManagementPage} />
        <Route path="/clinic/games/ichiban-kuji" component={IchibanKujiGame} />
        <Route path="/clinic/games/slot-machine" component={SlotMachineGame} />
        <Route path="/clinic/games/pachinko" component={PachinkoGame} />
        <Route path="/clinic/user-prizes" component={UserPrizesPage} />
        <Route path="/clinic/coupon-management" component={CouponManagementPage} />
        <Route path="/clinic/hr-management" component={HRManagementPage} />
        <Route path="/clinic/supplier-management" component={SupplierManagementPage} />
        <Route path="/clinic/review-management" component={ReviewManagementPage} />
        <Route path="/clinic/multi-branch" component={MultiBranchPage} />
        <Route path="/clinic/contract-management" component={ContractManagementPage} />
        <Route path="/clinic/treatment-tracking" component={TreatmentTrackingPage} />
        <Route path="/clinic/recommendation-engine" component={RecommendationEnginePage} />
        <Route path="/clinic/smart-scheduling" component={SmartSchedulingPage} />
        <Route path="/clinic/customer-360" component={Customer360Page} />
        <Route path="/clinic/treatment-records" component={TreatmentRecordsPage} />
        <Route path="/clinic/customer-packages" component={CustomerPackagesPage} />
        <Route path="/clinic/consultation" component={ConsultationManagementPage} />
        <Route path="/clinic/rfm-analysis" component={RFMAnalysisPage} />
        <Route path="/clinic/commission" component={CommissionManagementPage} />
        <Route path="/clinic/commission-allocation" component={CommissionAllocationPage} />
        <Route path="/clinic/intelligent-scheduling" component={IntelligentSchedulingPage} />
        <Route path="/clinic/prize-records" component={PrizeRecordsPage} />
        <Route path="/clinic/satisfaction" component={SatisfactionSurveyPage} />
        <Route path="/clinic/attendance-tracking" component={AttendanceTrackingPage} />
        <Route path="/clinic/inventory-cost" component={InventoryCostPage} />
        <Route path="/clinic/revenue-target" component={RevenueTargetPage} />
        <Route path="/clinic/customer-source-roi" component={CustomerSourceROIPage} />
        <Route path="/clinic/injection-mapping" component={InjectionMappingPage} />
        <Route path="/clinic/consent-form" component={ConsentFormPage} />
        <Route path="/clinic/prescription" component={PrescriptionPage} />
        <Route path="/clinic/skin-analysis" component={SkinAnalysisPage} />
        <Route path="/clinic/subscription" component={SubscriptionPage} />
        <Route path="/clinic/teleconsult" component={TeleconsultPage} />
        <Route path="/clinic/referral" component={ReferralPage} />
        <Route path="/clinic/social-integration" component={SocialIntegrationPage} />
        <Route path="/clinic/vouchers" component={VouchersPage} />
        <Route path="/clinic/voucher-redemption" component={VoucherRedemptionPage} />
        <Route path="/clinic/voucher-reports" component={VoucherReportsPage} />

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
