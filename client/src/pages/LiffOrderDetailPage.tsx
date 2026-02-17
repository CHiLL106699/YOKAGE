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
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Link, useParams } from "wouter";
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

export default function LiffOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { organizationId, isLoading: ctxLoading } = useStaffContext();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const orderQuery = trpc.order.get.useQuery(
    { id: Number(id), organizationId },
    { enabled: !ctxLoading && !!id }
  );

  if (ctxLoading || orderQuery.isLoading) {
    return <PageLoadingSkeleton message="載入訂單詳情..." />;
  }

  if (orderQuery.isError) {
    return <PageError message="無法載入訂單詳情" onRetry={() => orderQuery.refetch()} />;
  }

  const order: any = orderQuery.data;
  if (!order) {
    return <PageError message="找不到此訂單" />;
  }

  const config = statusConfig[order.status] ?? statusConfig.pending;
  const StatusIcon = config.icon;

  const orderItems: any[] = order.orderItems ?? [];
  const totalAmount = Number(order.total ?? 0);
  const paidAmount = Number(order.paidAmount ?? 0);
  const remainingAmount = totalAmount - paidAmount;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber ?? String(order.id));
    toast.success("已複製訂單編號");
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

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card className={`${config.bgColor} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full bg-white flex items-center justify-center`}>
                <StatusIcon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <p className={`font-bold text-lg ${config.color}`}>{config.label}</p>
                <p className="text-sm text-gray-600">
                  訂單編號：{order.orderNumber ?? order.id}
                  <button onClick={copyOrderId} className="ml-2 inline-flex">
                    <Copy className="w-3 h-3 text-gray-400" />
                  </button>
                </p>
              </div>
            </div>
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
            {orderItems.length === 0 ? (
              <p className="text-gray-400 text-center py-4">無商品明細</p>
            ) : (
              orderItems.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.productName ?? item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.productName ?? item.name}</h4>
                    {item.specs && <p className="text-xs text-gray-500">{item.specs}</p>}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">x{item.quantity ?? 1}</span>
                      <span className="text-sm font-medium">
                        NT${(Number(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">商品合計</span>
                <span>NT${totalAmount.toLocaleString()}</span>
              </div>
              {paidAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">已付金額</span>
                  <span className="text-green-600">NT${paidAmount.toLocaleString()}</span>
                </div>
              )}
              {remainingAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">待付金額</span>
                  <span className="text-red-500">NT${remainingAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>訂單總額</span>
                <span className="text-lg text-red-500">NT${totalAmount.toLocaleString()}</span>
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
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">付款方式</span>
              <span>{order.paymentMethod ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">建立時間</span>
              <span>{order.createdAt ? new Date(order.createdAt).toLocaleString("zh-TW") : "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                備註
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Clinic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              診所資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">YOChiLL 醫美診所</p>
            <p className="text-gray-500">台北市大安區忠孝東路四段123號5樓</p>
            <p className="text-gray-500">客服電話：02-1234-5678</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      {(order.status === "pending" || order.status === "paid") && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-red-500 border-red-200"
              onClick={() => setShowCancelDialog(true)}
            >
              取消訂單
            </Button>
            {order.status === "pending" && (
              <Button className="flex-1">
                立即付款
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              確認取消訂單
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">取消後將無法恢復，已付款項將依退款政策處理。</p>
          <Textarea
            placeholder="請輸入取消原因（選填）"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              返回
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCancelDialog(false);
                toast.success("訂單已取消");
              }}
            >
              確認取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
