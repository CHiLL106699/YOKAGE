/**
 * Sprint 4: 產品線總覽頁面
 * 路徑: /admin/products
 *
 * 顯示 YOKAGE 與 YaoYouQian 兩條產品線的租戶數、營收、活躍度，
 * 提供跨產品線租戶搜尋與升級/降級操作。
 */
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  Settings,
  FileText,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Package,
  Crown,
  Building2,
  Activity,
  Bell,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import type { PlanType, SourceProduct } from "../../../../shared/shared-types";
import { PLAN_DISPLAY_NAMES, PLAN_PRICES } from "../../../../shared/shared-types";

// ============================================
// Sidebar (複用 AdminDashboard 的 pattern)
// ============================================
const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const navItems = [
    { href: "/admin", icon: Home, label: "儀表板" },
    { href: "/admin/tenants", icon: Briefcase, label: "租戶管理" },
    { href: "/admin/products", icon: Package, label: "產品線總覽" },
    { href: "/admin/revenue", icon: DollarSign, label: "營收分析" },
    { href: "/admin/users", icon: Users, label: "使用者管理" },
    { href: "/admin/system", icon: Settings, label: "系統設定" },
    { href: "/admin/logs", icon: FileText, label: "日誌紀錄" },
  ];
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 md:flex flex-col hidden">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-transparent bg-clip-text">
          YOChiLL
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                location === item.href
                  ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">產品線總覽</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="h-6 w-6 text-gray-500" />
          <div className="w-8 h-8 bg-indigo-500 rounded-full" />
        </div>
      </header>
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);

// ============================================
// Plan Badge
// ============================================
function PlanBadge({ plan }: { plan: PlanType | string | null }) {
  if (!plan) return <span className="text-gray-400 text-xs">未設定</span>;
  const colorMap: Record<string, string> = {
    yyq_basic: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    yyq_advanced: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    yokage_starter: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    yokage_pro: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  };
  const displayName = PLAN_DISPLAY_NAMES[plan as PlanType] || plan;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[plan] || "bg-gray-100 text-gray-700"}`}>
      {displayName}
    </span>
  );
}

// ============================================
// Main Page
// ============================================
export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [changePlanTenant, setChangePlanTenant] = useState<{
    id: number;
    name: string;
    currentPlan: string;
  } | null>(null);
  const [targetPlan, setTargetPlan] = useState<PlanType | "">("");

  // tRPC queries
  const statsQuery = trpc.superAdmin.getProductLineStats.useQuery();
  const searchResults = trpc.superAdmin.searchTenantsCrossProduct.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 }
  );
  const changePlanMutation = trpc.superAdmin.changeTenantPlan.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      setChangePlanTenant(null);
      setTargetPlan("");
      statsQuery.refetch();
      searchResults.refetch();
    },
    onError: (err) => toast.error(`操作失敗: ${err.message}`),
  });

  const stats = statsQuery.data;

  const handleChangePlan = () => {
    if (!changePlanTenant || !targetPlan) return;
    changePlanMutation.mutate({
      tenantId: changePlanTenant.id,
      targetPlan: targetPlan as PlanType,
      reason: "超級管理員手動變更",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* === 產品線統計卡片 === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statsQuery.isLoading ? (
            <div className="col-span-2 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : stats ? (
            stats.map((line) => (
              <div
                key={line.product}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {line.product === "yokage" ? (
                      <Crown className="h-6 w-6 text-amber-500" />
                    ) : (
                      <Building2 className="h-6 w-6 text-blue-500" />
                    )}
                    <h3 className="text-lg font-semibold">{line.productName}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      line.product === "yokage"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    {line.product === "yokage" ? "高配版" : "LINE 專用版"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold">{line.totalTenants}</p>
                    <p className="text-xs text-gray-500">總租戶數</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {line.activeTenants}
                    </p>
                    <p className="text-xs text-gray-500">活躍租戶</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">
                      NT${line.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">月營收</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-xs text-gray-500 mb-2">方案分布</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(line.planBreakdown).map(([plan, count]) =>
                      count > 0 ? (
                        <div
                          key={plan}
                          className="flex items-center gap-1 text-xs"
                        >
                          <PlanBadge plan={plan} />
                          <span className="text-gray-500">×{count}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>

        {/* === 跨產品線租戶搜尋 === */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" />
            跨產品線租戶搜尋
          </h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋租戶名稱、Email 或 subdomain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {searchQuery.length >= 2 && (
            <div className="overflow-x-auto">
              {searchResults.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : searchResults.data && searchResults.data.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="pb-2 font-medium text-gray-500">ID</th>
                      <th className="pb-2 font-medium text-gray-500">名稱</th>
                      <th className="pb-2 font-medium text-gray-500">產品線</th>
                      <th className="pb-2 font-medium text-gray-500">方案</th>
                      <th className="pb-2 font-medium text-gray-500">狀態</th>
                      <th className="pb-2 font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.data.map((tenant) => (
                      <tr
                        key={tenant.id}
                        className="border-b border-gray-100 dark:border-gray-700/50"
                      >
                        <td className="py-2 text-gray-500">#{tenant.id}</td>
                        <td className="py-2 font-medium">{tenant.name}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              tenant.sourceProduct === "yokage"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {tenant.sourceProduct === "yokage"
                              ? "YOKAGE"
                              : "YaoYouQian"}
                          </span>
                        </td>
                        <td className="py-2">
                          <PlanBadge plan={tenant.planType} />
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs ${
                              tenant.isActive
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            <Activity className="h-3 w-3" />
                            {tenant.isActive ? "啟用" : "停用"}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                setChangePlanTenant({
                                  id: tenant.id,
                                  name: tenant.name,
                                  currentPlan: tenant.planType || "yyq_basic",
                                })
                              }
                              className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                            >
                              變更方案
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  找不到符合「{searchQuery}」的租戶
                </p>
              )}
            </div>
          )}
        </div>

        {/* === 升級/降級 Modal === */}
        {changePlanTenant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                變更方案 — {changePlanTenant.name}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  目前方案：
                  <PlanBadge plan={changePlanTenant.currentPlan} />
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  目標方案
                </label>
                <select
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value as PlanType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">選擇方案...</option>
                  {(
                    [
                      "yyq_basic",
                      "yyq_advanced",
                      "yokage_starter",
                      "yokage_pro",
                    ] as PlanType[]
                  )
                    .filter((p) => p !== changePlanTenant.currentPlan)
                    .map((p) => (
                      <option key={p} value={p}>
                        {PLAN_DISPLAY_NAMES[p]} (NT$
                        {PLAN_PRICES[p].toLocaleString()}/月)
                      </option>
                    ))}
                </select>
              </div>
              {targetPlan && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    {PLAN_PRICES[targetPlan as PlanType] >
                    PLAN_PRICES[changePlanTenant.currentPlan as PlanType] ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">升級</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600 font-medium">
                          降級
                        </span>
                      </>
                    )}
                    <span className="text-gray-500">
                      {PLAN_DISPLAY_NAMES[changePlanTenant.currentPlan as PlanType]} →{" "}
                      {PLAN_DISPLAY_NAMES[targetPlan as PlanType]}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setChangePlanTenant(null);
                    setTargetPlan("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={changePlanMutation.isPending}
                >
                  取消
                </button>
                <button
                  onClick={handleChangePlan}
                  disabled={!targetPlan || changePlanMutation.isPending}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {changePlanMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    "確認變更"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
