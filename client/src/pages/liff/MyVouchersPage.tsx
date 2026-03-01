import { useState } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Ticket, Gift, Percent, CreditCard, Package, QrCode, Clock, CheckCircle, XCircle, AlertTriangle, Send, Copy, Share2 } from "lucide-react";
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
    case "transferred":
      return (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
          <Send className="h-3 w-3 mr-1" />
          已轉贈
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function VoucherCard({ 
  voucher, 
  onShowQR,
  onTransfer,
}: { 
  voucher: VoucherInstance; 
  onShowQR: (voucher: VoucherInstance) => void;
  onTransfer: (voucher: VoucherInstance) => void;
}) {
  const template = voucher.template;
  const bgColor = template?.backgroundColor || "#1E3A5F";
  const txtColor = template?.textColor || "#F5D78E";
  const isUsable = voucher.status === "active";
  const isTransferable = template?.isTransferable && isUsable;
  const expiryDate = voucher.expiryDate ? new Date(voucher.expiryDate) : null;

  return (
    <Card
      className="overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{ backgroundColor: bgColor }}
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
          <div className="flex gap-2 mt-2">
            <Button
              className="flex-1"
              style={{ backgroundColor: txtColor, color: bgColor }}
              onClick={() => onShowQR(voucher)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              顯示 QR Code
            </Button>
            {isTransferable && (
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => onTransfer(voucher)}
              >
                <Gift className="h-4 w-4" />
              </Button>
            )}
          </div>
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
              value={`VOUCHER:${voucher.voucherCode}`}
              size={200}
              level="H"
              fgColor={bgColor}
            />
          </div>

          {/* 票券代碼 */}
          <div className="text-center">
            <p className="text-sm text-slate-400">票券代碼</p>
            <p className="text-2xl font-mono font-bold" style={{ color: txtColor }}>
              {voucher.voucherCode}
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
                有效期限：{safeDate(voucher.expiresAt)}
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

function TransferDialog({
  voucher,
  open,
  onClose,
  onSuccess,
}: {
  voucher: VoucherInstance | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    toCustomerName: "",
    toCustomerPhone: "",
    giftMessage: "",
  });
  const [claimCode, setClaimCode] = useState("");

  const createTransfer = trpc.voucher.createTransfer.useMutation({
    onSuccess: (data) => {
      setClaimCode(data.claimCode || "");
      setStep("success");
      toast.success("轉贈成功，請將領取碼分享給對方");
    },
    onError: (error) => {
      toast.error(`轉贈失敗: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!voucher) return;
    if (!formData.toCustomerPhone) {
      toast.error("請填寫收禮人手機號碼");
      return;
    }

    createTransfer.mutate({
      organizationId: voucher.organizationId,
      voucherInstanceId: voucher.id,
      fromCustomerId: voucher.customerId,
      toCustomerName: formData.toCustomerName,
      toCustomerPhone: formData.toCustomerPhone,
      giftMessage: formData.giftMessage,
      notificationChannel: "line",
    });
  };

  const handleCopyClaimCode = () => {
    navigator.clipboard.writeText(claimCode);
toast.success("已複製領取碼");
  };

  const handleShare = () => {
    const shareText = `🎁 您收到一份禮物！\n\n${voucher?.template?.name || "優惠券"}\n${formData.giftMessage ? `\n留言：${formData.giftMessage}\n` : ""}\n領取碼：${claimCode}\n\n請前往會員中心領取`;
    
    if (navigator.share) {
      navigator.share({
        title: "票券轉贈",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("已複製分享內容");
    }
  };

  const handleClose = () => {
    setStep("form");
    setFormData({ toCustomerName: "", toCustomerPhone: "", giftMessage: "" });
    setClaimCode("");
    onClose();
    if (step === "success") {
      onSuccess();
    }
  };

  if (!voucher) return null;

  const template = voucher.template;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" style={{ backgroundColor: "#0A1628" }}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#F5D78E]" />
            {step === "form" ? "轉贈票券" : "轉贈成功"}
          </DialogTitle>
          {step === "form" && (
            <DialogDescription className="text-slate-400">
              將此票券轉贈給親友，對方可使用領取碼領取
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-4 py-4">
            {/* 票券預覽 */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: template?.backgroundColor || "#1E3A5F" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">{getTypeLabel(template?.type || "discount")}</p>
                  <p className="text-lg font-bold text-white">{template?.name || "優惠券"}</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: template?.textColor || "#F5D78E" }}>
                  {getValueDisplay(template?.value || "0", template?.valueType || "fixed_amount")}
                </p>
              </div>
            </div>

            {/* 收禮人資訊 */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="toCustomerName" className="text-slate-300">收禮人姓名（選填）</Label>
                <Input
                  id="toCustomerName"
                  placeholder="請輸入收禮人姓名"
                  value={formData.toCustomerName}
                  onChange={(e) => setFormData({ ...formData, toCustomerName: e.target.value })}
                  className="mt-1 bg-[#1E3A5F]/50 border-[#F5D78E]/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="toCustomerPhone" className="text-slate-300">收禮人手機號碼 *</Label>
                <Input
                  id="toCustomerPhone"
                  placeholder="請輸入手機號碼"
                  value={formData.toCustomerPhone}
                  onChange={(e) => setFormData({ ...formData, toCustomerPhone: e.target.value })}
                  className="mt-1 bg-[#1E3A5F]/50 border-[#F5D78E]/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="giftMessage" className="text-slate-300">祝福留言（選填）</Label>
                <Textarea
                  id="giftMessage"
                  placeholder="寫下您的祝福..."
                  value={formData.giftMessage}
                  onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                  className="mt-1 bg-[#1E3A5F]/50 border-[#F5D78E]/30 text-white resize-none"
                  rows={3}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              * 轉贈後此票券將無法使用，對方需在 7 天內領取
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* 成功圖示 */}
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
            </div>

            {/* 領取碼 */}
            <div className="text-center space-y-2">
              <p className="text-slate-400">領取碼</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-mono font-bold text-[#F5D78E]">{claimCode}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyClaimCode}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-slate-400 text-center">
              請將此領取碼分享給 {formData.toCustomerName || formData.toCustomerPhone}，<br />
              對方可在會員中心使用此碼領取票券
            </p>

            {/* 分享按鈕 */}
            <Button
              className="w-full bg-[#F5D78E] text-[#0A1628] hover:bg-[#F5D78E]/90"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              分享給好友
            </Button>
          </div>
        )}

        <DialogFooter>
          {step === "form" ? (
            <>
              <Button variant="outline" onClick={handleClose} className="border-slate-600 text-slate-300">
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createTransfer.isPending}
                className="bg-[#F5D78E] text-[#0A1628] hover:bg-[#F5D78E]/90"
              >
                {createTransfer.isPending ? "處理中..." : "確認轉贈"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/80">
              完成
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClaimVoucherDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  
  const [claimCode, setClaimCode] = useState("");

  // TODO: 從 LIFF context 取得 customerId
  const customerId = 1;

  const claimTransfer = trpc.voucher.claimTransfer.useMutation({
    onSuccess: () => {
      toast.success("領取成功，票券已加入您的票券夾");
      setClaimCode("");
      onClose();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`領取失敗: ${error.message}`);
    },
  });

  const handleClaim = () => {
    if (!claimCode.trim()) {
      toast.error("請輸入領取碼");
      return;
    }

    claimTransfer.mutate({
      claimCode: claimCode.trim(),
      customerId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" style={{ backgroundColor: "#0A1628" }}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#F5D78E]" />
            領取票券
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            輸入好友分享的領取碼，即可領取票券
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="claimCode" className="text-slate-300">領取碼</Label>
            <Input
              id="claimCode"
              placeholder="請輸入領取碼 (例如: GIFT-XXXXXXXX)"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
              className="mt-1 bg-[#1E3A5F]/50 border-[#F5D78E]/30 text-white font-mono text-lg text-center"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            取消
          </Button>
          <Button
            onClick={handleClaim}
            disabled={claimTransfer.isPending}
            className="bg-[#F5D78E] text-[#0A1628] hover:bg-[#F5D78E]/90"
          >
            {claimTransfer.isPending ? "處理中..." : "領取票券"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MyVouchersPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherInstance | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  // TODO: 從 LIFF context 取得 customerId
  const customerId = 1;

  const { data: vouchers, isLoading, refetch } = trpc.voucher.myVouchers.useQuery({
    customerId,
    status: activeTab === "all" ? undefined : activeTab,
    includeExpired: activeTab === "expired" || activeTab === "all",
  });

  const handleShowQR = (voucher: VoucherInstance) => {
    setSelectedVoucher(voucher);
    setShowQRDialog(true);
  };

  const handleTransfer = (voucher: VoucherInstance) => {
    setSelectedVoucher(voucher);
    setShowTransferDialog(true);
  };

  const activeVouchers = vouchers?.filter((v: VoucherInstance) => v.status === "active") || [];
  const usedVouchers = vouchers?.filter((v: VoucherInstance) => v.status === "used") || [];
  const expiredVouchers = vouchers?.filter((v: VoucherInstance) => v.status === "expired" || v.status === "cancelled" || v.status === "transferred") || [];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0F172A] p-6">
        <div className="flex items-center justify-between">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClaimDialog(true)}
            className="border-[#F5D78E]/50 text-[#F5D78E] hover:bg-[#F5D78E]/10"
          >
            <Gift className="h-4 w-4 mr-1" />
            領取票券
          </Button>
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
              <Button
                variant="link"
                onClick={() => setShowClaimDialog(true)}
                className="text-[#F5D78E] mt-2"
              >
                有領取碼？點此領取
              </Button>
            </div>
          ) : (
            activeVouchers.map((voucher: VoucherInstance) => (
              <VoucherCard 
                key={voucher.id} 
                voucher={voucher} 
                onShowQR={handleShowQR}
                onTransfer={handleTransfer}
              />
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
              <VoucherCard 
                key={voucher.id} 
                voucher={voucher} 
                onShowQR={handleShowQR}
                onTransfer={handleTransfer}
              />
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
              <VoucherCard 
                key={voucher.id} 
                voucher={voucher} 
                onShowQR={handleShowQR}
                onTransfer={handleTransfer}
              />
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

      {/* Transfer Dialog */}
      <TransferDialog
        voucher={selectedVoucher}
        open={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        onSuccess={() => refetch()}
      />

      {/* Claim Dialog */}
      <ClaimVoucherDialog
        open={showClaimDialog}
        onClose={() => setShowClaimDialog(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
