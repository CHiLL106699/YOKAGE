import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Search, Eye, DollarSign, Package, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Order status colors
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, string> = {
  pending: "待付款",
  processing: "處理中",
  paid: "已付款",
  completed: "已完成",
  cancelled: "已取消",
  refunded: "已退款",
};

// Payment method labels
const paymentMethodLabels: Record<string, string> = {
  cash: "現金",
  credit_card: "信用卡",
  line_pay: "LINE Pay",
  bank_transfer: "銀行轉帳",
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // TODO: Get organizationId from context
  const organizationId = 1;

  const { data: orders } = trpc.order.list.useQuery({
    organizationId,
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: orderDetail } = trpc.order.get.useQuery(
    { id: selectedOrder! },
    { enabled: !!selectedOrder }
  );

  // Calculate stats
  const stats = {
    total: orders?.total || 0,
    pending: orders?.data?.filter((o) => o.status === "pending").length || 0,
    completed: orders?.data?.filter((o) => o.status === "completed" || o.status === "paid").length || 0,
    revenue: orders?.data?.reduce((sum, o) => sum + parseFloat(o.subtotal || "0"), 0) || 0,
  };

  const filteredOrders = orders?.data?.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">訂單管理</h1>
            <p className="text-gray-500 mt-1">查看與管理所有訂單</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">總訂單數</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">待處理</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">已完成</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">總營收</p>
                  <p className="text-2xl font-bold">NT$ {stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋訂單編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="訂單狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="pending">待付款</SelectItem>
              <SelectItem value="processing">處理中</SelectItem>
              <SelectItem value="paid">已付款</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
              <SelectItem value="refunded">已退款</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>訂單列表</CardTitle>
            <CardDescription>共 {orders?.total || 0} 筆訂單</CardDescription>
          </CardHeader>
          <CardContent>
            {!filteredOrders?.length ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">尚無訂單</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-500">訂單編號</th>
                      <th className="text-left p-3 font-medium text-gray-500">日期</th>
                      <th className="text-left p-3 font-medium text-gray-500">金額</th>
                      <th className="text-left p-3 font-medium text-gray-500">付款方式</th>
                      <th className="text-left p-3 font-medium text-gray-500">狀態</th>
                      <th className="text-left p-3 font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-mono font-medium">{order.orderNumber}</span>
                        </td>
                        <td className="p-3 text-gray-500">
                          {order.createdAt
                            ? format(new Date(order.createdAt), "yyyy/MM/dd HH:mm", { locale: zhTW })
                            : "-"}
                        </td>
                        <td className="p-3 font-medium">
                          NT$ {parseFloat(order.subtotal || "0").toLocaleString()}
                        </td>
                        <td className="p-3 text-gray-500">
                          {paymentMethodLabels[order.paymentMethod || ""] || order.paymentMethod || "-"}
                        </td>
                        <td className="p-3">
                          <Badge className={statusColors[order.status || "pending"]}>
                            {statusLabels[order.status || "pending"]}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => setSelectedOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                            查看
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {orders && orders.total > 20 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  顯示 {(page - 1) * 20 + 1} - {Math.min(page * 20, orders.total)} 筆，共 {orders.total} 筆
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    上一頁
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page * 20 >= orders.total}
                  >
                    下一頁
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>訂單詳情</DialogTitle>
              <DialogDescription>
                訂單編號：{orderDetail?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            {orderDetail && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">訂單日期</p>
                    <p className="font-medium">
                      {orderDetail?.createdAt
                        ? format(new Date(orderDetail.createdAt), "yyyy/MM/dd HH:mm", { locale: zhTW })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">訂單狀態</p>
                    <Badge className={statusColors[orderDetail?.status || "pending"]}>
                      {statusLabels[orderDetail?.status || "pending"]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">付款方式</p>
                    <p className="font-medium">
                      {paymentMethodLabels[orderDetail?.paymentMethod || ""] || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">付款狀態</p>
                    <p className="font-medium">{orderDetail?.paymentStatus || "-"}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">訂單項目</h4>
                  <div className="border rounded-lg divide-y">
                    <div className="p-3 text-center text-gray-500">
                      訂單項目詳情將在此顯示
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">小計</span>
                    <span>NT$ {parseFloat(orderDetail?.subtotal || "0").toLocaleString()}</span>
                  </div>
                  {orderDetail?.discount && parseFloat(orderDetail.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>折扣</span>
                      <span>- NT$ {parseFloat(orderDetail.discount).toLocaleString()}</span>
                    </div>
                  )}
                  {orderDetail?.tax && parseFloat(orderDetail.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">稅金</span>
                      <span>NT$ {parseFloat(orderDetail.tax).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>總計</span>
                    <span>NT$ {parseFloat(orderDetail?.total || "0").toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
