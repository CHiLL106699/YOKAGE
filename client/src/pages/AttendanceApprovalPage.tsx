import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Clock, MapPin, Calendar, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/**
 * 管理人員審核介面
 * 補登申請審核 + 異常打卡記錄
 */

export default function AttendanceApprovalPage() {
  const [organizationId] = useState(60001); // 測試診所 ID
  const [approverId] = useState(1); // 管理人員 ID
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 查詢補登申請列表
  const { data: records, refetch } = trpc.attendance.listRecords.useQuery({
    organizationId,
    approvalStatus,
  });

  // 審核補登申請
  const approveCorrection = trpc.attendance.approveCorrection.useMutation({
    onSuccess: () => {
      toast.success('審核完成');
      refetch();
      setIsApprovalDialogOpen(false);
      setSelectedRecord(null);
      setRejectReason('');
    },
    onError: (error) => {
      toast.error(`審核失敗：${error.message}`);
    },
  });

  // 處理審核
  const handleApprove = (record: any, approved: boolean) => {
    setSelectedRecord(record);
    if (approved) {
      approveCorrection.mutate({
        recordId: record.id,
        approved: true,
        approverId,
      });
    } else {
      setIsApprovalDialogOpen(true);
    }
  };

  // 處理拒絕審核
  const handleReject = () => {
    if (!selectedRecord) return;

    approveCorrection.mutate({
      recordId: selectedRecord.id,
      approved: false,
      approverId,
    });
  };

  // 批次審核
  const handleBatchApprove = () => {
    if (!records || records.length === 0) {
      toast.error('沒有待審核的記錄');
      return;
    }

    const pendingRecords = records.filter((r) => r.approvalStatus === 'pending');
    
    if (pendingRecords.length === 0) {
      toast.error('沒有待審核的記錄');
      return;
    }

    // 批次核准
    Promise.all(
      pendingRecords.map((record) =>
        approveCorrection.mutateAsync({
          recordId: record.id,
          approved: true,
          approverId,
        })
      )
    )
      .then(() => {
        toast.success(`已批次核准 ${pendingRecords.length} 筆申請`);
        refetch();
      })
      .catch((error) => {
        toast.error(`批次審核失敗：${error.message}`);
      });
  };

  // 狀態徽章
  const getApprovalStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      pending: { label: '待審核', variant: 'secondary' },
      approved: { label: '已核准', variant: 'default' },
      rejected: { label: '已拒絕', variant: 'destructive' },
    };

    const config = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">出勤審核</h1>
        <p className="text-muted-foreground mt-2">補登申請審核與異常打卡記錄管理</p>
      </div>

      {/* 篩選器 */}
      <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">篩選條件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-card-foreground">審核狀態</Label>
              <Select
                value={approvalStatus}
                onValueChange={(value: any) => setApprovalStatus(value)}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  <SelectItem value="pending">待審核</SelectItem>
                  <SelectItem value="approved">已核准</SelectItem>
                  <SelectItem value="rejected">已拒絕</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleBatchApprove}
                disabled={approvalStatus !== 'pending' || !records || records.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                批次核准
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 補登申請列表 */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">補登申請列表</CardTitle>
          <CardDescription className="text-muted-foreground">
            共 {records?.length || 0} 筆記錄
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records && records.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">員工</TableHead>
                    <TableHead className="text-muted-foreground">日期</TableHead>
                    <TableHead className="text-muted-foreground">上班時間</TableHead>
                    <TableHead className="text-muted-foreground">下班時間</TableHead>
                    <TableHead className="text-muted-foreground">補登原因</TableHead>
                    <TableHead className="text-muted-foreground">員工備註</TableHead>
                    <TableHead className="text-muted-foreground">狀態</TableHead>
                    <TableHead className="text-muted-foreground">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="border-border/50">
                      <TableCell className="text-foreground">
                        員工 #{record.staffId}
                      </TableCell>
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
                        <p className="text-sm max-w-[200px] truncate">
                          {record.manualReason || '--'}
                        </p>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {record.staffNote ? (
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm max-w-[200px] truncate" title={record.staffNote}>
                              {record.staffNote}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell>{getApprovalStatusBadge(record.approvalStatus || 'pending')}</TableCell>
                      <TableCell>
                        {record.approvalStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(record, true)}
                              disabled={approveCorrection.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApprove(record, false)}
                              disabled={approveCorrection.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {record.approvalStatus !== 'pending' && (
                          <span className="text-sm text-muted-foreground">--</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">查無補登申請記錄</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 拒絕審核對話框 */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="bg-popover text-popover-foreground">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">拒絕補登申請</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              請說明拒絕原因
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason" className="text-popover-foreground">拒絕原因</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="請說明拒絕原因..."
                className="bg-background text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApprovalDialogOpen(false);
                setSelectedRecord(null);
                setRejectReason('');
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || approveCorrection.isPending}
            >
              確認拒絕
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
