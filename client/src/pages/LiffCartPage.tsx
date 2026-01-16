import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus,
  Tag,
  Ticket,
  ChevronRight,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";

// 模擬購物車資料
const mockCartItems = [
  {
    id: "cart-001",
    productId: "prod-001",
    name: "玻尿酸填充療程",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
    price: 15000,
    originalPrice: 18000,
    quantity: 1,
    selected: true,
    specs: "1ml / 蘋果肌"
  },
  {
    id: "cart-002",
    productId: "prod-003",
    name: "皮秒雷射淨膚",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
    price: 6000,
    originalPrice: 8000,
    quantity: 2,
    selected: true,
    specs: "全臉"
  },
  {
    id: "cart-003",
    productId: "prod-005",
    name: "美白導入精華",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    price: 2500,
    originalPrice: 3000,
    quantity: 1,
    selected: false,
    specs: "30ml"
  }
];

// 模擬優惠券
const mockCoupons = [
  {
    id: "coupon-001",
    code: "WELCOME20",
    name: "新客 8 折券",
    discount: 0.2,
    discountType: "percentage",
    minAmount: 10000,
    validUntil: "2024-02-28",
    description: "首次消費滿 NT$10,000 可用"
  },
  {
    id: "coupon-002",
    code: "SAVE500",
    name: "滿額折 500",
    discount: 500,
    discountType: "fixed",
    minAmount: 5000,
    validUntil: "2024-01-31",
    description: "消費滿 NT$5,000 折 NT$500"
  },
  {
    id: "coupon-003",
    code: "BIRTHDAY",
    name: "生日禮金",
    discount: 1000,
    discountType: "fixed",
    minAmount: 0,
    validUntil: "2024-01-31",
    description: "生日當月專屬禮金"
  }
];

export default function LiffCartPage() {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<typeof mockCoupons[0] | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = selectedItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const savedAmount = originalTotal - subtotal;

  // 計算優惠券折扣
  const couponDiscount = selectedCoupon 
    ? selectedCoupon.discountType === "percentage"
      ? Math.round(subtotal * selectedCoupon.discount)
      : selectedCoupon.discount
    : 0;

  const finalTotal = subtotal - couponDiscount;

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(cartItems.map(item => ({ ...item, selected: !allSelected })));
  };

  const toggleSelect = (id: string) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast.success("已從購物車移除");
  };

  const applyCoupon = (coupon: typeof mockCoupons[0]) => {
    if (subtotal < coupon.minAmount) {
      toast.error(`需消費滿 NT$${coupon.minAmount.toLocaleString()} 才能使用此優惠券`);
      return;
    }
    setSelectedCoupon(coupon);
    setShowCouponDialog(false);
    toast.success("優惠券已套用");
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("請選擇要結帳的商品");
      return;
    }
    setLocation("/liff/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-600 mb-2">購物車是空的</h2>
        <p className="text-sm text-gray-400 mb-4">快去挑選喜歡的療程吧！</p>
        <Link href="/liff/shop">
          <Button>去逛逛</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/liff/shop">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">購物車 ({cartItems.length})</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-red-500">
            清空
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {cartItems.map(item => (
          <Card key={item.id}>
            <CardContent className="p-3">
              <div className="flex gap-3">
                <Checkbox 
                  checked={item.selected}
                  onCheckedChange={() => toggleSelect(item.id)}
                  className="mt-8"
                />
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.specs}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-red-500 font-bold">NT${item.price.toLocaleString()}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through ml-1">
                          ${item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="px-4">
        <Card>
          <CardContent className="p-3">
            <button 
              className="w-full flex items-center justify-between"
              onClick={() => setShowCouponDialog(true)}
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-500" />
                <span className="font-medium">優惠券</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {selectedCoupon ? (
                  <span className="text-red-500">-NT${couponDiscount.toLocaleString()}</span>
                ) : (
                  <span className="text-gray-400">選擇優惠券</span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="px-4 mt-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">商品小計</span>
              <span>NT${subtotal.toLocaleString()}</span>
            </div>
            {savedAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">已省</span>
                <span className="text-green-600">-NT${savedAmount.toLocaleString()}</span>
              </div>
            )}
            {selectedCoupon && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">優惠券折抵</span>
                <span className="text-red-500">-NT${couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium">應付金額</span>
              <span className="text-xl font-bold text-red-500">NT${finalTotal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={cartItems.every(item => item.selected)}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm">全選</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">
                已選 {selectedItems.length} 件
              </p>
              <p className="font-bold text-lg text-red-500">
                NT${finalTotal.toLocaleString()}
              </p>
            </div>
            <Button 
              className="px-8"
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
            >
              結帳
            </Button>
          </div>
        </div>
      </div>

      {/* Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>選擇優惠券</DialogTitle>
          </DialogHeader>
          
          {/* Coupon Code Input */}
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="輸入優惠碼"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button variant="outline">兌換</Button>
          </div>

          {/* Available Coupons */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {mockCoupons.map(coupon => {
              const isValid = subtotal >= coupon.minAmount;
              return (
                <div 
                  key={coupon.id}
                  className={`border rounded-lg p-3 ${isValid ? "cursor-pointer hover:border-primary" : "opacity-50"}`}
                  onClick={() => isValid && applyCoupon(coupon)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-red-500 border-red-500">
                          {coupon.discountType === "percentage" 
                            ? `${coupon.discount * 100}% OFF`
                            : `NT$${coupon.discount}`
                          }
                        </Badge>
                        <span className="font-medium">{coupon.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                      <p className="text-xs text-gray-400 mt-1">有效期限：{coupon.validUntil}</p>
                    </div>
                    {selectedCoupon?.id === coupon.id && (
                      <Badge className="bg-green-500">已選擇</Badge>
                    )}
                  </div>
                  {!isValid && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-orange-500">
                      <AlertCircle className="w-3 h-3" />
                      <span>需消費滿 NT${coupon.minAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
              取消
            </Button>
            {selectedCoupon && (
              <Button 
                variant="ghost" 
                className="text-red-500"
                onClick={() => {
                  setSelectedCoupon(null);
                  setShowCouponDialog(false);
                }}
              >
                不使用優惠券
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
