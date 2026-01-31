import React from 'react';
import { Building2, TrendingUp, ArrowRightLeft, Users, MapPin, MoreVertical } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  revenue: number;
  growth: number;
  status: 'Operational' | 'Maintenance' | 'Opening Soon';
}

const mockBranches: Branch[] = [
  {
    id: 'B001',
    name: '台北旗艦店',
    location: '台北市大安區',
    manager: 'Kevin',
    revenue: 4500000,
    growth: 12.5,
    status: 'Operational',
  },
  {
    id: 'B002',
    name: '台中逢甲店',
    location: '台中市西屯區',
    manager: 'Sarah',
    revenue: 2800000,
    growth: 8.2,
    status: 'Operational',
  },
  {
    id: 'B003',
    name: '高雄巨蛋店',
    location: '高雄市左營區',
    manager: 'David',
    revenue: 3100000,
    growth: -2.1,
    status: 'Operational',
  },
  {
    id: 'B004',
    name: '新竹竹北店',
    location: '新竹縣竹北市',
    manager: 'Pending',
    revenue: 0,
    growth: 0,
    status: 'Opening Soon',
  },
];

const MultiBranchDashboard: React.FC = () => {
  const totalRevenue = mockBranches.reduce((acc, branch) => acc + branch.revenue, 0);
  const avgGrowth = mockBranches.filter(b => b.status === 'Operational').reduce((acc, b) => acc + b.growth, 0) / 3;

  const getStatusBadgeClass = (status: Branch['status']) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Opening Soon':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">多店營運中樞</h1>
          <p className="mt-1 text-sm text-gray-500">總部戰情室：跨店管理與資源調度</p>
        </div>
        <div className="flex space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ArrowRightLeft className="-ml-1 mr-2 h-5 w-5" />
            跨店調撥
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <Building2 className="-ml-1 mr-2 h-5 w-5" />
            新增分店
          </button>
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-t-4 border-purple-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">集團總營收 (本月)</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">NT$ {totalRevenue.toLocaleString()}</dd>
            <dd className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="flex-shrink-0 mr-1.5 h-4 w-4" />
              {avgGrowth.toFixed(1)}% vs 上月
            </dd>
          </dl>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-t-4 border-blue-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">營運中分店</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">3 / 4</dd>
            <dd className="mt-2 text-sm text-gray-500">1 間籌備中</dd>
          </dl>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-t-4 border-indigo-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">總會員數</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">12,450</dd>
            <dd className="mt-2 flex items-center text-sm text-green-600">
              <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
              +450 本月新增
            </dd>
          </dl>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-t-4 border-orange-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">待處理調撥單</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">5</dd>
            <dd className="mt-2 text-sm text-red-600">2 筆急件</dd>
          </dl>
        </div>
      </div>

      {/* Branch List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">分店營運概況</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {mockBranches.map((branch) => (
            <li key={branch.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <div className="text-lg font-medium text-indigo-600 truncate">{branch.name}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {branch.location}
                        <span className="mx-2">&middot;</span>
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        店長: {branch.manager}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-8 text-right hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">營收: NT$ {branch.revenue.toLocaleString()}</div>
                      <div className={`text-sm ${branch.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {branch.growth >= 0 ? '+' : ''}{branch.growth}%
                      </div>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(branch.status)}`}>
                      {branch.status}
                    </span>
                    <button className="ml-4 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MultiBranchDashboard;
