import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { EmptyState } from "@/components/ui/empty-state";
import { DataPagination } from "@/components/ui/data-pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Ticket, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Send, 
  Eye,
  Gift,
  Percent,
  CreditCard,
  Wallet,
  Package,
  QrCode,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function VouchersPage() {
  const [organizationId] = useState(1);
  const [activeTab, setActiveTab] = useState("templates");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "discount" as "treatment" | "discount" | "gift_card" | "stored_value" | "free_item",
    value: "",
    valueType: "fixed_amount" as "fixed_amount" | "percentage" | "treatment_count",
    usageLimit: 1,
    validityType: "days_from_issue" as "fixed_date" | "days_from_issue" | "no_expiry",
    validDays: 30,
    backgroundColor: "#D4AF37",
    textColor: "#0A1628",
    isTransferable: false,
  });
  
  const [issueData, setIssueData] = useState({
    customerIds: [] as number[],
    issueReason: "",
    issueChannel: "manual" as const,
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = trpc.voucher.getStats.useQuery({ organizationId });
  const { data: templates, isLoading: templatesLoading, refetch: refetchTemplates } = trpc.voucher.listTemplates.useQuery({
    organizationId,
    type: selectedType === "all" ? undefined : selectedType,
    page,
    limit: 10,
  });
  const { data: instances, isLoading: instancesLoading, refetch: refetchInstances } = trpc.voucher.listInstances.useQuery({
    organizationId,
    page,
    limit: 10,
  });
  const { data: batches, isLoading: batchesLoading } = trpc.voucher.listBatches.useQuery({
    organizationId,
    page,
    limit: 10,
  });
  const { data: customers } = trpc.customer.list.useQuery({
    organizationId,
    limit: 100,
  });

  // Mutations
  const createTemplate = trpc.voucher.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("票券模板建立成功");
      setIsCreateOpen(false);
      refetchTemplates();
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateTemplate = trpc.voucher.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("票券模板更新成功");
      setIsEditOpen(false);
      refetchTemplates();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteTemplate = trpc.voucher.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("票券模板已刪除");
      setIsDeleteOpen(false);
      refetchTemplates();
    },
    onError: (error) => toast.error(error.message),
  });

  const issueVoucher = trpc.voucher.issueVoucher.useMutation({
    onSuccess: () => {
      toast.success("票券發送成功");
      setIsIssueOpen(false);
      refetchInstances();
    },
    onError: (error) => toast.error(error.message),
  });

  const batchIssue = trpc.voucher.batchIssue.useMutation({
    onSuccess: (data) => {
      toast.success(`成功發送 ${data.issued} 張票券`);
      setIsIssueOpen(false);
      refetchInstances();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "discount",
      value: "",
      valueType: "fixed_amount",
      usageLimit: 1,
      validityType: "days_from_issue",
      validDays: 30,
      backgroundColor: "#D4AF37",
      textColor: "#0A1628",
      isTransferable: false,
    });
  };

  const handleCreate = () => {
    createTemplate.mutate({
      organizationId,
      ...formData,
    });
  };

  const handleEdit = () => {
    if (!selectedTemplate) return;
    updateTemplate.mutate({
      id: selectedTemplate.id,
      name: formData.name,
      description: formData.description,
      value: formData.value,
      usageLimit: formData.usageLimit,
      validDays: formData.validDays,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
      isTransferable: formData.isTransferable,
    });
  };

  const handleDelete = () => {
    if (!selectedTemplate) return;
    deleteTemplate.mutate({ id: selectedTemplate.id });
  };

  const handleIssue = () => {
    if (!selectedTemplate || issueData.customerIds.length === 0) return;
    
    if (issueData.customerIds.length === 1) {
      issueVoucher.mutate({
        organizationId,
        templateId: selectedTemplate.id,
        customerId: issueData.customerIds[0],
        issueReason: issueData.issueReason,
        issueChannel: issueData.issueChannel,
      });
    } else {
      batchIssue.mutate({
        organizationId,
        templateId: selectedTemplate.id,
        customerIds: issueData.customerIds,
        batchName: `批量發送 - ${selectedTemplate.name}`,
        issueReason: issueData.issueReason,
        issueChannel: issueData.issueChannel,
      });
    }
  };

  const openEditDialog = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      type: template.type,
      value: template.value || "",
      valueType: template.valueType,
      usageLimit: template.usageLimit || 1,
      validityType: template.validityType,
      validDays: template.validDays || 30,
      backgroundColor: template.backgroundColor || "#D4AF37",
      textColor: template.textColor || "#0A1628",
      isTransferable: template.isTransferable || false,
    });
    setIsEditOpen(true);
  };

  const openIssueDialog = (template: any) => {
    setSelectedTemplate(template);
    setIssueData({
      customerIds: [],
      issueReason: "",
      issueChannel: "manual",
    });
    setIsIssueOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "treatment": return <Package className="h-4 w-4" />;
      case "discount": return <Percent className="h-4 w-4" />;
      case "gift_card": return <Gift className="h-4 w-4" />;
      case "stored_value": return <Wallet className="h-4 w-4" />;
      case "free_item": return <CreditCard className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      treatment: "療程券",
      discount: "折扣券",
      gift_card: "禮品卡",
      stored_value: "儲值卡",
      free_item: "贈品券",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      used: "secondary",
      expired: "destructive",
      cancelled: "outline",
      transferred: "secondary",
    };
    const labels: Record<string, string> = {
      active: "可使用",
      used: "已使用",
      expired: "已過期",
      cancelled: "已取消",
      transferred: "已轉贈",
    };
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="電子票券管理"
          description="管理療程券、折扣券、禮品卡等電子票券，支援 LINE 推送與 QR Code 核銷"
          actions={
            <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-to-r from-amber-500 to-amber-600">
              <Plus className="mr-2 h-4 w-4" />
              建立票券模板
            </Button>
          }
        />

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="票券模板"
            value={stats?.totalTemplates || 0}
            icon={Ticket}
            description={`${stats?.activeTemplates || 0} 個啟用中`}
          />
          <StatCard
            title="已發送票券"
            value={stats?.totalIssued || 0}
            icon={Send}
            description="累計發送數量"
          />
          <StatCard
            title="已核銷票券"
            value={stats?.totalRedeemed || 0}
            icon={QrCode}
            description={`核銷率 ${stats?.redemptionRate || 0}%`}
          />
          <StatCard
            title="待推送"
            value={stats?.pendingPush || 0}
            icon={Clock}
            description="等待 LINE 推送"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-amber-500/20">
            <TabsTrigger value="templates" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              票券模板
            </TabsTrigger>
            <TabsTrigger value="instances" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              已發送票券
            </TabsTrigger>
            <TabsTrigger value="batches" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              批次發送記錄
            </TabsTrigger>
          </TabsList>

          {/* 票券模板 Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜尋票券模板..."
                className="max-w-sm"
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-amber-500/20">
                  <SelectValue placeholder="票券類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類型</SelectItem>
                  <SelectItem value="treatment">療程券</SelectItem>
                  <SelectItem value="discount">折扣券</SelectItem>
                  <SelectItem value="gift_card">禮品卡</SelectItem>
                  <SelectItem value="stored_value">儲值卡</SelectItem>
                  <SelectItem value="free_item">贈品券</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-slate-900/50 border-amber-500/20">
              <CardContent className="p-0">
                {templatesLoading ? (
                  <SkeletonTable rows={5} columns={6} />
                ) : !templates?.data?.length ? (
                  <EmptyState
                    icon={Ticket}
                    title="尚無票券模板"
                    description="建立您的第一個票券模板，開始發送電子票券"
                    action={{
                      label: "建立票券模板",
                      onClick: () => setIsCreateOpen(true)
                    }}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-amber-500/20 hover:bg-transparent">
                        <TableHead>票券名稱</TableHead>
                        <TableHead>類型</TableHead>
                        <TableHead>價值</TableHead>
                        <TableHead>有效期</TableHead>
                        <TableHead>發送/核銷</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.data.map((template) => (
                        <TableRow key={template.id} className="border-amber-500/10 hover:bg-amber-500/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ 
                                  backgroundColor: template.backgroundColor || "#D4AF37",
                                  color: template.textColor || "#0A1628",
                                }}
                              >
                                {getTypeIcon(template.type || 'discount')}
                              </div>
                              <div>
                                <div className="font-medium text-amber-100">{template.name}</div>
                                <div className="text-sm text-slate-400">{template.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-amber-500/30">
                              {getTypeLabel(template.type || 'discount')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {template.valueType === "percentage" 
                              ? `${template.value}% 折扣`
                              : template.valueType === "treatment_count"
                              ? `${template.value} 次療程`
                              : `NT$ ${Number(template.value || 0).toLocaleString()}`
                            }
                          </TableCell>
                          <TableCell>
                            {template.validityType === "no_expiry" 
                              ? "永久有效"
                              : template.validityType === "days_from_issue"
                              ? `發送後 ${template.validDays} 天`
                              : "固定日期"
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400">{template.totalIssued || 0}</span>
                              <span className="text-slate-500">/</span>
                              <span className="text-emerald-400">{template.totalRedeemed || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "啟用" : "停用"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openIssueDialog(template)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  發送票券
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(template)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  編輯
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setIsDeleteOpen(true);
                                  }}
                                  className="text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  刪除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {templates && templates.total > 10 && (
              <DataPagination
                currentPage={page}
                totalPages={Math.ceil(templates.total / 10)}
                totalItems={templates.total}
                pageSize={10}
                onPageChange={setPage}
              />
            )}
          </TabsContent>

          {/* 已發送票券 Tab */}
          <TabsContent value="instances" className="space-y-4">
            <Card className="bg-slate-900/50 border-amber-500/20">
              <CardContent className="p-0">
                {instancesLoading ? (
                  <SkeletonTable rows={5} columns={6} />
                ) : !instances?.data?.length ? (
                  <EmptyState
                    icon={Send}
                    title="尚無已發送票券"
                    description="選擇票券模板並發送給客戶"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-amber-500/20 hover:bg-transparent">
                        <TableHead>票券代碼</TableHead>
                        <TableHead>客戶</TableHead>
                        <TableHead>發送管道</TableHead>
                        <TableHead>有效期限</TableHead>
                        <TableHead>使用狀態</TableHead>
                        <TableHead>LINE 推送</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {instances.data.map((instance) => (
                        <TableRow key={instance.id} className="border-amber-500/10 hover:bg-amber-500/5">
                          <TableCell>
                            <code className="px-2 py-1 bg-slate-800 rounded text-amber-400 text-sm">
                              {instance.voucherCode}
                            </code>
                          </TableCell>
                          <TableCell>客戶 #{instance.customerId}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-amber-500/30">
                              {instance.issueChannel === "manual" ? "手動發送" :
                               instance.issueChannel === "campaign" ? "行銷活動" :
                               instance.issueChannel === "birthday" ? "生日禮" :
                               instance.issueChannel === "line" ? "LINE" : instance.issueChannel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {instance.validUntil 
                              ? new Date(instance.validUntil).toLocaleDateString("zh-TW")
                              : "永久有效"
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(instance.status || 'active')}
                              <span className="text-sm text-slate-400">
                                ({instance.usedCount ?? 0}/{(instance.remainingUses ?? 0) + (instance.usedCount ?? 0)})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                instance.linePushStatus === "sent" ? "default" :
                                instance.linePushStatus === "failed" ? "destructive" :
                                "secondary"
                              }
                            >
                              {instance.linePushStatus === "sent" ? "已推送" :
                               instance.linePushStatus === "failed" ? "推送失敗" :
                               instance.linePushStatus === "pending" ? "待推送" : "不適用"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 批次發送記錄 Tab */}
          <TabsContent value="batches" className="space-y-4">
            <Card className="bg-slate-900/50 border-amber-500/20">
              <CardContent className="p-0">
                {batchesLoading ? (
                  <SkeletonTable rows={5} columns={5} />
                ) : !batches?.data?.length ? (
                  <EmptyState
                    icon={Users}
                    title="尚無批次發送記錄"
                    description="批量發送票券時會自動建立記錄"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-amber-500/20 hover:bg-transparent">
                        <TableHead>批次名稱</TableHead>
                        <TableHead>發送類型</TableHead>
                        <TableHead>發送數量</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>建立時間</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.data.map((batch) => (
                        <TableRow key={batch.id} className="border-amber-500/10 hover:bg-amber-500/5">
                          <TableCell className="font-medium text-amber-100">{batch.batchName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-amber-500/30">
                              {batch.batchType === "manual" ? "手動發送" :
                               batch.batchType === "campaign" ? "行銷活動" :
                               batch.batchType === "birthday" ? "生日禮" :
                               batch.batchType === "rfm_segment" ? "RFM 分群" : batch.batchType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-emerald-400">{batch.successCount}</span>
                            <span className="text-slate-500"> / </span>
                            <span>{batch.totalRecipients}</span>
                            {(batch.failedCount ?? 0) > 0 && (
                              <span className="text-red-400 ml-2">({batch.failedCount} 失敗)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                batch.status === "completed" ? "default" :
                                batch.status === "failed" ? "destructive" :
                                batch.status === "processing" ? "secondary" : "outline"
                              }
                            >
                              {batch.status === "completed" ? "已完成" :
                               batch.status === "failed" ? "失敗" :
                               batch.status === "processing" ? "處理中" :
                               batch.status === "pending" ? "待處理" : batch.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {new Date(batch.createdAt).toLocaleString("zh-TW")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 建立票券模板 Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl bg-slate-900 border-amber-500/20">
            <DialogHeader>
              <DialogTitle className="text-amber-100">建立票券模板</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>票券名稱</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例：新客首購優惠券"
                  />
                </div>
                <div className="space-y-2">
                  <Label>票券類型</Label>
                  <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treatment">療程券</SelectItem>
                      <SelectItem value="discount">折扣券</SelectItem>
                      <SelectItem value="gift_card">禮品卡</SelectItem>
                      <SelectItem value="stored_value">儲值卡</SelectItem>
                      <SelectItem value="free_item">贈品券</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="票券說明..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>價值類型</Label>
                  <Select value={formData.valueType} onValueChange={(v: any) => setFormData({ ...formData, valueType: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed_amount">固定金額</SelectItem>
                      <SelectItem value="percentage">百分比折扣</SelectItem>
                      <SelectItem value="treatment_count">療程次數</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {formData.valueType === "percentage" ? "折扣百分比" :
                     formData.valueType === "treatment_count" ? "療程次數" : "金額"}
                  </Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.valueType === "percentage" ? "10" : "1000"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>有效期類型</Label>
                  <Select value={formData.validityType} onValueChange={(v: any) => setFormData({ ...formData, validityType: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days_from_issue">發送後天數</SelectItem>
                      <SelectItem value="fixed_date">固定日期</SelectItem>
                      <SelectItem value="no_expiry">永久有效</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.validityType === "days_from_issue" && (
                  <div className="space-y-2">
                    <Label>有效天數</Label>
                    <Input
                      type="number"
                      value={formData.validDays}
                      onChange={(e) => setFormData({ ...formData, validDays: parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>使用次數</Label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>背景色</Label>
                  <Input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>文字色</Label>
                  <Input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  />
                </div>
              </div>

              {/* 票券預覽 */}
              <div className="space-y-2">
                <Label>票券預覽</Label>
                <div 
                  className="p-4 rounded-lg flex items-center gap-4"
                  style={{ 
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                  }}
                >
                  {getTypeIcon(formData.type)}
                  <div>
                    <div className="font-bold">{formData.name || "票券名稱"}</div>
                    <div className="text-sm opacity-80">
                      {formData.valueType === "percentage" 
                        ? `${formData.value || 0}% 折扣`
                        : formData.valueType === "treatment_count"
                        ? `${formData.value || 0} 次療程`
                        : `NT$ ${Number(formData.value || 0).toLocaleString()}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreate} disabled={createTemplate.isPending}>
                {createTemplate.isPending ? "建立中..." : "建立"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 編輯票券模板 Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl bg-slate-900 border-amber-500/20">
            <DialogHeader>
              <DialogTitle className="text-amber-100">編輯票券模板</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>票券名稱</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>價值</Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>使用次數</Label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
              <Button onClick={handleEdit} disabled={updateTemplate.isPending}>
                {updateTemplate.isPending ? "更新中..." : "更新"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 發送票券 Dialog */}
        <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
          <DialogContent className="max-w-lg bg-slate-900 border-amber-500/20">
            <DialogHeader>
              <DialogTitle className="text-amber-100">發送票券</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="font-medium text-amber-100">{selectedTemplate?.name}</div>
                <div className="text-sm text-slate-400">{selectedTemplate?.description}</div>
              </div>
              
              <div className="space-y-2">
                <Label>選擇客戶（可多選）</Label>
                <Select 
                  value={issueData.customerIds[0]?.toString() || ""}
                  onValueChange={(v) => setIssueData({ ...issueData, customerIds: [parseInt(v)] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.data?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>發送管道</Label>
                <Select 
                  value={issueData.issueChannel}
                  onValueChange={(v: any) => setIssueData({ ...issueData, issueChannel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">手動發送</SelectItem>
                    <SelectItem value="campaign">行銷活動</SelectItem>
                    <SelectItem value="birthday">生日禮</SelectItem>
                    <SelectItem value="referral">推薦獎勵</SelectItem>
                    <SelectItem value="purchase">消費贈送</SelectItem>
                    <SelectItem value="line">LINE 推送</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>發送原因（選填）</Label>
                <Input
                  value={issueData.issueReason}
                  onChange={(e) => setIssueData({ ...issueData, issueReason: e.target.value })}
                  placeholder="例：新客首購優惠"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIssueOpen(false)}>取消</Button>
              <Button 
                onClick={handleIssue} 
                disabled={issueVoucher.isPending || batchIssue.isPending || issueData.customerIds.length === 0}
              >
                {issueVoucher.isPending || batchIssue.isPending ? "發送中..." : "發送票券"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 刪除確認 Dialog */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="刪除票券模板"
          description={`確定要刪除「${selectedTemplate?.name}」嗎？此操作無法復原。`}
          onConfirm={handleDelete}
          confirmText="刪除"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
