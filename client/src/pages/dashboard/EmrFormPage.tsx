import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Star } from 'lucide-react';

const TREATMENT_TYPES = [
  { value: 'injection', label: '注射' },
  { value: 'laser', label: '雷射' },
  { value: 'facial', label: '臉部護理' },
  { value: 'surgery', label: '手術' },
  { value: 'consultation', label: '諮詢' },
  { value: 'other', label: '其他' },
];

export default function EmrFormPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, editParams] = useRoute('/dashboard/emr/edit/:id');
  const isEdit = !!editParams?.id;
  const editId = editParams?.id ? Number(editParams.id) : 0;

  const [customerId, setCustomerId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [treatmentType, setTreatmentType] = useState('consultation');
  const [treatmentArea, setTreatmentArea] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [satisfactionScore, setSatisfactionScore] = useState(0);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Load existing record for edit mode
  const { data: existingRecord } = trpc.pro.sprint5.emr.get.useQuery(
    { id: editId },
    { enabled: isEdit && editId > 0 },
  );

  useEffect(() => {
    if (existingRecord && isEdit) {
      setCustomerId(String(existingRecord.customerId));
      setStaffId(existingRecord.staffId ? String(existingRecord.staffId) : '');
      setTreatmentDate(existingRecord.treatmentDate ? new Date(existingRecord.treatmentDate).toISOString().split('T')[0] : '');
      setTreatmentType(existingRecord.treatmentType || 'consultation');
      setTreatmentArea(existingRecord.treatmentArea || '');
      setDosage(existingRecord.dosage || '');
      setNotes(existingRecord.notes || '');
      setInternalNotes(existingRecord.internalNotes || '');
      setSatisfactionScore(existingRecord.satisfactionScore || 0);
      setNextFollowUpDate(existingRecord.nextFollowUpDate || '');
    }
  }, [existingRecord, isEdit]);

  const createMutation = trpc.pro.sprint5.emr.create.useMutation({
    onSuccess: (data) => {
      toast({ title: '成功', description: '病歷已建立' });
      setLocation(`/dashboard/emr/${data.id}`);
    },
    onError: (err) => toast({ title: '錯誤', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = trpc.pro.sprint5.emr.update.useMutation({
    onSuccess: () => {
      toast({ title: '成功', description: '病歷已更新' });
      setLocation(`/dashboard/emr/${editId}`);
    },
    onError: (err) => toast({ title: '錯誤', description: err.message, variant: 'destructive' }),
  });

  function handleSubmit() {
    if (!customerId || !treatmentDate) {
      toast({ title: '錯誤', description: '客戶 ID 和療程日期為必填', variant: 'destructive' });
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        id: editId,
        staffId: staffId ? Number(staffId) : undefined,
        treatmentDate,
        treatmentType,
        treatmentArea: treatmentArea || undefined,
        dosage: dosage || undefined,
        notes: notes || undefined,
        internalNotes: internalNotes || undefined,
        satisfactionScore: satisfactionScore > 0 ? satisfactionScore : undefined,
        nextFollowUpDate: nextFollowUpDate || undefined,
      });
    } else {
      createMutation.mutate({
        organizationId: 1,
        customerId: Number(customerId),
        staffId: staffId ? Number(staffId) : undefined,
        treatmentDate,
        treatmentType,
        treatmentArea: treatmentArea || undefined,
        dosage: dosage || undefined,
        notes: notes || undefined,
        internalNotes: internalNotes || undefined,
        satisfactionScore: satisfactionScore > 0 ? satisfactionScore : undefined,
        nextFollowUpDate: nextFollowUpDate || undefined,
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/emr')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isEdit ? '編輯病歷' : '新增病歷'}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>客戶 ID *</Label>
                <Input
                  type="number"
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  placeholder="客戶 ID"
                  disabled={isEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>負責人員 ID</Label>
                <Input
                  type="number"
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                  placeholder="人員 ID（選填）"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>療程日期 *</Label>
                <Input
                  type="date"
                  value={treatmentDate}
                  onChange={e => setTreatmentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>療程類型</Label>
                <Select value={treatmentType} onValueChange={setTreatmentType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TREATMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>療程部位</Label>
                <Input
                  value={treatmentArea}
                  onChange={e => setTreatmentArea(e.target.value)}
                  placeholder="例：臉部、眼周"
                />
              </div>
              <div className="space-y-2">
                <Label>劑量</Label>
                <Input
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="例：2cc"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>下次回診日期</Label>
              <Input
                type="date"
                value={nextFollowUpDate}
                onChange={e => setNextFollowUpDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>滿意度</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSatisfactionScore(i === satisfactionScore ? 0 : i)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${i <= satisfactionScore ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                    />
                  </button>
                ))}
                {satisfactionScore > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">{satisfactionScore}/5</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>備註</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>一般備註</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="療程相關備註..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>內部備註（僅內部可見）</Label>
              <Textarea
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                placeholder="內部備註，不對客戶顯示..."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => setLocation('/dashboard/emr')}>取消</Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          <Save className="w-4 h-4 mr-2" />
          {isPending ? '儲存中...' : '儲存'}
        </Button>
      </div>
    </div>
  );
}
