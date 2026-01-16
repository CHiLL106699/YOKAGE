import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  CreditCard,
  Check,
  X,
  Download,
  Calendar,
  Users,
  Database,
  MessageSquare,
  Zap,
  Crown,
  Building2,
  TrendingUp,
} from "lucide-react";

// Mock data for subscription plans
const plans = [
  {
    id: "starter",
    name: "入門版",
    price: 1990,
    period: "月",
    description: "適合小型診所起步使用",
    features: [
      { name: "最多 3 位員工", included: true },
      { name: "最多 500 位客戶", included: true },
      { name: "基礎預約管理", included: true },
      { name: "基礎報表", included: true },
      { name: "LINE 通知（500則/月）", included: true },
      { name: "進階報表分析", included: false },
      { name: "API 存取", included: false },
      { name: "白標方案", included: false },
      { name: "優先客服支援", included: false },
    ],
    icon: Building2,
    popular: false,
  },
  {
    id: "professional",
    name: "專業版",
    price: 4990,
    period: "月",
    description: "適合成長中的診所",
    features: [
      { name: "最多 10 位員工", included: true },
      { name: "最多 3000 位客戶", included: true },
      { name: "完整預約管理", included: true },
      { name: "進階報表分析", included: true },
      { name: "LINE 通知（2000則/月）", included: true },
      { name: "庫存管理", included: true },
      { name: "API 存取", included: false },
      { name: "白標方案", included: false },
      { name: "優先客服支援", included: true },
    ],
    icon: Zap,
    popular: true,
  },
  {
    id: "enterprise",
    name: "企業版",
    price: 9990,
    period: "月",
    description: "適合連鎖診所或大型機構",
    features: [
      { name: "無限員工數", included: true },
      { name: "無限客戶數", included: true },
      { name: "完整預約管理", included: true },
      { name: "進階報表分析", included: true },
      { name: "LINE 通知（無限）", included: true },
      { name: "庫存管理", included: true },
      { name: "API 存取", included: true },
      { name: "白標方案", included: true },
      { name: "專屬客服經理", included: true },
    ],
    icon: Crown,
    popular: false,
  },
];

// Mock current subscription
const currentSubscription = {
  plan: "professional",
  status: "active",
  startDate: "2024-01-01",
  nextBillingDate: "2024-02-01",
  amount: 4990,
};

// Mock usage data
const usageData = {
  staff: { used: 6, limit: 10 },
  customers: { used: 1850, limit: 3000 },
  lineMessages: { used: 1200, limit: 2000 },
  storage: { used: 2.5, limit: 10 }, // GB
};

// Mock billing history
const billingHistory = [
  {
    id: 1,
    date: "2024-01-01",
    description: "專業版月費",
    amount: 4990,
    status: "paid",
    invoice: "INV-2024-001",
  },
  {
    id: 2,
    date: "2023-12-01",
    description: "專業版月費",
    amount: 4990,
    status: "paid",
    invoice: "INV-2023-012",
  },
  {
    id: 3,
    date: "2023-11-01",
    description: "專業版月費",
    amount: 4990,
    status: "paid",
    invoice: "INV-2023-011",
  },
  {
    id: 4,
    date: "2023-10-01",
    description: "入門版月費",
    amount: 1990,
    status: "paid",
    invoice: "INV-2023-010",
  },
  {
    id: 5,
    date: "2023-09-01",
    description: "入門版月費",
    amount: 1990,
    status: "paid",
    invoice: "INV-2023-009",
  },
];

// Mock payment methods
const paymentMethods = [
  {
    id: 1,
    type: "credit_card",
    brand: "Visa",
    last4: "4242",
    expiry: "12/25",
    isDefault: true,
  },
  {
    id: 2,
    type: "credit_card",
    brand: "Mastercard",
    last4: "8888",
    expiry: "06/26",
    isDefault: false,
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    toast.success("方案升級申請已送出，我們將盡快與您聯繫");
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`正在下載發票 ${invoiceId}`);
  };

  const currentPlan = plans.find(p => p.id === currentSubscription.plan);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-3xl font-bold">計費與訂閱</h1>
          <p className="text-muted-foreground mt-1">管理您的訂閱方案與付款資訊</p>
        </div>

        {/* 當前方案 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentPlan && <currentPlan.icon className="h-5 w-5" />}
                  {currentPlan?.name}
                  <Badge className="bg-green-100 text-green-800">啟用中</Badge>
                </CardTitle>
                <CardDescription>
                  下次扣款日：{currentSubscription.nextBillingDate}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  NT$ {currentSubscription.amount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">每月</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 使用量統計 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                員工數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageData.staff.used} / {usageData.staff.limit}
              </div>
              <Progress
                value={(usageData.staff.used / usageData.staff.limit) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                客戶數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageData.customers.used.toLocaleString()} / {usageData.customers.limit.toLocaleString()}
              </div>
              <Progress
                value={(usageData.customers.used / usageData.customers.limit) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                LINE 通知
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageData.lineMessages.used.toLocaleString()} / {usageData.lineMessages.limit.toLocaleString()}
              </div>
              <Progress
                value={(usageData.lineMessages.used / usageData.lineMessages.limit) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                儲存空間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageData.storage.used} / {usageData.storage.limit} GB
              </div>
              <Progress
                value={(usageData.storage.used / usageData.storage.limit) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">方案比較</TabsTrigger>
            <TabsTrigger value="history">帳單記錄</TabsTrigger>
            <TabsTrigger value="payment">付款方式</TabsTrigger>
          </TabsList>

          {/* 方案比較 */}
          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const PlanIcon = plan.icon;
                const isCurrent = plan.id === currentSubscription.plan;

                return (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${isCurrent ? "ring-2 ring-primary" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">最受歡迎</Badge>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-green-500">目前方案</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-2">
                      <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10 w-fit">
                        <PlanIcon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="text-center">
                      <div className="mb-4">
                        <span className="text-4xl font-bold">
                          NT$ {plan.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>

                      <ul className="space-y-2 text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={!feature.included ? "text-muted-foreground" : ""}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                        disabled={isCurrent}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isCurrent ? "目前方案" : plan.price > (currentPlan?.price || 0) ? "升級方案" : "降級方案"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* 帳單記錄 */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">帳單記錄</CardTitle>
                <CardDescription>查看過往的付款記錄與發票</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>發票編號</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>{bill.date}</TableCell>
                        <TableCell className="font-medium">{bill.description}</TableCell>
                        <TableCell className="font-mono text-sm">{bill.invoice}</TableCell>
                        <TableCell className="text-right">
                          NT$ {bill.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            已付款
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(bill.invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 付款方式 */}
          <TabsContent value="payment" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">付款方式</CardTitle>
                  <CardDescription>管理您的付款卡片</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${method.isDefault ? "border-primary bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {method.brand} •••• {method.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            到期日 {method.expiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge variant="outline">預設</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          編輯
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    新增付款方式
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">帳單資訊</CardTitle>
                  <CardDescription>發票與收據的寄送資訊</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">公司名稱</p>
                    <p className="font-medium">曜醫美診所</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">統一編號</p>
                    <p className="font-medium">12345678</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">帳單地址</p>
                    <p className="font-medium">台北市信義區信義路五段7號</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">帳單 Email</p>
                    <p className="font-medium">billing@yochill.com</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    編輯帳單資訊
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
