
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
  DollarSign,
  FileText,
  Activity,
  Clock,
  AlertCircle,
  Package,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";

// Static data for subscription plans comparison
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

const StatCard = ({ title, value, icon: Icon, isLoading, change, changeType }: { title: string; value: any; icon: any; isLoading: boolean; change?: string; changeType?: string }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const BillingStats = () => {
  const { data, isLoading, error, refetch } = trpc.superAdmin.billingStats.useQuery();

  if (error) {
    return <QueryError message={error.message} onRetry={refetch} />;
  }

  const formatCurrency = (amount: any) => `NT$ ${amount?.toLocaleString() || '0'}`;

  const stats = [
    { title: "總收入", value: formatCurrency(data?.totalRevenue), icon: DollarSign, isLoading: isLoading },
    { title: "本月收入", value: formatCurrency(data?.monthlyRevenue), icon: TrendingUp, isLoading: isLoading, change: `${data?.growthRate || 0}% vs last month`, changeType: (data?.growthRate || 0) >= 0 ? 'increase' : 'decrease' },
    { title: "活躍訂閱數", value: data?.activeSubscriptions || 0, icon: Users, isLoading: isLoading },
    { title: "待處理發票", value: data?.pendingInvoices || 0, icon: Clock, isLoading: isLoading },
    { title: "已逾期發票", value: data?.overdueInvoices || 0, icon: AlertCircle, isLoading: isLoading },
    { title: "總方案數", value: (data?.activeSubscriptions ?? 0), icon: Package, isLoading: isLoading },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
    </div>
  );
};

const InvoiceList = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, error, refetch } = trpc.superAdmin.listInvoices.useQuery({ page, limit });

  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.superAdmin.updateInvoiceStatus.useMutation({
    onSuccess: () => {
      toast.success("發票狀態已更新");
      utils.superAdmin.listInvoices.invalidate();
    },
    onError: (err) => {
      toast.error(`更新失敗: ${err.message}`);
    }
  });

  const handleStatusChange = (invoiceId: number, newStatus: 'paid' | 'pending' | 'overdue' | 'cancelled') => {
    updateStatusMutation.mutate({ invoiceId, status: newStatus });
  };

  if (isLoading) return <QueryLoading message="正在載入發票..." />;
  if (error) return <QueryError message={error.message} onRetry={refetch} />;

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>帳單記錄</CardTitle>
        <CardDescription>所有組織的發票歷史記錄</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>發票號碼</TableHead>
              <TableHead>診所</TableHead>
              <TableHead>方案</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>開立日期</TableHead>
              <TableHead>到期日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((invoice: any) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">#{invoice.id}</TableCell>
                <TableCell>{invoice.clinicName}</TableCell>
                <TableCell>{invoice.plan}</TableCell>
                <TableCell>NT$ {Number(invoice.amount).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}
                    className={`${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => toast.info("下載功能待實現")}>
                    <Download className="h-4 w-4 mr-2" />
                    下載
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {data?.total || 0} 筆發票
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一頁</Button>
            <span>第 {page} 頁，共 {totalPages} 頁</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一頁</Button>
          </div>
        </CardFooter>
    </Card>
  );
};

const SubscriptionList = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, error, refetch } = trpc.superAdmin.listSubscriptions.useQuery({ page, limit });

  if (isLoading) return <QueryLoading message="正在載入訂閱..." />;
  if (error) return <QueryError message={error.message} onRetry={refetch} />;

  const subscriptions = data ?? [];
  const totalItems = subscriptions.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>訂閱列表</CardTitle>
        <CardDescription>所有組織的目前訂閱狀態</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>診所</TableHead>
              <TableHead>方案</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>開始日期</TableHead>
              <TableHead>下次扣款日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub: any) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.clinic}</TableCell>
                <TableCell>{sub.plan}</TableCell>
                <TableCell>
                  <Badge variant={sub.isActive ? 'default' : 'destructive'} className={`${sub.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {totalItems} 筆訂閱
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一頁</Button>
            <span>第 {page} 頁</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={subscriptions.length < limit}>下一頁</Button>
          </div>
        </CardFooter>
    </Card>
  );
}

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">計費與收入總覽</h1>
          <p className="text-muted-foreground mt-1">追蹤全平台的收入、訂閱與發票</p>
        </div>

        <BillingStats />

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">帳單記錄</TabsTrigger>
            <TabsTrigger value="subscriptions">訂閱列表</TabsTrigger>
            <TabsTrigger value="plans">方案比較</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <InvoiceList />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionList />
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const PlanIcon = plan.icon;
                return (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">最受歡迎</Badge>
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
                      <div>
                        <span className="text-4xl font-bold">NT$ {plan.price.toLocaleString()}</span>
                        <span className="text-muted-foreground"> / {plan.period}</span>
                      </div>
                    </CardContent>
                    <CardContent className="flex-grow">
                      <ul className="space-y-3 text-sm text-left">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={!feature.included ? "text-muted-foreground" : ""}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"} disabled>
                        查看方案
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
