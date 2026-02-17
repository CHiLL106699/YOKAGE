
import React, { useState, useMemo } from 'react';
import { Search, FileDown, PlusCircle, MoreVertical, ChevronLeft, ChevronRight, X, CheckCircle, XCircle, Clock, Users, BarChart2, Building } from 'lucide-react';
import { useLocation, Link } from 'wouter';

// --- TYPES --- //
type Plan = '試用中' | 'Free' | 'Pro' | 'Enterprise';
type Status = '啟用' | '停用' | '試用中';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  status: Status;
  userCount: number;
  monthlyRevenue: number;
  createdDate: string;
}

// --- MOCK DATA --- //
const mockTenants: Tenant[] = [
  { id: 'tnt_1', name: 'Innovate Inc.', slug: 'innovate-inc', plan: 'Enterprise', status: '啟用', userCount: 120, monthlyRevenue: 2500, createdDate: '2025-01-15' },
  { id: 'tnt_2', name: 'DataDriven Co.', slug: 'datadriven-co', plan: 'Pro', status: '啟用', userCount: 75, monthlyRevenue: 999, createdDate: '2025-02-20' },
  { id: 'tnt_3', name: 'Cloud Solutions', slug: 'cloud-solutions', plan: 'Pro', status: '停用', userCount: 50, monthlyRevenue: 0, createdDate: '2024-12-10' },
  { id: 'tnt_4', name: 'Synergy Labs', slug: 'synergy-labs', plan: 'Free', status: '試用中', userCount: 5, monthlyRevenue: 0, createdDate: '2025-03-01' },
  { id: 'tnt_5', name: 'QuantumLeap', slug: 'quantumleap', plan: 'Enterprise', status: '啟用', userCount: 250, monthlyRevenue: 4500, createdDate: '2024-11-05' },
  { id: 'tnt_6', name: 'NextGen Systems', slug: 'nextgen-systems', plan: 'Pro', status: '啟用', userCount: 88, monthlyRevenue: 999, createdDate: '2025-01-28' },
  { id: 'tnt_7', name: 'Apex Innovations', slug: 'apex-innovations', plan: 'Free', status: '啟用', userCount: 10, monthlyRevenue: 0, createdDate: '2025-03-10' },
  { id: 'tnt_8', name: 'Stellar Services', slug: 'stellar-services', plan: 'Pro', status: '停用', userCount: 62, monthlyRevenue: 0, createdDate: '2024-10-15' },
  { id: 'tnt_9', name: 'FusionWorks', slug: 'fusionworks', plan: 'Enterprise', status: '啟用', userCount: 180, monthlyRevenue: 3800, createdDate: '2024-09-22' },
  { id: 'tnt_10', name: 'Momentum Tech', slug: 'momentum-tech', plan: 'Pro', status: '啟用', userCount: 95, monthlyRevenue: 999, createdDate: '2025-02-18' },
  { id: 'tnt_11', name: 'Pioneer Digital', slug: 'pioneer-digital', plan: '試用中', status: '試用中', userCount: 8, monthlyRevenue: 0, createdDate: '2025-03-12' },
  { id: 'tnt_12', name: 'Zenith Dynamics', slug: 'zenith-dynamics', plan: 'Pro', status: '啟用', userCount: 110, monthlyRevenue: 1200, createdDate: '2025-01-05' },
  { id: 'tnt_13', name: 'Catalyst Corp', slug: 'catalyst-corp', plan: 'Enterprise', status: '啟用', userCount: 300, monthlyRevenue: 5000, createdDate: '2024-08-01' },
  { id: 'tnt_14', name: 'Horizon Ventures', slug: 'horizon-ventures', plan: 'Free', status: '啟用', userCount: 15, monthlyRevenue: 0, createdDate: '2025-03-05' },
  { id: 'tnt_15', name: 'Ignite Solutions', slug: 'ignite-solutions', plan: 'Pro', status: '試用中', userCount: 25, monthlyRevenue: 0, createdDate: '2025-02-25' },
];

// --- HELPER COMPONENTS --- //

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

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AddTenantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
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
          <form className="space-y-4">
            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">租戶名稱</label>
              <input type="text" id="tenantName" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
              <input type="text" id="slug" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700">方案</label>
              <select id="plan" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Free</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                取消
              </button>
              <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                建立租戶
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
      {/* Sidebar */}
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
              className={`block py-2.5 px-6 transition duration-200 hover:bg-indigo-50 hover:text-indigo-600 ${'/admin/tenants' === item.path ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600'}`}>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">YOChiLL</h1>
            {/* Mobile menu button can be added here */}
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<Plan | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const filteredTenants = useMemo(() => {
    return mockTenants
      .filter(tenant => tenant.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(tenant => planFilter === 'all' || tenant.plan === planFilter)
      .filter(tenant => statusFilter === 'all' || tenant.status === statusFilter);
  }, [searchTerm, planFilter, statusFilter]);

  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTenants.slice(start, end);
  }, [filteredTenants, currentPage]);

  const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTenants(paginatedTenants.map(t => t.id));
    } else {
      setSelectedTenants([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedTenants(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  if (error) {
    return <AdminLayout><div className="text-red-500">Error: {error}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">租戶管理</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="總租戶" value="156" icon={<Building className="w-6 h-6" />} />
          <StatCard title="活躍" value="142" icon={<CheckCircle className="w-6 h-6" />} />
          <StatCard title="試用中" value="8" icon={<Clock className="w-6 h-6" />} />
          <StatCard title="已停用" value="6" icon={<XCircle className="w-6 h-6" />} />
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋租戶名稱..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={planFilter} onChange={e => setPlanFilter(e.target.value as any)} className="border-gray-300 rounded-md shadow-sm">
                <option value="all">所有方案</option>
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border-gray-300 rounded-md shadow-sm">
                <option value="all">所有狀態</option>
                <option value="啟用">啟用</option>
                <option value="停用">停用</option>
                <option value="試用中">試用中</option>
              </select>
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                新增租戶
              </button>
            </div>
          </div>
          {selectedTenants.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">已選取 {selectedTenants.length} 項</span>
                <button className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200">批量啟用</button>
                <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200">批量停用</button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                  <th scope="col" className="px-6 py-3">用戶數</th>
                  <th scope="col" className="px-6 py-3">月營收</th>
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
                    <td className="px-6 py-4">{tenant.plan}</td>
                    <td className="px-6 py-4"><StatusBadge status={tenant.status} /></td>
                    <td className="px-6 py-4 text-center">{tenant.userCount}</td>
                    <td className="px-6 py-4 text-right">${tenant.monthlyRevenue.toLocaleString()}</td>
                    <td className="px-6 py-4">{tenant.createdDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-indigo-600 hover:text-indigo-900">查看</button>
                        <button className="text-blue-600 hover:text-blue-900">編輯</button>
                        <button className="text-red-600 hover:text-red-900">停用</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <nav className="flex items-center justify-between p-4" aria-label="Table navigation">
            <span className="text-sm font-normal text-gray-500">顯示 <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredTenants.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTenants.length)}</span> / <span className="font-semibold text-gray-900">{filteredTenants.length}</span></span>
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </li>
              {/* Page numbers can be dynamically generated here */}
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
      <AddTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AdminLayout>
  );
};

export default AdminTenantsPage;
