import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Edit, Plus } from "lucide-react";

interface RichMenuArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "message" | "uri" | "postback";
    label?: string;
    text?: string;
    data?: string;
    uri?: string;
  };
}

interface RichMenuEditorProps {
  onAreasChange: (areas: RichMenuArea[]) => void;
  initialAreas?: RichMenuArea[];
  imageUrl?: string;
  onImageChange?: (imageUrl: string) => void;
}

export default function RichMenuEditor({
  onAreasChange,
  initialAreas = [],
  imageUrl,
  onImageChange,
}: RichMenuEditorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [areas, setAreas] = useState<RichMenuArea[]>(initialAreas);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(imageUrl || null);
  const [imageSize, setImageSize] = useState({ width: 2500, height: 1686 }); // LINE Rich Menu 標準尺寸

  // 繪製 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製背景圖片
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawAreas(ctx);
      };
      img.src = uploadedImage;
    } else {
      // 繪製預設背景
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      drawAreas(ctx);
    }
  }, [uploadedImage, areas, currentRect]);

  // 繪製所有按鈕區域
  const drawAreas = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = canvas.width / imageSize.width;
    const scaleY = canvas.height / imageSize.height;

    // 繪製已儲存的區域
    areas.forEach((area, index) => {
      const x = area.bounds.x * scaleX;
      const y = area.bounds.y * scaleY;
      const width = area.bounds.width * scaleX;
      const height = area.bounds.height * scaleY;

      ctx.strokeStyle = index === selectedAreaIndex ? "#ff0000" : "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = index === selectedAreaIndex ? "rgba(255, 0, 0, 0.2)" : "rgba(0, 255, 0, 0.2)";
      ctx.fillRect(x, y, width, height);

      // 繪製標籤
      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.fillText(`#${index + 1}: ${area.action.label || area.action.type}`, x + 5, y + 15);
    });

    // 繪製正在繪製的矩形
    if (currentRect) {
      ctx.strokeStyle = "#0000ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }
  };

  // 處理圖片上傳
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案類型
    if (!file.type.startsWith("image/")) {
      toast({ title: "請上傳圖片檔案", variant: "destructive" });
      return;
    }

    // 檢查檔案大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "圖片檔案過大，請上傳小於 5MB 的圖片", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setUploadedImage(imageUrl);
      if (onImageChange) {
        onImageChange(imageUrl);
      }
      toast({ title: "圖片上傳成功" });
    };
    reader.readAsDataURL(file);
  };

  // 處理 Canvas 滑鼠按下
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  // 處理 Canvas 滑鼠移動
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPos.x;
    const height = y - startPos.y;

    setCurrentRect({ x: startPos.x, y: startPos.y, width, height });
  };

  // 處理 Canvas 滑鼠放開
  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = imageSize.width / canvas.width;
    const scaleY = imageSize.height / canvas.height;

    // 計算實際座標（轉換為 LINE Rich Menu 座標系統）
    const bounds = {
      x: Math.round(Math.min(currentRect.x, currentRect.x + currentRect.width) * scaleX),
      y: Math.round(Math.min(currentRect.y, currentRect.y + currentRect.height) * scaleY),
      width: Math.round(Math.abs(currentRect.width) * scaleX),
      height: Math.round(Math.abs(currentRect.height) * scaleY),
    };

    // 驗證區域大小
    if (bounds.width < 50 || bounds.height < 50) {
      toast({ title: "按鈕區域太小，請重新繪製", variant: "destructive" });
      setIsDrawing(false);
      setCurrentRect(null);
      return;
    }

    // 建立新區域（預設動作）
    const newArea: RichMenuArea = {
      bounds,
      action: {
        type: "message",
        label: `按鈕 ${areas.length + 1}`,
        text: "點擊按鈕",
      },
    };

    setSelectedAreaIndex(areas.length);
    setAreas([...areas, newArea]);
    setIsDrawing(false);
    setCurrentRect(null);
    setIsActionDialogOpen(true);
  };

  // 處理按鈕動作設定
  const handleActionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedAreaIndex === null) return;

    const formData = new FormData(e.currentTarget);
    const actionType = formData.get("actionType") as "message" | "uri" | "postback";
    const label = formData.get("label") as string;

    const updatedAreas = [...areas];
    updatedAreas[selectedAreaIndex] = {
      ...updatedAreas[selectedAreaIndex],
      action: {
        type: actionType,
        label,
        text: actionType === "message" ? (formData.get("text") as string) : undefined,
        uri: actionType === "uri" ? (formData.get("uri") as string) : undefined,
        data: actionType === "postback" ? (formData.get("data") as string) : undefined,
      },
    };

    setAreas(updatedAreas);
    onAreasChange(updatedAreas);
    setIsActionDialogOpen(false);
    toast({ title: "按鈕動作已設定" });
  };

  // 刪除按鈕區域
  const handleDeleteArea = (index: number) => {
    const updatedAreas = areas.filter((_, i) => i !== index);
    setAreas(updatedAreas);
    onAreasChange(updatedAreas);
    setSelectedAreaIndex(null);
    toast({ title: "按鈕區域已刪除" });
  };

  // 編輯按鈕區域
  const handleEditArea = (index: number) => {
    setSelectedAreaIndex(index);
    setIsActionDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 圖片上傳 */}
      <Card>
        <CardHeader>
          <CardTitle>上傳 Rich Menu 圖片</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => document.querySelector<HTMLInputElement>("input[type='file']")?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              上傳圖片
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            建議尺寸：2500 x 1686 px（LINE Rich Menu 標準尺寸）
          </p>
        </CardContent>
      </Card>

      {/* Canvas 繪製區域 */}
      <Card>
        <CardHeader>
          <CardTitle>繪製按鈕區域</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            width={800}
            height={540}
            className="border border-gray-300 cursor-crosshair w-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          <p className="text-sm text-muted-foreground mt-2">
            在圖片上拖曳滑鼠以繪製按鈕區域
          </p>
        </CardContent>
      </Card>

      {/* 按鈕列表 */}
      <Card>
        <CardHeader>
          <CardTitle>按鈕列表（{areas.length} 個）</CardTitle>
        </CardHeader>
        <CardContent>
          {areas.length === 0 ? (
            <p className="text-muted-foreground">尚未建立任何按鈕區域</p>
          ) : (
            <div className="space-y-2">
              {areas.map((area, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    index === selectedAreaIndex ? "border-blue-500 bg-blue-50" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{area.action.label}</span>
                      <Badge>{area.action.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      位置：({area.bounds.x}, {area.bounds.y}) | 大小：{area.bounds.width} x {area.bounds.height}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditArea(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteArea(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 按鈕動作設定對話框 */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>設定按鈕動作</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleActionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="label">按鈕標籤</Label>
              <Input
                id="label"
                name="label"
                defaultValue={selectedAreaIndex !== null ? areas[selectedAreaIndex]?.action.label : ""}
                placeholder="例如：預約諮詢"
                required
              />
            </div>

            <div>
              <Label htmlFor="actionType">動作類型</Label>
              <Select
                name="actionType"
                defaultValue={selectedAreaIndex !== null ? areas[selectedAreaIndex]?.action.type : "message"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">發送訊息</SelectItem>
                  <SelectItem value="uri">開啟連結</SelectItem>
                  <SelectItem value="postback">Postback 事件</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div id="message-fields">
              <Label htmlFor="text">訊息內容</Label>
              <Textarea
                id="text"
                name="text"
                defaultValue={selectedAreaIndex !== null ? areas[selectedAreaIndex]?.action.text : ""}
                placeholder="點擊按鈕後發送的訊息"
              />
            </div>

            <div id="uri-fields" className="hidden">
              <Label htmlFor="uri">連結網址</Label>
              <Input
                id="uri"
                name="uri"
                defaultValue={selectedAreaIndex !== null ? areas[selectedAreaIndex]?.action.uri : ""}
                placeholder="https://example.com"
              />
            </div>

            <div id="postback-fields" className="hidden">
              <Label htmlFor="data">Postback 資料</Label>
              <Input
                id="data"
                name="data"
                defaultValue={selectedAreaIndex !== null ? areas[selectedAreaIndex]?.action.data : ""}
                placeholder="action=book&service=facial"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit">確定</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
