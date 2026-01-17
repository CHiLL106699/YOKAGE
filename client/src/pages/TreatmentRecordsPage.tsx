import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, FileText, Star, Calendar, User, Activity, ClipboardList, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// 使用優化後的通用元件
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput, useSearch } from "@/components/ui/search-input";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { EmptyState } from "@/components/ui/empty-state";
import { DataPagination, usePagination } from "@/components/ui/data-pagination";
import { ExportButton, downloadCSV } from "@/components/ui/export-button";
import { StatCard, StatGrid } from "@/components/ui/stat-card";

export default function TreatmentRecordsPage() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const { page, pageSize, setPage, setPageSize, offset, limit } = usePagination(20);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  
  // 假設 organizationId = 1，實際應從 context 取得
  const organizationId = 1;
  
  const { data: treatmentData, isLoading, refetch } = trpc.treatment.list.useQuery({
    organizationId,
    customerId: selectedCustomerId,
    limit: 100,
  });

  const { data: customers } = trpc.customer.list.useQuery({
    organizationId,
    limit: 100,
  });

  const { data: staffList } = trpc.staff.list.useQuery({ organizationId });
  const { data: products } = trpc.product.list.useQuery({ organizationId });

  const createMutation = trpc.treatment.create.useMutation({
    onSuccess: () => {
      toast.success("療程記錄已建立");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadPhotoMutation = trpc.treatment.uploadPhoto.useMutation({
    onSuccess: () => {
      toast.success("照片已上傳");
      setIsPhotoDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    customerId: 0,
    staffId: undefined as number | undefined,
    productId: undefined as number | undefined,
    treatmentDate: new Date().toISOString().split('T')[0],
    treatmentType: "",
    treatmentArea: "",
    dosage: "",
    notes: "",
    internalNotes: "",
    satisfactionScore: undefined as number | undefined,
  });

  const [photoData, setPhotoData] = useState({
    customerId: 0,
    treatmentRecordId: undefined as number | undefined,
    photoType: "before" as "before" | "after" | "during" | "other",
    photoUrl: "",
    photoDate: new Date().toISOString().split('T')[0],
    angle: "",
    notes: "",
  });

  const handleCreateSubmit = () => {
    if (!formData.customerId || !formData.treatmentDate) {
      toast.error("請填寫必要欄位");
      return;
    }
    createMutation.mutate({
      organizationId,
      ...formData,
      treatmentDate: new Date(formData.treatmentDate).toISOString(),
    });
  };

  const handlePhotoSubmit = () => {
    if (!photoData.customerId || !photoData.photoUrl) {
      toast.error("請填寫必要欄位");
      return;
    }
    uploadPhotoMutation.mutate({
      organizationId,
      ...photoData,
      photoDate: new Date(photoData.photoDate).toISOString(),
    });
  };

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    const records = filteredRecords || [];
    if (records.length === 0) {
      toast.error("沒有資料可匯出");
      return;
    }

    const exportData = records.map((r) => {
      const customer = customers?.data?.find(c => c.id === r.customerId);
      const staff = staffList?.data?.find((s: { id: number; name: string }) => s.id === r.staffId);
      return {
        日期: new Date(r.treatmentDate).toLocaleDateString('zh-TW'),
        客戶: customer?.name || "未知",
        療程類型: r.treatmentType || "",
        療程部位: r.treatmentArea || "",
        劑量: r.dosage || "",
        執行人員: staff?.name || "",
        滿意度: r.satisfactionScore || "",
        備註: r.notes || "",
      };
    });

    if (format === "csv") {
      downloadCSV(exportData, `療程記錄_${new Date().toISOString().split("T")[0]}`);
    }
  };

  const treatmentTypes = [
    "肉毒桿菌", "玻尿酸", "皮秒雷射", "音波拉提", "電波拉皮",
    "水光針", "埋線拉提", "脈衝光", "飛梭雷射", "淨膚雷射",
  ];

  const treatmentAreas = [
    "額頭", "眉間", "眼周", "鼻子", "蘋果肌", "法令紋",
    "嘴角", "下巴", "臉頰", "頸部", "全臉",
  ];

  const allRecords = treatmentData?.data || [];
  const filteredRecords = debouncedSearch
    ? allRecords.filter(record => {
        const customer = customers?.data?.find(c => c.id === record.customerId);
        return customer?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
               record.treatmentType?.toLowerCase().includes(debouncedSearch.toLowerCase());
      })
    : allRecords;

  // 計算統計數據
  const stats = {
    total: treatmentData?.total || 0,
    thisMonth: allRecords.filter(r => {
      const date = new Date(r.treatmentDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    avgSatisfaction: (() => {
      const scores = allRecords.filter(r => r.satisfactionScore).map(r => r.satisfactionScore!);
      return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "N/A";
    })(),
    pendingFollowUp: allRecords.filter(r => r.nextFollowUpDate && new Date(r.nextFollowUpDate) <= new Date()).length,
  };

  // 分頁處理
  const paginatedRecords = filteredRecords.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <PageHeader
          title="療程記錄管理"
          description="管理客戶療程記錄與前後對比照片"
          actions={
            <>
              <ExportButton onExport={handleExport} formats={["csv"]} />
              <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    上傳照片
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>上傳療程照片</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>客戶</Label>
                      <Select onValueChange={(v) => setPhotoData({ ...photoData, customerId: Number(v) })}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇客戶" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers?.data?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>照片類型</Label>
                      <Select 
                        value={photoData.photoType}
                        onValueChange={(v) => setPhotoData({ ...photoData, photoType: v as "before" | "after" | "during" | "other" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">術前照片</SelectItem>
                          <SelectItem value="after">術後照片</SelectItem>
                          <SelectItem value="during">療程中</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>照片網址</Label>
                      <Input
                        value={photoData.photoUrl}
                        onChange={(e) => setPhotoData({ ...photoData, photoUrl: e.target.value })}
                        placeholder="輸入照片網址或上傳後的 URL"
                      />
                    </div>
                    <div>
                      <Label>拍攝角度</Label>
                      <Select onValueChange={(v) => setPhotoData({ ...photoData, angle: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇角度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="front">正面</SelectItem>
                          <SelectItem value="left">左側</SelectItem>
                          <SelectItem value="right">右側</SelectItem>
                          <SelectItem value="45-left">左45度</SelectItem>
                          <SelectItem value="45-right">右45度</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>拍攝日期</Label>
                      <Input
                        type="date"
                        value={photoData.photoDate}
                        onChange={(e) => setPhotoData({ ...photoData, photoDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>備註</Label>
                      <Textarea
                        value={photoData.notes}
                        onChange={(e) => setPhotoData({ ...photoData, notes: e.target.value })}
                        placeholder="照片備註"
                      />
                    </div>
                    <Button onClick={handlePhotoSubmit} className="w-full" disabled={uploadPhotoMutation.isPending}>
                      {uploadPhotoMutation.isPending ? "上傳中..." : "上傳照片"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增療程記錄
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>新增療程記錄</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>客戶 *</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, customerId: Number(v) })}>
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
                    <div>
                      <Label>療程日期 *</Label>
                      <Input
                        type="date"
                        value={formData.treatmentDate}
                        onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>療程類型</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, treatmentType: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇療程類型" />
                        </SelectTrigger>
                        <SelectContent>
                          {treatmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>療程部位</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, treatmentArea: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇療程部位" />
                        </SelectTrigger>
                        <SelectContent>
                          {treatmentAreas.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>執行醫師/美容師</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, staffId: Number(v) })}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇執行人員" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffList?.data?.map((s: { id: number; name: string }) => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>療程項目</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, productId: Number(v) })}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇療程項目" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.data?.map((p: { id: number; name: string }) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>劑量/用量</Label>
                      <Input
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        placeholder="例如：100U、2cc"
                      />
                    </div>
                    <div>
                      <Label>滿意度評分</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, satisfactionScore: Number(v) })}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇評分" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((score) => (
                            <SelectItem key={score} value={score.toString()}>
                              {"⭐".repeat(score)} ({score}分)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>療程備註（可給客戶看）</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="術後注意事項、保養建議等"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>內部備註（僅內部可見）</Label>
                      <Textarea
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                        placeholder="內部記錄、特殊狀況等"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button onClick={handleCreateSubmit} className="w-full" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "建立中..." : "建立療程記錄"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          }
        />

        {/* Stats Cards */}
        <StatGrid columns={4}>
          <StatCard
            title="總療程數"
            value={stats.total}
            icon={ClipboardList}
            description="筆記錄"
          />
          <StatCard
            title="本月療程"
            value={stats.thisMonth}
            icon={Activity}
          />
          <StatCard
            title="平均滿意度"
            value={stats.avgSatisfaction}
            icon={Star}
            description={stats.avgSatisfaction !== "N/A" ? "/ 5 分" : ""}
          />
          <StatCard
            title="待追蹤"
            value={stats.pendingFollowUp}
            icon={AlertCircle}
            className={stats.pendingFollowUp > 0 ? "border-orange-200 bg-orange-50/50" : ""}
          />
        </StatGrid>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜尋客戶或療程類型..."
                className="max-w-sm"
              />
              <Select onValueChange={(v) => setSelectedCustomerId(v === "all" ? undefined : Number(v))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="篩選客戶" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部客戶</SelectItem>
                  {customers?.data?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                共 {filteredRecords.length} 筆記錄
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable
                columns={8}
                rows={5}
                headers={["日期", "客戶", "療程類型", "療程部位", "劑量", "執行人員", "滿意度", "操作"]}
              />
            ) : filteredRecords.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="尚無療程記錄"
                description="點擊「新增療程記錄」開始建立"
                action={{
                  label: "新增療程記錄",
                  onClick: () => setIsCreateDialogOpen(true),
                }}
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>客戶</TableHead>
                      <TableHead>療程類型</TableHead>
                      <TableHead>療程部位</TableHead>
                      <TableHead>劑量</TableHead>
                      <TableHead>執行人員</TableHead>
                      <TableHead>滿意度</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => {
                      const customer = customers?.data?.find(c => c.id === record.customerId);
                      const staff = staffList?.data?.find((s: { id: number; name: string }) => s.id === record.staffId);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(record.treatmentDate).toLocaleDateString('zh-TW')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {customer?.name || "未知"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.treatmentType || "未指定"}</Badge>
                          </TableCell>
                          <TableCell>{record.treatmentArea || "-"}</TableCell>
                          <TableCell>{record.dosage || "-"}</TableCell>
                          <TableCell>{staff?.name || "-"}</TableCell>
                          <TableCell>
                            {record.satisfactionScore ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                {record.satisfactionScore}
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toast.info("查看詳情功能開發中")}>
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => toast.info("查看照片功能開發中")}>
                                <Camera className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <DataPagination
                      currentPage={page}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={filteredRecords.length}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
