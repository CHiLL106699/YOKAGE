import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User, MoreHorizontal, Check, X, CalendarDays, Users, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// 使用優化後的通用元件
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatCard, StatGrid } from "@/components/ui/stat-card";

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cancelConfirm, setCancelConfirm] = useState<{ open: boolean; appointmentId: number | null }>({
    open: false,
    appointmentId: null,
  });
  
  // TODO: Get organizationId from context
  const organizationId = 1;
  
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const { data: appointmentsData, isLoading, refetch } = trpc.appointment.list.useQuery({
    organizationId,
    date: dateStr,
  });

  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => {
      toast.success("預約狀態已更新");
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleUpdateStatus = (id: number, status: "confirmed" | "arrived" | "completed" | "cancelled" | "no_show") => {
    if (status === "cancelled") {
      setCancelConfirm({ open: true, appointmentId: id });
    } else {
      updateMutation.mutate({ id, status });
    }
  };

  const handleConfirmCancel = () => {
    if (cancelConfirm.appointmentId) {
      updateMutation.mutate({ id: cancelConfirm.appointmentId, status: "cancelled" });
      setCancelConfirm({ open: false, appointmentId: null });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">待確認</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">已確認</Badge>;
      case "arrived":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">已到店</Badge>;
      case "in_progress":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">進行中</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">已完成</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">已取消</Badge>;
      case "no_show":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">未到店</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;
  };

  const appointments = appointmentsData?.data || [];

  // 計算統計數據
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed" || a.status === "arrived").length,
    completed: appointments.filter(a => a.status === "completed").length,
  };

  // Group appointments by time
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <PageHeader
          title="預約管理"
          description="管理診所預約排程"
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新增預約
            </Button>
          }
        />

        {/* Stats Cards */}
        <StatGrid columns={4}>
          <StatCard
            title="今日預約"
            value={stats.total}
            icon={CalendarDays}
            description="筆預約"
          />
          <StatCard
            title="待確認"
            value={stats.pending}
            icon={AlertCircle}
            className={stats.pending > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}
          />
          <StatCard
            title="已確認"
            value={stats.confirmed}
            icon={Users}
          />
          <StatCard
            title="已完成"
            value={stats.completed}
            icon={CheckCircle}
          />
        </StatGrid>

        {/* Date Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handlePrevDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-semibold min-w-[200px] text-center">
                  {formatDate(selectedDate)}
                </div>
                <Button variant="outline" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleToday}>
                  今天
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                共 {appointments.length} 筆預約
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable
                columns={4}
                rows={5}
                headers={["時間", "客戶", "狀態", "操作"]}
              />
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="當日無預約"
                description="點擊「新增預約」開始建立"
                action={{
                  label: "新增預約",
                  onClick: () => toast.info("新增預約功能開發中"),
                }}
              />
            ) : (
              <div className="space-y-4">
                {timeSlots.map((time) => {
                  const slotAppointments = appointments.filter(
                    (apt) => apt.startTime.startsWith(time.split(":")[0])
                  );
                  
                  if (slotAppointments.length === 0) return null;
                  
                  return (
                    <div key={time} className="flex gap-4">
                      <div className="w-20 text-sm font-medium text-muted-foreground pt-3">
                        {time}
                      </div>
                      <div className="flex-1 space-y-2">
                        {slotAppointments.map((apt) => (
                          <Card key={apt.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">客戶 #{apt.customerId}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {apt.startTime} - {apt.endTime ?? "未定"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(apt.status ?? "pending")}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, "confirmed")}>
                                        <Check className="h-4 w-4 mr-2" />
                                        確認預約
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, "arrived")}>
                                        <User className="h-4 w-4 mr-2" />
                                        標記到店
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, "completed")}>
                                        <Check className="h-4 w-4 mr-2" />
                                        完成服務
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        取消預約
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              {apt.notes && (
                                <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                                  {apt.notes}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm Cancel Dialog */}
        <ConfirmDialog
          open={cancelConfirm.open}
          onOpenChange={(open) => setCancelConfirm({ ...cancelConfirm, open })}
          title="確認取消預約"
          description="確定要取消此預約嗎？此操作無法復原。"
          confirmText="取消預約"
          cancelText="返回"
          variant="destructive"
          onConfirm={handleConfirmCancel}
        />
      </div>
    </DashboardLayout>
  );
}
