import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Ticket, 
  Search,
  Clock,
  User,
  Package,
  AlertTriangle
} from "lucide-react";

interface VoucherInfo {
  id: number;
  voucherCode: string;
  status: string | null;
  expiryDate: Date | null;
  customer?: {
    name: string;
    phone: string | null;
  } | null;
  template?: {
    name: string;
    type: string | null;
    value: string | null;
    valueType: string | null;
    description: string | null;
  } | null;
}

function getTypeLabel(type: string | null) {
  const labels: Record<string, string> = {
    treatment: "療程券",
    discount: "折扣券",
    gift_card: "禮品卡",
    stored_value: "儲值卡",
    free_item: "贈品券",
  };
  return labels[type || ""] || "優惠券";
}

function getValueDisplay(value: string | null, valueType: string | null) {
  if (!value) return "-";
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

export default function VoucherRedemptionPage() {
  const [manualCode, setManualCode] = useState("");
  const [scannedVoucher, setScannedVoucher] = useState<VoucherInfo | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // TODO: 從 context 取得 organizationId
  const organizationId = 1;

  const lookupMutation = trpc.voucher.getInstanceByCode.useQuery(
    { code: manualCode },
    { enabled: false }
  );

  const redeemMutation = trpc.voucher.redeem.useMutation({
    onSuccess: () => {
      toast.success("票券核銷成功！");
      setShowConfirmDialog(false);
      setScannedVoucher(null);
      setManualCode("");
    },
    onError: (error) => {
      toast.error(`核銷失敗：${error.message}`);
    },
  });

  // 開啟相機掃描
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (error) {
      toast.error("無法開啟相機，請檢查權限設定");
    }
  };

  // 停止掃描
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // 手動輸入查詢
  const handleManualLookup = async () => {
    if (!manualCode.trim()) {
      toast.error("請輸入票券代碼");
      return;
    }

    const result = await lookupMutation.refetch();
    if (result.data) {
      setScannedVoucher(result.data as any as VoucherInfo);
      setShowConfirmDialog(true);
    } else {
      toast.error("找不到此票券");
    }
  };

  // 確認核銷
  const handleConfirmRedeem = () => {
    if (!scannedVoucher) return;

    redeemMutation.mutate({
      organizationId,
      voucherCode: scannedVoucher.voucherCode,
      customerId: 1, // TODO: 從票券資料取得
      redemptionMethod: "manual_code",
    });
  };

  // 清理相機資源
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const isVoucherValid = scannedVoucher?.status === "active" && 
    (!scannedVoucher.expiryDate || new Date(scannedVoucher.expiryDate) > new Date());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">票券核銷</h1>
          <p className="text-slate-400 mt-1">掃描 QR Code 或輸入票券代碼進行核銷</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code 掃描 */}
          <Card className="bg-[#0F172A] border-[#1E3A5F]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5 text-[#F5D78E]" />
                QR Code 掃描
              </CardTitle>
              <CardDescription className="text-slate-400">
                使用相機掃描客戶的票券 QR Code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-[#F5D78E] rounded-lg" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={stopScanning}
                  >
                    停止掃描
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="p-4 bg-[#1E3A5F]/50 rounded-full mb-4">
                    <QrCode className="h-12 w-12 text-[#F5D78E]" />
                  </div>
                  <Button
                    className="bg-[#F5D78E] text-[#0A1628] hover:bg-[#D4AF37]"
                    onClick={startScanning}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    開啟相機掃描
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    需要相機權限
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 手動輸入 */}
          <Card className="bg-[#0F172A] border-[#1E3A5F]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Search className="h-5 w-5 text-[#F5D78E]" />
                手動輸入
              </CardTitle>
              <CardDescription className="text-slate-400">
                輸入票券代碼進行查詢與核銷
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="輸入票券代碼..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="font-mono bg-[#1E3A5F]/30 border-[#1E3A5F] text-white"
                  onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
                />
                <Button
                  className="bg-[#F5D78E] text-[#0A1628] hover:bg-[#D4AF37]"
                  onClick={handleManualLookup}
                  disabled={lookupMutation.isFetching}
                >
                  {lookupMutation.isFetching ? "查詢中..." : "查詢"}
                </Button>
              </div>

              <div className="p-4 bg-[#1E3A5F]/20 rounded-lg">
                <h4 className="text-sm font-medium text-slate-300 mb-2">使用說明</h4>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• 票券代碼為 8 位英數字組合</li>
                  <li>• 輸入後按 Enter 或點擊查詢按鈕</li>
                  <li>• 確認票券資訊後點擊核銷</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最近核銷記錄 */}
        <Card className="bg-[#0F172A] border-[#1E3A5F]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-[#F5D78E]" />
              最近核銷記錄
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>尚無核銷記錄</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 確認核銷 Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-[#0F172A] border-[#1E3A5F]">
          <DialogHeader>
            <DialogTitle className="text-white">確認核銷票券</DialogTitle>
          </DialogHeader>

          {scannedVoucher && (
            <div className="space-y-4">
              {/* 票券狀態 */}
              <div className="flex items-center justify-center">
                {isVoucherValid ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-4 py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    票券有效
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 px-4 py-2">
                    <XCircle className="h-4 w-4 mr-2" />
                    票券無效
                  </Badge>
                )}
              </div>

              {/* 票券資訊 */}
              <div className="bg-[#1E3A5F]/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-[#F5D78E]" />
                  <div>
                    <p className="text-sm text-slate-400">票券名稱</p>
                    <p className="text-white font-medium">
                      {scannedVoucher.template?.name || "優惠券"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#F5D78E]" />
                  <div>
                    <p className="text-sm text-slate-400">票券類型</p>
                    <p className="text-white">
                      {getTypeLabel(scannedVoucher.template?.type || null)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center text-[#F5D78E] font-bold">$</div>
                  <div>
                    <p className="text-sm text-slate-400">票券價值</p>
                    <p className="text-[#F5D78E] font-bold text-lg">
                      {getValueDisplay(
                        scannedVoucher.template?.value || null,
                        scannedVoucher.template?.valueType || null
                      )}
                    </p>
                  </div>
                </div>

                {scannedVoucher.customer && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-[#F5D78E]" />
                    <div>
                      <p className="text-sm text-slate-400">持有人</p>
                      <p className="text-white">
                        {scannedVoucher.customer.name}
                        {scannedVoucher.customer.phone && (
                          <span className="text-slate-400 ml-2">
                            ({scannedVoucher.customer.phone})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {scannedVoucher.expiryDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#F5D78E]" />
                    <div>
                      <p className="text-sm text-slate-400">有效期限</p>
                      <p className="text-white">
                        {new Date(scannedVoucher.expiryDate).toLocaleDateString("zh-TW")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#1E3A5F]">
                  <p className="text-sm text-slate-400">票券代碼</p>
                  <p className="text-[#F5D78E] font-mono text-lg">
                    {scannedVoucher.voucherCode}
                  </p>
                </div>
              </div>

              {!isVoucherValid && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">
                    {scannedVoucher.status !== "active"
                      ? "此票券已被使用或已取消"
                      : "此票券已過期"}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              取消
            </Button>
            <Button
              className="bg-[#F5D78E] text-[#0A1628] hover:bg-[#D4AF37]"
              onClick={handleConfirmRedeem}
              disabled={!isVoucherValid || redeemMutation.isPending}
            >
              {redeemMutation.isPending ? "核銷中..." : "確認核銷"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
