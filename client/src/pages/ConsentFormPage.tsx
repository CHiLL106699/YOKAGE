import { useState } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
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
import { toast } from "sonner";
import { FileSignature, Plus, FileText, CheckCircle, Clock, Eye, Pencil } from "lucide-react";

// 簽名畫布元件
const SignatureCanvas = ({ onSave }: { onSave: (dataUrl: string) => void }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useState<HTMLCanvasElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    const canvas = e.currentTarget;
    onSave(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className="space-y-2">
      <canvas
        id="signature-canvas"
        width={400}
        height={150}
        className="border rounded-lg bg-white cursor-crosshair w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
      />
      <Button variant="outline" size="sm" onClick={clearCanvas}>
        清除簽名
      </Button>
    </div>
  );
};

export default function ConsentFormPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [signFormOpen, setSignFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [signatureData, setSignatureData] = useState("");

  // 表單狀態
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState<string>("treatment");
  const [templateContent, setTemplateContent] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // 模擬客戶資料
  const mockCustomers = [
    { id: 1, name: "王小明" },
    { id: 2, name: "李小華" },
    { id: 3, name: "張美玲" },
  ];

  const { data: templates, refetch: refetchTemplates } = trpc.consent.listTemplates.useQuery({
    organizationId: 1,
  });

  const { data: signatures } = trpc.consent.listSignatures.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const createTemplateMutation = trpc.consent.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("同意書模板已建立");
      setNewTemplateOpen(false);
      setTemplateName("");
      setTemplateContent("");
      refetchTemplates();
    },
    onError: (error) => {
      toast.error(`建立失敗: ${error.message}`);
    },
  });

  const signMutation = trpc.consent.sign.useMutation({
    onSuccess: () => {
      toast.success("同意書已簽署");
      setSignFormOpen(false);
      setSignatureData("");
    },
    onError: (error) => {
      toast.error(`簽署失敗: ${error.message}`);
    },
  });

  const handleCreateTemplate = () => {
    if (!templateName || !templateContent) {
      toast.error("請填寫模板名稱和內容");
      return;
    }
    createTemplateMutation.mutate({
      organizationId: 1,
      name: templateName,
      category: templateCategory as any,
      content: templateContent,
      version: "1.0",
    });
  };

  const handleSign = () => {
    if (!selectedCustomerId || !selectedTemplate || !signatureData) {
      toast.error("請選擇客戶並完成簽名");
      return;
    }
    signMutation.mutate({
      organizationId: 1,
      customerId: selectedCustomerId,
      templateId: selectedTemplate.id,
      signatureImageUrl: signatureData,
      signedContent: selectedTemplate.content,
    });
  };

  const categoryLabels: Record<string, string> = {
    treatment: "療程同意書",
    surgery: "手術同意書",
    anesthesia: "麻醉同意書",
    photography: "攝影同意書",
    general: "一般同意書",
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-blue-500" />
            電子同意書管理
          </h1>
          <p className="text-muted-foreground">管理同意書模板與客戶簽署記錄</p>
        </div>
        <Dialog open={newTemplateOpen} onOpenChange={setNewTemplateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增模板
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新增同意書模板</DialogTitle>
              <DialogDescription>建立新的同意書模板供客戶簽署</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>模板名稱</Label>
                  <Input 
                    placeholder="例如：玻尿酸注射同意書"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>類別</Label>
                  <Select value={templateCategory} onValueChange={setTemplateCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treatment">療程同意書</SelectItem>
                      <SelectItem value="surgery">手術同意書</SelectItem>
                      <SelectItem value="anesthesia">麻醉同意書</SelectItem>
                      <SelectItem value="photography">攝影同意書</SelectItem>
                      <SelectItem value="general">一般同意書</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>同意書內容</Label>
                <Textarea 
                  placeholder="請輸入同意書內容..."
                  className="min-h-[200px]"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                建立模板
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總模板數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{templates?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">已簽署</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {signatures?.data?.filter(s => s.status === 'signed').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">待簽署</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">
              {signatures?.data?.filter(s => s.status === 'pending').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月簽署</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {signatures?.data?.filter(s => {
                const signedAt = s.signedAt ? new Date(s.signedAt) : null;
                return signedAt && signedAt.getMonth() === new Date().getMonth();
              }).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            模板管理
          </TabsTrigger>
          <TabsTrigger value="signatures">
            <CheckCircle className="h-4 w-4 mr-2" />
            簽署記錄
          </TabsTrigger>
          <TabsTrigger value="sign">
            <Pencil className="h-4 w-4 mr-2" />
            立即簽署
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>同意書模板</CardTitle>
              <CardDescription>管理診所的同意書模板</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模板名稱</TableHead>
                    <TableHead>類別</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>建立時間</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[template.category || "general"]}
                        </Badge>
                      </TableCell>
                      <TableCell>{template.version || "1.0"}</TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "啟用中" : "已停用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {safeDate(template.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!templates?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        尚無同意書模板
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>簽署記錄</CardTitle>
              <CardDescription>查看客戶的同意書簽署記錄</CardDescription>
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
                      <TableHead>同意書</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>簽署時間</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signatures?.data?.map((sig) => (
                      <TableRow key={sig.id}>
                        <TableCell className="font-medium">
                          模板 #{sig.templateId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sig.status === 'signed' ? "default" : "secondary"}>
                            {sig.status === 'signed' ? "已簽署" : "待簽署"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sig.signedAt 
                            ? safeDateTime(sig.signedAt)
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!signatures?.data?.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          尚無簽署記錄
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sign" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>立即簽署同意書</CardTitle>
              <CardDescription>選擇模板並讓客戶簽署</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label>選擇同意書模板</Label>
                  <Select onValueChange={(v) => {
                    const template = templates?.find(t => t.id === parseInt(v));
                    setSelectedTemplate(template);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.filter(t => t.isActive).map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">{selectedTemplate.name}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTemplate.content}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>客戶簽名</Label>
                    <SignatureCanvas onSave={setSignatureData} />
                  </div>

                  <Button 
                    onClick={handleSign} 
                    disabled={!signatureData || signMutation.isPending}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    確認簽署
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
