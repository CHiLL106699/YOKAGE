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
import { Plus, Edit, Trash2, Play, CheckCircle } from "lucide-react";

const ruleTypeLabels: Record<string, string> = {
  spending: "消費金額",
  visit_count: "到店次數",
  last_visit: "最後到店時間",
  member_level: "會員等級",
};

const operatorLabels = {
  ">=": "大於等於",
  "<=": "小於等於",
  ">": "大於",
  "<": "小於",
  "==": "等於",
};

export default function TagRulesManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tagId: "",
    name: "",
    description: "",
    ruleType: "spending" as "spending" | "visit_count" | "last_visit" | "member_level",
    operator: ">=" as ">=" | "<=" | ">" | "<" | "==",
    value: "",
    isActive: true,
  });

  // 假設 organizationId 為 1（實際應從 user context 取得）
  const organizationId = 1;

  // 查詢標籤規則
  const { data: rules, isLoading } = trpc.tagRules.list.useQuery({ organizationId });

  // 查詢所有標籤
  const { data: tags } = trpc.crmTags.list.useQuery({ organizationId });

  // 新增標籤規則
  const createMutation = trpc.tagRules.create.useMutation({
    onSuccess: () => {
      toast({ title: "新增成功", description: "標籤規則已新增" });
      setIsAddDialogOpen(false);
      setFormData({
        tagId: "",
        name: "",
        description: "",
        ruleType: "spending",
        operator: ">=",
        value: "",
        isActive: true,
      });
      trpc.useUtils().tagRules.list.invalidate({ organizationId });
    },
    onError: (error) => {
      toast({ title: "新增失敗", description: error.message, variant: "destructive" });
    },
  });

  // 刪除標籤規則
  const deleteMutation = trpc.tagRules.delete.useMutation({
    onSuccess: () => {
      toast({ title: "刪除成功", description: "標籤規則已刪除" });
      trpc.useUtils().tagRules.list.invalidate({ organizationId });
    },
    onError: (error) => {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    },
  });

  // 執行標籤規則
  const applyRulesMutation = trpc.tagRules.applyRules.useMutation({
    onSuccess: (data) => {
      toast({
        title: "執行成功",
        description: `已成功分配 ${data.assignedCount} 個標籤`,
      });
      trpc.useUtils().crmCustomers.list.invalidate();
    },
    onError: (error) => {
      toast({ title: "執行失敗", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!formData.tagId || !formData.name.trim() || !formData.value.trim()) {
      toast({ title: "請填寫所有必填欄位", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      organizationId,
      tagId: Number(formData.tagId),
      name: formData.name,
      description: formData.description,
      ruleType: formData.ruleType,
      condition: {
        operator: formData.operator,
        value: formData.ruleType === "member_level" ? formData.value : Number(formData.value),
      },
      isActive: formData.isActive,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除這個標籤規則嗎？")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleApplyRules = () => {
    if (confirm("確定要立即執行所有標籤規則嗎？這將為符合條件的客戶自動分配標籤。")) {
      applyRulesMutation.mutate({ organizationId });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">載入中...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">標籤規則管理</h1>
          <p className="text-muted-foreground mt-1">自動化標籤系統，根據客戶行為自動分配標籤</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleApplyRules}
            disabled={applyRulesMutation.isPending}
            variant="outline"
          >
            <Play className="w-4 h-4 mr-2" />
            {applyRulesMutation.isPending ? "執行中..." : "立即執行規則"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增規則
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新增標籤規則</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">標籤</label>
                  <Select
                    value={formData.tagId}
                    onValueChange={(value) => setFormData({ ...formData, tagId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇標籤" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags?.map((tag) => (
                        <SelectItem key={tag.id} value={String(tag.id)}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">規則名稱</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：VIP 客戶自動標籤"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">規則說明</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="說明規則的用途..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">規則類型</label>
                    <Select
                      value={formData.ruleType}
                      onValueChange={(value: any) => setFormData({ ...formData, ruleType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ruleTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">條件</label>
                    <Select
                      value={formData.operator}
                      onValueChange={(value: any) => setFormData({ ...formData, operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(operatorLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">數值</label>
                    <Input
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={formData.ruleType === "member_level" ? "例如：VIP" : "例如：100000"}
                    />
                  </div>
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
      </div>

      {!rules || rules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            尚無標籤規則，點擊「新增規則」開始建立自動化標籤系統
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => {
            const tag = tags?.find((t) => t.id === rule.tagId);
            const condition = rule.condition as { operator: string; value: number | string };
            return (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        {rule.isActive ? (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            啟用中
                          </Badge>
                        ) : (
                          <Badge variant="secondary">已停用</Badge>
                        )}
                        {tag && (
                          <Badge style={{ backgroundColor: (tag.color || '#6366f1') as string }} className="text-white">
                            {tag.name}
                          </Badge>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{ruleTypeLabels[rule.ruleType]}</Badge>
                        <span>{operatorLabels[condition.operator as keyof typeof operatorLabels]}</span>
                        <span className="font-medium">{condition.value}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
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
