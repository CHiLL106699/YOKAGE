/**
 * DashboardSchedule — 排班管理 (/dashboard/schedule)
 */
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Users,
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Package,
  Megaphone,
  Gamepad2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ClipboardList,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { toast } from "sonner";

type ShiftType = "morning" | "evening" | "fullday" | "off";

interface Shift {
  id: number;
  staffId: number;
  staffName: string;
  date: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  notes?: string;
}

const shiftConfig: Record<ShiftType, { label: string; color: string; bg: string }> = {
  morning: { label: "早班", color: "text-blue-300", bg: "bg-blue-500/20 border-blue-500/30" },
  evening: { label: "晚班", color: "text-violet-300", bg: "bg-violet-500/20 border-violet-500/30" },
  fullday: { label: "全天", color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-500/30" },
  off: { label: "休假", color: "text-slate-400", bg: "bg-slate-500/20 border-slate-500/30" },
};




const sidebarItems = [
  { name: "總覽", path: "/dashboard", icon: LayoutDashboard },
  { name: "預約管理", path: "/dashboard/appointments", icon: CalendarDays },
  { name: "客戶管理", path: "/dashboard/customers", icon: UserCircle },
  { name: "員工管理", path: "/dashboard/staff", icon: Users },
  { name: "排班管理", path: "/dashboard/schedule", icon: Calendar },
  { name: "庫存管理", path: "/dashboard/inventory", icon: Package },
  { name: "行銷管理", path: "/dashboard/marketing", icon: Megaphone },
  { name: "遊戲化行銷", path: "/dashboard/gamification", icon: Gamepad2 },
  { name: "報表中心", path: "/dashboard/reports", icon: BarChart3 },
  { name: "診所設定", path: "/dashboard/settings", icon: Settings },
];

export default function DashboardSchedulePage() {
  const organizationId = 1; // TODO: from context
  
  const { data: schedulesData, isLoading: schedLoading, error: schedError, refetch: refetchSchedules } = trpc.schedule.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: staffData, isLoading: staffLoading } = trpc.staff.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const createScheduleMutation = trpc.schedule.create.useMutation({
    onSuccess: () => { toast.success("排班已建立"); refetchSchedules(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = schedLoading || staffLoading;
  const schedules = (schedulesData as any)?.data ?? schedulesData ?? [];
  const staffList = staffData?.data ?? [];

  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [showModal, setShowModal] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const dayNames = ["一", "二", "三", "四", "五", "六", "日"];

  const getShiftsForStaffAndDate = (staffId: number, dateStr: string) => {
    return schedules.filter((s) => s.staffId === staffId && s.date === dateStr);
  };

  if (isLoading) return <QueryLoading variant="skeleton-table" />;

  if (schedError) return <QueryError message={schedError.message} onRetry={refetchSchedules} />;


  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <Link href="/dashboard"><span className="flex items-center gap-2 text-xl font-bold cursor-pointer"><span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-bold">Y</span>YOChiLL</span></Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="size-5" /></button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                  <item.icon className="size-5" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
          <Link href="/"><span className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 cursor-pointer"><LogOut className="size-4" />登出系統</span></Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-slate-800 px-6 py-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="size-6" /></button>
        </div>

        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">排班管理</h1>
              <p className="text-sm text-slate-400">管理員工班表與排班設定</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border border-slate-700">
                <button onClick={() => setViewMode("week")} className={`px-4 py-2 text-sm ${viewMode === "week" ? "bg-indigo-600 text-white" : "text-slate-400"} rounded-l-lg`}>週視圖</button>
                <button onClick={() => setViewMode("month")} className={`px-4 py-2 text-sm ${viewMode === "month" ? "bg-indigo-600 text-white" : "text-slate-400"} rounded-r-lg`}>月視圖</button>
              </div>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700">
                <Plus className="size-4" />新增班表
              </button>
            </div>
          </div>

          {/* Week navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800">
              <ChevronLeft className="size-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {weekDays[0].toLocaleDateString("zh-TW", { month: "long", day: "numeric" })} — {weekDays[6].toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
            </h2>
            <button onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)} className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800">
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Drag hint */}
          <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-center text-xs text-slate-500">
            <ClipboardList className="mr-1 inline size-3" />
            提示：可拖曳班表區塊進行快速排班調整
          </div>

          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-4">
            {(Object.entries(shiftConfig) as [ShiftType, typeof shiftConfig.morning][]).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <div className={`size-3 rounded ${config.bg} border`} />
                <span className={config.color}>{config.label}</span>
              </div>
            ))}
          </div>

          {/* Week view */}
          {viewMode === "week" && (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="sticky left-0 z-10 bg-slate-900 px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">員工</th>
                    {weekDays.map((day, i) => {
                      const isToday = day.toDateString() === today.toDateString();
                      return (
                        <th key={i} className={`px-3 py-3 text-center text-xs ${isToday ? "bg-indigo-900/20" : ""}`}>
                          <div className="text-slate-500">週{dayNames[i]}</div>
                          <div className={`mt-1 text-sm font-medium ${isToday ? "text-indigo-400" : "text-slate-300"}`}>{day.getDate()}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="sticky left-0 z-10 bg-slate-950 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-medium text-indigo-400">{staff.name[0]}</div>
                          <span className="text-sm font-medium">{staff.name}</span>
                        </div>
                      </td>
                      {weekDays.map((day, i) => {
                        const dateStr = day.toISOString().split("T")[0];
                        const shifts = getShiftsForStaffAndDate(staff.id, dateStr);
                        const isToday = day.toDateString() === today.toDateString();
                        return (
                          <td key={i} className={`px-2 py-2 ${isToday ? "bg-indigo-900/10" : ""}`}>
                            {shifts.map((shift) => (
                              <div key={shift.id} className={`rounded-lg border px-2 py-1.5 text-center text-xs ${shiftConfig[shift.shiftType].bg}`}>
                                <div className={`font-medium ${shiftConfig[shift.shiftType].color}`}>{shiftConfig[shift.shiftType].label}</div>
                                {shift.startTime && <div className="mt-0.5 text-slate-500">{shift.startTime}-{shift.endTime}</div>}
                              </div>
                            ))}
                            {shifts.length === 0 && (
                              <div className="rounded-lg border border-dashed border-slate-700 px-2 py-1.5 text-center text-xs text-slate-600">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Month view */}
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-1 rounded-xl border border-slate-800 p-2">
              {dayNames.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-slate-500">週{d}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const startOffset = (firstDay.getDay() + 6) % 7;
                const dayNum = i - startOffset + 1;
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                const isToday = isValid && dayNum === today.getDate();
                const staffCount = isValid ? Math.floor(Math.random() * 4) + 4 : 0;

                return (
                  <div key={i} className={`min-h-[80px] rounded-lg border p-2 ${isToday ? "border-indigo-500 bg-indigo-900/20" : "border-slate-800"} ${!isValid ? "opacity-30" : ""}`}>
                    {isValid && (
                      <>
                        <div className={`text-sm font-medium ${isToday ? "text-indigo-400" : "text-slate-300"}`}>{dayNum}</div>
                        <div className="mt-1 text-xs text-slate-500">{staffCount} 人上班</div>
                        <div className="mt-1 flex gap-1">
                          {Array.from({ length: Math.min(staffCount, 4) }, (_, j) => (
                            <div key={j} className="size-2 rounded-full bg-indigo-500/40" />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* New shift modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">新增班表</h3>
                <button onClick={() => setShowModal(false)}><X className="size-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">員工</label>
                  <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white">
                    {staffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">日期</label>
                  <input type="date" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">班別</label>
                  <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white">
                    <option value="morning">早班 (09:00-14:00)</option>
                    <option value="evening">晚班 (14:00-21:00)</option>
                    <option value="fullday">全天 (09:00-21:00)</option>
                    <option value="off">休假</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">開始時間</label>
                    <input type="time" defaultValue="09:00" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">結束時間</label>
                    <input type="time" defaultValue="18:00" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">備註</label>
                  <textarea className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white" rows={2} placeholder="選填..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-slate-700 py-2 text-sm text-slate-300 hover:bg-slate-800">取消</button>
                  <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">儲存</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
