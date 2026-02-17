import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Users,
  Calendar,
  Package,
  Megaphone,
  Gamepad2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  GitBranch,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "\u7e3d\u89bd", path: "/dashboard", icon: LayoutDashboard },
  { name: "\u9810\u7d04\u7ba1\u7406", path: "/dashboard/appointments", icon: CalendarDays },
  { name: "\u5ba2\u6236\u7ba1\u7406", path: "/dashboard/customers", icon: UserCircle },
  { name: "\u54e1\u5de5\u7ba1\u7406", path: "/dashboard/staff", icon: Users },
  { name: "\u6392\u73ed\u7ba1\u7406", path: "/dashboard/schedule", icon: Calendar },
  { name: "\u5eab\u5b58\u7ba1\u7406", path: "/dashboard/inventory", icon: Package },
  { name: "\u884c\u92b7\u7ba1\u7406", path: "/dashboard/marketing", icon: Megaphone },
  { name: "\u904a\u6232\u5316\u884c\u92b7", path: "/dashboard/gamification", icon: Gamepad2 },
  { name: "\u5831\u8868\u4e2d\u5fc3", path: "/dashboard/reports", icon: BarChart3 },
  { name: "LINE CRM", path: "/dashboard/crm", icon: MessageSquare },
  { name: "\u71df\u904b\u5206\u6790", path: "/dashboard/bi", icon: BarChart3 },
  { name: "\u4eba\u8cc7\u85aa\u916c", path: "/dashboard/hr", icon: Users },
  { name: "\u591a\u5e97\u4e2d\u6a1e", path: "/dashboard/multi-branch", icon: GitBranch },
  { name: "\u8a3a\u6240\u8a2d\u5b9a", path: "/dashboard/settings", icon: Settings },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transform bg-slate-900 transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <Link href="/">
            <span className="flex cursor-pointer items-center gap-2 text-xl font-bold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                Y
              </span>
              YOChiLL
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <span
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="size-5" />
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <Link href="/">
            <span className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300">
              <LogOut className="size-4" />
              登出系統
            </span>
          </Link>
          <div className="mt-3 flex items-center px-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-500">租戶管理員</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-800 px-6 py-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="size-6" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
