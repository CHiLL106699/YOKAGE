import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ticket, Gift, Percent, CreditCard, Package, QrCode, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import QRCode from "react-qr-code";

// 使用 any 類型以簡化類型定義
type VoucherInstance = any;

function getTypeIcon(type: string) {
  switch (type) {
    case "treatment":
      return <Package className="h-5 w-5" />;
    case "discount":
      return <Percent className="h-5 w-5" />;
    case "gift_card":
      return <Gift className="h-5 w-5" />;
    case "stored_value":
      return <CreditCard className="h-5 w-5" />;
    case "free_item":
      return <Gift className="h-5 w-5" />;
    default:
      return <Ticket className="h-5 w-5" />;
  }
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    treatment: "療程券",
    discount: "折扣券",
    gift_card: "禮品卡",
    stored_value: "儲值卡",
    free_item: "贈品券",
  };
  return labels[type] || "優惠券";
}

function getValueDisplay(value: string, valueType: string) {
  switch (valueType) {
    case "fixed_amount":
      return `NT$ ${parseInt(value).toLocaleString()}`;
    case "percentage":
      return `${value}% OFF`;
    case "treatment_count":
      return `${value} 堂`;
    default:
      return value;
  }
}

function getStatusBadge(status: string, expiresAt: string | null) {
  const now = new Date();
  const expiry = expiresAt ? new Date(expiresAt) : null;
  const isExpiringSoon = expiry && expiry.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;

  switch (status) {
    case "active":
      if (isExpiringSoon) {
        return (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            即將到期
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
          <CheckCircle className="h-3 w-3 mr-1" />
          可使用
        </Badge>
      );
    case "used":
      return (
        <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/50">
          <CheckCircle className="h-3 w-3 mr-1" />
          已使用
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
          <XCircle className="h-3 w-3 mr-1" />
          已過期
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/50">
          <XCircle className="h-3 w-3 mr-1" />
          已取消
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function VoucherCard({ voucher, onShowQR }: { voucher: VoucherInstance; onShowQR: (voucher: VoucherInstance) => void }) {
  const template = voucher.template;
  const bgColor = template?.backgroundColor || "#1E3A5F";
  const txtColor = template?.textColor || "#F5D78E";
  const isUsable = voucher.status === "active";
  const expiryDate = voucher.expiryDate ? new Date(voucher.expiryDate) : null;

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{ backgroundColor: bgColor }}
      onClick={() => isUsable && onShowQR(voucher)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: txtColor }}>
            {getTypeIcon(template?.type || "discount")}
            <span className="text-sm font-medium">{getTypeLabel(template?.type || "discount")}</span>
          </div>
          {getStatusBadge(voucher.status || "active", expiryDate ? expiryDate.toISOString() : null)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white">{template?.name || "優惠券"}</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: txtColor }}>
            {getValueDisplay(template?.value || "0", template?.valueType || "fixed_amount")}
          </p>
        </div>

        {template?.description && (
          <p className="text-sm text-slate-300 line-clamp-2">{template.description}</p>
        )}

        <div className="pt-2 border-t border-white/10 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">票券代碼</span>
            <span className="text-white font-mono">{voucher.voucherCode}</span>
          </div>
          {expiryDate && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">有效期限</span>
              <span className="text-white">
                {expiryDate.toLocaleDateString("zh-TW")}
              </span>
            </div>
          )}
          {(voucher.maxUsageCount || 0) > 1 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">使用次數</span>
              <span className="text-white">
                {voucher.currentUsageCount || 0} / {voucher.maxUsageCount}
              </span>
            </div>
          )}
        </div>

        {isUsable && (
          <Button
            className="w-full mt-2"
            style={{ backgroundColor: txtColor, color: bgColor }}
            onClick={(e) => {
              e.stopPropagation();
              onShowQR(voucher);
            }}
          >
            <QrCode className="h-4 w-4 mr-2" />
            顯示 QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function QRCodeDialog({
  voucher,
  open,
  onClose,
}: {
  voucher: VoucherInstance | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!voucher) return null;

  const template = voucher.template;
  const bgColor = template?.backgroundColor || "#1E3A5F";
  const txtColor = template?.textColor || "#F5D78E";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" style={{ backgroundColor: "#0A1628" }}>
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            {template?.name || "優惠券"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              value={`VOUCHER:${voucher.code}`}
              size={200}
              level="H"
              fgColor={bgColor}
            />
          </div>

          {/* 票券代碼 */}
          <div className="text-center">
            <p className="text-sm text-slate-400">票券代碼</p>
            <p className="text-2xl font-mono font-bold" style={{ color: txtColor }}>
              {voucher.code}
            </p>
          </div>

          {/* 價值 */}
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {getValueDisplay(template?.value || "0", template?.valueType || "fixed_amount")}
            </p>
          </div>

          {/* 有效期限 */}
          {voucher.expiresAt && (
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                有效期限：{new Date(voucher.expiresAt).toLocaleDateString("zh-TW")}
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center">
            請出示此 QR Code 給服務人員掃描核銷
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MyVouchersPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherInstance | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  // TODO: 從 LIFF context 取得 customerId
  const customerId = 1;

  const { data: vouchers, isLoading } = trpc.voucher.myVouchers.useQuery({
    customerId,
    status: activeTab === "all" ? undefined : activeTab,
    includeExpired: activeTab === "expired" || activeTab === "all",
  });

  const handleShowQR = (voucher: VoucherInstance) => {
    setSelectedVoucher(voucher);
    setShowQRDialog(true);
  };

  const activeVouchers = vouchers?.filter((v: VoucherInstance) => v.status === "active") || [];
  const usedVouchers = vouchers?.filter((v: VoucherInstance) => v.status === "used") || [];
  const expiredVouchers = vouchers?.filter((v: VoucherInstance) => v.status === "expired" || v.status === "cancelled") || [];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0F172A] p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F5D78E]/20 rounded-full">
            <Ticket className="h-6 w-6 text-[#F5D78E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">我的票券</h1>
            <p className="text-sm text-slate-400">
              共 {activeVouchers.length} 張可用票券
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid grid-cols-3 bg-[#1E3A5F]/50">
          <TabsTrigger value="active" className="data-[state=active]:bg-[#F5D78E] data-[state=active]:text-[#0A1628]">
            可使用 ({activeVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="used" className="data-[state=active]:bg-[#F5D78E] data-[state=active]:text-[#0A1628]">
            已使用 ({usedVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="data-[state=active]:bg-[#F5D78E] data-[state=active]:text-[#0A1628]">
            已過期 ({expiredVouchers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">載入中...</div>
          ) : activeVouchers.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">目前沒有可使用的票券</p>
            </div>
          ) : (
            activeVouchers.map((voucher: VoucherInstance) => (
              <VoucherCard key={voucher.id} voucher={voucher} onShowQR={handleShowQR} />
            ))
          )}
        </TabsContent>

        <TabsContent value="used" className="mt-4 space-y-4">
          {usedVouchers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">沒有已使用的票券</p>
            </div>
          ) : (
            usedVouchers.map((voucher: VoucherInstance) => (
              <VoucherCard key={voucher.id} voucher={voucher} onShowQR={handleShowQR} />
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-4 space-y-4">
          {expiredVouchers.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">沒有已過期的票券</p>
            </div>
          ) : (
            expiredVouchers.map((voucher: VoucherInstance) => (
              <VoucherCard key={voucher.id} voucher={voucher} onShowQR={handleShowQR} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <QRCodeDialog
        voucher={selectedVoucher}
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
      />
    </div>
  );
}
