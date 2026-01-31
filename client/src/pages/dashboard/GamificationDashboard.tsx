import React from 'react';
import { Gamepad2, Gift, Trophy, Plus, MoreHorizontal, PlayCircle, PauseCircle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'Ichiban Kuji' | 'Slot Machine' | 'Wheel';
  status: 'Active' | 'Paused' | 'Draft';
  participants: number;
  prizesClaimed: number;
  startDate: string;
  endDate: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 'CMP001',
    name: '夏日美白季一番賞',
    type: 'Ichiban Kuji',
    status: 'Active',
    participants: 1250,
    prizesClaimed: 450,
    startDate: '2026-06-01',
    endDate: '2026-08-31',
  },
  {
    id: 'CMP002',
    name: '新客見面禮拉霸機',
    type: 'Slot Machine',
    status: 'Active',
    participants: 340,
    prizesClaimed: 340,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'CMP003',
    name: '週年慶幸運轉盤',
    type: 'Wheel',
    status: 'Draft',
    participants: 0,
    prizesClaimed: 0,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
  {
    id: 'CMP004',
    name: 'VIP 專屬抽獎',
    type: 'Ichiban Kuji',
    status: 'Paused',
    participants: 85,
    prizesClaimed: 10,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
  },
];

const GamificationDashboard: React.FC = () => {
  const getStatusBadgeClass = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Gamepad2 className="mr-3 h-8 w-8 text-pink-600" />
          遊戲化行銷管理
        </h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          建立新活動
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-pink-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">總參與人次</dt>
                <dd className="text-2xl font-semibold text-gray-900">1,675</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gift className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">獎品兌換數</dt>
                <dd className="text-2xl font-semibold text-gray-900">800</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">進行中活動</dt>
                <dd className="text-2xl font-semibold text-gray-900">2</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">活動列表</h3>
          <div className="flex space-x-2">
             <span className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">全部</span>
             <span className="text-sm text-gray-300">|</span>
             <span className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">進行中</span>
             <span className="text-sm text-gray-300">|</span>
             <span className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">草稿</span>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {mockCampaigns.map((campaign) => (
            <li key={campaign.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      campaign.type === 'Ichiban Kuji' ? 'bg-pink-100 text-pink-600' :
                      campaign.type === 'Slot Machine' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {campaign.type === 'Ichiban Kuji' ? <Trophy className="h-5 w-5" /> :
                       campaign.type === 'Slot Machine' ? <Gamepad2 className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600 truncate">{campaign.name}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="truncate">{campaign.type}</span>
                        <span className="mx-1">&middot;</span>
                        <span>{campaign.startDate} ~ {campaign.endDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-6 text-right hidden sm:block">
                      <div className="text-sm text-gray-900">參與: {campaign.participants}</div>
                      <div className="text-xs text-gray-500">兌換: {campaign.prizesClaimed}</div>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <button className="ml-4 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {/* Progress Bar for Active Campaigns */}
                {campaign.status === 'Active' && (
                   <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-pink-600 h-1.5 rounded-full" style={{ width: `${(campaign.prizesClaimed / (campaign.participants || 1)) * 100}%` }}></div>
                   </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Helper icon component
const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default GamificationDashboard;
