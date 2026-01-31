import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Link } from 'wouter';

const DashboardHome: React.FC = () => {
  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">早安，Admin</h1>
        <p className="mt-1 text-sm text-gray-500">這裡是您今天的診所營運概況。</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">今日預估營收</dt>
                <dd className="text-2xl font-semibold text-gray-900">NT$ 125,000</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">今日預約</dt>
                <dd className="text-2xl font-semibold text-gray-900">24 診次</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">現場候診</dt>
                <dd className="text-2xl font-semibold text-gray-900">5 人</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">系統狀態</dt>
                <dd className="text-lg font-semibold text-green-600">運作正常</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Module Shortcuts */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">快速存取模組</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: '庫存管理', desc: '監控醫材庫存與效期', path: '/dashboard/inventory', color: 'bg-blue-500' },
          { name: 'LINE CRM', desc: '客戶對話與分眾行銷', path: '/dashboard/crm', color: 'bg-green-500' },
          { name: '營運分析', desc: '查看詳細營收報表', path: '/dashboard/bi', color: 'bg-indigo-500' },
          { name: '遊戲化行銷', desc: '管理一番賞與拉霸活動', path: '/dashboard/gamification', color: 'bg-pink-500' },
          { name: '人資薪酬', desc: '排班與業績獎金計算', path: '/dashboard/hr', color: 'bg-yellow-500' },
          { name: '多店中樞', desc: '跨店調撥與總部管理', path: '/dashboard/multi-branch', color: 'bg-purple-500' },
        ].map((module) => (
          <Link key={module.path} href={module.path}>
            <a className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
              <div className="p-5 flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${module.color}`}>
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">{module.name}</h3>
                  <p className="text-sm text-gray-500">{module.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
