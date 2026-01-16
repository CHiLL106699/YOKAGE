import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Loader2
} from "lucide-react";
import { Link } from "wouter";

// 假別定義
const leaveTypes = [
  { id: "annual", name: "特休", color: "bg-blue-500", remaining: 7 },
  { id: "sick", name: "病假", color: "bg-red-500", remaining: 30 },
  { id: "personal", name: "事假", color: "bg-orange-500", remaining: 14 },
  { id: "marriage", name: "婚假", color: "bg-pink-500", remaining: 8 },
  { id: "funeral", name: "喪假", color: "bg-gray-500", remaining: 8 },
  { id: "maternity", name: "產假", color: "bg-purple-500", remaining: 56 }
];

// 模擬請假記錄
const mockLeaveRecords = [
  {
    id: "leave-001",
    type: "annual",
    typeName: "特休",
    startDate: "2024-01-20",
    endDate: "2024-01-21",
    days: 2,
    reason: "家庭旅遊",
    status: "approved",
    statusText: "已核准",
    appliedAt: "2024-01-10",
    approvedBy: "王經理",
    approvedAt: "2024-01-11"
  },
  {
    id: "leave-002",
    type: "sick",
    typeName: "病假",
    startDate: "2024-01-15",
    endDate: "2024-01-15",
    days: 1,
    reason: "身體不適",
    status: "pending",
    statusText: "審核中",
    appliedAt: "2024-01-14"
  },
  {
    id: "leave-003",
    type: "personal",
    typeName: "事假",
    startDate: "2024-01-05",
    endDate: "2024-01-05",
    days: 1,
    reason: "處理私人事務",
    status: "rejected",
    statusText: "已拒絕",
    appliedAt: "2024-01-03",
    rejectedBy: "王經理",
    rejectedAt: "2024-01-04",
    rejectReason: "當日人力不足"
  }
];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function LiffStaffLeavePage() {
  const [activeTab, setActiveTab] = useState("balance");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const handleSubmit = async () => {
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("請填寫完整資訊");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowApplyDialog(false);
    setFormData({ type: "", startDate: "", endDate: "", reason: "" });
    toast.success("請假申請已送出！");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/liff/staff/clock">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">請假申請</h1>
          </div>
          <Button size="sm" onClick={() => setShowApplyDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            申請請假
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="balance">假別餘額</TabsTrigger>
            <TabsTrigger value="records">請假記錄</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        {activeTab === "balance" && (
          <div className="space-y-4">
            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 gap-3">
              {leaveTypes.map(leave => (
                <Card key={leave.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${leave.color}`} />
                      <span className="font-medium">{leave.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{leave.remaining}</span>
                      <span className="text-sm text-gray-500">天</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">剩餘可用</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Year Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">2024 年度統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">已請假天數</span>
                    <span className="font-medium">5 天</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">待審核</span>
                    <span className="font-medium text-yellow-600">1 件</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">已核准</span>
                    <span className="font-medium text-green-600">3 件</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">已拒絕</span>
                    <span className="font-medium text-red-600">1 件</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "records" && (
          <div className="space-y-3">
            {mockLeaveRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">尚無請假記錄</p>
              </div>
            ) : (
              mockLeaveRecords.map(record => {
                const StatusIcon = statusConfig[record.status]?.icon || AlertCircle;
                const leaveType = leaveTypes.find(t => t.id === record.type);
                
                return (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${leaveType?.color}`} />
                          <span className="font-medium">{record.typeName}</span>
                          <Badge className={statusConfig[record.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {record.statusText}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-400">{record.days} 天</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {record.startDate === record.endDate 
                              ? record.startDate 
                              : `${record.startDate} ~ ${record.endDate}`
                            }
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-gray-600">
                          <FileText className="w-4 h-4 mt-0.5" />
                          <span>{record.reason}</span>
                        </div>
                      </div>

                      {record.status === "approved" && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                          {record.approvedBy} 於 {record.approvedAt} 核准
                        </div>
                      )}

                      {record.status === "rejected" && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-400">
                            {record.rejectedBy} 於 {record.rejectedAt} 拒絕
                          </p>
                          <p className="text-xs text-red-500 mt-1">
                            原因：{record.rejectReason}
                          </p>
                        </div>
                      )}

                      {record.status === "pending" && (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            修改
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-200">
                            取消
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Apply Leave Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>申請請假</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Leave Type */}
            <div className="space-y-2">
              <Label>假別</Label>
              <div className="grid grid-cols-3 gap-2">
                {leaveTypes.slice(0, 6).map(leave => (
                  <button
                    key={leave.id}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      formData.type === leave.id 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setFormData({ ...formData, type: leave.id })}
                  >
                    <div className={`w-2 h-2 rounded-full ${leave.color} mx-auto mb-1`} />
                    <p className="font-medium">{leave.name}</p>
                    <p className="text-xs text-gray-400">餘 {leave.remaining} 天</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>開始日期</Label>
                <Input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>結束日期</Label>
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>請假事由</Label>
              <Textarea 
                placeholder="請說明請假原因..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
