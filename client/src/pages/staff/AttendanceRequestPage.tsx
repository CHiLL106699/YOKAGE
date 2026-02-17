import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileEdit, ListChecks, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

import { QueryError } from '@/components/ui/query-state';

const approvalStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待審核', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  approved: { label: '已核准', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export default function AttendanceRequestPage() {
  const { toast } = useToast();
  const ORG_ID = 1;
  const STAFF_ID = 1;

  // Make-up form state
  const [requestDate, setRequestDate] = useState('');
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [reason, setReason] = useState('');

  // Request list state
  const [listPage, setListPage] = useState(1);
  const now = new Date();
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

  const utils = trpc.useUtils();

  const submitMutation = trpc.pro.sprint5.attendance.submitMakeUpRequest.useMutation({
    onSuccess: () => {
      toast({ title: '成功', description: '補打卡申請已送出' });
      setRequestDate('');
      setClockInTime('');
      setClockOutTime('');
      setReason('');
      utils.pro.sprint5.attendance.listRecords.invalidate();
    },
    onError: (err) => toast({ title: '錯誤', description: err.message, variant: 'destructive' }),
  });

  const { data: recordsData, isError, refetch } = trpc.pro.sprint5.attendance.listRecords.useQuery({
    organizationId: ORG_ID,
    staffId: STAFF_ID,
    startDate,
    endDate,
    page: listPage,
    limit: 20,
  });

  // Filter to show only manual entries
  const manualRecords = (recordsData?.data ?? []).filter(r => r.isManualEntry);

  function handleSubmit() {
    if (!requestDate || !reason.trim()) {
      toast({ title: '錯誤', description: '日期和原因為必填', variant: 'destructive' });
      return;
    }

    const clockInStr = clockInTime ? `${requestDate}T${clockInTime}:00` : undefined;
    const clockOutStr = clockOutTime ? `${requestDate}T${clockOutTime}:00` : undefined;

    submitMutation.mutate({
      organizationId: ORG_ID,
      staffId: STAFF_ID,
      recordDate: requestDate,
      clockIn: clockInStr,
      clockOut: clockOutStr,
      reason: reason.trim(),
    });
  }

  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">補打卡 / 加班申請</h1>
        <p className="text-muted-foreground mt-1">提交補打卡或加班申請，查看審核狀態</p>
      </div>

      <Tabs defaultValue="request">
        <TabsList>
          <TabsTrigger value="request" className="gap-2">
            <FileEdit className="w-4 h-4" />
            補打卡申請
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <ListChecks className="w-4 h-4" />
            我的申請
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>提交補打卡申請</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>補打卡日期 *</Label>
                <Input
                  type="date"
                  value={requestDate}
                  onChange={e => setRequestDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>上班時間</Label>
                  <Input
                    type="time"
                    value={clockInTime}
                    onChange={e => setClockInTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>下班時間</Label>
                  <Input
                    type="time"
                    value={clockOutTime}
                    onChange={e => setClockOutTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>補打卡原因 *</Label>
                <Textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="請說明補打卡原因..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? '提交中...' : '提交申請'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>我的補打卡申請</CardTitle>
            </CardHeader>
            <CardContent>
              {manualRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>本月尚無補打卡申請</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {manualRecords.map(record => (
                    <div key={record.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{record.recordDate}</span>
                        <Badge className={approvalStatusConfig[record.approvalStatus || 'pending']?.color || ''}>
                          {approvalStatusConfig[record.approvalStatus || 'pending']?.label || '待審核'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          上班：{record.clockIn ? format(new Date(record.clockIn), 'HH:mm') : '--:--'}
                        </div>
                        <div>
                          下班：{record.clockOut ? format(new Date(record.clockOut), 'HH:mm') : '--:--'}
                        </div>
                      </div>
                      {record.manualReason && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">原因：</span>
                          {record.manualReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {(recordsData?.total ?? 0) > 20 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setListPage(p => Math.max(1, p - 1))} disabled={listPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">第 {listPage} 頁</span>
                  <Button variant="outline" size="sm" onClick={() => setListPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
