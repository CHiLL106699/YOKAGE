import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  BarChart3, 
  Gamepad2, 
  Users, 
  GitBranch, 
  LogOut,
  Settings
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location] = useLocation();

  const navItems = [
    { name: '總覽', path: '/dashboard', icon: LayoutDashboard },
    { name: '庫存管理', path: '/dashboard/inventory', icon: Package },
    { name: 'LINE CRM', path: '/dashboard/crm', icon: MessageSquare },
    { name: '營運分析', path: '/dashboard/bi', icon: BarChart3 },
    { name: '遊戲化行銷', path: '/dashboard/gamification', icon: Gamepad2 },
    { name: '人資薪酬', path: '/dashboard/hr', icon: Users },
    { name: '多店中樞', path: '/dashboard/multi-branch', icon: GitBranch },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center justify-center border-b border-slate-800">
          <Link href="/">
            <div className="flex items-center gap-2 font-bold text-xl cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white">
                Y
              </div>
              <span>YOChiLL</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}>
                      <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.name}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="w-5 h-5 mr-3" />
                系統設定
              </a>
            </li>
            <li>
              <Link href="/">
                <a className="flex items-center px-4 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-slate-800 hover:text-red-300 transition-colors">
                  <LogOut className="w-5 h-5 mr-3" />
                  登出系統
                </a>
              </Link>
            </li>
          </ul>
          <div className="mt-4 flex items-center px-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
