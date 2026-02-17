import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';

import { QueryError } from '@/components/ui/query-state';

const CATEGORIES = [
  { value: 'treatment', label: '療程' },
  { value: 'surgery', label: '手術' },
  { value: 'anesthesia', label: '麻醉' },
  { value: 'photography', label: '攝影' },
  { value: 'general', label: '一般' },
] as const;

type Category = 'treatment' | 'surgery' | 'anesthesia' | 'photography' | 'general';

const categoryColors: Record<string, string> = {
  treatment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  surgery: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  anesthesia: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  photography: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function ConsentTemplatePage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('general');
  const [formContent, setFormContent] = useState('');
  const [formVersion, setFormVersion] = useState('1.0');

  const utils = trpc.useUtils();

  const { data, isLoading, isError, refetch } = trpc.pro.sprint5.consent.listTemplates.useQuery({
    organizationId: 1,
    category: filterCategory !== 'all' ? filterCategory as Category : undefined,
    isActive: true,
    page: 1,
    limit: 50,
  });

  const createMutation = trpc.pro.sprint5.consent.createTemplate.useMutation({
    onSuccess: () => {
      toast({ title: '成功', description: '同意書模板已建立' });
      utils.pro.sprint5.consent.listTemplates.invalidate();
      closeDialog();
    },
    onError: (err) => toast({ title: '錯誤', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = trpc.pro.sprint5.consent.updateTemplate.useMutation({
    onSuccess: () => {
      toast({ title: '成功', description: '同意書模板已更新' });
      utils.pro.sprint5.consent.listTemplates.invalidate();
      closeDialog();
    },
    onError: (err) => toast({ title: '錯誤', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = trpc.pro.sprint5.consent.deleteTemplate.useMutation({
    onSuccess: () => {
      toast({ title: '成功', description: '同意書模板已停用' });
      utils.pro.sprint5.consent.listTemplates.invalidate();
    },
    onError: (err) => toast({ title: '錯誤', description: err.message, variant: 'destructive' }),
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setFormName('');
    setFormCategory('general');
    setFormContent('');
    setFormVersion('1.0');
  }

  function openCreate() {
    setEditingId(null);
    setFormName('');
    setFormCategory('general');
    setFormContent('');
    setFormVersion('1.0');
    setDialogOpen(true);
  }

  function openEdit(template: NonNullable<typeof data>['data'][0]) {
    setEditingId(template.id);
    setFormName(template.name);
    setFormCategory((template.category as Category) || 'general');
    setFormContent(template.content);
    setFormVersion(template.version || '1.0');
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!formName.trim() || !formContent.trim()) {
      toast({ title: '錯誤', description: '名稱和內容為必填', variant: 'destructive' });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, name: formName, category: formCategory, content: formContent, version: formVersion });
    } else {
      createMutation.mutate({ organizationId: 1, name: formName, category: formCategory, content: formContent, version: formVersion });
    }
  }

  const templates = data?.data ?? [];
  const filtered = searchTerm
    ? templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : templates;

  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">知情同意書模板管理</h1>
          <p className="text-muted-foreground mt-1">管理診所的知情同意書模板，支援分類與版本控制</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          新增模板
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜尋模板名稱..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="分類篩選" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分類</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">載入中...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>尚無同意書模板</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={categoryColors[template.category || 'general']}>
                    {CATEGORIES.find(c => c.value === template.category)?.label || '一般'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {template.content}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>版本 {template.version}</span>
                  <span>{template.createdAt ? format(new Date(template.createdAt), 'yyyy-MM-dd') : ''}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEdit(template)}>
                    <Pencil className="w-3 h-3 mr-1" />
                    編輯
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate({ id: template.id })}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    停用
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? '編輯同意書模板' : '新增同意書模板'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>模板名稱 *</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="例：雷射療程同意書" />
              </div>
              <div className="space-y-2">
                <Label>分類</Label>
                <Select value={formCategory} onValueChange={v => setFormCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>版本</Label>
              <Input value={formVersion} onChange={e => setFormVersion(e.target.value)} placeholder="1.0" />
            </div>
            <div className="space-y-2">
              <Label>同意書內容 *</Label>
              <Textarea
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                placeholder="請輸入同意書完整內容..."
                rows={12}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>取消</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? '儲存中...' : '儲存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
