import React, { useState } from 'react';
import { MessageSquare, Users, Tag, Send, Settings, Search, Plus, X, Edit, Trash2, History } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InteractionHistory } from '@/components/InteractionHistory';
import { SendLineMessageDialog } from '@/components/SendLineMessageDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LineCrmDashboard: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTagIds, setFilterTagIds] = useState<number[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isSendLineMessageDialogOpen, setIsSendLineMessageDialogOpen] = useState(false);
  
  // 查詢所有標籤
  const { data: allTags = [] } = trpc.crmTags.list.useQuery({ organizationId: 1 }); // TODO: Get from context
  
  // 查詢客戶列表（支援搜尋與標籤篩選）
  const { data: customers = [], refetch: refetchCustomers } = trpc.crmCustomers.list.useQuery({
    organizationId: 1, // TODO: 從 context 取得 organizationId
    search: searchQuery,
    tagIds: filterTagIds.length > 0 ? filterTagIds : undefined,
  });
  
  // 查詢當前客戶的標籤
  const { data: customerTags = [], refetch: refetchCustomerTags } = trpc.crmCustomers.getCustomerTags.useQuery(
    { customerId: selectedCustomerId! },
    { enabled: !!selectedCustomerId }
  );
  
  // 新增客戶 mutation
  const createCustomer = trpc.crmCustomers.create.useMutation({
    onSuccess: () => {
      toast({ title: '客戶已新增' });
      refetchCustomers();
      setIsCustomerDialogOpen(false);
      setEditingCustomer(null);
    },
    onError: () => {
      toast({ title: '新增客戶失敗', variant: 'destructive' });
    }
  });
  
  // 更新客戶 mutation
  const updateCustomer = trpc.crmCustomers.update.useMutation({
    onSuccess: () => {
      toast({ title: '客戶已更新' });
      refetchCustomers();
      setIsCustomerDialogOpen(false);
      setEditingCustomer(null);
    },
    onError: () => {
      toast({ title: '更新客戶失敗', variant: 'destructive' });
    }
  });
  
  // 刪除客戶 mutation
  const deleteCustomer = trpc.crmCustomers.delete.useMutation({
    onSuccess: () => {
      toast({ title: '客戶已刪除' });
      refetchCustomers();
      setSelectedCustomerId(null);
    },
    onError: () => {
      toast({ title: '刪除客戶失敗', variant: 'destructive' });
    }
  });
  
  // 新增標籤 mutation
  const addTag = trpc.crmCustomers.addTag.useMutation({
    onSuccess: () => {
      toast({ title: '標籤已新增' });
      refetchCustomerTags();
      refetchCustomers();
      setIsTagDialogOpen(false);
      setSelectedTagIds([]);
    },
    onError: () => {
      toast({ title: '新增標籤失敗', variant: 'destructive' });
    }
  });
  
  // 移除標籤 mutation
  const removeTag = trpc.crmCustomers.removeTag.useMutation({
    onSuccess: () => {
      toast({ title: '標籤已移除' });
      refetchCustomerTags();
      refetchCustomers();
    },
    onError: () => {
      toast({ title: '移除標籤失敗', variant: 'destructive' });
    }
  });
  
  const handleAssignTag = () => {
    if (selectedTagIds.length === 0 || !selectedCustomerId) return;
    selectedTagIds.forEach(tagId => {
      addTag.mutate({ customerId: selectedCustomerId, tagId });
    });
  };
  
  const handleRemoveTag = (tagId: number) => {
    if (!selectedCustomerId) return;
    removeTag.mutate({ customerId: selectedCustomerId, tagId });
  };
  
  const handleSaveCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      organizationId: 1, // TODO: 從 context 取得 organizationId
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      lineUserId: formData.get('lineUserId') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };
    
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, ...data });
    } else {
      createCustomer.mutate(data);
    }
  };
  
  const handleDeleteCustomer = () => {
    if (!selectedCustomerId) return;
    if (confirm('確定要刪除此客戶嗎？')) {
      deleteCustomer.mutate({ id: selectedCustomerId });
    }
  };
  
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#06C755]" />
          <h1 className="text-2xl font-bold text-gray-900">LINE CRM 客戶管理</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/crm/tags')}>
            <Tag className="w-4 h-4 mr-2" />
            標籤管理
          </Button>
          <Button onClick={() => {
            setEditingCustomer(null);
            setIsCustomerDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            新增客戶
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Customer List */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Search & Filter */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜尋客戶姓名、電話、Email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* 標籤篩選 */}
            <Select
              value={filterTagIds.join(',')}
              onValueChange={(value) => {
                if (value === 'all') {
                  setFilterTagIds([]);
                } else {
                  setFilterTagIds(value.split(',').map(Number));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="按標籤篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部客戶</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag.id} value={String(tag.id)}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color || '#6366f1' }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto">
            {customers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>尚無客戶資料</p>
              </div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCustomerId === customer.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{customer.phone || customer.email || '無聯絡資訊'}</p>
                      {customer.notes && (
                        <p className="text-xs text-gray-400 truncate mt-1">{customer.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Customer Details */}
        <div className="flex-1 flex flex-col">
          {selectedCustomer ? (
            <>
              {/* Customer Header */}
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        {selectedCustomer.phone && <span>📞 {selectedCustomer.phone}</span>}
                        {selectedCustomer.email && <span>✉️ {selectedCustomer.email}</span>}
                      </div>
                      
                      {/* 客戶標籤 */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {customerTags.map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color || '#6366f1' }}
                          >
                            {tag.name}
                            <button
                              onClick={() => handleRemoveTag(tag.id)}
                              className="hover:bg-white/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsTagDialogOpen(true)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          新增標籤
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsSendLineMessageDialogOpen(true)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      發送 LINE 訊息
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCustomer(selectedCustomer);
                        setIsCustomerDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      編輯
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteCustomer}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      刪除
                    </Button>
                  </div>
                </div>
              </div>

              {/* Customer Info with Tabs */}
              <div className="flex-1 p-6 overflow-y-auto">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList>
                    <TabsTrigger value="info">客戶資訊</TabsTrigger>
                    <TabsTrigger value="interactions">互動歷史</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="mt-4">
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">姓名</Label>
                      <p className="text-gray-900 font-medium">{selectedCustomer.name}</p>
                    </div>
                    
                    {selectedCustomer.phone && (
                      <div>
                        <Label className="text-sm text-gray-600">電話</Label>
                        <p className="text-gray-900 font-medium">{selectedCustomer.phone}</p>
                      </div>
                    )}
                    
                    {selectedCustomer.email && (
                      <div>
                        <Label className="text-sm text-gray-600">Email</Label>
                        <p className="text-gray-900 font-medium">{selectedCustomer.email}</p>
                      </div>
                    )}
                    
                    {selectedCustomer.lineUserId && (
                      <div>
                        <Label className="text-sm text-gray-600">LINE ID</Label>
                        <p className="text-gray-900 font-medium">{selectedCustomer.lineUserId}</p>
                      </div>
                    )}
                    
                    {selectedCustomer.gender && (
                      <div>
                        <Label className="text-sm text-gray-600">性別</Label>
                        <p className="text-gray-900 font-medium">
                          {selectedCustomer.gender === 'male' ? '男' : selectedCustomer.gender === 'female' ? '女' : '其他'}
                        </p>
                      </div>
                    )}
                    
                    {selectedCustomer.birthday && (
                      <div>
                        <Label className="text-sm text-gray-600">生日</Label>
                        <p className="text-gray-900 font-medium">
                          {new Date(selectedCustomer.birthday).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    )}
                    
                    {selectedCustomer.address && (
                      <div className="col-span-2">
                        <Label className="text-sm text-gray-600">地址</Label>
                        <p className="text-gray-900 font-medium">{selectedCustomer.address}</p>
                      </div>
                    )}
                    
                    {selectedCustomer.source && (
                      <div>
                        <Label className="text-sm text-gray-600">來源</Label>
                        <p className="text-gray-900 font-medium">{selectedCustomer.source}</p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm text-gray-600">會員等級</Label>
                      <p className="text-gray-900 font-medium">{selectedCustomer.memberLevel || 'bronze'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-600">累計消費</Label>
                      <p className="text-gray-900 font-medium">NT$ {selectedCustomer.totalSpent || 0}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-600">到店次數</Label>
                      <p className="text-gray-900 font-medium">{selectedCustomer.visitCount || 0} 次</p>
                    </div>
                  </div>
                  
                      {selectedCustomer.notes && (
                        <div className="mt-4">
                          <Label className="text-sm text-gray-600">備註</Label>
                          <p className="text-gray-700 mt-1">{selectedCustomer.notes}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="interactions" className="mt-4">
                    <InteractionHistory customerId={selectedCustomerId!} organizationId={1} />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">請選擇客戶以查看詳細資訊</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新增/編輯客戶 Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? '編輯客戶' : '新增客戶'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCustomer}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCustomer?.name}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingCustomer?.phone}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingCustomer?.email}
                />
              </div>
              
              <div>
                <Label htmlFor="lineUserId">LINE ID</Label>
                <Input
                  id="lineUserId"
                  name="lineUserId"
                  defaultValue={editingCustomer?.lineUserId}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="notes">備註</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingCustomer?.notes}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingCustomer ? '更新' : '新增'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 新增標籤 Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>為客戶新增標籤</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>選擇標籤</Label>
            <Select
              value={selectedTagIds.join(',')}
              onValueChange={(value) => setSelectedTagIds(value.split(',').map(Number))}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇標籤" />
              </SelectTrigger>
              <SelectContent>
                {allTags
                  .filter(tag => !customerTags.some(ct => ct.id === tag.id))
                  .map(tag => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color || '#6366f1' }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAssignTag}>
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 發送 LINE 訊息 Dialog */}
      <SendLineMessageDialog
        open={isSendLineMessageDialogOpen}
        onOpenChange={setIsSendLineMessageDialogOpen}
        organizationId={1}
        customerId={selectedCustomerId || undefined}
        mode="single"
      />
    </div>
  );
};

export default LineCrmDashboard;
