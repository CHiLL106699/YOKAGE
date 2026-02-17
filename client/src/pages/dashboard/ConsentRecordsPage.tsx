import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileCheck, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const categoryLabels: Record<string, string> = {
  treatment: '療程',
  surgery: '手術',
  anesthesia: '麻醉',
  photography: '攝影',
  general: '一般',
};

const categoryColors: Record<string, string> = {
  treatment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  surgery: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  anesthesia: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  photography: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function ConsentRecordsPage() {
  const [page, setPage] = useState(1);
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data, isLoading } = trpc.pro.sprint5.consent.listSignatures.useQuery({
    organizationId: 1,
    customerId: filterCustomerId ? Number(filterCustomerId) : undefined,
    page,
    limit: 20,
  });

  const { data: detail } = trpc.pro.sprint5.consent.getSignature.useQuery(
    { id: detailId! },
    { enabled: detailId !== null },
  );

  const records = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">簽署記錄查詢</h1>
        <p className="text-muted-foreground mt-1">查詢與管理所有知情同意書的簽署記錄</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="依客戶 ID 篩選..."
            value={filterCustomerId}
            onChange={e => { setFilterCustomerId(e.target.value); setPage(1); }}
            className="pl-10"
            type="number"
          />
        </div>
        <span className="text-sm text-muted-foreground">共 {total} 筆記錄</span>
      </div>

      {/* Records Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">載入中...</div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>尚無簽署記錄</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="py-3 px-4">客戶</th>
                <th className="py-3 px-4">同意書</th>
                <th className="py-3 px-4">分類</th>
                <th className="py-3 px-4">簽署時間</th>
                <th className="py-3 px-4">狀態</th>
                <th className="py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{record.customerName || `客戶 #${record.customerId}`}</td>
                  <td className="py-3 px-4">{record.templateName || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge className={categoryColors[record.templateCategory || 'general']}>
                      {categoryLabels[record.templateCategory || 'general'] || '一般'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {record.signedAt ? format(new Date(record.signedAt), 'yyyy-MM-dd HH:mm') : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={record.status === 'signed' ? 'default' : 'secondary'}>
                      {record.status === 'signed' ? '已簽署' : record.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => setDetailId(record.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      檢視
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">第 {page} / {totalPages} 頁</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailId !== null} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>簽署記錄詳情</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">客戶：</span>
                  <span className="font-medium ml-2">{detail.customerName || `#${detail.customerId}`}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">同意書：</span>
                  <span className="font-medium ml-2">{detail.templateName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">分類：</span>
                  <Badge className={`ml-2 ${categoryColors[detail.templateCategory || 'general']}`}>
                    {categoryLabels[detail.templateCategory || 'general']}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">簽署時間：</span>
                  <span className="font-medium ml-2">
                    {detail.signedAt ? format(new Date(detail.signedAt), 'yyyy-MM-dd HH:mm:ss') : '-'}
                  </span>
                </div>
                {detail.witnessName && (
                  <div>
                    <span className="text-muted-foreground">見證人：</span>
                    <span className="font-medium ml-2">{detail.witnessName}</span>
                  </div>
                )}
                {detail.ipAddress && (
                  <div>
                    <span className="text-muted-foreground">IP 位址：</span>
                    <span className="font-medium ml-2">{detail.ipAddress}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">同意書內容</h3>
                <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {detail.signedContent || detail.templateContent || '無內容'}
                </div>
              </div>

              {detail.signatureImageUrl && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">簽名</h3>
                    <div className="border rounded-lg p-2 bg-white inline-block">
                      <img
                        src={detail.signatureImageUrl}
                        alt="簽名"
                        className="max-h-32"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
