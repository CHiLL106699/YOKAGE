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
  MapPin,
  Phone,
  FileText,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";

// 模擬訂單資料
const mockOrders = [
  {
    id: "ORD-ABC123",
    status: "pending",
    statusText: "待付款",
    createdAt: "2024-01-15 14:30",
    appointmentDate: "2024-01-20",
    appointmentTime: "14:00",
    items: [
      { name: "玻尿酸填充療程", specs: "1ml / 蘋果肌", price: 15000, quantity: 1 }
    ],
    totalAmount: 15000,
    paidAmount: 0,
    remainingAmount: 15000
  },
  {
    id: "ORD-DEF456",
    status: "paid",
    statusText: "已付訂金",
    createdAt: "2024-01-14 10:20",
    appointmentDate: "2024-01-18",
    appointmentTime: "15:00",
    items: [
      { name: "皮秒雷射淨膚", specs: "全臉", price: 6000, quantity: 2 },
      { name: "美白導入精華", specs: "30ml", price: 2500, quantity: 1 }
    ],
    totalAmount: 14500,
    paidAmount: 4350,
    remainingAmount: 10150
  },
  {
    id: "ORD-GHI789",
    status: "confirmed",
    statusText: "已確認",
    createdAt: "2024-01-10 16:45",
    appointmentDate: "2024-01-16",
    appointmentTime: "10:00",
    items: [
      { name: "肉毒桿菌除皺", specs: "前額 + 魚尾紋", price: 8000, quantity: 1 }
    ],
    totalAmount: 8000,
    paidAmount: 2400,
    remainingAmount: 5600
  },
  {
    id: "ORD-JKL012",
    status: "completed",
    statusText: "已完成",
    createdAt: "2024-01-05 11:00",
    appointmentDate: "2024-01-08",
    appointmentTime: "14:00",
    items: [
      { name: "新客體驗套組", specs: "含3項療程", price: 9999, quantity: 1 }
    ],
    totalAmount: 9999,
    paidAmount: 9999,
    remainingAmount: 0
  },
  {
    id: "ORD-MNO345",
    status: "cancelled",
    statusText: "已取消",
    createdAt: "2024-01-03 09:30",
    appointmentDate: "2024-01-06",
    appointmentTime: "11:00",
    items: [
      { name: "體雕塑身療程", specs: "腹部", price: 25000, quantity: 1 }
    ],
    totalAmount: 25000,
    paidAmount: 0,
    remainingAmount: 25000,
    cancelReason: "客戶取消"
  }
];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  paid: { color: "bg-blue-100 text-blue-800", icon: Package },
  confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelled: { color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function LiffOrdersPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = activeTab === "all" 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeTab);

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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="all" className="text-xs">全部</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">待付款</TabsTrigger>
            <TabsTrigger value="paid" className="text-xs">已付訂</TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs">已確認</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">已完成</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Order List */}
      <div className="p-4 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暫無訂單</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const StatusIcon = statusConfig[order.status]?.icon || Package;
            return (
              <Link key={order.id} href={`/liff/orders/${order.id}`}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{order.id}</span>
                      </div>
                      <Badge className={statusConfig[order.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.statusText}
                      </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start mb-2 last:mb-0">
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.specs}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">NT${item.price.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Appointment Info */}
                    {order.status !== "cancelled" && (
                      <div className="px-4 py-2 bg-blue-50 flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-700">
                          預約時間：{order.appointmentDate} {order.appointmentTime}
                        </span>
                      </div>
                    )}

                    {/* Order Footer */}
                    <div className="px-4 py-3 border-t flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">訂單金額：</span>
                        <span className="font-bold text-red-500">
                          NT${order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <Button size="sm">去付款</Button>
                        )}
                        {order.status === "completed" && (
                          <Button size="sm" variant="outline">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            再次預約
                          </Button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
