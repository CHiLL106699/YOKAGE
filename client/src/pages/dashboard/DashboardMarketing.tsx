
import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { BarChart, Bell, Tag, Calendar, Users, Send, PlusCircle, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { toast } from "sonner";




const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.FC<{ className?: string }> }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
    <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full mr-4">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const BroadcastsTab = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="搜尋推播..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <button onClick={onOpenModal} className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-shadow">
        <PlusCircle className="mr-2" size={20} />
        新增推播
      </button>
    </div>
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名稱</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">發送數</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">開信率</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">點擊率</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {broadcasts.map((broadcast) => (
            <tr key={broadcast.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{broadcast.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${broadcast.status === '已發送' ? 'bg-green-100 text-green-800' : broadcast.status === '排程中' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {broadcast.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{broadcast.sent}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{broadcast.openRate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{broadcast.clickRate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href="#" className="text-indigo-600 hover:text-indigo-900">編輯</a>
                <a href="#" className="text-red-600 hover:text-red-900 ml-4">刪除</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SegmentsTab = () => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="搜尋分群..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <button className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-shadow">
        <PlusCircle className="mr-2" size={20} />
        新增分群
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(campaigns as any[]).map((segment) => (
        <div key={segment.id} className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{segment.name}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {segment.tags.map((tag, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          <p className="text-sm text-gray-500">人數: <span className="font-semibold">{segment.count}</span></p>
        </div>
      ))}
    </div>
  </div>
);

const CampaignsTab = () => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="搜尋活動..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <button className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-shadow">
        <PlusCircle className="mr-2" size={20} />
        新增活動
      </button>
    </div>
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動名稱</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期範圍</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">類型</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">轉換率</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.dateRange}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === '已結束' ? 'bg-gray-100 text-gray-800' : campaign.status === '進行中' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                  {campaign.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.conversionRate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href="#" className="text-indigo-600 hover:text-indigo-900">詳情</a>
                <a href="#" className="text-red-600 hover:text-red-900 ml-4">封存</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BroadcastModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  if (isLoading) return <QueryLoading variant="skeleton-cards" />;

  if (campError) return <QueryError message={campError.message} onRetry={refetchCampaigns} />;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">新增推播</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">推播名稱</label>
            <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="例如：週末限時優惠" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">訊息模板</label>
            <textarea rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="輸入您的推播訊息..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">目標分群</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {(campaigns as any[]).map(segment => <option key={segment.id}>{segment.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">排程</label>
            <div className="mt-1 flex gap-4">
              <input type="date" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              <input type="time" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
            取消
          </button>
          <button className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-shadow">
            <Send className="mr-2" size={16} />
            立即發送
          </button>
          <button className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-shadow">
            <Calendar className="mr-2" size={16} />
            排程發送
          </button>
        </div>
      </div>
    </div>
  );
};


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { href: "/dashboard", icon: BarChart, label: "總覽" },
    { href: "/dashboard/marketing", icon: Bell, label: "行銷管理" },
    { href: "/dashboard/customers", icon: Users, label: "顧客管理" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4 h-16 border-b">
          <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            YOChiLL
          </h1>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-indigo-600">
            <ChevronRight className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={`flex items-center py-3 px-4 my-1 transition-colors ${location === item.href ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-500' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}`}>
                <item.icon className="h-6 w-6" />
                <span className={`ml-4 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const DashboardMarketingPage = () => {
  const organizationId = 1; // TODO: from context
  
  const { data: campaignsData, isLoading: campLoading, error: campError, refetch: refetchCampaigns } = trpc.marketing.listCampaigns.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: broadcastData, isLoading: bcLoading } = trpc.broadcast.list.useQuery(
    { organizationId, limit: 20 },
    { enabled: !!organizationId }
  );
  
  const createCampaignMutation = trpc.marketing.createCampaign.useMutation({
    onSuccess: () => { toast.success("行銷活動已建立"); refetchCampaigns(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = campLoading || bcLoading;
  const campaigns = (campaignsData as any)?.data ?? campaignsData ?? [];
  const broadcasts = (broadcastData as any)?.data ?? broadcastData ?? [];

  const [activeTab, setActiveTab] = useState('broadcasts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const tabs = [
    { id: 'broadcasts', label: '推播管理', icon: Bell },
    { id: 'segments', label: '標籤分群', icon: Tag },
    { id: 'campaigns', label: '活動管理', icon: Calendar },
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-10">載入中...</div>;
    }
    if (error) {
      return <div className="text-center p-10 text-red-500">錯誤: {error}</div>;
    }
    switch (activeTab) {
      case 'broadcasts':
        return <BroadcastsTab onOpenModal={() => setModalOpen(true)} />;
      case 'segments':
        return <SegmentsTab />;
      case 'campaigns':
        return <CampaignsTab />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">行銷管理</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="本月推播" value="45" icon={Send} />
          <StatCard title="平均開信率" value="68%" icon={BarChart} />
          <StatCard title="轉換率" value="12%" icon={Users} />
        </div>

        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-5">
            {renderContent()}
          </div>
        </div>
      </div>
      <BroadcastModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  );
};

export default DashboardMarketingPage;

