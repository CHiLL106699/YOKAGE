import { useState } from "react";
import { Button } from "@/components/ui/button";
import { safeDate } from '@/lib/safeFormat';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

const leaveTypes = [
  { id: "特休", name: "特休", color: "bg-blue-500" },
  { id: "病假", name: "病假", color: "bg-red-500" },
  { id: "事假", name: "事假", color: "bg-orange-500" },
  { id: "婚假", name: "婚假", color: "bg-pink-500" },
  { id: "喪假", name: "喪假", color: "bg-gray-500" },
  { id: "產假", name: "產假", color: "bg-purple-500" },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, label: "審核中" },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "已核准" },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle, label: "已拒絕" },
};

export default function LiffStaffLeavePage() {
  const { organizationId, staffId, isLoading: ctxLoading } = useStaffContext();
  const [activeTab, setActiveTab] = useState("balance");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const utils = trpc.useUtils();

  // Fetch leave requests
  const leaveQuery = trpc.leaveManagement.getMyLeaveRequests.useQuery(
    { clinicId: String(organizationId) },
    { enabled: !ctxLoading }
  );

  // Fetch leave statistics
  const statsQuery = trpc.leaveManagement.getLeaveStatistics.useQuery(
    { clinicId: String(organizationId), year: new Date().getFullYear() },
    { enabled: !ctxLoading }
  );

  // Submit leave request mutation
  const submitLeave = trpc.leaveManagement.submitLeaveRequest.useMutation({
    onSuccess: () => {
      utils.leaveManagement.getMyLeaveRequests.invalidate();
      utils.leaveManagement.getLeaveStatistics.invalidate();
      setShowApplyDialog(false);
      setFormData({ type: "", startDate: "", endDate: "", reason: "" });
      toast.success("請假申請已送出");
    },
    onError: (err) => {
      toast.error(`申請失敗: ${err.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("請填寫完整資訊");
      return;
    }
    submitLeave.mutate({
      clinicId: String(organizationId),
      leaveType: formData.type as any,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
    });
  };

  if (ctxLoading || leaveQuery.isLoading) {
    return <PageLoadingSkeleton message="載入請假資料..." />;
  }

  if (leaveQuery.isError) {
    return <PageError message="無法載入請假記錄" onRetry={() => leaveQuery.refetch()} />;
  }

  const leaveRecords: any[] = Array.isArray(leaveQuery.data) ? leaveQuery.data : [];
  const leaveStats: any = statsQuery.data ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/liff/member">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">請假管理</h1>
          </div>
          <Button size="sm" onClick={() => setShowApplyDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            請假
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white border-b px-4">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0">
            <TabsTrigger value="balance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              假別餘額
            </TabsTrigger>
            <TabsTrigger value="records" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              請假記錄
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Balance Tab */}
        <TabsContent value="balance" className="p-4 space-y-3 mt-0">
          <div className="grid grid-cols-2 gap-3">
            {leaveTypes.map((type) => {
              const remaining = leaveStats[type.id]?.remaining ?? 0;
              const used = leaveStats[type.id]?.used ?? 0;
              const total = remaining + used;
              return (
                <Card key={type.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <span className="font-medium text-sm">{type.name}</span>
                    </div>
                    <p className="text-2xl font-bold">{remaining}</p>
                    <p className="text-xs text-gray-500">
                      已用 {used} / 共 {total} 天
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${type.color} rounded-full`}
                        style={{ width: total > 0 ? `${(used / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="p-4 space-y-3 mt-0">
          {leaveRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暫無請假記錄</p>
            </div>
          ) : (
            leaveRecords.map((record: any) => {
              const config = statusConfig[record.status] ?? statusConfig.pending;
              const StatusIcon = config.icon;
              const typeName = leaveTypes.find((t) => t.id === record.leaveType)?.name ?? record.leaveType;
              return (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium">{typeName}</span>
                        <p className="text-sm text-gray-500 mt-1">
                          {safeDate(record.startDate)} ~ {safeDate(record.endDate)}
                        </p>
                      </div>
                      <Badge className={config.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{record.reason}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>申請請假</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>假別</Label>
              <select
                className="w-full h-10 px-3 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">請選擇假別</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>開始日期</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>結束日期</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>請假原因</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="請輸入請假原因"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitLeave.isPending}>
              {submitLeave.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  送出中...
                </>
              ) : (
                "送出申請"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
