import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil, Trash2, Star, Camera, Upload } from 'lucide-react';
import { format } from 'date-fns';

import { QueryError } from '@/components/ui/query-state';

const TREATMENT_TYPES: Record<string, string> = {
  injection: '注射', laser: '雷射', facial: '臉部護理',
  surgery: '手術', consultation: '諮詢', other: '其他',
};

/** Before/After 滑桿比對元件 */
function BASlider({ before, after, angle }: { before: string | null; after: string | null; angle: string }) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
  }, [isDragging, handleMove]);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
  }, [handleMove]);

  if (!before && !after) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">角度：{angle}</p>
      <div
        className="relative w-full h-64 rounded-lg overflow-hidden cursor-col-resize select-none bg-muted"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
      >
        {/* After (background) */}
        {after && (
          <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        {/* Before (clipped) */}
        {before && (
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
            <img src={before} alt="Before" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">⟷</span>
          </div>
        </div>
        {/* Labels */}
        <div className="absolute top-2 left-2 z-20">
          <Badge variant="secondary" className="bg-black/50 text-white">Before</Badge>
        </div>
        <div className="absolute top-2 right-2 z-20">
          <Badge variant="secondary" className="bg-black/50 text-white">After</Badge>
        </div>
      </div>
    </div>
  );
}

export default function EmrDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/dashboard/emr/:id');
  const recordId = params?.id ? Number(params.id) : 0;

  const { data: record, isLoading, isError, refetch } = trpc.pro.sprint5.emr.get.useQuery(
    { id: recordId },
    { enabled: recordId > 0 },
  );

  const { data: baPairs } = trpc.pro.sprint5.emr.getBeforeAfterPairs.useQuery(
    { customerId: record?.customerId ?? 0, treatmentRecordId: recordId },
    { enabled: !!record?.customerId },
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.pro.sprint5.emr.delete.useMutation({
    onSuccess: () => setLocation('/dashboard/emr'),
  });

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">載入中...</div>;
  }

  if (!record) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">找不到該病歷</p>
        <Button variant="outline" onClick={() => setLocation('/dashboard/emr')}>返回列表</Button>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/emr')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">病歷詳情</h1>
            <p className="text-muted-foreground text-sm">ID: {record.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation(`/dashboard/emr/edit/${record.id}`)}>
            <Pencil className="w-4 h-4 mr-2" />
            編輯
          </Button>
          <Button
            variant="destructive"
            onClick={() => { if (confirm('確定要刪除此病歷？')) deleteMutation.mutate({ id: record.id }); }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            刪除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patient & Treatment Info */}
        <Card>
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">客戶：</span>
                <span className="font-medium ml-1">{record.customerName || `#${record.customerId}`}</span>
              </div>
              <div>
                <span className="text-muted-foreground">負責人員：</span>
                <span className="font-medium ml-1">{record.staffName || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">療程日期：</span>
                <span className="font-medium ml-1">
                  {record.treatmentDate ? format(new Date(record.treatmentDate), 'yyyy-MM-dd') : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">療程類型：</span>
                <span className="font-medium ml-1">
                  {TREATMENT_TYPES[record.treatmentType || ''] || record.treatmentType || '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">療程部位：</span>
                <span className="font-medium ml-1">{record.treatmentArea || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">劑量：</span>
                <span className="font-medium ml-1">{record.dosage || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">滿意度：</span>
                <span className="ml-1 inline-flex items-center gap-0.5">
                  {record.satisfactionScore ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= record.satisfactionScore! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                    ))
                  ) : '-'}
                </span>
              </div>
              {record.nextFollowUpDate && (
                <div>
                  <span className="text-muted-foreground">下次回診：</span>
                  <span className="font-medium ml-1">{record.nextFollowUpDate}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>備註</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">一般備註</p>
                <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap">{record.notes}</div>
              </div>
            )}
            {record.internalNotes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">內部備註</p>
                <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap">{record.internalNotes}</div>
              </div>
            )}
            {!record.notes && !record.internalNotes && (
              <p className="text-muted-foreground text-sm">無備註</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              療程照片
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {record.photos && record.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {record.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.photoUrl}
                    alt={photo.notes || '療程照片'}
                    className="w-full h-40 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                    {photo.photoType === 'before' ? 'Before' : photo.photoType === 'after' ? 'After' : photo.photoType}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">尚無照片</p>
          )}
        </CardContent>
      </Card>

      {/* Before/After Comparison */}
      {baPairs && baPairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Before / After 比對</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {baPairs.map((pair, idx) => (
              <BASlider
                key={idx}
                before={pair.before?.photoUrl ?? null}
                after={pair.after?.photoUrl ?? null}
                angle={pair.angle}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
