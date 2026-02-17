import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Webhook, MessageSquare, Plus, Edit, Trash2, Power, PowerOff, ArrowUp, ArrowDown } from 'lucide-react';

import { QueryLoading } from '@/components/ui/query-state';

export default function LineWebhookManagement() {
  const [organizationId] = useState(1); // TODO: 從 context 取得
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  // 查詢 Webhook 事件列表
  const { data: eventsData, refetch: refetchEvents, isLoading } = trpc.lineWebhook.listEvents.useQuery({
    organizationId,
    page: 1,
    pageSize: 20,
  });

  // 查詢自動回覆規則列表
  const { data: rules, refetch: refetchRules } = trpc.autoReplyRules.list.useQuery({
    organizationId,
  });

  // 新增/更新自動回覆規則
  const createRuleMutation = trpc.autoReplyRules.create.useMutation({
    onSuccess: () => {
      toast.success('自動回覆規則已新增');
      refetchRules();
      setIsRuleDialogOpen(false);
      setEditingRule(null);
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const updateRuleMutation = trpc.autoReplyRules.update.useMutation({
    onSuccess: () => {
      toast.success('自動回覆規則已更新');
      refetchRules();
      setIsRuleDialogOpen(false);
      setEditingRule(null);
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteRuleMutation = trpc.autoReplyRules.delete.useMutation({
    onSuccess: () => {
      toast.success('自動回覆規則已刪除');
      refetchRules();
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.autoReplyRules.toggleActive.useMutation({
    onSuccess: () => {
      toast.success('規則狀態已更新');
      refetchRules();
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const handleSaveRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      organizationId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      triggerType: formData.get('triggerType') as 'keyword' | 'regex' | 'always',
      triggerValue: formData.get('triggerValue') as string,
      replyType: formData.get('replyType') as 'text' | 'flex' | 'template',
      replyContent: formData.get('replyContent') as string,
      priority: parseInt(formData.get('priority') as string) || 0,
      isActive: true,
    };

    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, ...data });
    } else {
      createRuleMutation.mutate(data);
    }
  };

  if (isLoading) {

    return (

      <div className="p-6">

        <QueryLoading variant="skeleton-cards" />

      </div>

    );

  }


  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LINE Webhook 管理</h1>
        <p className="text-muted-foreground">
          管理 LINE Webhook 事件、自動回覆規則與測試工具
        </p>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">
            <Webhook className="w-4 h-4 mr-2" />
            Webhook 事件
          </TabsTrigger>
          <TabsTrigger value="rules">
            <MessageSquare className="w-4 h-4 mr-2" />
            自動回覆規則
          </TabsTrigger>
        </TabsList>

        {/* Webhook 事件列表 */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook 事件日誌</CardTitle>
              <CardDescription>
                查看所有 LINE Webhook 接收到的事件記錄
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventsData?.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsEventDialogOpen(true);
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{event.eventType}</Badge>
                        {event.messageType && (
                          <Badge variant="secondary">{event.messageType}</Badge>
                        )}
                        <Badge variant={event.isProcessed ? 'default' : 'destructive'}>
                          {event.isProcessed ? '已處理' : '未處理'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.messageText || `[${event.eventType} event]`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.createdAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                ))}

                {eventsData?.events.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    尚無 Webhook 事件記錄
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 自動回覆規則 */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">自動回覆規則</h2>
              <p className="text-muted-foreground">
                設定關鍵字觸發的自動回覆訊息
              </p>
            </div>
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingRule(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  新增規則
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSaveRule}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRule ? '編輯自動回覆規則' : '新增自動回覆規則'}
                    </DialogTitle>
                    <DialogDescription>
                      設定觸發條件與回覆內容
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">規則名稱</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingRule?.name}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">規則說明</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingRule?.description}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="triggerType">觸發類型</Label>
                        <Select name="triggerType" defaultValue={editingRule?.triggerType || 'keyword'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keyword">關鍵字</SelectItem>
                            <SelectItem value="regex">正則表達式</SelectItem>
                            <SelectItem value="always">總是回覆</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">優先級</Label>
                        <Input
                          id="priority"
                          name="priority"
                          type="number"
                          defaultValue={editingRule?.priority || 0}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="triggerValue">觸發值</Label>
                      <Input
                        id="triggerValue"
                        name="triggerValue"
                        defaultValue={editingRule?.triggerValue}
                        placeholder="例如：預約、查詢、取消"
                      />
                    </div>

                    <div>
                      <Label htmlFor="replyType">回覆類型</Label>
                      <Select name="replyType" defaultValue={editingRule?.replyType || 'text'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">純文字</SelectItem>
                          <SelectItem value="flex">Flex Message</SelectItem>
                          <SelectItem value="template">模板訊息</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="replyContent">回覆內容</Label>
                      <Textarea
                        id="replyContent"
                        name="replyContent"
                        defaultValue={editingRule?.replyContent}
                        rows={4}
                        required
                        placeholder="輸入回覆訊息內容"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                      取消
                    </Button>
                    <Button type="submit">
                      {editingRule ? '更新' : '新增'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {rules?.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {rule.name}
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? '啟用' : '停用'}
                        </Badge>
                        <Badge variant="outline">優先級: {rule.priority}</Badge>
                      </CardTitle>
                      {rule.description && (
                        <CardDescription>{rule.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingRule(rule);
                          setIsRuleDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('確定要刪除此規則嗎？')) {
                            deleteRuleMutation.mutate({ id: rule.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          toggleActiveMutation.mutate({
                            id: rule.id,
                            isActive: !rule.isActive,
                          });
                        }}
                      >
                        {rule.isActive ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">觸發類型：</span>
                      <Badge variant="outline">{rule.triggerType}</Badge>
                    </div>
                    {rule.triggerValue && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">觸發值：</span>
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {rule.triggerValue}
                        </code>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">回覆類型：</span>
                      <Badge variant="outline">{rule.replyType}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">回覆內容：</span>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                        {rule.replyContent}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rules?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  尚未設定自動回覆規則
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Webhook 事件詳情 Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Webhook 事件詳情</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>事件類型</Label>
                  <Badge variant="outline">{selectedEvent.eventType}</Badge>
                </div>
                <div>
                  <Label>訊息類型</Label>
                  <Badge variant="secondary">
                    {selectedEvent.messageType || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <Label>來源類型</Label>
                  <Badge variant="outline">{selectedEvent.sourceType}</Badge>
                </div>
                <div>
                  <Label>處理狀態</Label>
                  <Badge variant={selectedEvent.isProcessed ? 'default' : 'destructive'}>
                    {selectedEvent.isProcessed ? '已處理' : '未處理'}
                  </Badge>
                </div>
              </div>

              {selectedEvent.messageText && (
                <div>
                  <Label>訊息內容</Label>
                  <p className="mt-1 p-3 bg-muted rounded">{selectedEvent.messageText}</p>
                </div>
              )}

              <div>
                <Label>完整 Payload</Label>
                <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(JSON.parse(selectedEvent.rawPayload), null, 2)}
                </pre>
              </div>

              <div className="text-xs text-muted-foreground">
                建立時間：{new Date(selectedEvent.createdAt).toLocaleString('zh-TW')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
