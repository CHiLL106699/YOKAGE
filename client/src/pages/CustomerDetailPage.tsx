import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, User, Phone, Mail, Calendar, CreditCard, 
  Tag, Clock, Package, Heart, Edit, MessageCircle 
} from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

// Member level badge colors
const memberLevelColors: Record<string, string> = {
  regular: "bg-gray-100 text-gray-700",
  silver: "bg-slate-200 text-slate-700",
  gold: "bg-amber-100 text-amber-700",
  platinum: "bg-purple-100 text-purple-700",
  diamond: "bg-cyan-100 text-cyan-700",
};

const memberLevelLabels: Record<string, string> = {
  regular: "一般會員",
  silver: "銀卡會員",
  gold: "金卡會員",
  platinum: "白金會員",
  diamond: "鑽石會員",
};

// Appointment status colors
const appointmentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-700",
};

const appointmentStatusLabels: Record<string, string> = {
  pending: "待確認",
  confirmed: "已確認",
  completed: "已完成",
  cancelled: "已取消",
  no_show: "未到",
};

// Order status colors
const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

const orderStatusLabels: Record<string, string> = {
  pending: "待付款",
  paid: "已付款",
  cancelled: "已取消",
  refunded: "已退款",
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const customerId = parseInt(params.id || "0");
  
  // TODO: Get organizationId from context
  const organizationId = 1;

  const { data: customer, isLoading: customerLoading } = trpc.customer.get.useQuery({
    id: customerId,
  });

  const { data: appointments } = trpc.appointment.list.useQuery({
    organizationId,
    limit: 10,
  });

  const { data: orders } = trpc.order.list.useQuery({
    organizationId,
    limit: 10,
  });

  const { data: aftercareRecords } = trpc.aftercare.list.useQuery({
    organizationId,
  });

  if (customerLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <User className="h-12 w-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">找不到此客戶</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/clinic/customers")}>
            返回客戶列表
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate total spent
  const totalSpent = orders?.data?.reduce((sum, order) => sum + parseFloat(order.subtotal || "0"), 0) || 0;
  const completedAppointments = appointments?.data?.filter(a => a.status === "completed").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clinic/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <Badge className={memberLevelColors[customer.memberLevel || "regular"]}>
                {memberLevelLabels[customer.memberLevel || "regular"]}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              加入日期：{customer.createdAt ? format(new Date(customer.createdAt), "yyyy年MM月dd日", { locale: zhTW }) : "-"}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            編輯資料
          </Button>
          <Button className="gap-2">
            <MessageCircle className="h-4 w-4" />
            發送訊息
          </Button>
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
                  <p className="text-sm text-gray-500">預約次數</p>
                  <p className="text-2xl font-bold">{appointments?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">累計消費</p>
                  <p className="text-2xl font-bold">NT$ {totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">完成療程</p>
                  <p className="text-2xl font-bold">{completedAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">術後關懷</p>
                  <p className="text-2xl font-bold">{aftercareRecords?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>基本資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{customer.phone || "未填寫"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{customer.email || "未填寫"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  {customer.birthday 
                    ? format(new Date(customer.birthday), "yyyy年MM月dd日", { locale: zhTW })
                    : "未填寫"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <span>{customer.gender === "male" ? "男" : customer.gender === "female" ? "女" : "未填寫"}</span>
              </div>
              
              {customer.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">備註</p>
                  <p className="text-sm">{customer.notes}</p>
                </div>
              )}

              {/* Tags */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">標籤</p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    管理
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">VIP</Badge>
                  <Badge variant="secondary">敏感肌</Badge>
                  <Badge variant="secondary">回購客</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appointments">預約記錄</TabsTrigger>
                <TabsTrigger value="orders">消費記錄</TabsTrigger>
                <TabsTrigger value="aftercare">術後關懷</TabsTrigger>
              </TabsList>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>預約記錄</CardTitle>
                    <CardDescription>共 {appointments?.total || 0} 筆預約</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!appointments?.data?.length ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>尚無預約記錄</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.data.map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{appointment.notes || "療程"}</p>
                                <p className="text-sm text-gray-500">
                                  {appointment.appointmentDate 
                                    ? format(new Date(appointment.appointmentDate), "yyyy/MM/dd HH:mm", { locale: zhTW })
                                    : "-"}
                                </p>
                              </div>
                            </div>
                            <Badge className={appointmentStatusColors[appointment.status || "pending"]}>
                              {appointmentStatusLabels[appointment.status || "pending"]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>消費記錄</CardTitle>
                    <CardDescription>共 {orders?.total || 0} 筆訂單</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!orders?.data?.length ? (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>尚無消費記錄</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.data.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">訂單 #{order.id}</p>
                                <p className="text-sm text-gray-500">
                                  {order.createdAt 
                                    ? format(new Date(order.createdAt), "yyyy/MM/dd HH:mm", { locale: zhTW })
                                    : "-"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">NT$ {parseFloat(order.subtotal || "0").toLocaleString()}</p>
                              <Badge className={orderStatusColors[order.status || "pending"]}>
                                {orderStatusLabels[order.status || "pending"]}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aftercare Tab */}
              <TabsContent value="aftercare" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>術後關懷記錄</CardTitle>
                    <CardDescription>共 {aftercareRecords?.length || 0} 筆記錄</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!aftercareRecords?.length ? (
                      <div className="text-center py-8 text-gray-500">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>尚無術後關懷記錄</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {aftercareRecords.map((record) => (
                          <div key={record.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">術後關懷</p>
                              <Badge variant={record.status === "completed" ? "default" : "secondary"}>
                                {record.status === "pending" ? "待追蹤" : 
                                 record.status === "in_progress" ? "追蹤中" : "已完成"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              療程日期：{record.treatmentDate 
                                ? format(new Date(record.treatmentDate), "yyyy/MM/dd", { locale: zhTW })
                                : "-"}
                            </p>
                            {record.notes && (
                              <p className="text-sm mt-2 text-gray-600">{record.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
