import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { useState } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Shift type colors
const shiftTypeColors: Record<string, string> = {
  morning: "bg-amber-100 text-amber-700 border-amber-200",
  afternoon: "bg-blue-100 text-blue-700 border-blue-200",
  evening: "bg-purple-100 text-purple-700 border-purple-200",
  full: "bg-green-100 text-green-700 border-green-200",
  off: "bg-gray-100 text-gray-500 border-gray-200",
  custom: "bg-orange-100 text-orange-700 border-orange-200",
};

const shiftTypeLabels: Record<string, string> = {
  morning: "早班",
  afternoon: "午班",
  evening: "晚班",
  full: "全天",
  off: "休假",
  custom: "自訂",
};

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    staffId: "",
    date: "",
    shiftType: "morning" as "morning" | "afternoon" | "evening" | "off" | "custom" | "full",
    startTime: "09:00",
    endTime: "18:00",
  });

  // TODO: Get organizationId from context
  const organizationId = 1;

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: staffList } = trpc.staff.list.useQuery({
    organizationId,
    limit: 100,
  });

  const { data: schedules, refetch } = trpc.schedule.list.useQuery({
    organizationId,
    startDate: format(weekStart, "yyyy-MM-dd"),
    endDate: format(addDays(weekStart, 6), "yyyy-MM-dd"),
    staffId: selectedStaff !== "all" ? parseInt(selectedStaff) : undefined,
  });

  const createMutation = trpc.schedule.create.useMutation({
    onSuccess: () => {
      toast.success("排班新增成功");
      setIsDialogOpen(false);
      setNewSchedule({
        staffId: "",
        date: "",
        shiftType: "morning",
        startTime: "09:00",
        endTime: "18:00",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.staffId || !newSchedule.date) {
      toast.error("請填寫必要欄位");
      return;
    }
    createMutation.mutate({
      organizationId,
      staffId: parseInt(newSchedule.staffId),
      scheduleDate: newSchedule.date,
      shiftType: newSchedule.shiftType as "morning" | "afternoon" | "evening" | "off" | "custom" | "full",
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
    });
  };

  const getScheduleForStaffAndDay = (staffId: number, date: Date) => {
    if (!schedules) return null;
    return schedules.find(
      (s) => s.staffId === staffId && isSameDay(new Date(s.scheduleDate), date)
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">排班管理</h1>
            <p className="text-gray-500 mt-1">管理員工班表與工作時間</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新增排班
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增排班</DialogTitle>
                <DialogDescription>設定員工的工作班次</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>員工</Label>
                  <Select
                    value={newSchedule.staffId}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, staffId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇員工" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList?.data?.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>日期</Label>
                  <Input
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>班次類型</Label>
                  <Select
                    value={newSchedule.shiftType}
                    onValueChange={(value: "morning" | "afternoon" | "evening" | "off" | "custom" | "full") => 
                      setNewSchedule({ ...newSchedule, shiftType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">早班</SelectItem>
                      <SelectItem value="afternoon">午班</SelectItem>
                      <SelectItem value="evening">晚班</SelectItem>
                      <SelectItem value="full">全天</SelectItem>
                      <SelectItem value="off">休假</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>開始時間</Label>
                    <Input
                      type="time"
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>結束時間</Label>
                    <Input
                      type="time"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateSchedule} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "新增中..." : "新增"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Week Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">
                    {format(weekStart, "yyyy年MM月dd日", { locale: zhTW })} - {format(addDays(weekStart, 6), "MM月dd日", { locale: zhTW })}
                  </span>
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setCurrentWeek(new Date())}>
                  今天
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

        {/* Schedule Grid */}
        <Card>
          <CardHeader>
            <CardTitle>班表</CardTitle>
            <CardDescription>點擊空白格子新增排班</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50 text-left w-32">員工</th>
                    {weekDays.map((day) => (
                      <th key={day.toISOString()} className="border p-3 bg-gray-50 text-center min-w-28">
                        <div className="font-medium">{format(day, "EEE", { locale: zhTW })}</div>
                        <div className="text-sm text-gray-500">{format(day, "MM/dd")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staffList?.data?.map((staff) => (
                    <tr key={staff.id}>
                      <td className="border p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{staff.name}</p>
                            <p className="text-xs text-gray-500">{staff.position}</p>
                          </div>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const schedule = getScheduleForStaffAndDay(staff.id, day);
                        return (
                          <td key={day.toISOString()} className="border p-2 text-center">
                            {schedule ? (
                              <div className={`p-2 rounded-lg border ${shiftTypeColors[schedule.shiftType || "morning"]}`}>
                                <div className="font-medium text-sm">
                                  {shiftTypeLabels[schedule.shiftType || "morning"]}
                                </div>
                                <div className="text-xs flex items-center justify-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-12 text-gray-400 hover:text-primary hover:bg-primary/5"
                                onClick={() => {
                                  setNewSchedule({
                                    ...newSchedule,
                                    staffId: staff.id.toString(),
                                    date: format(day, "yyyy-MM-dd"),
                                  });
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">班次類型：</span>
          {Object.entries(shiftTypeLabels).map(([key, label]) => (
            <Badge key={key} className={shiftTypeColors[key]}>
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
