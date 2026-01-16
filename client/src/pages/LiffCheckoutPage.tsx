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
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";

// 模擬訂單資料
const mockOrderItems = [
  {
    id: "item-001",
    name: "玻尿酸填充療程",
    specs: "1ml / 蘋果肌",
    price: 15000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400"
  },
  {
    id: "item-002",
    name: "皮秒雷射淨膚",
    specs: "全臉",
    price: 6000,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400"
  }
];

export default function LiffCheckoutPage() {
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("line_pay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderId, setOrderId] = useState("");

  // 表單資料
  const [formData, setFormData] = useState({
    name: "王小明",
    phone: "0912-345-678",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });

  // 計算金額
  const subtotal = mockOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = 5400; // 模擬優惠券折扣
  const depositAmount = Math.round((subtotal - couponDiscount) * 0.3); // 30% 訂金
  const finalTotal = subtotal - couponDiscount;

  const handleSubmit = async () => {
    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast.error("請選擇預約日期與時間");
      return;
    }

    setIsProcessing(true);

    // 模擬付款處理
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 生成訂單編號
    const newOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(newOrderId);
    setIsProcessing(false);
    setShowSuccessDialog(true);
  };

  const handleViewOrder = () => {
    setShowSuccessDialog(false);
    setLocation(`/liff/orders/${orderId}`);
  };

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
              />
            </div>
            <div className="space-y-2">
              <Label>手機號碼</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  min={new Date().toISOString().split('T')[0]}
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
            {mockOrderItems.map(item => (
              <div key={item.id} className="flex gap-3">
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.specs}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                    <span className="text-sm font-medium">NT${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">商品小計</span>
                <span>NT${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">優惠券折抵</span>
                <span className="text-red-500">-NT${couponDiscount.toLocaleString()}</span>
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

            {/* 訂金說明 */}
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
          disabled={isProcessing}
          onClick={handleSubmit}
        >
          {isProcessing ? (
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
            <p className="text-gray-500 mb-4">
              訂單編號：{orderId}
            </p>
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
