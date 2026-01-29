import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import OrganizationsPage from "./pages/OrganizationsPage";
import OrganizationDetailPage from "./pages/OrganizationDetailPage";
import ClinicDashboard from "./pages/ClinicDashboard";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProductsPage from "./pages/ProductsPage";
import StaffPage from "./pages/StaffPage";
import AftercarePage from "./pages/AftercarePage";
import LineSettingsPage from "@/pages/LineSettingsPage";
import SchedulePage from "@/pages/SchedulePage";
import AttendancePage from "@/pages/AttendancePage";
import CouponsPage from "@/pages/CouponsPage";
import OrdersPage from "@/pages/OrdersPage";
import LiffBookingPage from "@/pages/LiffBookingPage";
import LiffMemberPage from "@/pages/LiffMemberPage";
import ReportsPage from "@/pages/ReportsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import InventoryPage from "@/pages/InventoryPage";
import BillingPage from "@/pages/BillingPage";
import ApiDocsPage from "@/pages/ApiDocsPage";
import WhiteLabelPage from "@/pages/WhiteLabelPage";
import LineIntegrationPage from "@/pages/LineIntegrationPage";
import PaymentPage from "@/pages/PaymentPage";
import RichMenuPage from "@/pages/RichMenuPage";
import FlexMessagePage from "@/pages/FlexMessagePage";
import LineRichMenuManagementPage from "@/pages/LineRichMenuManagementPage";
import LeaveRequestPage from "@/pages/LeaveRequestPage";
import LeaveApprovalPage from "@/pages/LeaveApprovalPage";
import WebhookPage from "@/pages/WebhookPage";
// LIFF 顧客端商城
import LiffShopPage from "@/pages/LiffShopPage";
import LiffCartPage from "@/pages/LiffCartPage";
import LiffCheckoutPage from "@/pages/LiffCheckoutPage";
import LiffOrdersPage from "@/pages/LiffOrdersPage";
import LiffOrderDetailPage from "@/pages/LiffOrderDetailPage";
// LIFF 員工端
import LiffStaffClockPage from "@/pages/LiffStaffClockPage";
import LiffStaffTasksPage from "@/pages/LiffStaffTasksPage";
import LiffStaffSchedulePage from "@/pages/LiffStaffSchedulePage";
import LiffStaffLeavePage from "@/pages/LiffStaffLeavePage";
// 進階功能
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
// Phase 26-30 超越 SUPER8 與夾客的進階功能
import AIChatbotPage from "@/pages/AIChatbotPage";
import MarketingAutomationPage from "@/pages/MarketingAutomationPage";
import GamificationPage from "@/pages/GamificationPage";
import MemberPassportPage from "@/pages/MemberPassportPage";
import MessageCenterPage from "@/pages/MessageCenterPage";
// Phase 31-35 新增功能
import SocialMarketingPage from "@/pages/SocialMarketingPage";
import HRManagementPage from "@/pages/HRManagementPage";
import SupplierManagementPage from "@/pages/SupplierManagementPage";
import ReviewManagementPage from "@/pages/ReviewManagementPage";
import MultiBranchPage from "@/pages/MultiBranchPage";
import ContractManagementPage from "@/pages/ContractManagementPage";
import TreatmentTrackingPage from "@/pages/TreatmentTrackingPage";
import RecommendationEnginePage from "@/pages/RecommendationEnginePage";
import SmartSchedulingPage from "@/pages/SmartSchedulingPage";
import Customer360Page from "@/pages/Customer360Page";
// 核心功能實裝頁面
import TreatmentRecordsPage from "@/pages/TreatmentRecordsPage";
import CustomerPackagesPage from "@/pages/CustomerPackagesPage";
import ConsultationManagementPage from "@/pages/ConsultationManagementPage";
import RFMAnalysisPage from "@/pages/RFMAnalysisPage";
import CommissionManagementPage from "@/pages/CommissionManagementPage";
import SatisfactionSurveyPage from "@/pages/SatisfactionSurveyPage";
import AttendanceTrackingPage from "@/pages/AttendanceTrackingPage";
import InventoryCostPage from "@/pages/InventoryCostPage";
import RevenueTargetPage from "@/pages/RevenueTargetPage";
import CustomerSourceROIPage from "@/pages/CustomerSourceROIPage";
// Phase 41-48 競品分析差異化功能
import InjectionMappingPage from "@/pages/InjectionMappingPage";
import ConsentFormPage from "@/pages/ConsentFormPage";
import PrescriptionPage from "@/pages/PrescriptionPage";
import SkinAnalysisPage from "@/pages/SkinAnalysisPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import TeleconsultPage from "@/pages/TeleconsultPage";
import ReferralPage from "@/pages/ReferralPage";
import SocialIntegrationPage from "@/pages/SocialIntegrationPage";
// Phase 56: 電子票券系統
import VouchersPage from "@/pages/VouchersPage";
import MyVouchersPage from "@/pages/liff/MyVouchersPage";
import VoucherRedemptionPage from "@/pages/VoucherRedemptionPage";
import VoucherReportsPage from "@/pages/VoucherReportsPage";
// Phase 61: 每日結帳系統
import SettlementPage from "@/pages/SettlementPage";
import SuperAdminSettingsPage from "@/pages/SuperAdminSettingsPage";
import SuperAdminVouchersPage from "@/pages/SuperAdminVouchersPage";
import SuperAdminUsersPage from "@/pages/SuperAdminUsersPage";
import SuperAdminMonitorPage from "@/pages/SuperAdminMonitorPage";
import SuperAdminNotificationsPage from "@/pages/SuperAdminNotificationsPage";
import SuperAdminBillingPage from "@/pages/SuperAdminBillingPage";
import SuperAdminApiDocsPage from "@/pages/SuperAdminApiDocsPage";
import SuperAdminWhiteLabelPage from "@/pages/SuperAdminWhiteLabelPage";
// Phase 63: 客戶行銷自動化
import CustomerMarketingPage from "@/pages/CustomerMarketingPage";
// Phase 29-31: LINE 整合、資料匯入、支付整合
import DataImportPage from "@/pages/DataImportPage";
import PaymentSettingsPage from "@/pages/PaymentSettingsPage";
// Phase 35: 定位打卡與 LINE 遊戲模組
import AttendanceClockInPage from "@/pages/AttendanceClockInPage";
import AttendanceSettingsPage from "@/pages/AttendanceSettingsPage";
import GameManagementPage from "@/pages/GameManagementPage";
import IchibanKujiGame from "@/pages/IchibanKujiGame";
import SlotMachineGame from "@/pages/SlotMachineGame";
import PachinkoGame from "@/pages/PachinkoGame";
import UserPrizesPage from "@/pages/UserPrizesPage";
import CouponManagementPage from "@/pages/CouponManagementPage";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path={"/"} component={Home} />
      
      {/* Super Admin Routes */}
      <Route path={"/super-admin"} component={SuperAdminDashboard} />
      <Route path={"/super-admin/organizations"} component={OrganizationsPage} />
      <Route path={"/super-admin/organizations/:id"} component={OrganizationDetailPage} />
      <Route path={"/super-admin/billing"} component={SuperAdminBillingPage} />
      <Route path={"/super-admin/api-docs"} component={SuperAdminApiDocsPage} />
      <Route path={"/super-admin/white-label"} component={SuperAdminWhiteLabelPage} />
      
      {/* Clinic Admin Routes */}
      <Route path={"/clinic"} component={ClinicDashboard} />
      <Route path={"/clinic/customers"} component={CustomersPage} />
      <Route path={"/clinic/customers/:id"} component={CustomerDetailPage} />
      <Route path={"/clinic/appointments"} component={AppointmentsPage} />
      <Route path={"/clinic/products"} component={ProductsPage} />
      <Route path={"/clinic/staff"} component={StaffPage} />
      <Route path={"/clinic/aftercare"} component={AftercarePage} />
      <Route path="/clinic/line-settings" component={LineSettingsPage} />
      <Route path="/clinic/schedule" component={SchedulePage} />
      <Route path="/clinic/attendance" component={AttendancePage} />
      <Route path="/clinic/coupons" component={CouponsPage} />
      <Route path="/clinic/orders" component={OrdersPage} />
      <Route path="/clinic/reports" component={ReportsPage} />
      <Route path="/clinic/notifications" component={NotificationsPage} />
      <Route path="/clinic/inventory" component={InventoryPage} />
      <Route path="/clinic/line-integration" component={LineIntegrationPage} />
      
      {/* 金流管理 */}
      <Route path="/clinic/payment" component={PaymentPage} />
      <Route path="/clinic/settlement" component={SettlementPage} />
      <Route path="/clinic/marketing" component={CustomerMarketingPage} />
      <Route path="/clinic/payment-settings" component={PaymentSettingsPage} />
      
      {/* 資料管理 */}
      <Route path="/clinic/data-import" component={DataImportPage} />
      
      {/* LINE 生態整合 */}
      <Route path="/clinic/rich-menu" component={RichMenuPage} />
      <Route path="/clinic/line-rich-menu" component={LineRichMenuManagementPage} />
      
      {/* 請假管理系統 */}
      <Route path="/clinic/leave-request" component={LeaveRequestPage} />
      <Route path="/clinic/leave-approval" component={LeaveApprovalPage} />
      <Route path="/clinic/flex-message" component={FlexMessagePage} />
      <Route path="/clinic/webhook" component={WebhookPage} />
      
      {/* Super Admin 進階設定 */}
      <Route path="/super-admin/billing" component={BillingPage} />
      <Route path="/super-admin/api-docs" component={ApiDocsPage} />
      <Route path="/super-admin/white-label" component={WhiteLabelPage} />
      <Route path="/super-admin/settings" component={SuperAdminSettingsPage} />
      <Route path="/super-admin/vouchers" component={SuperAdminVouchersPage} />
      <Route path="/super-admin/users" component={SuperAdminUsersPage} />
      <Route path="/super-admin/monitor" component={SuperAdminMonitorPage} />
      <Route path="/super-admin/notifications" component={SuperAdminNotificationsPage} />
      
      {/* LIFF 顧客端頁面 */}
      <Route path="/liff/booking" component={LiffBookingPage} />
      <Route path="/liff/member" component={LiffMemberPage} />
      <Route path="/liff/shop" component={LiffShopPage} />
      <Route path="/liff/cart" component={LiffCartPage} />
      <Route path="/liff/checkout" component={LiffCheckoutPage} />
      <Route path="/liff/orders" component={LiffOrdersPage} />
      <Route path="/liff/orders/:id" component={LiffOrderDetailPage} />
      
      {/* LIFF 員工端頁面 */}
      <Route path="/liff/staff/clock" component={LiffStaffClockPage} />
      <Route path="/liff/staff/tasks" component={LiffStaffTasksPage} />
      <Route path="/liff/staff/schedule" component={LiffStaffSchedulePage} />
      <Route path="/liff/staff/leave" component={LiffStaffLeavePage} />
      
      {/* 進階功能 */}
      <Route path="/clinic/analytics" component={AnalyticsPage} />
      <Route path="/clinic/settings" component={SettingsPage} />
      
      {/* Phase 26-30 超越 SUPER8 與夾客的進階功能 */}
      <Route path="/clinic/ai-chatbot" component={AIChatbotPage} />
      <Route path="/clinic/marketing-automation" component={MarketingAutomationPage} />
      <Route path="/clinic/gamification" component={GamificationPage} />
      <Route path="/clinic/member-passport" component={MemberPassportPage} />
      <Route path="/clinic/message-center" component={MessageCenterPage} />
          {/* Phase 63: 客戶行銷自動化 */}
      <Route path="/clinic/customer-marketing" component={CustomerMarketingPage} />
      
      {/* Phase 35: 定位打卡與 LINE 遊戲模組 */}
      <Route path="/clinic/attendance-clock-in" component={AttendanceClockInPage} />
      <Route path="/clinic/attendance-settings" component={AttendanceSettingsPage} />
      <Route path="/clinic/game-management" component={GameManagementPage} />
      <Route path="/clinic/games/ichiban-kuji" component={IchibanKujiGame} />
      <Route path="/clinic/games/slot-machine" component={SlotMachineGame} />
      <Route path="/clinic/games/pachinko" component={PachinkoGame} />
      <Route path="/clinic/user-prizes" component={UserPrizesPage} />
      <Route path="/clinic/coupon-management" component={CouponManagementPage} />     <Route path="/clinic/hr-management" component={HRManagementPage} />
      <Route path="/clinic/supplier-management" component={SupplierManagementPage} />
      <Route path="/clinic/review-management" component={ReviewManagementPage} />
      <Route path="/clinic/multi-branch" component={MultiBranchPage} />
      <Route path="/clinic/contract-management" component={ContractManagementPage} />
      <Route path="/clinic/treatment-tracking" component={TreatmentTrackingPage} />
      <Route path="/clinic/recommendation-engine" component={RecommendationEnginePage} />
      <Route path="/clinic/smart-scheduling" component={SmartSchedulingPage} />
      <Route path="/clinic/customer-360" component={Customer360Page} />
      
      {/* 核心功能實裝頁面 */}
      <Route path="/clinic/treatment-records" component={TreatmentRecordsPage} />
      <Route path="/clinic/customer-packages" component={CustomerPackagesPage} />
      <Route path="/clinic/consultation" component={ConsultationManagementPage} />
      <Route path="/clinic/rfm-analysis" component={RFMAnalysisPage} />
      <Route path="/clinic/commission" component={CommissionManagementPage} />
      <Route path="/clinic/satisfaction" component={SatisfactionSurveyPage} />
      <Route path="/clinic/attendance-tracking" component={AttendanceTrackingPage} />
      <Route path="/clinic/inventory-cost" component={InventoryCostPage} />
      <Route path="/clinic/revenue-target" component={RevenueTargetPage} />
      <Route path="/clinic/customer-source-roi" component={CustomerSourceROIPage} />
      
      {/* Phase 41-48 競品分析差異化功能 */}
      <Route path="/clinic/injection-mapping" component={InjectionMappingPage} />
      <Route path="/clinic/consent-form" component={ConsentFormPage} />
      <Route path="/clinic/prescription" component={PrescriptionPage} />
      <Route path="/clinic/skin-analysis" component={SkinAnalysisPage} />
      <Route path="/clinic/subscription" component={SubscriptionPage} />
      <Route path="/clinic/teleconsult" component={TeleconsultPage} />
      <Route path="/clinic/referral" component={ReferralPage} />
      <Route path="/clinic/social-integration" component={SocialIntegrationPage} />
      
      {/* Phase 56: 電子票券系統 */}
      <Route path="/clinic/vouchers" component={VouchersPage} />
      <Route path="/clinic/voucher-redemption" component={VoucherRedemptionPage} />
      <Route path="/clinic/voucher-reports" component={VoucherReportsPage} />
      
      {/* LIFF 票券頁面 */}
      <Route path="/liff/my-vouchers" component={MyVouchersPage} />
      
      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
