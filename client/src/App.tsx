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
      <Route path="/clinic/customers/:id" component={CustomerDetailPage} />
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
      
      {/* LIFF 頁面 */}
      <Route path="/liff/booking" component={LiffBookingPage} />
      <Route path="/liff/member" component={LiffMemberPage} />
      
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
