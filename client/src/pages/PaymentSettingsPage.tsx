/**
 * 支付設定頁面
 * 管理診所的支付服務商設定
 */

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  CreditCard,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
  Building2,
  Smartphone,
  QrCode,
} from "lucide-react";

type PaymentProvider = "lemonsqueezy" | "ecpay" | "stripe" | "linepay" | "jkopay";

interface ProviderInfo {
  id: PaymentProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  setupUrl: string;
  status: "available" | "coming_soon";
}

const providers: ProviderInfo[] = [
  {
    id: "lemonsqueezy",
    name: "LemonSqueezy",
    description: "國際訂閱與一次性付款",
    icon: <Wallet className="h-6 w-6" />,
    setupUrl: "https://app.lemonsqueezy.com",
    status: "available",
  },
  {
    id: "ecpay",
    name: "綠界 ECPay",
    description: "台灣本地支付（信用卡、ATM、超商）",
    icon: <Building2 className="h-6 w-6" />,
    setupUrl: "https://www.ecpay.com.tw",
    status: "available",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "國際支付（預留）",
    icon: <CreditCard className="h-6 w-6" />,
    setupUrl: "https://dashboard.stripe.com",
    status: "coming_soon",
  },
  {
    id: "linepay",
    name: "LINE Pay",
    description: "LINE 生態系支付（預留）",
    icon: <Smartphone className="h-6 w-6" />,
    setupUrl: "https://pay.line.me",
    status: "coming_soon",
  },
  {
    id: "jkopay",
    name: "街口支付",
    description: "台灣行動支付（預留）",
    icon: <QrCode className="h-6 w-6" />,
    setupUrl: "https://www.jkopay.com",
    status: "coming_soon",
  },
];

