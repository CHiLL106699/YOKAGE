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
import AppointmentsPage from "./pages/AppointmentsPage";
import ProductsPage from "./pages/ProductsPage";
import StaffPage from "./pages/StaffPage";
import AftercarePage from "./pages/AftercarePage";
import LineSettingsPage from "./pages/LineSettingsPage";

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
      <Route path={"/clinic/appointments"} component={AppointmentsPage} />
      <Route path={"/clinic/products"} component={ProductsPage} />
      <Route path={"/clinic/staff"} component={StaffPage} />
      <Route path={"/clinic/aftercare"} component={AftercarePage} />
      <Route path={"/clinic/line-settings"} component={LineSettingsPage} />
      
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
