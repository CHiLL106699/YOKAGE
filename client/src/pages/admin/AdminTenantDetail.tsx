import React, { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { Building2, Puzzle, BarChart3, CreditCard, ArrowUpCircle, XCircle, KeyRound, Edit, Save, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

// --- TYPES --- //
type TenantPlan = 'free' | 'pro' | 'enterprise';
type TenantStatus = 'active' | 'inactive' | 'suspended';
type BillingStatus = 'paid' | 'pending' | 'failed';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: string;
  modules: { [key: string]: boolean };
};

type UsageData = {
  date: string;
  apiCalls: number;
  storage: number;
  users: number;
};

type BillingRecord = {
  id: string;
  date: string;
  amount: number;
  status: BillingStatus;
  invoiceUrl: string;
};

// --- MOCK DATA --- //
const mockTenant: Tenant = {
  id: 'tenant-123',
  name: 'Innovate Corp',
  slug: 'innovate-corp',
  email: 'contact@innovatecorp.com',
  phone: '+1 (555) 123-4567',
  address: '123 Innovation Drive, Tech City, TX 75001',
  plan: 'pro',
  status: 'active',
  createdAt: '2023-01-15T10:30:00Z',
  modules: {
    'CRM': true,
    'BI': true,
    'AI對話': false,
    '遊戲化': true,
    'LINE行銷': false,
    '多店管理': true,
  },
};

const mockUsage: UsageData[] = [
  { date: '2024-04', apiCalls: 150000, storage: 25, users: 120 },
  { date: '2024-05', apiCalls: 180000, storage: 28, users: 135 },
  { date: '2024-06', apiCalls: 220000, storage: 32, users: 150 },
  { date: '2024-07', apiCalls: 210000, storage: 35, users: 160 },
];

const mockBillingHistory: BillingRecord[] = [
  { id: 'inv-004', date: '2024-07-01', amount: 299, status: 'paid', invoiceUrl: '#' },
  { id: 'inv-003', date: '2024-06-01', amount: 299, status: 'paid', invoiceUrl: '#' },
  { id: 'inv-002', date: '2024-05-01', amount: 199, status: 'paid', invoiceUrl: '#' },
  { id: 'inv-001', date: '2024-04-01', amount: 199, status: 'failed', invoiceUrl: '#' },
];

const modulesConfig = [
    { id: 'CRM', name: 'CRM', description: '客戶關係管理' },
    { id: 'BI', name: 'BI', description: '商業智慧分析' },
    { id: 'AI對話', name: 'AI對話', description: '智慧對話機器人' },
    { id: '遊戲化', name: '遊戲化', description: '使用者參與遊戲化' },
    { id: 'LINE行銷', name: 'LINE行銷', description: 'LINE 官方帳號行銷工具' },
    { id: '多店管理', name: '多店管理', description: '跨分店資料整合管理' },
];

// --- HELPER COMPONENTS --- //
const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
  <div className="bg-slate-800/50 p-4 rounded-lg">
    <div className="flex items-center">
      <Icon className="h-6 w-6 text-indigo-400 mr-3" />
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const BarChart = ({ title, data, dataKey, unit, maxVal }: { title: string; data: any[]; dataKey: string; unit: string; maxVal: number }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
            {data.map(item => (
                <div key={item.date} className="flex flex-col items-center justify-end space-y-2">
                    <div className="text-sm font-medium text-white">{item[dataKey].toLocaleString()}{unit}</div>
                    <div className="w-1/2 bg-slate-700 rounded-t-lg" style={{ height: `${(item[dataKey] / maxVal) * 150}px` }}>
                        <div className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg" style={{ height: '100%' }}></div>
                    </div>
                    <div className="text-xs text-slate-400">{item.date}</div>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN COMPONENT --- //
const AdminTenantDetailPage = () => {
  const [match, params] = useRoute("/admin/tenants/:id");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Tenant>>({});

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      if (params?.id === 'tenant-123') {
        setTenant(mockTenant);
        setEditData(mockTenant);
      } else {
        setError('找不到指定的租戶。');
      }
      setIsLoading(false);
    }, 1000);
  }, [params?.id]);

  const handleEditToggle = () => {
    if (isEditing) {
        setEditData(tenant || {});
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Simulate save API call
    setTenant(prev => ({ ...prev!, ...editData } as Tenant));
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleModuleToggle = (moduleId: string) => {
    setTenant(prev => {
        if (!prev) return null;
        const newModules = { ...prev.modules, [moduleId]: !prev.modules[moduleId] };
        // Simulate API call to update modules
        return { ...prev, modules: newModules };
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <p className="ml-4 text-lg">載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="ml-4 text-lg">錯誤: {error}</p>
      </div>
    );
  }

  if (!tenant) {
    return null; // Should not happen if not loading and no error
  }

  const tabs = [
    { id: 'info', label: '基本資訊', icon: Building2 },
    { id: 'modules', label: '模組啟用', icon: Puzzle },
    { id: 'usage', label: '用量統計', icon: BarChart3 },
    { id: 'billing', label: '帳單記錄', icon: CreditCard },
  ];

  const planStyles: { [key in TenantPlan]: string } = {
    free: 'bg-slate-600 text-slate-100',
    pro: 'bg-indigo-600 text-indigo-100',
    enterprise: 'bg-violet-600 text-violet-100',
  };

  const statusStyles: { [key in TenantStatus]: string } = {
    active: 'bg-green-500 text-green-100',
    inactive: 'bg-slate-500 text-slate-100',
    suspended: 'bg-red-500 text-red-100',
  };

  const billingStatusStyles: { [key in BillingStatus]: string } = {
    paid: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">租戶詳細資料</h3>
                <button onClick={handleEditToggle} className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300">
                    {isEditing ? <><X className="h-4 w-4 mr-1"/>取消</> : <><Edit className="h-4 w-4 mr-1"/>編輯</>}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
                {isEditing ? (
                    <>
                        <div><label className="text-sm text-slate-400">公司名稱</label><input type="text" name="name" value={editData.name} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div><label className="text-sm text-slate-400">Slug</label><input type="text" name="slug" value={editData.slug} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div><label className="text-sm text-slate-400">Email</label><input type="email" name="email" value={editData.email} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div><label className="text-sm text-slate-400">電話</label><input type="tel" name="phone" value={editData.phone} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div className="md:col-span-2"><label className="text-sm text-slate-400">地址</label><input type="text" name="address" value={editData.address} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div><label className="text-sm text-slate-400">方案</label><select name="plan" value={editData.plan} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"><option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></div>
                        <div><label className="text-sm text-slate-400">狀態</label><select name="status" value={editData.status} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></div>
                    </>
                ) : (
                    <>
                        <div><p className="text-sm text-slate-400">公司名稱</p><p className="text-white font-medium">{tenant.name}</p></div>
                        <div><p className="text-sm text-slate-400">Slug</p><p className="text-white font-mono">{tenant.slug}</p></div>
                        <div><p className="text-sm text-slate-400">Email</p><p className="text-white font-medium">{tenant.email}</p></div>
                        <div><p className="text-sm text-slate-400">電話</p><p className="text-white font-medium">{tenant.phone}</p></div>
                        <div className="md:col-span-2"><p className="text-sm text-slate-400">地址</p><p className="text-white font-medium">{tenant.address}</p></div>
                        <div><p className="text-sm text-slate-400">方案</p><span className={`px-2 py-1 text-xs font-bold rounded-full ${planStyles[tenant.plan]}`}>{tenant.plan.toUpperCase()}</span></div>
                        <div><p className="text-sm text-slate-400">狀態</p><span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[tenant.status]}`}>{tenant.status.toUpperCase()}</span></div>
                        <div><p className="text-sm text-slate-400">建立日期</p><p className="text-white font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</p></div>
                    </>
                )}
            </div>
            {isEditing && (
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                        <Save className="h-4 w-4 mr-2"/>儲存變更
                    </button>
                </div>
            )}
          </div>
        );
      case 'modules':
        return (
            <div className="bg-slate-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-6">模組啟用狀態</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulesConfig.map(module => (
                        <div key={module.id} className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-white">{module.name}</p>
                                <p className="text-sm text-slate-400">{module.description}</p>
                            </div>
                            <button onClick={() => handleModuleToggle(module.id)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${tenant.modules[module.id] ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${tenant.modules[module.id] ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 'usage':
        return (
            <div className="grid grid-cols-1 gap-6">
                <BarChart title="API 呼叫次數" data={mockUsage} dataKey="apiCalls" unit="" maxVal={300000} />
                <BarChart title="儲存空間用量 (GB)" data={mockUsage} dataKey="storage" unit="GB" maxVal={50} />
                <BarChart title="活躍使用者數" data={mockUsage} dataKey="users" unit="" maxVal={200} />
            </div>
        );
      case 'billing':
        return (
            <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="p-4 font-semibold">日期</th>
                            <th className="p-4 font-semibold">金額</th>
                            <th className="p-4 font-semibold">狀態</th>
                            <th className="p-4 font-semibold">發票</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockBillingHistory.map(record => (
                            <tr key={record.id} className="border-b border-slate-700 last:border-b-0">
                                <td className="p-4">{record.date}</td>
                                <td className="p-4">${record.amount.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`flex items-center font-semibold ${billingStatusStyles[record.status]}`}>
                                        {record.status === 'paid' && <CheckCircle className="h-4 w-4 mr-2"/>}
                                        {record.status === 'pending' && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                                        {record.status === 'failed' && <AlertTriangle className="h-4 w-4 mr-2"/>}
                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <a href={record.invoiceUrl} className="text-indigo-400 hover:underline">下載</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Conceptual AdminLayout Sidebar */}
      <div className="w-64 bg-slate-950 p-4 flex-shrink-0 hidden md:block">
        <div className="text-2xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">YOChiLL</div>
        <nav>
          <ul>
            <li><Link href="/admin/dashboard" className="block p-2 rounded hover:bg-slate-800">總覽</Link></li>
            <li><Link href="/admin/tenants" className="block p-2 rounded bg-slate-800 font-semibold">租戶管理</Link></li>
            <li><Link href="/admin/users" className="block p-2 rounded hover:bg-slate-800">使用者管理</Link></li>
            <li><Link href="/admin/settings" className="block p-2 rounded hover:bg-slate-800">系統設定</Link></li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white">{tenant.name}</h1>
              <p className="mt-1 text-sm text-slate-400">ID: {tenant.id}</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500">
                <ArrowUpCircle className="-ml-1 mr-2 h-5 w-5" />
                升級方案
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500">
                <KeyRound className="-ml-1 mr-2 h-5 w-5" />
                重置密碼
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500">
                <XCircle className="-ml-1 mr-2 h-5 w-5" />
                停用租戶
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-700 mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`}
                >
                  <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTenantDetailPage;
