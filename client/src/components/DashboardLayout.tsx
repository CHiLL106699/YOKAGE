import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, LogOut, PanelLeft, Users, Calendar, Package, 
  Heart, Settings, MessageSquare, Clock, Ticket, ShoppingCart,
  BarChart3, Bell, AlertTriangle, CreditCard, Menu, FileText, Webhook,
  Building2, Globe, Key, Brain, Cog, Bot, Zap, Gamepad2, UserCircle, Inbox,
  Share2, Briefcase, Truck, Star, GitBranch, FileSignature, Camera, Sparkles, Target, Eye,
  Syringe, ClipboardList, PhoneCall, PieChart, DollarSign, ThumbsUp,
  Crosshair, FileCheck, Pill, ScanFace, CreditCard as CreditCardIcon, Video, Gift, Globe2, Crown,
  Upload
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

// 診所 Admin 選單
const clinicMenuItems = [
  { icon: LayoutDashboard, label: "儀表板", path: "/clinic" },
  { icon: Users, label: "客戶管理", path: "/clinic/customers" },
  { icon: UserCircle, label: "會員護照", path: "/clinic/member-passport" },
  { icon: Calendar, label: "預約管理", path: "/clinic/appointments" },
  { icon: Package, label: "產品管理", path: "/clinic/products" },
  { icon: Users, label: "員工管理", path: "/clinic/staff" },
  { icon: Clock, label: "排班管理", path: "/clinic/schedule" },
  { icon: Clock, label: "打卡紀錄", path: "/clinic/attendance" },
  { icon: Clock, label: "定位打卡", path: "/clinic/attendance" },
  { icon: Settings, label: "打卡設定", path: "/clinic/attendance-settings" },
  { icon: Heart, label: "術後關懷", path: "/clinic/aftercare" },
  { icon: Ticket, label: "優惠券", path: "/clinic/coupons" },
  { icon: ShoppingCart, label: "訂單管理", path: "/clinic/orders" },
  { icon: AlertTriangle, label: "庫存警示", path: "/clinic/inventory" },
  { icon: BarChart3, label: "報表分析", path: "/clinic/reports" },
  { icon: Brain, label: "AI 數據分析", path: "/clinic/analytics" },
  { icon: Bell, label: "通知管理", path: "/clinic/notifications" },
  { icon: CreditCard, label: "金流管理", path: "/clinic/payment" },
  { icon: Upload, label: "資料匯入", path: "/clinic/data-import" },
  { icon: DollarSign, label: "每日結帳", path: "/clinic/settlement" },
  { icon: Target, label: "客戶行銷", path: "/clinic/marketing" },
  // Phase 26-30 超越 SUPER8 與夾客的進階功能
  { icon: Bot, label: "AI 智能客服", path: "/clinic/ai-chatbot" },
  { icon: Inbox, label: "訊息中心", path: "/clinic/message-center" },
  { icon: Zap, label: "行銷自動化", path: "/clinic/marketing-automation" },
  { icon: Gamepad2, label: "遊戲 & OMO", path: "/clinic/gamification" },
  { icon: Gamepad2, label: "遊戲管理", path: "/clinic/game-management" },
  { icon: Gift, label: "使用者獎品", path: "/clinic/user-prizes" },
  { icon: Ticket, label: "優惠券管理", path: "/clinic/coupon-management" },
  // LINE 生態整合
  { icon: MessageSquare, label: "LINE 設定", path: "/clinic/line-settings" },
  { icon: MessageSquare, label: "LINE 整合", path: "/clinic/line-integration" },
  { icon: Menu, label: "Rich Menu", path: "/clinic/rich-menu" },
  { icon: FileText, label: "Flex Message", path: "/clinic/flex-message" },
  { icon: Webhook, label: "Webhook", path: "/clinic/webhook" },
  // Phase 31-35 新增功能
  { icon: Share2, label: "社群行銷", path: "/clinic/social-marketing" },
  { icon: Briefcase, label: "人資管理", path: "/clinic/hr-management" },
  { icon: Truck, label: "供應商管理", path: "/clinic/supplier-management" },
  { icon: Star, label: "評價管理", path: "/clinic/review-management" },
  { icon: GitBranch, label: "多分店管理", path: "/clinic/multi-branch" },
  { icon: FileSignature, label: "合約管理", path: "/clinic/contract-management" },
  { icon: Camera, label: "療程追蹤", path: "/clinic/treatment-tracking" },
  { icon: Sparkles, label: "智能推薦", path: "/clinic/recommendation-engine" },
  { icon: Target, label: "智能排程", path: "/clinic/smart-scheduling" },
  { icon: Eye, label: "客戶 360°", path: "/clinic/customer-360" },
  // 核心功能實裝頁面
  { icon: Syringe, label: "療程記錄", path: "/clinic/treatment-records" },
  { icon: ClipboardList, label: "療程套餐", path: "/clinic/customer-packages" },
  { icon: PhoneCall, label: "諮詢管理", path: "/clinic/consultation" },
  { icon: PieChart, label: "RFM 分析", path: "/clinic/rfm-analysis" },
  { icon: DollarSign, label: "佣金管理", path: "/clinic/commission" },
  { icon: ThumbsUp, label: "滿意度調查", path: "/clinic/satisfaction" },
  { icon: Calendar, label: "到診率追蹤", path: "/clinic/attendance-tracking" },
  { icon: Package, label: "庫存成本", path: "/clinic/inventory-cost" },
  { icon: Target, label: "營收目標", path: "/clinic/revenue-target" },
  { icon: BarChart3, label: "客戶來源 ROI", path: "/clinic/customer-source-roi" },
  // Phase 41-48 競品分析差異化功能
  { icon: Crosshair, label: "注射點位圖", path: "/clinic/injection-mapping" },
  { icon: FileCheck, label: "電子同意書", path: "/clinic/consent-form" },
  { icon: Pill, label: "處方管理", path: "/clinic/prescription" },
  { icon: ScanFace, label: "AI 膚質分析", path: "/clinic/skin-analysis" },
  { icon: CreditCardIcon, label: "會員訂閱", path: "/clinic/subscription" },
  { icon: Video, label: "遠程諮詢", path: "/clinic/teleconsult" },
  { icon: Gift, label: "推薦獎勵", path: "/clinic/referral" },
  { icon: Globe2, label: "社群整合", path: "/clinic/social-integration" },
  { icon: Cog, label: "系統設定", path: "/clinic/settings" },
];

