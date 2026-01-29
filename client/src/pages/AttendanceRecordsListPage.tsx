import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download, Calendar, Clock, MapPin } from 'lucide-react';

/**
 * 出勤記錄列表頁面
 */

export default function AttendanceRecordsListPage() {
  const [organizationId] = useState(60001); // 測試診所 ID
  const [staffId] = useState(1); // 測試員工 ID
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // 查詢出勤記錄
  const { data: records, isLoading } = trpc.attendance.listRecords.useQuery({
    organizationId,
    staffId,
    startDate,
    endDate,
  });

  // 匯出 CSV
  const handleExportCSV = () => {
    if (!records || records.length === 0) {
      toast.error('沒有資料可以匯出');
      return;
    }

    const headers = ['日期', '上班時間', '下班時間', '上班地點', '下班地點', '狀態', '是否補登'];
    const rows = records.map((record) => [
      record.recordDate,
      record.clockIn ? new Date(record.clockIn).toLocaleTimeString('zh-TW') : '--',
      record.clockOut ? new Date(record.clockOut).toLocaleTimeString('zh-TW') : '--',
      record.checkInAddress || '--',
      record.checkOutAddress || '--',
      record.status || 'normal',
      record.isManualEntry ? '是' : '否',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `出勤記錄_${startDate}_${endDate}.csv`;
    link.click();

    toast.success('CSV 匯出成功');
  };

  // 狀態徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      normal: { label: '正常', variant: 'default' },
      late: { label: '遲到', variant: 'destructive' },
      early_leave: { label: '早退', variant: 'destructive' },
      absent: { label: '缺勤', variant: 'destructive' },
      leave: { label: '請假', variant: 'secondary' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">出勤記錄</h1>
        <p className="text-muted-foreground mt-2">查詢歷史出勤記錄</p>
      </div>

      {/* 日期範圍篩選器 */}
      <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            日期範圍
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-card-foreground">開始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-card-foreground">結束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background text-foreground"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleExportCSV} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                匯出 CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 出勤記錄表格 */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">出勤記錄</CardTitle>
          <CardDescription className="text-muted-foreground">
            共 {records?.length || 0} 筆記錄
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">載入中...</div>
          ) : records && records.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">日期</TableHead>
                    <TableHead className="text-muted-foreground">上班時間</TableHead>
                    <TableHead className="text-muted-foreground">下班時間</TableHead>
                    <TableHead className="text-muted-foreground">上班地點</TableHead>
                    <TableHead className="text-muted-foreground">下班地點</TableHead>
                    <TableHead className="text-muted-foreground">狀態</TableHead>
                    <TableHead className="text-muted-foreground">補登</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="border-border/50">
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(record.recordDate).toLocaleDateString('zh-TW')}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {record.clockIn
                            ? new Date(record.clockIn).toLocaleTimeString('zh-TW', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--:--'}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {record.clockOut
                            ? new Date(record.clockOut).toLocaleTimeString('zh-TW', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '--:--'}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[150px]">
                            {record.checkInAddress || '--'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[150px]">
                            {record.checkOutAddress || '--'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status || 'normal')}</TableCell>
                      <TableCell>
                        {record.isManualEntry ? (
                          <Badge variant="outline" className="text-primary border-primary">
                            補登
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">--</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">查無出勤記錄</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
