import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Copy,
  MessageCircle,
  AlertTriangle,
  CreditCard,
  User,
  Loader2
} from "lucide-react";
import { Link, useParams } from "wouter";

// 模擬訂單詳情
const mockOrderDetail = {
  id: "ORD-DEF456",
  status: "paid",
  statusText: "已付訂金",
  createdAt: "2024-01-14 10:20",
  appointmentDate: "2024-01-18",
  appointmentTime: "15:00",
  customer: {
    name: "王小明",
    phone: "0912-345-678"
  },
  items: [
    { 
      name: "皮秒雷射淨膚", 
      specs: "全臉", 
      price: 6000, 
      quantity: 2,
      image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400"
    },
    { 
      name: "美白導入精華", 
      specs: "30ml", 
      price: 2500, 
      quantity: 1,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
    }
  ],
  subtotal: 14500,
  couponDiscount: 0,
  totalAmount: 14500,
  paidAmount: 4350,
  remainingAmount: 10150,
  paymentMethod: "LINE Pay",
  paymentTime: "2024-01-14 10:25",
  notes: "希望由李醫師服務",
  clinic: {
    name: "YOChiLL 醫美診所",
    address: "台北市大安區忠孝東路四段123號5樓",
    phone: "02-1234-5678"
  },
  timeline: [
    { time: "2024-01-14 10:20", event: "訂單建立", status: "completed" },
    { time: "2024-01-14 10:25", event: "訂金付款成功", status: "completed" },
    { time: "2024-01-15 09:00", event: "診所確認預約", status: "pending" },
    { time: "2024-01-18 15:00", event: "到店服務", status: "pending" },
    { time: "", event: "完成療程", status: "pending" }
  ]
};

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  paid: { color: "text-blue-600", bgColor: "bg-blue-100", icon: Package },
  confirmed: { color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  completed: { color: "text-gray-600", bgColor: "bg-gray-100", icon: CheckCircle },
  cancelled: { color: "text-red-600", bgColor: "bg-red-100", icon: XCircle }
};

export default function LiffOrderDetailPage() {
  const params = useParams();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const order = mockOrderDetail;
  const StatusIcon = statusConfig[order.status]?.icon || Package;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    toast.success("訂單編號已複製");
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("請填寫取消原因");
      return;
    }
    setIsCancelling(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCancelling(false);
    setShowCancelDialog(false);
    toast.success("訂單已取消，訂金將於 3-5 個工作天退還");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">訂單詳情</h1>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`${statusConfig[order.status]?.bgColor} px-4 py-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center`}>
            <StatusIcon className={`w-6 h-6 ${statusConfig[order.status]?.color}`} />
          </div>
          <div>
            <p className={`font-bold text-lg ${statusConfig[order.status]?.color}`}>
              {order.statusText}
            </p>
            <p className="text-sm text-gray-600">
              {order.status === "paid" && `待付餘額 NT$${order.remainingAmount.toLocaleString()}`}
              {order.status === "confirmed" && "請準時到店"}
              {order.status === "completed" && "感謝您的光臨"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">訂單編號</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={copyOrderId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400">下單時間：{order.createdAt}</p>
          </CardContent>
        </Card>

        {/* Appointment Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              預約資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">預約日期</span>
              <span className="font-medium">{order.appointmentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">預約時段</span>
              <span className="font-medium">{order.appointmentTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">聯絡人</span>
              <span>{order.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">聯絡電話</span>
              <span>{order.customer.phone}</span>
            </div>
            {order.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 mb-1">備註</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              商品明細
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                 loading="lazy" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.specs}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                    <span className="text-sm font-medium">
                      NT${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">商品小計</span>
                <span>NT${order.subtotal.toLocaleString()}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">優惠折抵</span>
                  <span className="text-red-500">-NT${order.couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>訂單總額</span>
                <span className="text-lg text-red-500">NT${order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              付款資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">付款方式</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">已付訂金</span>
              <span className="text-green-600">NT${order.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">待付餘額</span>
              <span className="font-medium">NT${order.remainingAmount.toLocaleString()}</span>
            </div>
            {order.paymentTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">付款時間</span>
                <span className="text-sm">{order.paymentTime}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clinic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              診所資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{order.clinic.name}</p>
            <p className="text-sm text-gray-500">{order.clinic.address}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MapPin className="w-4 h-4 mr-1" />
                導航
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="w-4 h-4 mr-1" />
                撥打電話
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              訂單進度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.timeline.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === "completed" ? "bg-green-500" : "bg-gray-300"
                    }`} />
                    {idx < order.timeline.length - 1 && (
                      <div className={`w-0.5 h-full ${
                        item.status === "completed" ? "bg-green-500" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm ${
                      item.status === "completed" ? "font-medium" : "text-gray-400"
                    }`}>
                      {item.event}
                    </p>
                    {item.time && (
                      <p className="text-xs text-gray-400">{item.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            聯繫客服
          </Button>
          {(order.status === "pending" || order.status === "paid") && (
            <Button 
              variant="outline" 
              className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              取消訂單
            </Button>
          )}
          {order.status === "pending" && (
            <Button className="flex-1">
              去付款
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              確認取消訂單
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              取消訂單後，已付訂金將於 3-5 個工作天內退還至原付款帳戶。
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">取消原因</label>
              <Textarea 
                placeholder="請告訴我們取消的原因..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              返回
            </Button>
            <Button 
              variant="destructive"
              disabled={isCancelling}
              onClick={handleCancel}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  處理中...
                </>
              ) : (
                "確認取消"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
