import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Phone, Users, MessageCircle, Calendar, Activity, FileText } from "lucide-react";

interface InteractionHistoryProps {
  customerId: number;
  organizationId: number;
}

const interactionTypeIcons = {
  phone: Phone,
  meeting: Users,
  line: MessageCircle,
  appointment: Calendar,
  treatment: Activity,
  note: FileText,
};

const interactionTypeLabels = {
  phone: "電話",
  meeting: "面談",
  line: "LINE 對話",
  appointment: "預約",
  treatment: "療程",
  note: "備註",
};

export function InteractionHistory({ customerId, organizationId }: InteractionHistoryProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: "note" as "phone" | "meeting" | "line" | "appointment" | "treatment" | "note",
    title: "",
    content: "",
  });

  // 查詢互動記錄
  const { data: interactions, isLoading } = trpc.interactions.list.useQuery({
    customerId,
  });

  // 新增互動記錄
  const createMutation = trpc.interactions.create.useMutation({
    onSuccess: () => {
      toast({ title: "新增成功", description: "互動記錄已新增" });
      setIsAddDialogOpen(false);
      setFormData({ type: "note", title: "", content: "" });
      trpc.useUtils().interactions.list.invalidate({ customerId });
    },
    onError: (error) => {
      toast({ title: "新增失敗", description: error.message, variant: "destructive" });
    },
  });

  // 更新互動記錄
  const updateMutation = trpc.interactions.update.useMutation({
    onSuccess: () => {
      toast({ title: "更新成功", description: "互動記錄已更新" });
      setEditingId(null);
      trpc.useUtils().interactions.list.invalidate({ customerId });
    },
    onError: (error) => {
      toast({ title: "更新失敗", description: error.message, variant: "destructive" });
    },
  });

  // 刪除互動記錄
  const deleteMutation = trpc.interactions.delete.useMutation({
    onSuccess: () => {
      toast({ title: "刪除成功", description: "互動記錄已刪除" });
      trpc.useUtils().interactions.list.invalidate({ customerId });
    },
    onError: (error) => {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!formData.title.trim()) {
      toast({ title: "請填寫標題", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      organizationId,
      customerId,
      ...formData,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除這筆互動記錄嗎？")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">載入中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">互動歷史</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              新增記錄
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增互動記錄</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">類型</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(interactionTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">標題</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：電話諮詢"
                />
              </div>
              <div>
                <label className="text-sm font-medium">內容</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="記錄詳細內容..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "新增中..." : "新增"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!interactions || interactions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            尚無互動記錄
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interactions.map((interaction) => {
            const Icon = interactionTypeIcons[interaction.type];
            return (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{interactionTypeLabels[interaction.type]}</Badge>
                          <span className="font-medium">{interaction.title}</span>
                        </div>
                        {interaction.content && (
                          <p className="text-sm text-muted-foreground mt-1">{interaction.content}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(interaction.createdAt).toLocaleString("zh-TW")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(interaction.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