// Super Admin 選單
const superAdminMenuItems = [
  { icon: LayoutDashboard, label: "系統儀表板", path: "/admin" },
  { icon: Building2, label: "診所管理", path: "/admin/organizations" },
  { icon: Users, label: "使用者管理", path: "/admin/users" },
  { icon: CreditCard, label: "計費管理", path: "/admin/billing" },
  { icon: Ticket, label: "票券管理", path: "/admin/vouchers" },
  { icon: Bell, label: "通知中心", path: "/admin/notifications" },
  { icon: BarChart3, label: "系統監控", path: "/admin/monitor" },
  { icon: Key, label: "API 文檔", path: "/admin/api-docs" },
  { icon: Globe, label: "白標方案", path: "/admin/white-label" },
  { icon: Cog, label: "系統設定", path: "/admin/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          {/* 尊爵登入卡片 */}
          <div className="w-full p-8 rounded-2xl card-premium">
            <div className="flex flex-col items-center gap-6">
              {/* Logo 區域 */}
              <img 
                src="/logo-new.png" 
                alt="Logo" 
                className="w-16 h-16 rounded-full object-cover shadow-lg"
               loading="lazy" />
              <h1 className="text-2xl font-semibold tracking-tight text-center text-gold-gradient">
                YOChiLL Premium
              </h1>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                尊貴會員專屬管理平台，請登入以繼續
              </p>
            </div>
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              size="lg"
              className="w-full mt-8 btn-gold"
            >
              登入系統
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // 根據當前路徑和用戶角色決定使用哪個選單
  const isAdminRoute = location.startsWith("/admin");
  const isSuperAdminUser = user?.role === "super_admin";
  // 只有 super_admin 角色且在 /admin 路由下才顯示超級管理員選單
  const menuItems = (isAdminRoute && isSuperAdminUser) ? superAdminMenuItems : clinicMenuItems;
  const activeMenuItem = menuItems.find(item => item.path === location);
  const sidebarTitle = (isAdminRoute && isSuperAdminUser) ? "Super Admin" : "YOKAGE 診所";

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-sidebar"
          disableTransition={isResizing}
        >
          {/* 尊爵側邊欄頭部 */}
          <SidebarHeader className="h-20 justify-center border-b border-sidebar-border bg-[oklch(0.08_0.02_250)]">
            <div className="flex items-center gap-3 px-3 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-10 w-10 flex items-center justify-center hover:bg-sidebar-accent rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 border border-sidebar-border"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-3 min-w-0">
                  {/* 平台 Logo */}
                  <img 
                    src="/logo-new.png" 
                    alt="Logo" 
                    className="w-8 h-8 rounded-lg object-cover shadow-md"
                   loading="lazy" />
                  <span className="font-bold tracking-tight truncate text-lg text-gold-gradient">
                    {sidebarTitle}
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          {/* 側邊欄選單 */}
          <SidebarContent className="gap-0 overflow-y-auto py-3 bg-sidebar">
            <SidebarMenu className="px-3 space-y-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-11 transition-all font-medium rounded-xl ${
                        isActive 
                          ? "bg-[oklch(0.18_0.04_250)] text-[oklch(0.85_0.12_75)] border-l-3 border-[oklch(0.80_0.14_70)] shadow-sm" 
                          : "text-[oklch(0.65_0.03_250)] hover:bg-[oklch(0.14_0.035_250)] hover:text-[oklch(0.85_0.12_75)]"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-[oklch(0.80_0.14_70)]" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* 尊爵用戶資訊區 */}
          <SidebarFooter className="p-3 border-t border-sidebar-border bg-[oklch(0.08_0.02_250)]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent hover:border-sidebar-border">
                  {/* 燙金頭像邊框 */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gold-gradient opacity-50 blur-sm" />
                    <Avatar className="h-10 w-10 border-2 border-[oklch(0.75_0.15_65)] relative">
                      <AvatarFallback className="text-sm font-bold bg-[oklch(0.16_0.04_250)] text-[oklch(0.85_0.12_75)]">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold truncate leading-none text-[oklch(0.90_0.03_70)]">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {(user as any)?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>登出系統</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        {/* 側邊欄拖曳調整 */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[oklch(0.80_0.14_70)]/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-background">
        {/* 行動版頂部導覽 */}
        {isMobile && (
          <div className="flex border-b border-border h-16 items-center justify-between bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10 rounded-xl bg-background border border-border" />
              <div className="flex items-center gap-3">
                <span className="tracking-tight text-foreground font-semibold">
                  {activeMenuItem?.label ?? "選單"}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* 主內容區 */}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
