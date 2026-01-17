import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback } from "react";
import { 
  Ticket, Upload, Download, FileSpreadsheet, CheckCircle, 
  XCircle, AlertTriangle, Plus, Trash2, Eye, Clock, 
  Gift, Percent, CreditCard, Package, Building2
} from "lucide-react";

// CSV 範本欄位
const CSV_TEMPLATE_HEADERS = [
  "name",
  "type",
  "value",
  "valueType",
  "validDays",
  "description",
  "minPurchaseAmount",
  "maxUsageCount"
];

const CSV_TEMPLATE_EXAMPLE = [
  "生日禮遇券",
  "discount",
  "20",
  "percentage",
  "30",
  "生日當月專屬 8 折優惠",
  "1000",
  "1"
];

// 票券類型選項
const voucherTypes = [
  { value: "treatment", label: "療程券", icon: Package },
  { value: "discount", label: "折扣券", icon: Percent },
  { value: "gift_card", label: "禮品卡", icon: Gift },
  { value: "stored_value", label: "儲值卡", icon: CreditCard },
  { value: "free_item", label: "贈品券", icon: Gift },
];

const valueTypes = [
  { value: "fixed_amount", label: "固定金額" },
  { value: "percentage", label: "百分比折扣" },
  { value: "treatment_count", label: "療程次數" },
];

interface ParsedVoucher {
  name: string;
  type: string;
  value: string;
  valueType: string;
  validDays: number;
  description: string;
  minPurchaseAmount?: number;
  maxUsageCount?: number;
  isValid: boolean;
  errors: string[];
}

