import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType; label: string }> = {
  pending: { color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock, label: "待付款" },
  paid: { color: "text-blue-600", bgColor: "bg-blue-100", icon: Package, label: "已付訂金" },
  confirmed: { color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle, label: "已確認" },
  completed: { color: "text-gray-600", bgColor: "bg-gray-100", icon: CheckCircle, label: "已完成" },
  cancelled: { color: "text-red-600", bgColor: "bg-red-100", icon: XCircle, label: "已取消" },
};

export default function LiffOrdersPage() {
  const { organizationId, isLoading: ctxLoading } = useStaffContext();
  const [activeTab, setActiveTab] = useState("all");

  const ordersQuery = trpc.order.list.useQuery(
    { organizationId, limit: 50 },
    { enabled: !ctxLoading }
  );

  if (ctxLoading || ordersQuery.isLoading) {
    return <PageLoadingSkeleton message="載入訂單列表..." />;
  }

  if (ordersQuery.isError) {
    return <PageError message="無法載入訂單" onRetry={() => ordersQuery.refetch()} />;
  }

  const rawOrders = ordersQuery.data;
  const allOrders: any[] = Array.isArray(rawOrders) ? rawOrders : (rawOrders as any)?.data ?? [];

  const filteredOrders = activeTab === "all"
    ? allOrders
    : allOrders.filter((o: any) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/member">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">我的訂單</h1>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b px-4">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-0">
            {[
              { value: "all", label: "全部" },
              { value: "pending", label: "待付款" },
              { value: "paid", label: "已付款" },
              { value: "confirmed", label: "已確認" },
              { value: "completed", label: "已完成" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暫無訂單</p>
            </div>
          ) : (
            filteredOrders.map((order: any) => {
              const config = statusConfig[order.status] ?? statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <Link key={order.id} href={`/liff/orders/${order.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">
                          訂單 #{order.orderNumber ?? order.id}
                        </span>
                        <Badge className={`${config.bgColor} ${config.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{order.createdAt ? new Date(order.createdAt).toLocaleString("zh-TW") : "—"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div>
                          <span className="text-sm text-gray-500">訂單金額</span>
                          <span className="ml-2 font-bold text-red-500">
                            NT${Number(order.total ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}

          {/* Refresh */}
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => ordersQuery.refetch()}
              className="text-gray-400"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              重新整理
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
