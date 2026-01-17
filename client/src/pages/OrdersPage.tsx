import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Eye, DollarSign, Clock, CheckCircle } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// 使用優化後的通用元件
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput, useSearch } from "@/components/ui/search-input";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { EmptyState } from "@/components/ui/empty-state";
import { DataPagination, usePagination } from "@/components/ui/data-pagination";
import { ExportButton, downloadCSV } from "@/components/ui/export-button";
import { StatCard, StatGrid } from "@/components/ui/stat-card";

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
  const { search, setSearch, debouncedSearch } = useSearch();
  const { page, pageSize, setPage, setPageSize } = usePagination(20);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  // TODO: Get organizationId from context
  const organizationId = 1;

  const { data: orders, isLoading } = trpc.order.list.useQuery({
    organizationId,
    page,
    limit: pageSize,
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

  const filteredOrders = debouncedSearch
    ? orders?.data?.filter((order) =>
        order.orderNumber?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : orders?.data;

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    const orderList = filteredOrders || [];
    if (orderList.length === 0) {
      toast.error("沒有資料可匯出");
      return;
    }

    const exportData = orderList.map((o) => ({
      訂單編號: o.orderNumber || "",
      日期: o.createdAt ? new Date(o.createdAt).toLocaleString("zh-TW") : "",
      金額: parseFloat(o.subtotal || "0"),
      付款方式: paymentMethodLabels[o.paymentMethod || ""] || o.paymentMethod || "",
      狀態: statusLabels[o.status || "pending"],
    }));

    if (format === "csv") {
      downloadCSV(exportData, `訂單列表_${new Date().toISOString().split("T")[0]}`);
    }
  };

  const totalPages = Math.ceil((orders?.total || 0) / pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <PageHeader
          title="訂單管理"
          description="查看與管理所有訂單"
          actions={
            <ExportButton onExport={handleExport} formats={["csv"]} />
          }
        />

        {/* Stats Cards */}
        <StatGrid columns={4}>
          <StatCard
            title="總訂單數"
            value={stats.total}
            icon={ShoppingCart}
            description="筆訂單"
          />
          <StatCard
            title="待處理"
            value={stats.pending}
            icon={Clock}
            className={stats.pending > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}
          />
          <StatCard
            title="已完成"
            value={stats.completed}
            icon={CheckCircle}
          />
          <StatCard
            title="總營收"
            value={`NT$ ${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
          />
        </StatGrid>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜尋訂單編號..."
                className="max-w-md"
              />
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
              <div className="text-sm text-muted-foreground">
                共 {orders?.total || 0} 筆訂單
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable
                columns={6}
                rows={5}
                headers={["訂單編號", "日期", "金額", "付款方式", "狀態", "操作"]}
              />
            ) : !filteredOrders?.length ? (
              <EmptyState
                icon={ShoppingCart}
                title="尚無訂單"
                description="目前沒有符合條件的訂單"
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>訂單編號</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>付款方式</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-mono font-medium">{order.orderNumber}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.createdAt
                            ? format(new Date(order.createdAt), "yyyy/MM/dd HH:mm", { locale: zhTW })
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          NT$ {parseFloat(order.subtotal || "0").toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {paymentMethodLabels[order.paymentMethod || ""] || order.paymentMethod || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status || "pending"]}>
                            {statusLabels[order.status || "pending"]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => setSelectedOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <DataPagination
                      currentPage={page}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={orders?.total || 0}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                )}
              </>
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
                    <p className="text-sm text-muted-foreground">訂單日期</p>
                    <p className="font-medium">
                      {orderDetail?.createdAt
                        ? format(new Date(orderDetail.createdAt), "yyyy/MM/dd HH:mm", { locale: zhTW })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">訂單狀態</p>
                    <Badge className={statusColors[orderDetail.status || "pending"]}>
                      {statusLabels[orderDetail.status || "pending"]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">付款方式</p>
                    <p className="font-medium">
                      {paymentMethodLabels[orderDetail.paymentMethod || ""] || orderDetail.paymentMethod || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">訂單金額</p>
                    <p className="font-medium text-lg">
                      NT$ {parseFloat(orderDetail.total || "0").toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">小計</span>
                    <span>NT$ {parseFloat(orderDetail.subtotal || "0").toLocaleString()}</span>
                  </div>
                  {orderDetail.discount && parseFloat(orderDetail.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>折扣</span>
                      <span>-NT$ {parseFloat(orderDetail.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-lg mt-2 pt-2 border-t">
                    <span>總計</span>
                    <span>NT$ {parseFloat(orderDetail.total || "0").toLocaleString()}</span>
                  </div>
                </div>

                {/* Notes */}
                {orderDetail.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-1">備註</p>
                    <p className="text-sm bg-muted p-3 rounded">{orderDetail.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
