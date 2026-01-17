import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Syringe, Plus, History, Eye, MapPin, User } from "lucide-react";

// 臉部 SVG 模板
const FaceFrontSVG = ({ points, onAddPoint }: { points: any[]; onAddPoint: (x: number, y: number) => void }) => {
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddPoint(x, y);
  };

  return (
    <svg 
      viewBox="0 0 200 250" 
      className="w-full max-w-md mx-auto cursor-crosshair border rounded-lg bg-gradient-to-b from-rose-50 to-amber-50"
      onClick={handleClick}
    >
      {/* 臉部輪廓 */}
      <ellipse cx="100" cy="120" rx="70" ry="90" fill="none" stroke="#d4a574" strokeWidth="2" />
      {/* 眉毛 */}
      <path d="M 50 80 Q 70 70 90 80" fill="none" stroke="#8b7355" strokeWidth="2" />
      <path d="M 110 80 Q 130 70 150 80" fill="none" stroke="#8b7355" strokeWidth="2" />
      {/* 眼睛 */}
      <ellipse cx="70" cy="95" rx="15" ry="8" fill="none" stroke="#8b7355" strokeWidth="1.5" />
      <ellipse cx="130" cy="95" rx="15" ry="8" fill="none" stroke="#8b7355" strokeWidth="1.5" />
      <circle cx="70" cy="95" r="4" fill="#4a3728" />
      <circle cx="130" cy="95" r="4" fill="#4a3728" />
      {/* 鼻子 */}
      <path d="M 100 90 L 100 130 Q 90 140 100 140 Q 110 140 100 130" fill="none" stroke="#d4a574" strokeWidth="1.5" />
      {/* 嘴巴 */}
      <path d="M 80 165 Q 100 180 120 165" fill="none" stroke="#c97b7b" strokeWidth="2" />
      {/* 區域標籤 */}
      <text x="100" y="55" textAnchor="middle" fontSize="10" fill="#666">額頭</text>
      <text x="40" y="95" textAnchor="middle" fontSize="8" fill="#666">太陽穴</text>
      <text x="160" y="95" textAnchor="middle" fontSize="8" fill="#666">太陽穴</text>
      <text x="50" y="130" textAnchor="middle" fontSize="8" fill="#666">蘋果肌</text>
      <text x="150" y="130" textAnchor="middle" fontSize="8" fill="#666">蘋果肌</text>
      <text x="100" y="195" textAnchor="middle" fontSize="8" fill="#666">下巴</text>
      
      {/* 注射點位 */}
      {points.map((point, index) => (
        <g key={index}>
          <circle 
            cx={point.positionX * 2} 
            cy={point.positionY * 2.5} 
            r="6" 
            fill="#ef4444" 
            fillOpacity="0.7"
            stroke="#fff"
            strokeWidth="1"
          />
          <text 
            x={point.positionX * 2} 
            y={point.positionY * 2.5 + 3} 
            textAnchor="middle" 
            fontSize="8" 
            fill="#fff"
            fontWeight="bold"
          >
            {point.units}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default function InjectionMappingPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("face_front");
  const [currentPoints, setCurrentPoints] = useState<any[]>([]);
  const [newRecordOpen, setNewRecordOpen] = useState(false);
  const [productUsed, setProductUsed] = useState("");
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null);
  const [pointUnits, setPointUnits] = useState("");
  const [pointDepth, setPointDepth] = useState("");
  const [pointTechnique, setPointTechnique] = useState("");

  // 模擬客戶資料
  const mockCustomers = [
    { id: 1, name: "王小明" },
    { id: 2, name: "李小華" },
    { id: 3, name: "張美玲" },
  ];

  const { data: injectionRecords } = trpc.injection.listRecords.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const { data: historyComparison } = trpc.injection.compareHistory.useQuery(
    { customerId: selectedCustomerId || 0, templateType: selectedTemplate },
    { enabled: !!selectedCustomerId }
  );

  const createRecordMutation = trpc.injection.createRecord.useMutation({
    onSuccess: (data) => {
      toast.success("注射記錄已建立");
      // 接著新增點位
      currentPoints.forEach(async (point) => {
        await addPointMutation.mutateAsync({
          injectionRecordId: data.id,
          positionX: point.positionX.toString(),
          positionY: point.positionY.toString(),
          units: point.units.toString(),
          depth: point.depth,
          technique: point.technique,
        });
      });
      setNewRecordOpen(false);
      setCurrentPoints([]);
    },
    onError: (error) => {
      toast.error(`建立失敗: ${error.message}`);
    },
  });

  const addPointMutation = trpc.injection.addPoint.useMutation();

  const handleAddPoint = (x: number, y: number) => {
    setPendingPoint({ x, y });
  };

  const confirmAddPoint = () => {
    if (pendingPoint && pointUnits) {
      setCurrentPoints([
        ...currentPoints,
        {
          positionX: pendingPoint.x,
          positionY: pendingPoint.y,
          units: parseFloat(pointUnits),
          depth: pointDepth,
          technique: pointTechnique,
        },
      ]);
      setPendingPoint(null);
      setPointUnits("");
      setPointDepth("");
      setPointTechnique("");
    }
  };

  const handleSaveRecord = () => {
    if (!selectedCustomerId || currentPoints.length === 0) {
      toast.error("請選擇客戶並標記至少一個注射點");
      return;
    }

    const totalUnits = currentPoints.reduce((sum, p) => sum + p.units, 0);
    createRecordMutation.mutate({
      organizationId: 1,
      customerId: selectedCustomerId,
      staffId: 1,
      templateType: selectedTemplate as any,
      productUsed,
      totalUnits: totalUnits.toString(),
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Syringe className="h-6 w-6 text-rose-500" />
            注射點位圖管理
          </h1>
          <p className="text-muted-foreground">記錄與追蹤客戶的注射治療位置與劑量</p>
        </div>
        <Dialog open={newRecordOpen} onOpenChange={setNewRecordOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增注射記錄
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>新增注射記錄</DialogTitle>
              <DialogDescription>在臉部模板上點擊以標記注射位置</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
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
                  <Label>模板類型</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face_front">正面臉部</SelectItem>
                      <SelectItem value="face_side_left">左側臉部</SelectItem>
                      <SelectItem value="face_side_right">右側臉部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>使用產品</Label>
                  <Input 
                    placeholder="例如：保妥適、喬雅登" 
                    value={productUsed}
                    onChange={(e) => setProductUsed(e.target.value)}
                  />
                </div>
                
                {pendingPoint && (
                  <Card className="border-rose-200 bg-rose-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">設定注射點參數</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">劑量 (U)</Label>
                          <Input 
                            type="number" 
                            placeholder="單位數"
                            value={pointUnits}
                            onChange={(e) => setPointUnits(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">深度</Label>
                          <Input 
                            placeholder="例如：真皮層"
                            value={pointDepth}
                            onChange={(e) => setPointDepth(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">注射技術</Label>
                        <Input 
                          placeholder="例如：扇形注射"
                          value={pointTechnique}
                          onChange={(e) => setPointTechnique(e.target.value)}
                        />
                      </div>
                      <Button size="sm" onClick={confirmAddPoint} className="w-full">
                        確認新增點位
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>已標記點位 ({currentPoints.length})</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {currentPoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                        <span>點位 {index + 1}</span>
                        <Badge variant="secondary">{point.units} U</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveRecord} 
                  className="w-full"
                  disabled={currentPoints.length === 0 || createRecordMutation.isPending}
                >
                  儲存注射記錄
                </Button>
              </div>
              <div>
                <FaceFrontSVG points={currentPoints} onAddPoint={handleAddPoint} />
                <p className="text-center text-sm text-muted-foreground mt-2">
                  點擊臉部模板以標記注射位置
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 客戶選擇 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              選擇客戶
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="選擇客戶查看記錄" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 統計卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              注射統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{injectionRecords?.total || 0}</p>
                <p className="text-sm text-muted-foreground">總記錄數</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {injectionRecords?.data?.reduce((sum, r) => sum + parseFloat(r.totalUnits || "0"), 0).toFixed(0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">總注射單位</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 歷史比較 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              歷史比較
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {historyComparison?.length || 0} 筆歷史記錄可供比較
            </p>
            <Button variant="outline" size="sm" className="mt-2" disabled={!selectedCustomerId}>
              <Eye className="h-4 w-4 mr-2" />
              查看歷史
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 注射記錄列表 */}
      {selectedCustomerId && (
        <Card>
          <CardHeader>
            <CardTitle>注射記錄</CardTitle>
            <CardDescription>客戶的所有注射治療記錄</CardDescription>
          </CardHeader>
          <CardContent>
            {injectionRecords?.data?.length ? (
              <div className="space-y-4">
                {injectionRecords.data.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.productUsed || "未指定產品"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString("zh-TW")} · 
                        {record.templateType === "face_front" ? " 正面臉部" : record.templateType}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge>{record.totalUnits} U</Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        查看
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">尚無注射記錄</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
