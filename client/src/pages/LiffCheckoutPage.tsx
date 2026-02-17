import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Smartphone,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  ChevronRight,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

export default function LiffCheckoutPage() {
  const [, setLocation] = useLocation();
  const { organizationId, staffId: customerId, isLoading: ctxLoading } = useStaffContext();
  const [paymentMethod, setPaymentMethod] = useState("line_pay");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });

  // Fetch cart items for checkout
  const cartQuery = trpc.cart.list.useQuery(
    { organizationId, customerId },
    { enabled: !ctxLoading }
  );

  // Create order mutation
  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      const newOrderId = String(data.id);
      setOrderId(newOrderId);
      setShowSuccessDialog(true);
    },
    onError: (err) => {
      toast.error(`訂單建立失敗: ${err.message}`);
    },
  });

  const cartItems: any[] = Array.isArray(cartQuery.data) ? cartQuery.data : [];
  const selectedItems = cartItems.filter((item: any) => item.selected);

  // Calculate amounts
  const subtotal = selectedItems.reduce(
    (sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0
  );
  const depositAmount = Math.round(subtotal * 0.3);
  const finalTotal = subtotal;

  const handleSubmit = async () => {
    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast.error("請選擇預約日期與時間");
      return;
    }
    if (!formData.name) {
      toast.error("請填寫姓名");
      return;
    }

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    createOrder.mutate({
      organizationId,
      customerId,
      orderNumber,
      subtotal: String(subtotal),
      total: String(finalTotal),
      paymentMethod,
      notes: formData.notes || undefined,
    });
  };

  const handleViewOrder = () => {
    setShowSuccessDialog(false);
    setLocation(`/liff/orders/${orderId}`);
  };

  if (ctxLoading || cartQuery.isLoading) {
    return <PageLoadingSkeleton message="載入結帳頁面..." />;
  }

  if (cartQuery.isError) {
    return <PageError message="無法載入結帳資料" onRetry={() => cartQuery.refetch()} />;
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-600 mb-2">沒有選取的商品</h2>
        <p className="text-sm text-gray-400 mb-4">請回到購物車選擇要結帳的商品</p>
        <Link href="/liff/cart">
          <Button>回到購物車</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">確認訂單</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 聯絡資訊 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              聯絡資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="請輸入姓名"
              />
            </div>
            <div className="space-y-2">
              <Label>手機號碼</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="請輸入聯絡電話"
              />
            </div>
          </CardContent>
        </Card>

        {/* 預約時間 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              預約時間
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>預約日期</Label>
                <Input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>預約時段</Label>
                <select
                  className="w-full h-10 px-3 border rounded-md"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                >
                  <option value="">請選擇</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>備註</Label>
              <Textarea
                placeholder="如有特殊需求請在此說明..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 訂單明細 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              訂單明細
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedItems.map((item: any) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.productName}</h4>
                  {item.specs && <p className="text-xs text-gray-500">{item.specs}</p>}
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">x{item.quantity ?? 1}</span>
                    <span className="text-sm font-medium">
                      NT${((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">商品小計</span>
                <span>NT${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>訂單總額</span>
                <span className="text-lg text-red-500">NT${finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 付款方式 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              付款方式
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="line_pay" id="line_pay" />
                <Label htmlFor="line_pay" className="flex items-center gap-2 cursor-pointer flex-1">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">LINE Pay</p>
                    <p className="text-xs text-gray-500">使用 LINE Pay 快速付款</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg mt-2">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">信用卡</p>
                    <p className="text-xs text-gray-500">VISA / MasterCard / JCB</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg mt-2">
                <RadioGroupItem value="store" id="store" />
                <Label htmlFor="store" className="flex items-center gap-2 cursor-pointer flex-1">
                  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">現場付款</p>
                    <p className="text-xs text-gray-500">到店後再付款</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">訂金說明</p>
                  <p className="text-yellow-700 mt-1">
                    療程類商品需預付 30% 訂金（NT${depositAmount.toLocaleString()}），
                    餘額於療程當日現場支付。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 診所資訊 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              診所資訊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="font-medium">YOChiLL 醫美診所</p>
              <p className="text-gray-500">台北市大安區忠孝東路四段123號5樓</p>
              <p className="text-gray-500">營業時間：週一至週五 10:00-21:00</p>
              <p className="text-gray-500">客服電話：02-1234-5678</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">應付訂金</p>
            <p className="text-xl font-bold text-red-500">NT${depositAmount.toLocaleString()}</p>
          </div>
          <p className="text-xs text-gray-400">
            餘額 NT${(finalTotal - depositAmount).toLocaleString()} 現場支付
          </p>
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={createOrder.isPending}
          onClick={handleSubmit}
        >
          {createOrder.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              處理中...
            </>
          ) : (
            `確認付款 NT$${depositAmount.toLocaleString()}`
          )}
        </Button>
        <p className="text-xs text-gray-400 text-center mt-2">
          點擊付款即表示您同意我們的服務條款與隱私政策
        </p>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm text-center">
          <div className="py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <DialogTitle className="text-xl mb-2">訂單成立！</DialogTitle>
            <p className="text-gray-500 mb-4">訂單編號：{orderId}</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">預約日期</span>
                <span>{formData.appointmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">預約時間</span>
                <span>{formData.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">已付訂金</span>
                <span className="text-green-600">NT${depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">現場付款</span>
                <span>NT${(finalTotal - depositAmount).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Button className="w-full" onClick={handleViewOrder}>
                查看訂單
              </Button>
              <Link href="/liff/shop">
                <Button variant="outline" className="w-full">
                  繼續逛逛
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
