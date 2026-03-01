
import React, { useState, useMemo } from 'react';
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import { Search, FileDown, PlusCircle, MoreVertical, ChevronLeft, ChevronRight, X, CheckCircle, XCircle, Clock, Users, BarChart2, Building } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { Skeleton } from '@/components/ui/skeleton';

// --- TYPES --- //
type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
type Status = '啟用' | '停用' | '試用中';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  subscriptionPlan: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  isActive: boolean;
  // userCount: number; // This data is not available in the listOrganizations endpoint
  // monthlyRevenue: number; // This data is not available in the listOrganizations endpoint
  createdAt: string;
}

// --- HELPER COMPONENTS --- //

const getStatus = (isActive: boolean, subscriptionStatus: SubscriptionStatus | null): Status => {
  if (!isActive) return '停用';
  if (subscriptionStatus === 'trialing') return '試用中';
  return '啟用';
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full inline-flex items-center';
  switch (status) {
    case '啟用':
      return <span className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="w-3 h-3 mr-1" />啟用</span>;
    case '停用':
      return <span className={`${baseClasses} bg-red-100 text-red-800`}><XCircle className="w-3 h-3 mr-1" />停用</span>;
    case '試用中':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><Clock className="w-3 h-3 mr-1" />試用中</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; isLoading?: boolean }> = ({ title, value, icon, isLoading }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      {isLoading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-2xl font-bold text-gray-800">{value}</p>}
    </div>
  </div>
);

const AddTenantModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void; }> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState('Pro');
  const createTenantMutation = trpc.superAdmin.createOrganization.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenantMutation.mutate({ name, slug, subscriptionPlan: plan.toLowerCase() as 'free' | 'basic' | 'pro' | 'enterprise' }, {
      onSuccess: () => {
        onSuccess();
        onClose();
        setName('');
        setSlug('');
        setPlan('Pro');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">新增租戶</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">租戶名稱</label>
              <input type="text" id="tenantName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
              <input type="text" id="slug" value={slug} onChange={e => setSlug(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700">方案</label>
              <select id="plan" value={plan} onChange={e => setPlan(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Free</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
            </div>
            {createTenantMutation.error && <p className="text-sm text-red-600">Error: {createTenantMutation.error.message}</p>}
            <div className="flex justify-end pt-4">
              <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                取消
              </button>
              <button type="submit" disabled={createTenantMutation.isPending} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {createTenantMutation.isPending ? '建立中...' : '建立租戶'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setLocation] = useLocation();
  const navItems = [
    { name: '總覽', path: '/admin/dashboard' },
    { name: '租戶管理', path: '/admin/tenants' },
    { name: '用戶管理', path: '/admin/users' },
    { name: '系統設定', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">YOChiLL</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <nav className="mt-6">
          {navItems.map(item => (
            <Link
              key={item.name}
              href={item.path}
              className={`block py-2.5 px-6 transition duration-200 hover:bg-indigo-50 hover:text-indigo-600 ${
                '/admin/tenants' === item.path ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600'}`}>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">YOChiLL</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT --- //
const AdminTenantsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const utils = trpc.useUtils();

  const ITEMS_PER_PAGE = 10;

  const { data: tenantsData, isLoading, error } = trpc.superAdmin.listOrganizations.useQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchTerm,
  });

  const { data: statsData, isLoading: statsLoading } = trpc.superAdmin.stats.useQuery();

  const updateStatusMutation = trpc.superAdmin.updateOrganization.useMutation({
    onSuccess: () => {
      utils.superAdmin.listOrganizations.invalidate();
      utils.superAdmin.stats.invalidate();
    }
  });

  const paginatedTenants = tenantsData?.data ?? [];
  const totalTenants = tenantsData?.total ?? 0;
  const totalPages = Math.ceil(totalTenants / ITEMS_PER_PAGE);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTenants(paginatedTenants.map(t => t.id));
    } else {
      setSelectedTenants([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedTenants(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleBatchUpdateStatus = (isActive: boolean) => {
    selectedTenants.forEach(id => {
      updateStatusMutation.mutate({ id: Number(id), isActive });
    });
    setSelectedTenants([]);
  };

  if (error) {
    return <AdminLayout><QueryError message={error.message} onRetry={() => utils.superAdmin.listOrganizations.invalidate()} /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">租戶管理</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="總租戶" value={statsData?.organizations ?? 0} icon={<Building className="w-6 h-6" />} isLoading={statsLoading} />
          <StatCard title="活躍用戶" value={statsData?.users ?? 0} icon={<Users className="w-6 h-6" />} isLoading={statsLoading} />
          <StatCard title="總預約數" value={statsData?.appointments ?? 0} icon={<BarChart2 className="w-6 h-6" />} isLoading={statsLoading} />
          <StatCard title="總客戶數" value={statsData?.customers ?? 0} icon={<CheckCircle className="w-6 h-6" />} isLoading={statsLoading} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋租戶名稱..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                新增租戶
              </button>
            </div>
          </div>
          {selectedTenants.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">已選取 {selectedTenants.length} 項</span>
                <button onClick={() => handleBatchUpdateStatus(true)} className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200">批量啟用</button>
                <button onClick={() => handleBatchUpdateStatus(false)} className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200">批量停用</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="w-full text-sm text-left text-gray-500">
                <div className="text-xs text-gray-700 uppercase bg-gray-50 flex p-4 items-center">
                    <Skeleton className="h-4 w-4 mr-4"/>
                    <Skeleton className="h-4 w-32"/>
                </div>
                {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                    <div key={i} className="flex items-center p-4 border-b">
                        <Skeleton className="h-4 w-4 mr-4"/>
                        <Skeleton className="h-6 w-1/4 mr-6"/>
                        <Skeleton className="h-6 w-1/4 mr-6"/>
                        <Skeleton className="h-6 w-1/6 mr-6"/>
                        <Skeleton className="h-6 w-1/6"/>
                    </div>
                ))}
              </div>
            ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="p-4">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" onChange={handleSelectAll} checked={selectedTenants.length > 0 && selectedTenants.length === paginatedTenants.length} />
                  </th>
                  <th scope="col" className="px-6 py-3">租戶名稱</th>
                  <th scope="col" className="px-6 py-3">Slug</th>
                  <th scope="col" className="px-6 py-3">方案</th>
                  <th scope="col" className="px-6 py-3">狀態</th>
                  <th scope="col" className="px-6 py-3">建立日期</th>
                  <th scope="col" className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTenants.map((tenant) => (
                  <tr key={tenant.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="w-4 p-4">
                      <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={selectedTenants.includes(tenant.id)} onChange={() => handleSelectOne(tenant.id)} />
                    </td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {tenant.name}
                    </th>
                    <td className="px-6 py-4 text-gray-600">{tenant.slug}</td>
                    <td className="px-6 py-4">{tenant.subscriptionPlan ?? 'N/A'}</td>
                    <td className="px-6 py-4"><StatusBadge status={getStatus(tenant.isActive !== false, tenant.subscriptionStatus as SubscriptionStatus | null)} /></td>
                    <td className="px-6 py-4">{safeDate(tenant.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-indigo-600 hover:text-indigo-900">查看</button>
                        <button className="text-blue-600 hover:text-blue-900">編輯</button>
                        <button onClick={() => updateStatusMutation.mutate({ id: tenant.id, isActive: !tenant.isActive })} className="text-red-600 hover:text-red-900">{tenant.isActive ? '停用' : '啟用'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
          <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
            <span className="text-sm font-normal text-gray-500">顯示 <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalTenants)}-{Math.min(currentPage * ITEMS_PER_PAGE, totalTenants)}</span> / <span className="font-semibold text-gray-900">{totalTenants}</span></span>
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </li>
              <li>
                <span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">{currentPage} / {totalPages}</span>
              </li>
              <li>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <AddTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => utils.superAdmin.listOrganizations.invalidate()} />
    </AdminLayout>
  );
};

export default AdminTenantsPage;
