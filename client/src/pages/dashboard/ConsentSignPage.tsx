import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PenTool, RotateCcw, Check, FileText } from 'lucide-react';

import { QueryError } from '@/components/ui/query-state';

export default function ConsentSignPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customerId, setCustomerId] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [signed, setSigned] = useState(false);

  const { data: templates, isError, refetch } = trpc.pro.sprint5.consent.listTemplates.useQuery({
    organizationId: 1,
    isActive: true,
    page: 1,
    limit: 100,
  });

  const selectedTemplate = templates?.data.find(t => t.id === Number(selectedTemplateId));

  const signMutation = trpc.pro.sprint5.consent.sign.useMutation({
    onSuccess: () => {
      toast({ title: '簽署成功', description: '知情同意書已完成簽署' });
      setSigned(true);
    },
    onError: (err) => toast({ title: '簽署失敗', description: err.message, variant: 'destructive' }),
  });

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  }, [isDrawing, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  function handleSubmit() {
    if (!selectedTemplateId || !customerId) {
      toast({ title: '錯誤', description: '請選擇模板並輸入客戶 ID', variant: 'destructive' });
      return;
    }
    if (!hasSignature) {
      toast({ title: '錯誤', description: '請先簽名', variant: 'destructive' });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');

    signMutation.mutate({
      organizationId: 1,
      customerId: Number(customerId),
      templateId: Number(selectedTemplateId),
      signatureImageUrl: signatureDataUrl,
      signedContent: selectedTemplate?.content,
      witnessName: witnessName || undefined,
      ipAddress: undefined,
      userAgent: navigator.userAgent,
    });
  }

  if (signed) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">簽署完成</h2>
            <p className="text-muted-foreground mb-6">知情同意書已成功簽署並記錄</p>
            <Button onClick={() => { setSigned(false); clearSignature(); setSelectedTemplateId(''); setCustomerId(''); }}>
              簽署另一份
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">知情同意書簽署</h1>
        <p className="text-muted-foreground mt-1">選擇同意書模板，完成數位簽署流程</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Template Selection & Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">選擇同意書模板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>同意書模板 *</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger><SelectValue placeholder="請選擇模板" /></SelectTrigger>
                  <SelectContent>
                    {templates?.data.map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>客戶 ID *</Label>
                <Input type="number" value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="請輸入客戶 ID" />
              </div>
              <div className="space-y-2">
                <Label>見證人姓名（選填）</Label>
                <Input value={witnessName} onChange={e => setWitnessName(e.target.value)} placeholder="見證人姓名" />
              </div>
            </CardContent>
          </Card>

          {/* Template Preview */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  同意書內容預覽
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                  {selectedTemplate.content}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Signature Pad */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                數位簽名
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair touch-none"
                  style={{ height: '200px' }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSignature} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清除簽名
                </Button>
              </div>

              <Separator />

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={!hasSignature || !selectedTemplateId || !customerId || signMutation.isPending}
              >
                {signMutation.isPending ? '簽署中...' : '確認簽署'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
