import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const TREATMENT_TYPES = [
  { value: 'injection', label: '注射' },
  { value: 'laser', label: '雷射' },
  { value: 'facial', label: '臉部護理' },
  { value: 'surgery', label: '手術' },
  { value: 'consultation', label: '諮詢' },
  { value: 'other', label: '其他' },
];

function StarRating({ score }: { score: number | null }) {
  if (!score) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= score ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export default function EmrListPage() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data, isLoading } = trpc.pro.sprint5.emr.list.useQuery({
    organizationId: 1,
    customerId: filterCustomerId ? Number(filterCustomerId) : undefined,
    treatmentType: filterType !== 'all' ? filterType : undefined,
    page,
    limit: 20,
  });

  const records = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">電子病歷 EMR</h1>
          <p className="text-muted-foreground mt-1">管理診所的電子病歷記錄，支援 Before/After 照片比對</p>
        </div>
        <Button onClick={() => setLocation('/dashboard/emr/new')}>
          <Plus className="w-4 h-4 mr-2" />
          新增病歷
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="依客戶 ID 篩選..."
            value={filterCustomerId}
            onChange={e => { setFilterCustomerId(e.target.value); setPage(1); }}
            className="pl-10"
            type="number"
          />
        </div>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="療程類型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部類型</SelectItem>
            {TREATMENT_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">共 {total} 筆病歷</span>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">載入中...</div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>尚無病歷記錄</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="py-3 px-4">日期</th>
                <th className="py-3 px-4">客戶</th>
                <th className="py-3 px-4">負責人員</th>
                <th className="py-3 px-4">療程類型</th>
                <th className="py-3 px-4">療程部位</th>
                <th className="py-3 px-4">滿意度</th>
                <th className="py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/dashboard/emr/${record.id}`)}
                >
                  <td className="py-3 px-4 text-sm">
                    {record.treatmentDate ? format(new Date(record.treatmentDate), 'yyyy-MM-dd') : '-'}
                  </td>
                  <td className="py-3 px-4 font-medium">{record.customerName || `客戶 #${record.customerId}`}</td>
                  <td className="py-3 px-4">{record.staffName || '-'}</td>
                  <td className="py-3 px-4">
                    {TREATMENT_TYPES.find(t => t.value === record.treatmentType)?.label || record.treatmentType || '-'}
                  </td>
                  <td className="py-3 px-4">{record.treatmentArea || '-'}</td>
                  <td className="py-3 px-4">
                    <StarRating score={record.satisfactionScore} />
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setLocation(`/dashboard/emr/${record.id}`); }}>
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
    </div>
  );
}
