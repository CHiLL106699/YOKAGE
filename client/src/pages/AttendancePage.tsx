import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Clock, Calendar, User, LogIn, LogOut, MapPin, AlertCircle } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { zhTW } from "date-fns/locale";
import { toast } from "sonner";

// Attendance status colors
const statusColors: Record<string, string> = {
  normal: "bg-green-100 text-green-700",
  late: "bg-yellow-100 text-yellow-700",
  early_leave: "bg-orange-100 text-orange-700",
  absent: "bg-red-100 text-red-700",
  leave: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<string, string> = {
  normal: "正常",
  late: "遲到",
  early_leave: "早退",
  absent: "缺勤",
  leave: "請假",
};

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>("all");

  // TODO: Get organizationId from context
  const organizationId = 1;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: staffList } = trpc.staff.list.useQuery({
    organizationId,
    limit: 100,
  });

  const { data: records, refetch } = trpc.attendance.list.useQuery({
    organizationId,
    date: format(monthStart, "yyyy-MM-dd"),
    staffId: selectedStaff !== "all" ? parseInt(selectedStaff) : undefined,
  });

  const clockInMutation = trpc.attendance.clockIn.useMutation({
    onSuccess: () => {
      toast.success("打卡成功");
      refetch();
    },
    onError: (error) => {
      toast.error(`打卡失敗: ${error.message}`);
    },
  });

  const clockOutMutation = trpc.attendance.clockOut.useMutation({
    onSuccess: () => {
      toast.success("下班打卡成功");
      refetch();
    },
    onError: (error) => {
      toast.error(`打卡失敗: ${error.message}`);
    },
  });

  // Calculate statistics
  const stats = {
    total: records?.length || 0,
    normal: records?.filter((r) => r.status === "normal").length || 0,
    late: records?.filter((r) => r.status === "late").length || 0,
    absent: records?.filter((r) => r.status === "absent").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">打卡記錄</h1>
            <p className="text-gray-500 mt-1">查看員工出勤記錄與打卡狀態</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                // TODO: Get current user's staff ID
                clockInMutation.mutate({
                  organizationId,
                  staffId: 1,
                });
              }}
              disabled={clockInMutation.isPending}
            >
              <LogIn className="h-4 w-4" />
              上班打卡
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                // TODO: Get today's attendance record ID
                clockOutMutation.mutate({
                  id: 1,
                });
              }}
              disabled={clockOutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              下班打卡
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">本月記錄</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">正常出勤</p>
                  <p className="text-2xl font-bold">{stats.normal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">遲到次數</p>
                  <p className="text-2xl font-bold">{stats.late}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">缺勤次數</p>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <Calendar className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {format(currentMonth, "yyyy年MM月", { locale: zhTW })}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setCurrentMonth(new Date())}>
                  本月
                </Button>
              </div>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="篩選員工" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部員工</SelectItem>
                  {staffList?.data?.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>出勤記錄</CardTitle>
            <CardDescription>共 {records?.length || 0} 筆記錄</CardDescription>
          </CardHeader>
          <CardContent>
            {!records?.length ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">本月尚無打卡記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-500">員工</th>
                      <th className="text-left p-3 font-medium text-gray-500">日期</th>
                      <th className="text-left p-3 font-medium text-gray-500">上班時間</th>
                      <th className="text-left p-3 font-medium text-gray-500">下班時間</th>
                      <th className="text-left p-3 font-medium text-gray-500">狀態</th>
                      <th className="text-left p-3 font-medium text-gray-500">備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => {
                      const staff = staffList?.data?.find((s) => s.id === record.staffId);
                      return (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{staff?.name || "未知"}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {format(new Date(record.recordDate), "yyyy/MM/dd (EEE)", { locale: zhTW })}
                          </td>
                          <td className="p-3">
                            {record.clockIn ? (
                              <div className="flex items-center gap-1">
                                <LogIn className="h-4 w-4 text-green-500" />
                                {format(new Date(record.clockIn), "HH:mm")}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            {record.clockOut ? (
                              <div className="flex items-center gap-1">
                                <LogOut className="h-4 w-4 text-blue-500" />
                                {format(new Date(record.clockOut), "HH:mm")}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge className={statusColors[record.status || "normal"]}>
                              {statusLabels[record.status || "normal"]}
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-500 text-sm">
                            {record.notes || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
