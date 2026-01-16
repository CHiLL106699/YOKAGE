import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import OrganizationsPage from "./pages/OrganizationsPage";
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

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path={"/"} component={Home} />
      
      {/* Super Admin Routes */}
      <Route path={"/super-admin"} component={SuperAdminDashboard} />
      <Route path={"/super-admin/organizations"} component={OrganizationsPage} />
      
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
      
      {/* LINE 生態整合 */}
      <Route path="/clinic/rich-menu" component={RichMenuPage} />
      <Route path="/clinic/flex-message" component={FlexMessagePage} />
      <Route path="/clinic/webhook" component={WebhookPage} />
      
      {/* Super Admin 進階設定 */}
      <Route path="/super-admin/billing" component={BillingPage} />
      <Route path="/super-admin/api-docs" component={ApiDocsPage} />
      <Route path="/super-admin/white-label" component={WhiteLabelPage} />
      
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
      
      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
