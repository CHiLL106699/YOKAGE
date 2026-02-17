import React, { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { Building2, Puzzle, BarChart3, CreditCard, ArrowUpCircle, XCircle, KeyRound, Edit, Save, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';

// --- TYPES --- //
type TenantPlan = 'free' | 'basic' | 'pro' | 'enterprise';
type SubscriptionStatus = 'active' | 'suspended' | 'cancelled';

const modulesConfig = [
    { id: 'CRM', name: 'CRM', description: '客戶關係管理' },
    { id: 'BI', name: 'BI', description: '商業智慧分析' },
    { id: 'AI對話', name: 'AI對話', description: '智慧對話機器人' },
    { id: '遊戲化', name: '遊戲化', description: '使用者參與遊戲化' },
    { id: 'LINE行銷', name: 'LINE行銷', description: 'LINE 官方帳號行銷工具' },
    { id: '多店管理', name: '多店管理', description: '跨分店資料整合管理' },
];

// --- HELPER COMPONENTS --- //
const BarChartPlaceholder = ({ title }: { title: string }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-center h-48">
        <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-slate-500 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">此租戶的用量統計資料暫時無法使用。</p>
        </div>
    </div>
);

// --- MAIN COMPONENT --- //
const AdminTenantDetailPage = () => {
  const [, params] = useRoute("/admin/tenants/:id");
  const tenantIdStr = params?.id || '';
  const tenantId = parseInt(tenantIdStr, 10);
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  const { data: tenant, isLoading: isTenantLoading, error: tenantError } = trpc.superAdmin.getOrganization.useQuery(
    { id: tenantId },
    { enabled: !isNaN(tenantId) && tenantId > 0 }
  );

  const { data: billingData, isLoading: isBillingLoading, error: billingError } = trpc.superAdmin.listInvoices.useQuery(
    { limit: 10 },
    { enabled: !isNaN(tenantId) && activeTab === 'billing' }
  );

  const updateTenantMutation = trpc.superAdmin.updateOrganization.useMutation({
    onSuccess: () => {
      utils.superAdmin.getOrganization.invalidate({ id: tenantId });
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (tenant) {
      setEditData({
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email ?? '',
        phone: tenant.phone ?? '',
        address: tenant.address ?? '',
        subscriptionPlan: tenant.subscriptionPlan ?? 'free',
        isActive: tenant.isActive ?? true,
      });
    }
  }, [tenant]);

  const handleEditToggle = () => {
    if (isEditing && tenant) {
      setEditData({
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email ?? '',
        phone: tenant.phone ?? '',
        address: tenant.address ?? '',
        subscriptionPlan: tenant.subscriptionPlan ?? 'free',
        isActive: tenant.isActive ?? true,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (!tenant) return;
    updateTenantMutation.mutate({ 
        id: tenant.id, 
        name: editData.name || undefined,
        email: editData.email || undefined,
        phone: editData.phone || undefined,
        address: editData.address || undefined,
        subscriptionPlan: editData.subscriptionPlan as TenantPlan,
        isActive: editData.isActive,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleModuleToggle = (_moduleId: string) => {
    // enabledModules is not part of the updateOrganization API
    // This is a placeholder for future implementation
  };

  if (isTenantLoading) {
    return <QueryLoading message="正在載入租戶資料..." />;
  }

  if (tenantError) {
    return <QueryError message={tenantError.message} onRetry={() => utils.superAdmin.getOrganization.invalidate({ id: tenantId })} />;
  }

  if (!tenant) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <p className="ml-4 text-lg">找不到指定的租戶資料。</p>
      </div>
    );
  }

  const enabledModulesArr: string[] = (tenant.enabledModules as string[] | null) ?? [];
  const enabledModulesSet = new Set(enabledModulesArr);

  const tabs = [
    { id: 'info', label: '基本資訊', icon: Building2 },
    { id: 'modules', label: '模組啟用', icon: Puzzle },
    { id: 'usage', label: '用量統計', icon: BarChart3 },
    { id: 'billing', label: '帳單記錄', icon: CreditCard },
  ];

  const planStyles: Record<string, string> = {
    free: 'bg-slate-600 text-slate-100',
    basic: 'bg-blue-600 text-blue-100',
    pro: 'bg-indigo-600 text-indigo-100',
    enterprise: 'bg-violet-600 text-violet-100',
  };

  const statusStyles: Record<string, string> = {
    active: 'bg-green-500 text-green-100',
    inactive: 'bg-slate-500 text-slate-100',
    suspended: 'bg-red-500 text-red-100',
  };

  const billingStatusStyles: Record<string, string> = {
    paid: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    overdue: 'text-red-400',
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">租戶詳細資料</h3>
                <div className="flex items-center space-x-4">
                    {isEditing && updateTenantMutation.isPending && <Loader2 className="h-5 w-5 animate-spin text-slate-400"/>}
                    <button onClick={handleEditToggle} disabled={updateTenantMutation.isPending} className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isEditing ? <><X className="h-4 w-4 mr-1"/>取消</> : <><Edit className="h-4 w-4 mr-1"/>編輯</>}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
                {isEditing ? (
                    <>
                        <div><label className="text-sm text-slate-400">公司名稱</label><input type="text" name="name" value={editData.name || ''} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div><label className="text-sm text-slate-400">Slug</label><input type="text" name="slug" value={editData.slug || ''} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white" disabled/></div>
                        <div><label className="text-sm text-slate-400">Email</label><input type="email" name="email" value={editData.email || ''} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div><label className="text-sm text-slate-400">電話</label><input type="tel" name="phone" value={editData.phone || ''} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div className="md:col-span-2"><label className="text-sm text-slate-400">地址</label><input type="text" name="address" value={editData.address || ''} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"/></div>
                        <div><label className="text-sm text-slate-400">方案</label><select name="subscriptionPlan" value={editData.subscriptionPlan || ''} onChange={handleInputChange} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"><option value="free">Free</option><option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></div>
                        <div><label className="text-sm text-slate-400">狀態</label><select name="isActive" value={String(editData.isActive)} onChange={(e) => setEditData(p => ({...p, isActive: e.target.value === 'true'}))} className="w-full p-2 bg-slate-700 rounded mt-1 text-white"><option value="true">Active</option><option value="false">Inactive</option></select></div>
                    </>
                ) : (
                    <>
                        <div><p className="text-sm text-slate-400">公司名稱</p><p className="text-white font-medium">{tenant.name}</p></div>
                        <div><p className="text-sm text-slate-400">Slug</p><p className="text-white font-mono">{tenant.slug}</p></div>
                        <div><p className="text-sm text-slate-400">Email</p><p className="text-white font-medium">{tenant.email || 'N/A'}</p></div>
                        <div><p className="text-sm text-slate-400">電話</p><p className="text-white font-medium">{tenant.phone || 'N/A'}</p></div>
                        <div className="md:col-span-2"><p className="text-sm text-slate-400">地址</p><p className="text-white font-medium">{tenant.address || 'N/A'}</p></div>
                        <div><p className="text-sm text-slate-400">方案</p><span className={`px-2 py-1 text-xs font-bold rounded-full ${planStyles[tenant.subscriptionPlan || 'free']}`}>{(tenant.subscriptionPlan || 'N/A').toUpperCase()}</span></div>
                        <div><p className="text-sm text-slate-400">狀態</p><span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[tenant.isActive ? 'active' : 'inactive']}`}>{tenant.isActive ? 'ACTIVE' : 'INACTIVE'}</span></div>
                        <div><p className="text-sm text-slate-400">建立日期</p><p className="text-white font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</p></div>
                    </>
                )}
            </div>
            {isEditing && (
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} disabled={updateTenantMutation.isPending} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
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
                            <button
                                onClick={() => handleModuleToggle(module.id)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${enabledModulesSet.has(module.id) ? 'bg-indigo-600' : 'bg-slate-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabledModulesSet.has(module.id) ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 'usage':
        return (
            <div className="grid grid-cols-1 gap-6">
                <BarChartPlaceholder title="API 呼叫次數" />
                <BarChartPlaceholder title="儲存空間用量" />
                <BarChartPlaceholder title="活躍使用者數" />
            </div>
        );
      case 'billing':
        if (isBillingLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;
        if (billingError) return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">無法載入帳單記錄: {billingError.message}</div>;
        if (!billingData || billingData.data.length === 0) return <div className="text-slate-400 text-center p-8">沒有帳單記錄。</div>;

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
                        {billingData.data.map((record: any) => (
                            <tr key={record.id} className="border-b border-slate-700 last:border-b-0">
                                <td className="p-4">{new Date(record.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">${(Number(record.amount) / 100).toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`flex items-center font-semibold ${billingStatusStyles[String(record.status).toLowerCase()] || 'text-slate-400'}`}>
                                        {['paid', 'succeeded'].includes(String(record.status).toLowerCase()) && <CheckCircle className="h-4 w-4 mr-2"/>}
                                        {String(record.status).toLowerCase() === 'pending' && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                                        {String(record.status).toLowerCase() === 'failed' && <AlertTriangle className="h-4 w-4 mr-2"/>}
                                        {String(record.status).charAt(0).toUpperCase() + String(record.status).slice(1)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <a href={`/invoice/${record.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">查看</a>
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
