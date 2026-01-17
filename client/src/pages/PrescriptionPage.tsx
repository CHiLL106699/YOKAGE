import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Pill, Plus, AlertTriangle, FileText, User, History } from "lucide-react";

export default function PrescriptionPage() {
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [newPrescriptionOpen, setNewPrescriptionOpen] = useState(false);
  const [newMedicationOpen, setNewMedicationOpen] = useState(false);
  const [newAllergyOpen, setNewAllergyOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedMedicationId, setSelectedMedicationId] = useState<number | null>(null);

  // 處方表單狀態
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [quantity, setQuantity] = useState("");
  const [instructions, setInstructions] = useState("");

  // 藥品表單狀態
  const [medName, setMedName] = useState("");
  const [medGenericName, setMedGenericName] = useState("");
  const [medCategory, setMedCategory] = useState("oral");
  const [medDosageForm, setMedDosageForm] = useState("");
  const [medStrength, setMedStrength] = useState("");
  const [medContraindications, setMedContraindications] = useState("");

  // 過敏表單狀態
  const [allergen, setAllergen] = useState("");
  const [allergyType, setAllergyType] = useState("medication");
  const [severity, setSeverity] = useState("mild");
  const [reaction, setReaction] = useState("");

  // 模擬客戶資料
  const mockCustomers = [
    { id: 1, name: "王小明" },
    { id: 2, name: "李小華" },
    { id: 3, name: "張美玲" },
  ];

  const { data: medications, refetch: refetchMedications } = trpc.prescription.listMedications.useQuery({
    organizationId: 1,
  });

  const { data: prescriptions, refetch: refetchPrescriptions } = trpc.prescription.listPrescriptions.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const { data: allergies, refetch: refetchAllergies } = trpc.prescription.listAllergies.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const { data: conflictCheck } = trpc.prescription.checkConflict.useQuery(
    { customerId: selectedCustomerId || 0, medicationId: selectedMedicationId || 0 },
    { enabled: !!selectedCustomerId && !!selectedMedicationId }
  );

  const createMedicationMutation = trpc.prescription.createMedication.useMutation({
    onSuccess: () => {
      toast.success("藥品已新增");
      setNewMedicationOpen(false);
      resetMedicationForm();
      refetchMedications();
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const createPrescriptionMutation = trpc.prescription.create.useMutation({
    onSuccess: () => {
      toast.success("處方已開立");
      setNewPrescriptionOpen(false);
      resetPrescriptionForm();
      refetchPrescriptions();
    },
    onError: (error) => {
      toast.error(`開立失敗: ${error.message}`);
    },
  });

  const createAllergyMutation = trpc.prescription.addAllergy.useMutation({
    onSuccess: () => {
      toast.success("過敏記錄已新增");
      setNewAllergyOpen(false);
      resetAllergyForm();
      refetchAllergies();
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const resetMedicationForm = () => {
    setMedName("");
    setMedGenericName("");
    setMedCategory("oral");
    setMedDosageForm("");
    setMedStrength("");
    setMedContraindications("");
  };

  const resetPrescriptionForm = () => {
    setSelectedMedicationId(null);
    setDosage("");
    setFrequency("");
    setDuration("");
    setQuantity("");
    setInstructions("");
  };

  const resetAllergyForm = () => {
    setAllergen("");
    setAllergyType("medication");
    setSeverity("mild");
    setReaction("");
  };

  const handleCreateMedication = () => {
    if (!medName) {
      toast.error("請填寫藥品名稱");
      return;
    }
    createMedicationMutation.mutate({
      organizationId: 1,
      name: medName,
      genericName: medGenericName || undefined,
      category: medCategory as any,
      dosageForm: medDosageForm || undefined,
      strength: medStrength || undefined,
      contraindications: medContraindications || undefined,
    });
  };

  const handleCreatePrescription = () => {
    if (!selectedCustomerId || !selectedMedicationId || !dosage || !frequency || !quantity) {
      toast.error("請填寫必要欄位");
      return;
    }
    createPrescriptionMutation.mutate({
      organizationId: 1,
      customerId: selectedCustomerId,
      prescriberId: 1, // 假設當前登入的醫師 ID
      medicationId: selectedMedicationId,
      dosage,
      frequency,
      duration: duration || undefined,
      quantity: parseInt(quantity),
      instructions: instructions || undefined,
    });
  };

  const handleCreateAllergy = () => {
    if (!selectedCustomerId || !allergen) {
      toast.error("請選擇客戶並填寫過敏原");
      return;
    }
    createAllergyMutation.mutate({
      customerId: selectedCustomerId,
      allergyType: allergyType as any,
      allergen,
      severity: severity as any,
      reaction: reaction || undefined,
    });
  };

  const categoryLabels: Record<string, string> = {
    oral: "口服藥",
    topical: "外用藥",
    injection: "注射劑",
    supplement: "保健品",
    other: "其他",
  };

  const severityLabels: Record<string, { label: string; color: string }> = {
    mild: { label: "輕微", color: "bg-yellow-100 text-yellow-800" },
    moderate: { label: "中度", color: "bg-orange-100 text-orange-800" },
    severe: { label: "嚴重", color: "bg-red-100 text-red-800" },
    life_threatening: { label: "致命", color: "bg-red-200 text-red-900" },
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6 text-green-500" />
            處方管理系統
          </h1>
          <p className="text-muted-foreground">管理藥品、開立處方與追蹤過敏記錄</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newMedicationOpen} onOpenChange={setNewMedicationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                新增藥品
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增藥品</DialogTitle>
                <DialogDescription>新增藥品到藥品資料庫</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>藥品名稱 *</Label>
                    <Input 
                      placeholder="例如：Botox"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>學名</Label>
                    <Input 
                      placeholder="例如：Botulinum Toxin"
                      value={medGenericName}
                      onChange={(e) => setMedGenericName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>類別</Label>
                    <Select value={medCategory} onValueChange={setMedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oral">口服藥</SelectItem>
                        <SelectItem value="topical">外用藥</SelectItem>
                        <SelectItem value="injection">注射劑</SelectItem>
                        <SelectItem value="supplement">保健品</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>劑型</Label>
                    <Input 
                      placeholder="例如：凍乾粉"
                      value={medDosageForm}
                      onChange={(e) => setMedDosageForm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>劑量規格</Label>
                  <Input 
                    placeholder="例如：100U/瓶"
                    value={medStrength}
                    onChange={(e) => setMedStrength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>禁忌症</Label>
                  <Textarea 
                    placeholder="請輸入禁忌症說明..."
                    value={medContraindications}
                    onChange={(e) => setMedContraindications(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateMedication} disabled={createMedicationMutation.isPending}>
                  新增藥品
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={newPrescriptionOpen} onOpenChange={setNewPrescriptionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                開立處方
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>開立處方</DialogTitle>
                <DialogDescription>為客戶開立新處方</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {conflictCheck?.hasConflict && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>過敏警告</AlertTitle>
                    <AlertDescription>
                      此客戶對以下成分過敏：{conflictCheck.conflicts.map(c => c.allergen).join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>選擇客戶 *</Label>
                    <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇客戶" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>選擇藥品 *</Label>
                    <Select onValueChange={(v) => setSelectedMedicationId(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇藥品" />
                      </SelectTrigger>
                      <SelectContent>
                        {medications?.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.name} {m.strength && `(${m.strength})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>劑量 *</Label>
                    <Input 
                      placeholder="例如：10mg"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>頻率 *</Label>
                    <Input 
                      placeholder="例如：每日三次"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>療程</Label>
                    <Input 
                      placeholder="例如：7天"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>數量 *</Label>
                    <Input 
                      type="number"
                      placeholder="開立數量"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>用藥說明</Label>
                  <Textarea 
                    placeholder="請輸入用藥說明..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCreatePrescription} 
                  disabled={createPrescriptionMutation.isPending || conflictCheck?.hasConflict}
                >
                  開立處方
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">藥品總數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{medications?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月處方</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {prescriptions?.data?.filter(p => {
                const date = new Date(p.createdAt);
                return date.getMonth() === new Date().getMonth();
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">過敏記錄</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{allergies?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">待領取</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {prescriptions?.data?.filter(p => p.status === 'active').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="prescriptions">
            <FileText className="h-4 w-4 mr-2" />
            處方記錄
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="h-4 w-4 mr-2" />
            藥品管理
          </TabsTrigger>
          <TabsTrigger value="allergies">
            <AlertTriangle className="h-4 w-4 mr-2" />
            過敏記錄
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>處方記錄</CardTitle>
              <CardDescription>查看客戶的處方歷史</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-64">
                <Label>選擇客戶</Label>
                <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomerId && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>藥品</TableHead>
                      <TableHead>劑量</TableHead>
                      <TableHead>頻率</TableHead>
                      <TableHead>數量</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>開立日期</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions?.data?.map((rx) => (
                      <TableRow key={rx.id}>
                        <TableCell className="font-medium">
                          藥品 #{rx.medicationId}
                        </TableCell>
                        <TableCell>{rx.dosage}</TableCell>
                        <TableCell>{rx.frequency}</TableCell>
                        <TableCell>{rx.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={rx.status === 'active' ? "default" : "secondary"}>
                            {rx.status === 'active' ? "有效" : rx.status === 'completed' ? "已完成" : rx.status === 'cancelled' ? "已取消" : rx.status === 'expired' ? "已過期" : rx.status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(rx.createdAt).toLocaleDateString("zh-TW")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!prescriptions?.data?.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          尚無處方記錄
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>藥品管理</CardTitle>
              <CardDescription>管理診所的藥品資料庫</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>藥品名稱</TableHead>
                    <TableHead>學名</TableHead>
                    <TableHead>類別</TableHead>
                    <TableHead>劑型</TableHead>
                    <TableHead>規格</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications?.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.genericName || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[med.category || "other"]}
                        </Badge>
                      </TableCell>
                      <TableCell>{med.dosageForm || "-"}</TableCell>
                      <TableCell>{med.strength || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={med.isActive ? "default" : "secondary"}>
                          {med.isActive ? "啟用" : "停用"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!medications?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        尚無藥品資料
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>過敏記錄</CardTitle>
                <CardDescription>管理客戶的過敏資訊</CardDescription>
              </div>
              <Dialog open={newAllergyOpen} onOpenChange={setNewAllergyOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    新增過敏
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增過敏記錄</DialogTitle>
                    <DialogDescription>記錄客戶的過敏資訊</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>選擇客戶 *</Label>
                      <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇客戶" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCustomers.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>過敏類型</Label>
                        <Select value={allergyType} onValueChange={setAllergyType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medication">藥物過敏</SelectItem>
                            <SelectItem value="food">食物過敏</SelectItem>
                            <SelectItem value="environmental">環境過敏</SelectItem>
                            <SelectItem value="other">其他</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>嚴重程度</Label>
                        <Select value={severity} onValueChange={setSeverity}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">輕微</SelectItem>
                            <SelectItem value="moderate">中度</SelectItem>
                            <SelectItem value="severe">嚴重</SelectItem>
                            <SelectItem value="life_threatening">致命</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>過敏原 *</Label>
                      <Input 
                        placeholder="例如：盤尼西林"
                        value={allergen}
                        onChange={(e) => setAllergen(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>過敏反應</Label>
                      <Textarea 
                        placeholder="描述過敏反應症狀..."
                        value={reaction}
                        onChange={(e) => setReaction(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateAllergy} disabled={createAllergyMutation.isPending}>
                      新增過敏記錄
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-64">
                <Label>選擇客戶</Label>
                <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomerId && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>過敏原</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead>嚴重程度</TableHead>
                      <TableHead>反應</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allergies?.map((allergy) => (
                      <TableRow key={allergy.id}>
                        <TableCell className="font-medium">{allergy.allergen}</TableCell>
                        <TableCell>
                          {allergy.allergyType === 'medication' ? '藥物' : 
                           allergy.allergyType === 'food' ? '食物' :
                           allergy.allergyType === 'environmental' ? '環境' : '其他'}
                        </TableCell>
                        <TableCell>
                          <Badge className={severityLabels[allergy.severity || 'mild'].color}>
                            {severityLabels[allergy.severity || 'mild'].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{allergy.reaction || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={allergy.isActive ? "default" : "secondary"}>
                            {allergy.isActive ? "有效" : "已解除"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!allergies?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          尚無過敏記錄
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
