import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default function LeaveApprovalPage() {
  const [_, setLocation] = useLocation();

  const [clinicId] = useState('1'); // TODO: Get from context

  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const { data: pendingLeaves, isLoading, refetch } = trpc.leaveManagement.getPendingLeaveRequests.useQuery({
    clinicId,
  });

  const approveMutation = trpc.leaveManagement.approveLeaveRequest.useMutation({
    onSuccess: () => {
      toast.success('請假已批准');
      setSelectedLeave(null);
      setReviewNote('');
      setActionType(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`批准失敗：${error.message}`);
    },
  });

  const rejectMutation = trpc.leaveManagement.rejectLeaveRequest.useMutation({
    onSuccess: () => {
      toast.success('請假已拒絕');
      setSelectedLeave(null);
      setReviewNote('');
      setActionType(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`拒絕失敗：${error.message}`);
    },
  });

  const handleApprove = () => {
    if (!selectedLeave) return;
    approveMutation.mutate({
      leaveId: selectedLeave.id,
      reviewNote,
    });
  };

  const handleReject = () => {
    if (!selectedLeave) return;
    rejectMutation.mutate({
      leaveId: selectedLeave.id,
      reviewNote,
    });
  };

  const calculateDays = (startDate: Date, endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center h-64">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation('/clinic')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            請假審核
          </CardTitle>
          <CardDescription>
            審核員工的請假申請
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingLeaves || pendingLeaves.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>目前沒有待審核的請假申請</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <Card key={leave.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{leave.leaveType}</Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {calculateDays(leave.startDate, leave.endDate)} 天
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(leave.startDate), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                              {' → '}
                              {format(new Date(leave.endDate), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                            </span>
                          </div>

                          {leave.reason && (
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <FileText className="h-4 w-4 mt-0.5" />
                              <span>{leave.reason}</span>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            申請時間：{format(new Date(leave.createdAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setActionType('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          批准
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setActionType('reject');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          拒絕
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 審核對話框 */}
      <Dialog open={!!selectedLeave} onOpenChange={() => {
        setSelectedLeave(null);
        setReviewNote('');
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? '批准請假' : '拒絕請假'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? '確認批准此請假申請嗎？'
                : '確認拒絕此請假申請嗎？'}
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedLeave.leaveType}</Badge>
                  <Badge variant="outline">
                    {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} 天
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(selectedLeave.startDate), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                  {' → '}
                  {format(new Date(selectedLeave.endDate), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">審核備註（選填）</label>
                <Textarea
                  placeholder="填寫審核意見或備註..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLeave(null);
                setReviewNote('');
                setActionType(null);
              }}
            >
              取消
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {approveMutation.isPending || rejectMutation.isPending
                ? '處理中...'
                : actionType === 'approve'
                ? '確認批准'
                : '確認拒絕'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
