import React from 'react';
import { Building2, TrendingUp, ArrowRightLeft, Users, MapPin, MoreVertical } from 'lucide-react';
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";

interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  revenue: number;
  growth: number;
  status: 'Operational' | 'Maintenance' | 'Opening Soon';
}

const MultiBranchDashboard: React.FC = () => {
  const { data: orgList, isLoading, error, refetch } = trpc.organization.list.useQuery();

  // Transform org data to Branch format
  const branches: Branch[] = (orgList ?? []).map((org: any) => ({
    id: `B${String(org.id).padStart(3, '0')}`,
    name: org.name || '未命名分店',
    location: org.address || org.city || '-',
    manager: org.managerName || '-',
    revenue: Number(org.monthlyRevenue || 0),
    growth: Number(org.revenueGrowth || 0),
    status: org.isActive === false ? 'Maintenance' : org.status === 'opening' ? 'Opening Soon' : 'Operational',
  }));

  const operationalBranches = branches.filter(b => b.status === 'Operational');
  const totalRevenue = branches.reduce((acc, branch) => acc + branch.revenue, 0);
  const avgGrowth = operationalBranches.length > 0
    ? operationalBranches.reduce((acc, b) => acc + b.growth, 0) / operationalBranches.length
    : 0;

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

  if (isLoading) return <QueryLoading variant="skeleton-cards" />;
  if (error) return <QueryError message={error.message} onRetry={refetch} />;

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
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{operationalBranches.length} / {branches.length}</dd>
            <dd className="mt-2 text-sm text-gray-500">{branches.length - operationalBranches.length} 間籌備/維護中</dd>
          </dl>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-t-4 border-indigo-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">總會員數</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">-</dd>
            <dd className="mt-2 flex items-center text-sm text-gray-500">
              <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
              跨店統計
            </dd>
          </dl>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-t-4 border-orange-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">待處理調撥單</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">-</dd>
            <dd className="mt-2 text-sm text-gray-500">功能開發中</dd>
          </dl>
        </div>
      </div>

      {/* Branch List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">分店營運概況</h3>
        </div>
        {branches.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">尚無分店資料</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {branches.map((branch) => (
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
        )}
      </div>
    </div>
  );
};

export default MultiBranchDashboard;