export default function SuperAdminVouchersPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedVoucher[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<string>("");
  const [reminderDays, setReminderDays] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API 查詢
  const { data: voucherStats, isLoading: statsLoading } = trpc.superAdmin.voucherStats.useQuery();
  const { data: templatesData, isLoading: templatesLoading } = trpc.superAdmin.listAllVoucherTemplates.useQuery({});
  const { data: orgStats, isLoading: orgStatsLoading } = trpc.superAdmin.voucherStatsByOrganization.useQuery();
  const { data: expiringVouchers, isLoading: expiringLoading } = trpc.superAdmin.getExpiringVouchers.useQuery({ days: reminderDays });
  const { data: organizations } = trpc.superAdmin.listOrganizations.useQuery({});

  // 批量匯入 Mutation
  const batchImportMutation = trpc.superAdmin.batchImportTemplates.useMutation({
    onSuccess: (result) => {
      toast.success(`成功匯入 ${result.createdCount} 筆票券模板`);
      setImportDialogOpen(false);
      setParsedData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      toast.error(`匯入失敗：${error.message}`);
    },
  });

  // 下載 CSV 範本
  const handleDownloadTemplate = () => {
    const csvContent = [
      CSV_TEMPLATE_HEADERS.join(","),
      CSV_TEMPLATE_EXAMPLE.join(","),
      "新客體驗券,treatment,1,treatment_count,60,首次到店免費體驗一次療程,0,1",
      "滿額折扣券,discount,500,fixed_amount,90,消費滿 3000 折 500,3000,1",
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "voucher_template.csv";
    link.click();
    toast.success("CSV 範本已下載");
  };

  // 解析 CSV 檔案
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV 檔案格式錯誤：至少需要標題列和一筆資料");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      const parsed: ParsedVoucher[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
        const errors: string[] = [];
        
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        // 驗證必填欄位
        if (!row.name) errors.push("名稱為必填");
        if (!row.type) errors.push("類型為必填");
        if (!row.value) errors.push("面額為必填");
        if (!row.valueType) errors.push("面額類型為必填");

        // 驗證類型值
        if (row.type && !["treatment", "discount", "gift_card", "stored_value", "free_item"].includes(row.type)) {
          errors.push("類型值無效");
        }
        if (row.valueType && !["fixed_amount", "percentage", "treatment_count"].includes(row.valueType)) {
          errors.push("面額類型值無效");
        }

        // 驗證數值
        if (row.value && isNaN(Number(row.value))) {
          errors.push("面額必須為數字");
        }
        if (row.valueType === "percentage" && Number(row.value) > 100) {
          errors.push("百分比不能超過 100");
        }

        parsed.push({
          name: row.name || "",
          type: row.type || "discount",
          value: row.value || "0",
          valueType: row.valueType || "fixed_amount",
          validDays: parseInt(row.validDays) || 90,
          description: row.description || "",
          minPurchaseAmount: row.minPurchaseAmount ? parseInt(row.minPurchaseAmount) : undefined,
          maxUsageCount: row.maxUsageCount ? parseInt(row.maxUsageCount) : undefined,
          isValid: errors.length === 0,
          errors,
        });
      }

      setParsedData(parsed);
      toast.info(`已解析 ${parsed.length} 筆資料`);
    };

    reader.readAsText(file, "UTF-8");
  };

  // 執行批量匯入
  const handleBatchImport = useCallback(async () => {
    const validData = parsedData.filter(d => d.isValid);
    if (validData.length === 0) {
      toast.error("沒有有效的資料可匯入");
      return;
    }

    if (!selectedClinic) {
      toast.error("請選擇目標診所");
      return;
    }

    // 轉換成 API 需要的格式
    const templates = validData.map(d => ({
      name: d.name,
      description: d.description || undefined,
      type: d.type as "treatment" | "discount" | "gift_card" | "stored_value" | "free_item",
      value: d.value,
      valueType: d.valueType as "fixed_amount" | "percentage" | "treatment_count",
      validDays: d.validDays,
      minPurchase: d.minPurchaseAmount?.toString(),
      usageLimit: d.maxUsageCount,
    }));

    batchImportMutation.mutate({
      organizationId: selectedClinic === "all" ? null : parseInt(selectedClinic.replace("clinic-", "")),
      templates,
    });
  }, [parsedData, selectedClinic, batchImportMutation]);

  const getTypeIcon = (type: string) => {
    const found = voucherTypes.find(t => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Ticket className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    return voucherTypes.find(t => t.value === type)?.label || type;
  };

  const getValueTypeLabel = (valueType: string) => {
    return valueTypes.find(t => t.value === valueType)?.label || valueType;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="票券管理"
          description="管理跨診所票券模板、批量匯入與到期提醒設定"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                下載 CSV 範本
              </Button>
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gold gap-2">
                    <Upload className="h-4 w-4" />
                    批量匯入
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                      批量匯入票券模板
                    </DialogTitle>
                    <DialogDescription>
                      上傳 CSV 檔案以批量建立票券模板
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* 選擇診所 */}
                    <div className="space-y-2">
                      <Label>目標診所</Label>
                      <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇要匯入的診所" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有診所（全域模板）</SelectItem>
                          {organizations?.data?.map((org: any) => (
                            <SelectItem key={org.id} value={`clinic-${org.id}`}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 上傳區域 */}
                    <div className="space-y-2">
                      <Label>上傳 CSV 檔案</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[oklch(0.80_0.14_70)] transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            點擊或拖曳 CSV 檔案到此處
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* 預覽表格 */}
                    {parsedData.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>預覽資料（{parsedData.length} 筆）</Label>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-green-500 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              有效：{parsedData.filter(d => d.isValid).length}
                            </Badge>
                            <Badge variant="outline" className="text-red-500 border-red-500/30">
                              <XCircle className="h-3 w-3 mr-1" />
                              無效：{parsedData.filter(d => !d.isValid).length}
                            </Badge>
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10">狀態</TableHead>
                                <TableHead>名稱</TableHead>
                                <TableHead>類型</TableHead>
                                <TableHead>面額</TableHead>
                                <TableHead>有效天數</TableHead>
                                <TableHead>錯誤訊息</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {parsedData.map((row, index) => (
                                <TableRow key={index} className={!row.isValid ? "bg-red-500/5" : ""}>
                                  <TableCell>
                                    {row.isValid ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{row.name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {getTypeIcon(row.type)}
                                      <span>{getTypeLabel(row.type)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {row.valueType === "percentage" 
                                      ? `${row.value}%` 
                                      : row.valueType === "treatment_count"
                                      ? `${row.value} 次`
                                      : `NT$ ${parseInt(row.value).toLocaleString()}`}
                                  </TableCell>
                                  <TableCell>{row.validDays} 天</TableCell>
                                  <TableCell>
                                    {row.errors.length > 0 && (
                                      <span className="text-xs text-red-500">
                                        {row.errors.join(", ")}
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                      取消
                    </Button>
                    <Button 
                      onClick={handleBatchImport} 
                      disabled={parsedData.filter(d => d.isValid).length === 0 || isImporting || !selectedClinic}
                      className="btn-gold gap-2"
                    >
                      {isImporting ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          匯入中...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          確認匯入
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="票券模板總數"
            value={voucherStats?.totalTemplates || 0}
            icon={Ticket}
            description="跨所有診所"
            loading={statsLoading}
          />
          <StatCard
            title="已發送票券"
            value={voucherStats?.totalIssued || 0}
            icon={Gift}
            description="總計"
            loading={statsLoading}
          />
          <StatCard
            title="待到期提醒"
            value={voucherStats?.pendingReminders || 0}
            icon={Clock}
            description="未來 3 天"
            loading={statsLoading}
          />
          <StatCard
            title="核銷率"
            value={`${voucherStats?.redemptionRate || 0}%`}
            icon={CheckCircle}
            description="平均"
            loading={statsLoading}
          />
        </div>

        {/* 票券模板列表 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="templates" className="gap-2">
              <Ticket className="h-4 w-4" />
              票券模板
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2">
              <Clock className="h-4 w-4" />
              到期提醒
            </TabsTrigger>
            <TabsTrigger value="clinics" className="gap-2">
              <Building2 className="h-4 w-4" />
              診所分布
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>全域票券模板</CardTitle>
                <CardDescription>
                  管理可供所有診所使用的票券模板
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">載入中...</div>
                ) : templatesData?.data && templatesData.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名稱</TableHead>
                        <TableHead>類型</TableHead>
                        <TableHead>面額</TableHead>
                        <TableHead>有效期</TableHead>
                        <TableHead>使用診所</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templatesData.data.map((item: any) => (
                        <TableRow key={item.template.id}>
                          <TableCell className="font-medium">{item.template.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTypeIcon(item.template.type)}
                              {getTypeLabel(item.template.type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.template.valueType === "percentage" 
                              ? `${item.template.value}%` 
                              : item.template.valueType === "treatment_count"
                              ? `${item.template.value} 次`
                              : `NT$ ${Number(item.template.value).toLocaleString()}`}
                          </TableCell>
                          <TableCell>{item.template.validDays} 天</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.organization.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={item.template.isActive 
                              ? "bg-green-500/10 text-green-500 border-green-500/30" 
                              : "bg-gray-500/10 text-gray-500 border-gray-500/30"}>
                              {item.template.isActive ? "啟用中" : "已停用"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    尚無票券模板，請使用批量匯入功能新增
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>到期提醒排程</CardTitle>
                    <CardDescription>
                      查看即將到期的票券，系統將自動發送 LINE 提醒
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>提醒天數：</Label>
                    <Select value={reminderDays.toString()} onValueChange={(v) => setReminderDays(parseInt(v))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 天</SelectItem>
                        <SelectItem value="3">3 天</SelectItem>
                        <SelectItem value="7">7 天</SelectItem>
                        <SelectItem value="14">14 天</SelectItem>
                        <SelectItem value="30">30 天</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {expiringLoading ? (
                  <div className="text-center py-8 text-muted-foreground">載入中...</div>
                ) : expiringVouchers && expiringVouchers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>票券名稱</TableHead>
                        <TableHead>持有人</TableHead>
                        <TableHead>診所</TableHead>
                        <TableHead>到期日</TableHead>
                        <TableHead>剩餘天數</TableHead>
                        <TableHead>狀態</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringVouchers.map((item: any) => {
                        const daysLeft = Math.ceil((new Date(item.voucher.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return (
                          <TableRow key={item.voucher.id}>
                            <TableCell className="font-medium">{item.template.name}</TableCell>
                            <TableCell>{item.customer.name}</TableCell>
                            <TableCell>{item.organization.name}</TableCell>
                            <TableCell>{new Date(item.voucher.validUntil).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={daysLeft <= 1 
                                ? "bg-red-500/10 text-red-500 border-red-500/30" 
                                : daysLeft <= 3 
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/30"}>
                                {daysLeft} 天
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                                待提醒
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    未來 {reminderDays} 天內沒有即將到期的票券
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>診所票券分布</CardTitle>
                <CardDescription>
                  各診所票券使用情況統計
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orgStatsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">載入中...</div>
                ) : orgStats && orgStats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>診所名稱</TableHead>
                        <TableHead>票券模板數</TableHead>
                        <TableHead>已發送</TableHead>
                        <TableHead>已核銷</TableHead>
                        <TableHead>核銷率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgStats.map((stat: any) => (
                        <TableRow key={stat.organizationId}>
                          <TableCell className="font-medium">{stat.organizationName}</TableCell>
                          <TableCell>{stat.templateCount}</TableCell>
                          <TableCell>{stat.issuedCount}</TableCell>
                          <TableCell>{stat.redeemedCount}</TableCell>
                          <TableCell>
                            <Badge className={stat.redemptionRate >= 70 
                              ? "bg-green-500/10 text-green-500 border-green-500/30" 
                              : stat.redemptionRate >= 50 
                              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                              : "bg-red-500/10 text-red-500 border-red-500/30"}>
                              {stat.redemptionRate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    尚無診所票券統計資料
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
