import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Clock, FileText, ArrowLeft } from 'lucide-react';

const LEAVE_TYPES = ['病假', '事假', '特休', '育嬰假', '喪假', '婚假', '產假', '陪產假', '其他'] as const;

export default function LeaveRequestPage() {
  const [_, setLocation] = useLocation();

  const [clinicId] = useState('1'); // TODO: Get from context

  const [formData, setFormData] = useState({
    leaveType: '' as typeof LEAVE_TYPES[number] | '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const submitMutation = trpc.leaveManagement.submitLeaveRequest.useMutation({
    onSuccess: () => {
      toast.success('請假申請已提交，等待主管審核');
      setLocation('/clinic');
    },
    onError: (error) => {
      toast.error(`提交失敗：${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveType || !formData.startDate || !formData.endDate) {
      toast.error('請填寫必填欄位：請假類型、開始日期、結束日期');
      return;
    }

    submitMutation.mutate({
      clinicId,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
    });
  };

  return (
    <div className="container max-w-4xl py-8">
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
            請假申請
          </CardTitle>
          <CardDescription>
            填寫請假資訊，提交後等待主管審核
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 請假類型 */}
            <div className="space-y-2">
              <Label htmlFor="leaveType">請假類型 *</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) =>
                  setFormData({ ...formData, leaveType: value as typeof LEAVE_TYPES[number] })
                }
              >
                <SelectTrigger id="leaveType">
                  <SelectValue placeholder="請選擇請假類型" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 開始日期 */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                開始日期 *
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            {/* 結束日期 */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                結束日期 *
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>

            {/* 請假原因 */}
            <div className="space-y-2">
              <Label htmlFor="reason">請假原因</Label>
              <Textarea
                id="reason"
                placeholder="請簡述請假原因（選填）"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* 提交按鈕 */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1"
              >
                {submitMutation.isPending ? '提交中...' : '提交申請'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/clinic')}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
