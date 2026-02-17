
import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Building2, DollarSign, Users, Settings, FileText, X, Menu, LogOut } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { href: '/admin', label: '儀表板', icon: LayoutDashboard },
  { href: '/admin/tenants', label: '租戶管理', icon: Building2 },
  { href: '/admin/revenue', label: '營收報表', icon: DollarSign },
  { href: '/admin/users', label: '用戶管理', icon: Users },
  { href: '/admin/system', label: '系統設定', icon: Settings },
  { href: '/admin/logs', label: '系統日誌', icon: FileText },
];

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Mock data for loading/error states - replace with actual logic
  const isLoading = false;
  const error = null;

  const NavLinks = () => (
    <nav className="mt-8 flex-1">
      <ul>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <li key={item.href} className="px-4 mb-2">
              <Link href={item.href}>
                <a
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}>
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center justify-between px-6">
        <div className="flex items-center">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">
                YOChiLL
            </span>
            <span className="ml-2 bg-slate-700 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">ADMIN</span>
        </div>
        <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
        >
            <X className="w-6 h-6" />
        </button>
      </div>
      <NavLinks />
      <div className="p-4 mt-auto">
        <div className="p-4 bg-slate-800 rounded-lg">
            <div className="flex items-center">
                <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User avatar"  loading="lazy" />
                <div className="ml-3">
                    <p className="text-sm font-semibold text-white">Tech Lead</p>
                    <p className="text-xs text-slate-400">Principal Architect</p>
                </div>
            </div>
            <button className="mt-4 w-full flex items-center justify-center p-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-red-600/50 hover:text-white rounded-md transition-colors">
                <LogOut className="w-4 h-4 mr-2"/>
                登出
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-800">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 flex transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <aside className="w-64 bg-slate-900 flex-shrink-0">
            <SidebarContent />
        </aside>
        <div
          onClick={() => setSidebarOpen(false)}
          className="flex-1 bg-black bg-opacity-50"
          aria-hidden="true"
        ></div>
      </div>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-shrink-0">
        <div className="flex flex-col w-64 fixed h-full bg-slate-900">
            <SidebarContent />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white dark:bg-slate-900 shadow-sm h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">
            YOChiLL
          </span>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-800">
          <div className="container mx-auto px-6 py-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">Something went wrong. Please try again later.</span>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
