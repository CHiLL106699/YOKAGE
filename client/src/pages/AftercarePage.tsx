import DashboardLayout from "@/components/DashboardLayout";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Heart, Plus, MoreHorizontal, Phone, Check, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AftercarePage() {
  const [activeTab, setActiveTab] = useState("pending");
  
  // TODO: Get organizationId from context
  const organizationId = 1;
  
  const { data: aftercareData, isLoading, refetch } = trpc.aftercare.list.useQuery({
    organizationId,
    status: activeTab as "pending" | "in_progress" | "completed" | "cancelled",
  });

  const updateMutation = trpc.aftercare.update.useMutation({
    onSuccess: () => {
      toast.success("狀態已更新");
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const handleUpdateStatus = (id: number, status: "pending" | "in_progress" | "completed" | "cancelled") => {
    updateMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">待關懷</Badge>;
      case "contacted":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">已聯繫</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">已完成</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">已取消</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case "follow_up":
        return <Badge variant="outline">術後追蹤</Badge>;
      case "reminder":
        return <Badge variant="outline">回診提醒</Badge>;
      case "satisfaction":
        return <Badge variant="outline">滿意度調查</Badge>;
      case "promotion":
        return <Badge variant="outline">優惠通知</Badge>;
      default:
        return <Badge variant="outline">一般關懷</Badge>;
    }
  };

  const records = aftercareData || [];

  const tabCounts = {
    pending: records.filter(r => r.status === "pending").length,
    contacted: records.filter(r => r.status === "in_progress").length,
    completed: records.filter(r => r.status === "completed").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">術後關懷</h1>
            <p className="text-gray-500 mt-1">管理客戶術後追蹤與回訪</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新增關懷記錄
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待關懷</p>
                  <p className="text-2xl font-bold">{tabCounts.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">已聯繫</p>
                  <p className="text-2xl font-bold">{tabCounts.contacted}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">已完成</p>
                  <p className="text-2xl font-bold">{tabCounts.completed}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">待關懷</TabsTrigger>
                <TabsTrigger value="contacted">已聯繫</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Heart className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">暫無關懷記錄</p>
                <p className="text-sm">點擊「新增關懷記錄」開始建立</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客戶</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>預定日期</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>備註</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-pink-500" />
                          </div>
                          <div>
                            <p className="font-medium">客戶 #{record.customerId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(null)}</TableCell>
                      <TableCell>
                        {record.followUpDate 
                          ? safeDate(record.followUpDate)
                          : "-"
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status ?? "pending")}</TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {record.notes || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(record.id, "in_progress")}>
                              <Phone className="h-4 w-4 mr-2" />
                              標記已聯繫
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(record.id, "completed")}>
                              <Check className="h-4 w-4 mr-2" />
                              標記完成
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
