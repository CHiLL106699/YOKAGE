import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Calendar as CalendarIcon, User, Briefcase, Tag } from "lucide-react";
import { Link } from "wouter";

// Mock Data
const mockAppointments = [
  {
    id: "appt-001",
    dateTime: new Date("2026-07-15T10:00:00"),
    customerName: "陳小姐",
    service: "深層臉部護理",
    status: "confirmed",
  },
  {
    id: "appt-002",
    dateTime: new Date("2026-07-15T14:30:00"),
    customerName: "林先生",
    service: "運動按摩",
    status: "completed",
  },
  {
    id: "appt-003",
    dateTime: new Date("2026-07-16T11:00:00"),
    customerName: "王太太",
    service: "美甲服務",
    status: "pending",
  },
  {
    id: "appt-004",
    dateTime: new Date("2026-07-16T16:00:00"),
    customerName: "李先生",
    service: "頭皮護理",
    status: "cancelled",
  },
  {
    id: "appt-005",
    dateTime: new Date("2026-07-17T09:00:00"),
    customerName: "張小姐",
    service: "全身精油按摩",
    status: "confirmed",
  },
    {
    id: "appt-006",
    dateTime: new Date("2026-07-17T13:00:00"),
    customerName: "吳先生",
    service: "臉部護理",
    status: "confirmed",
  },
];

type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

const statusColors: Record<AppointmentStatus, string> = {
  confirmed: "bg-blue-500 text-blue-50",
  pending: "bg-yellow-500 text-yellow-50",
  completed: "bg-green-500 text-green-50",
  cancelled: "bg-red-500 text-red-50",
};

const statusLabels: Record<AppointmentStatus, string> = {
    confirmed: "已確認",
    pending: "待確認",
    completed: "已完成",
    cancelled: "已取消",
};

const StaffAppointments = () => {
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");

  const filteredAppointments = mockAppointments.filter(appt => 
    filter === "all" || appt.status === filter
  ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center mb-6">
        <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link to="/staff">
                <ChevronLeft className="h-4 w-4" />
            </Link>
        </Button>
        <h1 className="text-2xl font-bold">個人預約行事曆</h1>
      </header>

      <Card>
        <CardHeader>
            <CardTitle>預約列表</CardTitle>
            <div className="flex items-center space-x-2 pt-4">
                <span className="text-sm font-medium">篩選狀態:</span>
                <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>全部</Button>
                {(Object.keys(statusLabels) as AppointmentStatus[]).map(status => (
                    <Button key={status} variant={filter === status ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter(status)}>
                        {statusLabels[status]}
                    </Button>
                ))}
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(appt => (
                        <div key={appt.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-muted/50 transition-colors">
                            <div className="flex-1 mb-4 sm:mb-0">
                                <div className="flex items-center mb-2">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <p className="font-semibold text-lg">{appt.dateTime.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })} - {appt.dateTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mb-1">
                                    <User className="h-4 w-4 mr-2" />
                                    <span>客戶: {appt.customerName}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    <span>服務: {appt.service}</span>
                                </div>
                            </div>
                            <Badge className={`${statusColors[appt.status as AppointmentStatus]} flex items-center`}>
                                <Tag className="h-3 w-3 mr-1.5" />
                                {statusLabels[appt.status as AppointmentStatus]}
                            </Badge>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>沒有符合篩選條件的預約。</p>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAppointments;
