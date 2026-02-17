/**
 * YOKAGE — 超級管理員：升級請求管理頁面
 * /admin/upgrades
 */
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
  ArrowUpCircle, CheckCircle2, XCircle, Clock, Building2,
  Loader2, Eye, RefreshCw, Filter, Search
} from 'lucide-react';

interface UpgradeRequest {
  id: number;
  tenantId: number;
  tenantName: string;
  currentPlan: string;
  requestedPlan: string;
  status: string;
  requestedAt: string;
  reviewedAt: string | null;
  notes: string | null;
  sourceProduct: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: '待審核', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: '已批准', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const PLAN_LABELS: Record<string, string> = {
  yyq_basic: 'YaoYouQian 基礎版',
  yyq_advanced: 'YaoYouQian 進階版',
  yokage_pro: 'YOKAGE 高配版',
};

export default function AdminUpgradeRequests() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 查詢升級請求列表
  const requestsQuery = trpc.superAdmin.listUpgradeRequests.useQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  // 審核升級請求
  const reviewMutation = trpc.superAdmin.reviewUpgradeRequest.useMutation({
    onSuccess: () => {
      requestsQuery.refetch();
    },
  });

  const requests: UpgradeRequest[] = (requestsQuery.data as any)?.data || [];
  const stats = (requestsQuery.data as any)?.stats || { pending: 0, approved: 0, rejected: 0, total: 0 };

  const filteredRequests = requests.filter((req) => {
    if (searchTerm) {
      return req.tenantName?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleApprove = (requestId: number) => {
    reviewMutation.mutate({ requestId, action: 'approve' });
  };

  const handleReject = (requestId: number) => {
    reviewMutation.mutate({ requestId, action: 'reject' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowUpCircle className="h-7 w-7 text-indigo-600" />
              升級請求管理
            </h1>
            <p className="text-gray-500 mt-1">管理從 YaoYouQian 升級到 YOKAGE 高配版的請求</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => requestsQuery.refetch()}
            disabled={requestsQuery.isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${requestsQuery.isRefetching ? 'animate-spin' : ''}`} />
            重新整理
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('all')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">總請求數</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('pending')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">待審核</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('approved')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-gray-500">已批准</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('rejected')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-gray-500">已拒絕</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋租戶名稱..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? '全部' : STATUS_CONFIG[status]?.label || status}
              </Button>
            ))}
          </div>
        </div>

        {/* Request List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">升級請求列表</CardTitle>
            <CardDescription>
              {statusFilter === 'all' ? '顯示所有升級請求' : `篩選：${STATUS_CONFIG[statusFilter]?.label || statusFilter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ArrowUpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>目前沒有升級請求</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => {
                  const statusInfo = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{req.tenantName || `租戶 #${req.tenantId}`}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {PLAN_LABELS[req.currentPlan] || req.currentPlan}
                            </span>
                            <span className="text-xs text-gray-400">→</span>
                            <span className="text-xs font-medium text-indigo-600">
                              {PLAN_LABELS[req.requestedPlan] || req.requestedPlan}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            申請時間：{req.requestedAt ? new Date(req.requestedAt).toLocaleString('zh-TW') : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusInfo.color} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApprove(req.id)}
                              disabled={reviewMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              批准
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(req.id)}
                              disabled={reviewMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              拒絕
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