export default function PaymentSettingsPage() {
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>("ecpay");
  
  // TODO: Get organizationId from context
  const organizationId = 1;

  // 取得支付設定
  const { data: settings, refetch } = trpc.payment.getSettings.useQuery({
    organizationId,
  });

  // LemonSqueezy 設定
  const [lsApiKey, setLsApiKey] = useState("");
  const [lsStoreId, setLsStoreId] = useState("");
  const [lsWebhookSecret, setLsWebhookSecret] = useState("");
  const [lsTestMode, setLsTestMode] = useState(true);

  // ECPay 設定
  const [ecpayMerchantId, setEcpayMerchantId] = useState("");
  const [ecpayHashKey, setEcpayHashKey] = useState("");
  const [ecpayHashIv, setEcpayHashIv] = useState("");
  const [ecpayTestMode, setEcpayTestMode] = useState(true);

  // Mutations
  const saveLemonSqueezyMutation = trpc.payment.saveLemonSqueezySettings.useMutation({
    onSuccess: () => {
      toast.success("LemonSqueezy 設定已儲存");
      refetch();
    },
    onError: (error) => {
      toast.error(`儲存失敗: ${error.message}`);
    },
  });

  const saveECPayMutation = trpc.payment.saveECPaySettings.useMutation({
    onSuccess: () => {
      toast.success("綠界 ECPay 設定已儲存");
      refetch();
    },
    onError: (error) => {
      toast.error(`儲存失敗: ${error.message}`);
    },
  });

  const handleSaveLemonSqueezy = () => {
    if (!lsApiKey || !lsStoreId) {
      toast.error("請填寫必要欄位");
      return;
    }
    saveLemonSqueezyMutation.mutate({
      organizationId,
      apiKey: lsApiKey,
      storeId: lsStoreId,
      webhookSecret: lsWebhookSecret || undefined,
      isTestMode: lsTestMode,
      isEnabled: true,
    });
  };

  const handleSaveECPay = () => {
    if (!ecpayMerchantId || !ecpayHashKey || !ecpayHashIv) {
      toast.error("請填寫必要欄位");
      return;
    }
    saveECPayMutation.mutate({
      organizationId,
      merchantId: ecpayMerchantId,
      hashKey: ecpayHashKey,
      hashIv: ecpayHashIv,
      isTestMode: ecpayTestMode,
      isEnabled: true,
    });
  };

  const getProviderStatus = (providerId: PaymentProvider) => {
    const setting = settings?.find((s: any) => s.provider === providerId);
    return setting?.isEnabled ? "enabled" : "disabled";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">支付設定</h1>
          <p className="text-gray-500 mt-1">
            設定您的支付服務商以接受線上付款
          </p>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              className={`cursor-pointer transition-all ${
                activeProvider === provider.id
                  ? "ring-2 ring-primary"
                  : "hover:shadow-md"
              } ${provider.status === "coming_soon" ? "opacity-60" : ""}`}
              onClick={() => {
                if (provider.status === "available") {
                  setActiveProvider(provider.id);
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {provider.icon}
                  </div>
                  {provider.status === "coming_soon" ? (
                    <Badge variant="secondary">即將推出</Badge>
                  ) : getProviderStatus(provider.id) === "enabled" ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      已啟用
                    </Badge>
                  ) : (
                    <Badge variant="outline">未設定</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">{provider.name}</CardTitle>
                <CardDescription>{provider.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {providers.find((p) => p.id === activeProvider)?.name} 設定
            </CardTitle>
            <CardDescription>
              設定您的{" "}
              {providers.find((p) => p.id === activeProvider)?.name} 憑證
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeProvider === "lemonsqueezy" && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>設定步驟</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                      <li>
                        前往{" "}
                        <a
                          href="https://app.lemonsqueezy.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center"
                        >
                          LemonSqueezy Dashboard
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </li>
                      <li>建立 Store 並取得 Store ID</li>
                      <li>在 Settings → API 建立 API Key</li>
                      <li>在 Settings → Webhooks 設定 Webhook URL</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lsApiKey">
                      API Key <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lsApiKey"
                      type="password"
                      placeholder="輸入 API Key"
                      value={lsApiKey}
                      onChange={(e) => setLsApiKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lsStoreId">
                      Store ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lsStoreId"
                      placeholder="輸入 Store ID"
                      value={lsStoreId}
                      onChange={(e) => setLsStoreId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lsWebhookSecret">Webhook Secret（選填）</Label>
                    <Input
                      id="lsWebhookSecret"
                      type="password"
                      placeholder="輸入 Webhook Secret"
                      value={lsWebhookSecret}
                      onChange={(e) => setLsWebhookSecret(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>測試模式</Label>
                      <p className="text-sm text-muted-foreground">
                        啟用測試模式進行開發測試
                      </p>
                    </div>
                    <Switch
                      checked={lsTestMode}
                      onCheckedChange={setLsTestMode}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveLemonSqueezy}
                    disabled={saveLemonSqueezyMutation.isPending}
                  >
                    {saveLemonSqueezyMutation.isPending ? "儲存中..." : "儲存設定"}
                  </Button>
                </div>
              </div>
            )}

            {activeProvider === "ecpay" && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>設定步驟</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                      <li>
                        前往{" "}
                        <a
                          href="https://www.ecpay.com.tw"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center"
                        >
                          綠界科技官網
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>{" "}
                        申請商店帳號
                      </li>
                      <li>取得 MerchantID、HashKey、HashIV</li>
                      <li>設定付款完成通知網址</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">測試環境憑證</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    <p className="text-sm mt-1">
                      測試環境可使用以下憑證：
                    </p>
                    <ul className="text-sm mt-2 space-y-1 font-mono">
                      <li>MerchantID: 3002607</li>
                      <li>HashKey: pwFHCqoQZGmho4w6</li>
                      <li>HashIV: EkRm7iFT261dpevs</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ecpayMerchantId">
                      Merchant ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ecpayMerchantId"
                      placeholder="輸入 Merchant ID"
                      value={ecpayMerchantId}
                      onChange={(e) => setEcpayMerchantId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ecpayHashKey">
                      Hash Key <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ecpayHashKey"
                      type="password"
                      placeholder="輸入 Hash Key"
                      value={ecpayHashKey}
                      onChange={(e) => setEcpayHashKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ecpayHashIv">
                      Hash IV <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ecpayHashIv"
                      type="password"
                      placeholder="輸入 Hash IV"
                      value={ecpayHashIv}
                      onChange={(e) => setEcpayHashIv(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>測試模式</Label>
                      <p className="text-sm text-muted-foreground">
                        啟用測試模式使用測試環境
                      </p>
                    </div>
                    <Switch
                      checked={ecpayTestMode}
                      onCheckedChange={setEcpayTestMode}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveECPay}
                    disabled={saveECPayMutation.isPending}
                  >
                    {saveECPayMutation.isPending ? "儲存中..." : "儲存設定"}
                  </Button>
                </div>
              </div>
            )}

            {(activeProvider === "stripe" ||
              activeProvider === "linepay" ||
              activeProvider === "jkopay") && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {providers.find((p) => p.id === activeProvider)?.name} 整合即將推出
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  我們正在努力開發中，敬請期待
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
