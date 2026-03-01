import React, { useState } from 'react';
import { Gamepad2, Gift, Trophy, Plus, PlayCircle, PauseCircle, Trash2, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const organizationId = 1; // TODO: from context

export default function GamificationDashboard() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('slot_machine');
  const [formDesc, setFormDesc] = useState('');

  const { data: campaigns, isLoading, error, refetch } =
    (trpc as any).game.list.useQuery({ organizationId });

  const createMutation = (trpc as any).game.create.useMutation({
    onSuccess: () => { toast.success('活動已建立'); refetch(); setCreateOpen(false); setFormName(''); setFormDesc(''); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = (trpc as any).game.update.useMutation({
    onSuccess: () => { toast.success('活動已更新'); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = (trpc as any).game.delete.useMutation({
    onSuccess: () => { toast.success('活動已刪除'); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  const items = Array.isArray(campaigns?.data) ? campaigns.data : Array.isArray(campaigns) ? campaigns : [];

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: '進行中', cls: 'bg-green-100 text-green-800' },
      Active: { label: '進行中', cls: 'bg-green-100 text-green-800' },
      paused: { label: '已暫停', cls: 'bg-yellow-100 text-yellow-800' },
      Paused: { label: '已暫停', cls: 'bg-yellow-100 text-yellow-800' },
      ended: { label: '已結束', cls: 'bg-gray-100 text-gray-800' },
      draft: { label: '草稿', cls: 'bg-blue-100 text-blue-800' },
      Draft: { label: '草稿', cls: 'bg-blue-100 text-blue-800' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cfg.cls}`}>{cfg.label}</span>;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { toast.error('請輸入活動名稱'); return; }
    createMutation.mutate({
      organizationId,
      name: formName,
      gameType: formType,
      description: formDesc,
    });
  };

  return (
    <DashboardLayout title="遊戲化行銷">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400">管理遊戲化行銷活動，提升客戶互動與回訪率</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow hover:scale-[1.02] transition-transform"
          >
            <Plus size={20} /> 新增活動
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
            <Gamepad2 className="mx-auto mb-2 text-purple-500" size={28} />
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-sm text-gray-500">總活動數</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
            <PlayCircle className="mx-auto mb-2 text-green-500" size={28} />
            <div className="text-2xl font-bold">{items.filter((c: any) => c.status === 'active' || c.status === 'Active').length}</div>
            <div className="text-sm text-gray-500">進行中</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
            <Trophy className="mx-auto mb-2 text-amber-500" size={28} />
            <div className="text-2xl font-bold">{items.filter((c: any) => c.status === 'ended').length}</div>
            <div className="text-sm text-gray-500">已結束</div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error.message}</div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Gift className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-400">尚未建立任何遊戲化活動</p>
            <p className="text-sm text-gray-400 mt-1">點擊「新增活動」開始建立</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((campaign: any) => (
              <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Gamepad2 className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold">{campaign.name}</div>
                    <div className="text-sm text-gray-500">
                      {campaign.gameType || campaign.game_type || '拉霸機'} · {campaign.description || '無描述'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(campaign.status || 'draft')}
                  {(campaign.status === 'active' || campaign.status === 'Active') ? (
                    <button
                      onClick={() => updateMutation.mutate({ id: campaign.id, status: 'paused' })}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                      title="暫停"
                    >
                      <PauseCircle size={20} />
                    </button>
                  ) : (campaign.status === 'paused' || campaign.status === 'Paused' || campaign.status === 'draft' || campaign.status === 'Draft') ? (
                    <button
                      onClick={() => updateMutation.mutate({ id: campaign.id, status: 'active' })}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="啟動"
                    >
                      <PlayCircle size={20} />
                    </button>
                  ) : null}
                  <button
                    onClick={() => { if (confirm('確定要刪除此活動？')) deleteMutation.mutate({ id: campaign.id }); }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="刪除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">新增遊戲化活動</h3>
                <button onClick={() => setCreateOpen(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">活動名稱</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="例：新春拉霸抽獎" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">遊戲類型</label>
                  <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                    <option value="slot_machine">拉霸機</option>
                    <option value="wheel">轉盤</option>
                    <option value="scratch">刮刮卡</option>
                    <option value="ichiban_kuji">一番賞</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">描述</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
                <button type="submit" disabled={createMutation.isPending} className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow disabled:opacity-50">
                  {createMutation.isPending ? '建立中...' : '建立活動'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
