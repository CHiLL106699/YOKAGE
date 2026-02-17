import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Phone, MessageSquare, Calendar, User, TrendingUp, Clock, CheckCircle, XCircle, Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ConsultationManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  
  const organizationId = 1;
  
  const { data: consultationsData, isLoading, refetch } = trpc.consultation.list.useQuery({
    organizationId,
    status: statusFilter,
    limit: 50,
  });

  const { data: customers } = trpc.customer.list.useQuery({
    organizationId,
    limit: 100,
  });

  const { data: staffList } = trpc.staff.list.useQuery({ organizationId });
  const { data: products } = trpc.product.list.useQuery({ organizationId });
  const { data: conversionStats } = trpc.consultation.getConversionStats.useQuery({ organizationId });

  const { data: pendingFollowUps } = trpc.followUp.getPending.useQuery({ organizationId });

  const createMutation = trpc.consultation.create.useMutation({
    onSuccess: () => {
      toast.success("諮詢記錄已建立");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.consultation.update.useMutation({
    onSuccess: () => {
      toast.success("狀態已更新");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createFollowUpMutation = trpc.followUp.create.useMutation({
    onSuccess: () => {
      toast.success("跟進任務已建立");
      setIsFollowUpDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    customerId: undefined as number | undefined,
    prospectName: "",
    prospectPhone: "",
    prospectEmail: "",
    consultationDate: new Date().toISOString().split('T')[0],
    consultationType: "walk_in" as "walk_in" | "phone" | "online" | "referral",
    staffId: undefined as number | undefined,
    concerns: "",
    recommendations: "",
    source: "",
    notes: "",
  });

  const [followUpData, setFollowUpData] = useState({
    followUpDate: new Date().toISOString().split('T')[0],
    followUpType: "call" as "call" | "sms" | "line" | "email" | "visit",
    staffId: undefined as number | undefined,
    notes: "",
  });

  const handleCreateSubmit = () => {
    if (!formData.prospectName && !formData.customerId) {
      toast.error("請填寫客戶姓名或選擇現有客戶");
      return;
    }
    createMutation.mutate({
      organizationId,
      ...formData,
      consultationDate: new Date(formData.consultationDate).toISOString(),
    });
  };

  const handleFollowUpSubmit = () => {
    if (!selectedConsultationId) return;
    createFollowUpMutation.mutate({
      organizationId,
      consultationId: selectedConsultationId,
      ...followUpData,
      followUpDate: new Date(followUpData.followUpDate).toISOString(),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      new: { label: "新諮詢", variant: "default" },
      contacted: { label: "已聯繫", variant: "outline" },
      scheduled: { label: "已排程", variant: "secondary" },
      converted: { label: "已成交", variant: "default" },
      lost: { label: "流失", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "phone": return <Phone className="w-4 h-4" />;
      case "online": return <MessageSquare className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const consultationsList = consultationsData?.data || [];
  const filteredConsultations = consultationsList.filter((c: Record<string, any>) => {
    if (!searchTerm) return true;
    return c.prospectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.prospectPhone?.includes(searchTerm);
  });

  // 計算統計數據
  const stats = {
    total: consultationsList.length,
    new: consultationsList.filter((c: Record<string, any>) => c.status === "new").length,
    converted: consultationsList.filter((c: Record<string, any>) => c.status === "converted").length,
    conversionRate: conversionStats?.conversionRate || 0,
    pendingFollowUps: pendingFollowUps?.length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">諮詢管理</h1>
          <p className="text-muted-foreground">管理潛在客戶諮詢與跟進任務</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增諮詢
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增諮詢記錄</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>現有客戶（選填）</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, customerId: v ? Number(v) : undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇現有客戶或填寫新客戶資料" />
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
              <div>
                <Label>姓名 *</Label>
                <Input
                  value={formData.prospectName}
                  onChange={(e) => setFormData({ ...formData, prospectName: e.target.value })}
                  placeholder="客戶姓名"
                />
              </div>
              <div>
                <Label>電話</Label>
                <Input
                  value={formData.prospectPhone}
                  onChange={(e) => setFormData({ ...formData, prospectPhone: e.target.value })}
                  placeholder="聯絡電話"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.prospectEmail}
                  onChange={(e) => setFormData({ ...formData, prospectEmail: e.target.value })}
                  placeholder="電子郵件"
                />
              </div>
              <div>
                <Label>諮詢日期</Label>
                <Input
                  type="date"
                  value={formData.consultationDate}
                  onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
                />
              </div>
              <div>
                <Label>諮詢類型</Label>
                <Select 
                  value={formData.consultationType}
                  onValueChange={(v) => setFormData({ ...formData, consultationType: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk_in">現場諮詢</SelectItem>
                    <SelectItem value="phone">電話諮詢</SelectItem>
                    <SelectItem value="online">線上諮詢</SelectItem>
                    <SelectItem value="referral">轉介紹</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>諮詢人員</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, staffId: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇諮詢人員" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList?.data?.map((s: Record<string, any>) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>來源管道</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, source: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇來源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook 廣告</SelectItem>
                    <SelectItem value="google">Google 廣告</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="line">LINE 官方帳號</SelectItem>
                    <SelectItem value="referral">朋友介紹</SelectItem>
                    <SelectItem value="walk_in">路過</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>諮詢內容/需求</Label>
                <Textarea
                  value={formData.concerns}
                  onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                  placeholder="客戶的需求、問題或關注點"
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label>建議療程</Label>
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="諮詢師的建議療程方案"
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label>備註</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="其他備註"
                />
              </div>
              <div className="col-span-2">
                <Button onClick={handleCreateSubmit} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "建立中..." : "建立諮詢記錄"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總諮詢數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              待處理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              已成交
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              轉換率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              待跟進
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingFollowUps}</div>
          </CardContent>
        </Card>
      </div>

      {/* 篩選與搜尋 */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜尋客戶姓名或電話..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="狀態篩選" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="new">新諮詢</SelectItem>
            <SelectItem value="contacted">已聯繫</SelectItem>
            <SelectItem value="scheduled">已排程</SelectItem>
            <SelectItem value="converted">已成交</SelectItem>
            <SelectItem value="lost">流失</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 諮詢列表 */}
      <Card>
        <CardHeader>
          <CardTitle>諮詢列表</CardTitle>
          <CardDescription>共 {filteredConsultations.length} 筆記錄</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">載入中...</div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">尚無諮詢記錄</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead>聯絡方式</TableHead>
                  <TableHead>來源</TableHead>
                  <TableHead>諮詢人員</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultations.map((consultation: Record<string, any>) => {
                  const staff = staffList?.data?.find((s: Record<string, any>) => s.id === consultation.staffId);
                  return (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        {new Date(consultation.consultationDate).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(consultation.consultationType)}
                          <span className="text-sm">
                            {consultation.consultationType === "walk_in" ? "現場" :
                             consultation.consultationType === "phone" ? "電話" :
                             consultation.consultationType === "online" ? "線上" : "轉介"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{consultation.prospectName || "未知"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {consultation.prospectPhone && <div>{consultation.prospectPhone}</div>}
                          {consultation.prospectEmail && <div className="text-muted-foreground">{consultation.prospectEmail}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{consultation.source || "-"}</TableCell>
                      <TableCell>{staff?.name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={consultation.status}
                            onValueChange={(v) => updateMutation.mutate({ id: consultation.id, status: v as any })}
                          >
                            <SelectTrigger className="w-[100px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">新諮詢</SelectItem>
                              <SelectItem value="contacted">已聯繫</SelectItem>
                              <SelectItem value="scheduled">已排程</SelectItem>
                              <SelectItem value="converted">已成交</SelectItem>
                              <SelectItem value="lost">流失</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedConsultationId(consultation.id);
                              setIsFollowUpDialogOpen(true);
                            }}
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新增跟進對話框 */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增跟進任務</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>跟進日期</Label>
              <Input
                type="date"
                value={followUpData.followUpDate}
                onChange={(e) => setFollowUpData({ ...followUpData, followUpDate: e.target.value })}
              />
            </div>
            <div>
              <Label>跟進方式</Label>
              <Select 
                value={followUpData.followUpType}
                onValueChange={(v) => setFollowUpData({ ...followUpData, followUpType: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">電話</SelectItem>
                  <SelectItem value="sms">簡訊</SelectItem>
                  <SelectItem value="line">LINE</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="visit">到店</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>負責人員</Label>
              <Select onValueChange={(v) => setFollowUpData({ ...followUpData, staffId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇負責人員" />
                </SelectTrigger>
                <SelectContent>
                  {staffList?.data?.map((s: Record<string, any>) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>備註</Label>
              <Textarea
                value={followUpData.notes}
                onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                placeholder="跟進內容備註"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFollowUpDialogOpen(false)}>取消</Button>
            <Button onClick={handleFollowUpSubmit} disabled={createFollowUpMutation.isPending}>
              {createFollowUpMutation.isPending ? "建立中..." : "建立跟進"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
