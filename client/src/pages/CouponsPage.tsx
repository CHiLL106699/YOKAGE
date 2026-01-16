import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Ticket, Plus, Search, Calendar, Percent, DollarSign, Copy } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

// Discount type labels
const discountTypeLabels: Record<string, string> = {
  percentage: "折扣百分比",
  fixed: "固定金額",
};

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    name: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minPurchase: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  // TODO: Get organizationId from context
  const organizationId = 1;

  const { data: coupons, refetch } = trpc.coupon.list.useQuery({
    organizationId,
  });

  const createMutation = trpc.coupon.create.useMutation({
    onSuccess: () => {
      toast.success("優惠券建立成功");
      setIsDialogOpen(false);
      setNewCoupon({
        code: "",
        name: "",
        discountType: "percentage",
        discountValue: "",
        minPurchase: "",
        maxUses: "",
        validFrom: "",
        validUntil: "",
        isActive: true,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`建立失敗: ${error.message}`);
    },
  });

  const handleCreateCoupon = () => {
    if (!newCoupon.code || !newCoupon.name || !newCoupon.discountValue) {
      toast.error("請填寫必要欄位");
      return;
    }
    createMutation.mutate({
      organizationId,
      code: newCoupon.code.toUpperCase(),
      name: newCoupon.name,
      discountType: newCoupon.discountType,
      discountValue: newCoupon.discountValue,
      minPurchase: newCoupon.minPurchase ? newCoupon.minPurchase : undefined,
      usageLimit: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : undefined,
      startDate: newCoupon.validFrom || undefined,
      endDate: newCoupon.validUntil || undefined,
    });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("優惠碼已複製");
  };

  const filteredCoupons = coupons?.filter(
    (coupon) =>
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const activeCoupons = coupons?.filter((c) => c.isActive).length || 0;
  const expiredCoupons = coupons?.filter((c) => c.endDate && new Date(c.endDate) < new Date()).length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">優惠券管理</h1>
            <p className="text-gray-500 mt-1">建立與管理促銷優惠券</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新增優惠券
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>新增優惠券</DialogTitle>
                <DialogDescription>建立新的促銷優惠券</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>優惠碼</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      placeholder="例如：SAVE20"
                      className="uppercase"
                    />
                    <Button variant="outline" onClick={generateCode}>
                      自動產生
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>優惠券名稱</Label>
                  <Input
                    value={newCoupon.name}
                    onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                    placeholder="例如：新客戶優惠"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>折扣類型</Label>
                    <Select
                      value={newCoupon.discountType}
                      onValueChange={(value: "percentage" | "fixed") =>
                        setNewCoupon({ ...newCoupon, discountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">百分比折扣</SelectItem>
                        <SelectItem value="fixed">固定金額</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>折扣值</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={newCoupon.discountValue}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                        placeholder={newCoupon.discountType === "percentage" ? "20" : "100"}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {newCoupon.discountType === "percentage" ? "%" : "元"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>最低消費</Label>
                    <Input
                      type="number"
                      value={newCoupon.minPurchase}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                      placeholder="選填"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>使用次數上限</Label>
                    <Input
                      type="number"
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                      placeholder="選填"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>開始日期</Label>
                    <Input
                      type="date"
                      value={newCoupon.validFrom}
                      onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>結束日期</Label>
                    <Input
                      type="date"
                      value={newCoupon.validUntil}
                      onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>立即啟用</Label>
                  <Switch
                    checked={newCoupon.isActive}
                    onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, isActive: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateCoupon} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "建立中..." : "建立"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">總優惠券數</p>
                  <p className="text-2xl font-bold">{coupons?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">啟用中</p>
                  <p className="text-2xl font-bold">{activeCoupons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">已過期</p>
                  <p className="text-2xl font-bold">{expiredCoupons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜尋優惠碼或名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Coupons Grid */}
        {!filteredCoupons?.length ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">尚無優惠券</p>
                <p className="text-sm mt-1">點擊上方按鈕建立第一張優惠券</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoupons.map((coupon) => {
              const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
              const isNotStarted = coupon.startDate && new Date(coupon.startDate) > new Date();
              
              return (
                <Card key={coupon.id} className={`relative overflow-hidden ${!coupon.isActive || isExpired ? "opacity-60" : ""}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6">
                    <div className={`w-full h-full rounded-full ${coupon.discountType === "percentage" ? "bg-purple-100" : "bg-green-100"}`} />
                  </div>
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{coupon.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-primary">{coupon.code}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(coupon.code || "")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpired && <Badge variant="secondary">已過期</Badge>}
                        {isNotStarted && <Badge variant="outline">未開始</Badge>}
                        {coupon.isActive && !isExpired && !isNotStarted && (
                          <Badge className="bg-green-100 text-green-700">啟用中</Badge>
                        )}
                        {!coupon.isActive && <Badge variant="secondary">已停用</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-2xl font-bold">
                        {coupon.discountType === "percentage" ? (
                          <>
                            <Percent className="h-6 w-6 text-purple-500" />
                            <span>{coupon.discountValue}% OFF</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-6 w-6 text-green-500" />
                            <span>折 NT$ {coupon.discountValue}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        {coupon.minPurchase && (
                          <p>最低消費：NT$ {parseFloat(coupon.minPurchase).toLocaleString()}</p>
                        )}
                        {coupon.usageLimit && (
                          <p>使用上限：{coupon.usageLimit} 次（已使用 {coupon.usedCount || 0} 次）</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {coupon.startDate 
                            ? format(new Date(coupon.startDate), "yyyy/MM/dd", { locale: zhTW })
                            : "無限制"} 
                          {" - "}
                          {coupon.endDate 
                            ? format(new Date(coupon.endDate), "yyyy/MM/dd", { locale: zhTW })
                            : "無限制"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
