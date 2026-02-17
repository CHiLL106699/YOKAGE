import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function RevenueTargetPage() {
  const [organizationId] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTarget, setNewTarget] = useState({
    targetType: "monthly" as "monthly" | "quarterly" | "yearly",
    targetYear: new Date().getFullYear(),
    targetMonth: new Date().getMonth() + 1,
    targetQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
    targetAmount: "",
    notes: "",
  });

  // 營收目標列表
  const { data: targets, refetch: refetchTargets } = trpc.revenueTarget.list.useQuery({
    organizationId,
    year: selectedYear,
  });

  // 當月達成率
  const currentMonth = new Date().getMonth() + 1;
  const { data: currentAchievement } = trpc.revenueTarget.getAchievement.useQuery({
    organizationId,
    year: selectedYear,
    month: currentMonth,
  });

  // 新增目標
  const createTarget = trpc.revenueTarget.create.useMutation({
    onSuccess: () => {
      toast.success("營收目標已新增");
      setIsAddDialogOpen(false);
      refetchTargets();
      setNewTarget({
        targetType: "monthly",
        targetYear: new Date().getFullYear(),
        targetMonth: new Date().getMonth() + 1,
        targetQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
        targetAmount: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const handleAddTarget = () => {
    if (!newTarget.targetAmount) {
      toast.error("請填寫目標金額");
      return;
    }

    createTarget.mutate({
      organizationId,
      targetType: newTarget.targetType,
      targetYear: newTarget.targetYear,
      targetMonth: newTarget.targetType === "monthly" ? newTarget.targetMonth : undefined,
      targetQuarter: newTarget.targetType === "quarterly" ? newTarget.targetQuarter : undefined,
      targetAmount: newTarget.targetAmount,
      notes: newTarget.notes || undefined,
    });
  };

  const getAchievementColor = (rate: number) => {
    if (rate >= 100) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getAchievementBadge = (rate: number) => {
    if (rate >= 100) return { label: "達標", variant: "default" as const, icon: <CheckCircle2 className="h-3 w-3" /> };
    if (rate >= 80) return { label: "接近", variant: "secondary" as const, icon: <TrendingUp className="h-3 w-3" /> };
    return { label: "落後", variant: "destructive" as const, icon: <AlertCircle className="h-3 w-3" /> };
  };

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  // 計算年度總目標與達成
  const yearlyStats = targets?.reduce((acc: Record<string, any>, t: Record<string, any>) => {
    if (t.targetType === 'monthly') {
      acc.totalTarget += Number(t.targetAmount);
      acc.totalActual += Number(t.actualAmount || 0);
    }
    return acc;
  }, { totalTarget: 0, totalActual: 0 }) || { totalTarget: 0, totalActual: 0 };

  const yearlyAchievementRate = yearlyStats.totalTarget > 0 
    ? Math.round((yearlyStats.totalActual / yearlyStats.totalTarget) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">營收目標追蹤</h1>
          <p className="text-muted-foreground">設定與追蹤月度、季度、年度營收目標</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>{year} 年</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增目標
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增營收目標</DialogTitle>
                <DialogDescription>設定月度、季度或年度營收目標</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>目標類型</Label>
                  <Select
                    value={newTarget.targetType}
                    onValueChange={(value: any) => setNewTarget(prev => ({ ...prev, targetType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">月度目標</SelectItem>
                      <SelectItem value="quarterly">季度目標</SelectItem>
                      <SelectItem value="yearly">年度目標</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>年份</Label>
                    <Select
                      value={newTarget.targetYear.toString()}
                      onValueChange={(value) => setNewTarget(prev => ({ ...prev, targetYear: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026].map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newTarget.targetType === "monthly" && (
                    <div className="space-y-2">
                      <Label>月份</Label>
                      <Select
                        value={newTarget.targetMonth.toString()}
                        onValueChange={(value) => setNewTarget(prev => ({ ...prev, targetMonth: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {monthNames.map((name, idx) => (
                            <SelectItem key={idx} value={(idx + 1).toString()}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {newTarget.targetType === "quarterly" && (
                    <div className="space-y-2">
                      <Label>季度</Label>
                      <Select
                        value={newTarget.targetQuarter.toString()}
                        onValueChange={(value) => setNewTarget(prev => ({ ...prev, targetQuarter: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Q1 (1-3月)</SelectItem>
                          <SelectItem value="2">Q2 (4-6月)</SelectItem>
                          <SelectItem value="3">Q3 (7-9月)</SelectItem>
                          <SelectItem value="4">Q4 (10-12月)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>目標金額</Label>
                  <Input
                    type="number"
                    value={newTarget.targetAmount}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, targetAmount: e.target.value }))}
                    placeholder="輸入目標金額"
                  />
                </div>
                <div className="space-y-2">
                  <Label>備註</Label>
                  <Input
                    value={newTarget.notes}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="選填"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>取消</Button>
                <Button onClick={handleAddTarget} disabled={createTarget.isPending}>
                  {createTarget.isPending ? "處理中..." : "新增"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 年度總覽 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年度目標</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${yearlyStats.totalTarget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{selectedYear} 年度總目標</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累計達成</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${yearlyStats.totalActual.toLocaleString()}
            </div>
            <Progress value={yearlyAchievementRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年度達成率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAchievementColor(yearlyAchievementRate)}`}>
              {yearlyAchievementRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {yearlyAchievementRate >= 100 ? '已達成年度目標！' : `還差 $${(yearlyStats.totalTarget - yearlyStats.totalActual).toLocaleString()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月達成</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAchievementColor(currentAchievement?.achievementRate || 0)}`}>
              {currentAchievement?.achievementRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${currentAchievement?.actual?.toLocaleString() || 0} / ${currentAchievement?.target?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 月度目標列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{selectedYear} 年月度目標</CardTitle>
          <CardDescription>各月營收目標與達成情況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {monthNames.map((name, idx) => {
              const monthTarget = targets?.find((t: Record<string, any>) => t.targetType === 'monthly' && t.targetMonth === idx + 1);
              const target = monthTarget ? Number(monthTarget.targetAmount) : 0;
              const actual = monthTarget ? Number(monthTarget.actualAmount || 0) : 0;
              const rate = target > 0 ? Math.round((actual / target) * 100) : 0;
              const badge = getAchievementBadge(rate);
              const isPast = idx + 1 < currentMonth;
              const isCurrent = idx + 1 === currentMonth;

              return (
                <Card key={idx} className={`${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{name}</CardTitle>
                      {target > 0 && (
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.icon}
                          <span className="ml-1">{badge.label}</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {target > 0 ? (
                      <>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className={`text-xl font-bold ${getAchievementColor(rate)}`}>{rate}%</span>
                          <span className="text-sm text-muted-foreground">
                            ${actual.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={Math.min(rate, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          目標: ${target.toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground">尚未設定目標</p>
                        {!isPast && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-1"
                            onClick={() => {
                              setNewTarget(prev => ({ ...prev, targetMonth: idx + 1 }));
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            設定
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
