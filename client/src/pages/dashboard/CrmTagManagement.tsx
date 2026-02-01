import React from 'react';
import { Tag, Plus, Edit, Trash2, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const CrmTagManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    color: '#3B82F6',
    description: ''
  });

  const { data: tags, isLoading } = trpc.crmTags.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.crmTags.create.useMutation({
    onSuccess: () => {
      utils.crmTags.list.invalidate();
      setIsCreateDialogOpen(false);
      setFormData({ name: '', color: '#3B82F6', description: '' });
      alert('標籤建立成功！');
    },
    onError: (error) => {
      alert(`建立失敗：${error.message}`);
    }
  });

  const updateMutation = trpc.crmTags.update.useMutation({
    onSuccess: () => {
      utils.crmTags.list.invalidate();
      setEditingTag(null);
      alert('標籤更新成功！');
    },
    onError: (error) => {
      alert(`更新失敗：${error.message}`);
    }
  });

  const deleteMutation = trpc.crmTags.delete.useMutation({
    onSuccess: () => {
      utils.crmTags.list.invalidate();
      alert('標籤刪除成功！');
    },
    onError: (error) => {
      alert(`刪除失敗：${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      updateMutation.mutate({
        id: editingTag.id,
        name: formData.name,
        color: formData.color,
        description: formData.description
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || '#3B82F6',
      description: tag.description || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (tagId: number) => {
    if (confirm('確定要刪除此標籤嗎？此操作將移除所有客戶的此標籤關聯。')) {
      deleteMutation.mutate({ id: tagId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客戶標籤管理</h1>
          <p className="text-gray-600 mt-1">管理客戶分類標籤，提升 CRM 效率</p>
        </div>
        <button
          onClick={() => {
            setEditingTag(null);
            setFormData({ name: '', color: '#3B82F6', description: '' });
            setIsCreateDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          新增標籤
        </button>
      </div>

      {/* 標籤列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags?.map((tag) => (
          <div
            key={tag.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color || '#3B82F6' }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{tag.description || '無描述'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 新增/編輯 Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingTag ? '編輯標籤' : '新增標籤'}</h2>
              <button onClick={() => setIsCreateDialogOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">標籤名稱</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">標籤顏色</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">描述（選填）</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingTag ? '更新' : '建立'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmTagManagement;
