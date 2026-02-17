/**
 * 客戶行銷自動化管理頁面
 * 整合 RFM 分析、沉睡客戶喚醒、療程提醒等功能
 */
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { QueryLoading } from '@/components/ui/query-state';

import {
  Users,
  TrendingUp,
  Clock,
  Send,
  Bell,
  Target,
  UserMinus,
  Gift,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Calendar,
  MessageSquare,
  Zap,
} from 'lucide-react';

export default function CustomerMarketingPage() {
  // toast from sonner
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunningRfm, setIsRunningRfm] = useState(false);
  const [isRunningDormant, setIsRunningDormant] = useState(false);
  const [isRunningTreatment, setIsRunningTreatment] = useState(false);
  const [dormantDays, setDormantDays] = useState('30');
  const [specialOffer, setSpecialOffer] = useState('');
  const [treatmentDays, setTreatmentDays] = useState('3');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // API 查詢
  const rfmSummary = trpc.rfm.getSummary.useQuery({});
  const dormantStats = trpc.line.getDormantStats.useQuery({});
  const commissionSummary = trpc.commission.getSummaryStats.useQuery({});

  // API 變更
  const performRfmAnalysis = trpc.rfm.performAnalysis.useMutation({
    onSuccess: (data) => {
      toast.success(`RFM 分析完成，已分析 ${data.totalCustomers} 位客戶`);
      rfmSummary.refetch();
      setIsRunningRfm(false);
    },
    onError: (error) => {
      toast.error(`分析失敗: ${error.message}`);
      setIsRunningRfm(false);
    },
  });

  const sendDormantReminders = trpc.line.sendDormantReminders.useMutation({
    onSuccess: (data) => {
      toast.success(`沉睡客戶喚醒完成，已發送 ${data.remindersSent} 則提醒`);
      dormantStats.refetch();
      setIsRunningDormant(false);
    },
    onError: (error) => {
      toast.error(`發送失敗: ${error.message}`);
      setIsRunningDormant(false);
    },
  });

  const sendTreatmentReminders = trpc.line.sendTreatmentReminders.useMutation({
    onSuccess: (data) => {
      toast.success(`療程提醒發送完成，已發送 ${data.remindersSent} 則提醒`);
      setIsRunningTreatment(false);
    },
    onError: (error) => {
      toast.error(`發送失敗: ${error.message}`);
      setIsRunningTreatment(false);
    },
  });

  const handleRunRfmAnalysis = () => {
    setIsRunningRfm(true);
    performRfmAnalysis.mutate({});
  };

  const handleSendDormantReminders = () => {
    setIsRunningDormant(true);
    sendDormantReminders.mutate({
      minDays: parseInt(dormantDays),
      maxDays: 180,
      specialOffer: specialOffer || undefined,
    });
  };

  const handleSendTreatmentReminders = () => {
    setIsRunningTreatment(true);
    sendTreatmentReminders.mutate({
      daysBeforeExpiry: parseInt(treatmentDays),
    });
  };

  // RFM 分群顏色
  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      champions: 'bg-green-500',
      loyal_customers: 'bg-blue-500',
      potential_loyalists: 'bg-cyan-500',
      new_customers: 'bg-purple-500',
      promising: 'bg-indigo-500',
      need_attention: 'bg-yellow-500',
      about_to_sleep: 'bg-orange-500',
      at_risk: 'bg-red-400',
      cant_lose: 'bg-red-600',
      hibernating: 'bg-gray-500',
      lost: 'bg-gray-700',
    };
    return colors[segment] || 'bg-gray-400';
  };

  const getSegmentLabel = (segment: string) => {
    const labels: Record<string, string> = {
      champions: '冠軍客戶',
      loyal_customers: '忠誠客戶',
      potential_loyalists: '潛力忠誠',
      new_customers: '新客戶',
      promising: '有潛力',
      need_attention: '需關注',
      about_to_sleep: '即將沉睡',
      at_risk: '有風險',
      cant_lose: '不可流失',
      hibernating: '休眠中',
      lost: '已流失',
    };
    return labels[segment] || segment;
  };

  if (rfmSummary.isLoading) {
    return (
      <div className="p-6">
        <QueryLoading variant="skeleton-cards" />
      </div>
    );
  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">客戶行銷自動化</h1>
            <p className="text-muted-foreground mt-1">
              智能分析客戶行為，自動化行銷推播，提升回購率
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            自動化設定
          </Button>
        </div>

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總客戶數</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rfmSummary.data?.totalCustomers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                已完成 RFM 分析
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">沉睡客戶</CardTitle>
              <UserMinus className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {dormantStats.data?.totalDormant || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                30天以上未回診
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">高風險客戶</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {rfmSummary.data?.segmentDistribution?.at_risk || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                流失風險 &gt; 50%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月佣金</CardTitle>
              <Gift className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${commissionSummary.data?.currentMonth?.totalCommission?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                待發放佣金
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主要功能區 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="rfm">RFM 分析</TabsTrigger>
            <TabsTrigger value="dormant">沉睡喚醒</TabsTrigger>
            <TabsTrigger value="treatment">療程提醒</TabsTrigger>
            <TabsTrigger value="commission">員工佣金</TabsTrigger>
          </TabsList>

          {/* 總覽 Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    快速操作
                  </CardTitle>
                  <CardDescription>一鍵執行常用行銷任務</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleRunRfmAnalysis}
                    disabled={isRunningRfm}
                  >
                    {isRunningRfm ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    執行 RFM 分析
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleSendDormantReminders}
                    disabled={isRunningDormant}
                  >
                    {isRunningDormant ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4 mr-2" />
                    )}
                    發送沉睡客戶喚醒
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleSendTreatmentReminders}
                    disabled={isRunningTreatment}
                  >
                    {isRunningTreatment ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    發送療程到期提醒
                  </Button>
                </CardContent>
              </Card>

              {/* 自動化狀態 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    自動化狀態
                  </CardTitle>
                  <CardDescription>已啟用的自動化任務</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">療程到期提醒</span>
                    </div>
                    <Badge variant="outline">每日 09:00</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm">沉睡客戶喚醒</span>
                    </div>
                    <Badge variant="outline">每週一 10:00</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-sm">RFM 分析更新</span>
                    </div>
                    <Badge variant="outline">每月 1 日</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <span className="text-sm">生日優惠推送</span>
                    </div>
                    <Badge variant="secondary">未啟用</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 最近活動 */}
            <Card>
              <CardHeader>
                <CardTitle>最近行銷活動</CardTitle>
                <CardDescription>過去 7 天的自動化執行記錄</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Send className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">療程到期提醒</p>
                      <p className="text-sm text-muted-foreground">發送 12 則提醒給即將到期客戶</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">今天 09:00</p>
                      <Badge variant="outline" className="text-green-600">成功</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">RFM 分析更新</p>
                      <p className="text-sm text-muted-foreground">分析 156 位客戶的消費行為</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">昨天 00:00</p>
                      <Badge variant="outline" className="text-green-600">成功</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <UserMinus className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">沉睡客戶喚醒</p>
                      <p className="text-sm text-muted-foreground">發送 8 則喚醒訊息</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">週一 10:00</p>
                      <Badge variant="outline" className="text-green-600">成功</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RFM 分析 Tab */}
          <TabsContent value="rfm" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>RFM 客戶分群</CardTitle>
                    <CardDescription>
                      根據最近消費時間(R)、消費頻率(F)、消費金額(M)進行客戶分群
                    </CardDescription>
                  </div>
                  <Button onClick={handleRunRfmAnalysis} disabled={isRunningRfm}>
                    {isRunningRfm ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        執行分析
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {rfmSummary.data?.segmentDistribution ? (
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {Object.entries(rfmSummary.data.segmentDistribution).map(([segment, count]) => (
                      <div
                        key={segment}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-3 w-3 rounded-full ${getSegmentColor(segment)}`} />
                          <span className="font-medium">{getSegmentLabel(segment)}</span>
                        </div>
                        <p className="text-2xl font-bold">{count as number}</p>
                        <p className="text-xs text-muted-foreground">
                          {((count as number) / (rfmSummary.data?.totalCustomers || 1) * 100).toFixed(1)}% 佔比
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>尚未執行 RFM 分析</p>
                    <p className="text-sm">點擊「執行分析」開始分析客戶資料</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RFM 說明 */}
            <Card>
              <CardHeader>
                <CardTitle>RFM 分群說明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="font-medium">冠軍客戶</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      最近消費、頻繁消費、高消費金額。應給予 VIP 待遇，維持關係。
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="font-medium">需關注</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      曾經是好客戶，但最近較少消費。需要主動關懷，了解原因。
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="font-medium">有風險</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      曾經是高價值客戶，但已很久沒消費。需要立即採取挽回措施。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 沉睡喚醒 Tab */}
          <TabsContent value="dormant" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>沉睡客戶統計</CardTitle>
                  <CardDescription>依未回診天數分布</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>30-60 天</span>
                      <span className="font-medium">{dormantStats.data?.dormant30Days || 0} 人</span>
                    </div>
                    <Progress value={((dormantStats.data?.dormant30Days || 0) / (dormantStats.data?.totalDormant || 1)) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>60-90 天</span>
                      <span className="font-medium">{dormantStats.data?.dormant60Days || 0} 人</span>
                    </div>
                    <Progress value={((dormantStats.data?.dormant60Days || 0) / (dormantStats.data?.totalDormant || 1)) * 100} className="h-2 bg-orange-100 [&>div]:bg-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>90-180 天</span>
                      <span className="font-medium">{dormantStats.data?.dormant90Days || 0} 人</span>
                    </div>
                    <Progress value={((dormantStats.data?.dormant90Days || 0) / (dormantStats.data?.totalDormant || 1)) * 100} className="h-2 bg-red-100 [&>div]:bg-red-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>&gt; 180 天</span>
                      <span className="font-medium">{dormantStats.data?.dormant180Days || 0} 人</span>
                    </div>
                    <Progress value={((dormantStats.data?.dormant180Days || 0) / (dormantStats.data?.totalDormant || 1)) * 100} className="h-2 bg-gray-100 [&>div]:bg-gray-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>發送喚醒訊息</CardTitle>
                  <CardDescription>向沉睡客戶發送 LINE 喚醒訊息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>目標客戶（未回診天數）</Label>
                    <Select value={dormantDays} onValueChange={setDormantDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 天以上</SelectItem>
                        <SelectItem value="60">60 天以上</SelectItem>
                        <SelectItem value="90">90 天以上</SelectItem>
                        <SelectItem value="120">120 天以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>專屬優惠（選填）</Label>
                    <Textarea
                      placeholder="例如：回歸享 9 折優惠，限時 7 天"
                      value={specialOffer}
                      onChange={(e) => setSpecialOffer(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendDormantReminders}
                    disabled={isRunningDormant}
                  >
                    {isRunningDormant ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        發送中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        發送喚醒訊息
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 療程提醒 Tab */}
          <TabsContent value="treatment" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>療程到期提醒設定</CardTitle>
                  <CardDescription>設定療程到期前的提醒時間</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>提前提醒天數</Label>
                    <Select value={treatmentDays} onValueChange={setTreatmentDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 天前</SelectItem>
                        <SelectItem value="3">3 天前</SelectItem>
                        <SelectItem value="7">7 天前</SelectItem>
                        <SelectItem value="14">14 天前</SelectItem>
                        <SelectItem value="30">30 天前</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendTreatmentReminders}
                    disabled={isRunningTreatment}
                  >
                    {isRunningTreatment ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        發送中...
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        立即發送提醒
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>自動提醒設定</CardTitle>
                  <CardDescription>設定自動發送提醒的時間</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">每日自動提醒</p>
                      <p className="text-sm text-muted-foreground">每天 09:00 自動發送</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">已啟用</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">提醒天數</p>
                      <p className="text-sm text-muted-foreground">療程到期前 3 天</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 員工佣金 Tab */}
          <TabsContent value="commission" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>員工佣金統計</CardTitle>
                    <CardDescription>本月員工業績與佣金計算</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    選擇月份
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">本月總業績</p>
                    <p className="text-2xl font-bold">
                      ${commissionSummary.data?.currentMonth?.totalCommission?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">待發放佣金</p>
                    <p className="text-2xl font-bold text-orange-500">
                      ${commissionSummary.data?.currentMonth?.totalCommission?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">已發放佣金</p>
                    <p className="text-2xl font-bold text-green-500">
                      ${commissionSummary.data?.lastMonth?.totalCommission?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>員工佣金排行榜</p>
                  <p className="text-sm">需要有訂單資料才能計算佣金</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 自動化設定對話框 */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>自動化設定</DialogTitle>
              <DialogDescription>
                設定自動執行的行銷任務
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">療程到期自動提醒</p>
                  <p className="text-sm text-muted-foreground">每日 09:00 自動發送療程到期提醒</p>
                </div>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  啟用
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">沉睡客戶自動喚醒</p>
                  <p className="text-sm text-muted-foreground">每週一 10:00 自動發送喚醒訊息</p>
                </div>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  啟用
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">RFM 分析自動更新</p>
                  <p className="text-sm text-muted-foreground">每月 1 日 00:00 自動執行 RFM 分析</p>
                </div>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  啟用
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">生日優惠自動推送</p>
                  <p className="text-sm text-muted-foreground">客戶生日當天自動發送優惠訊息</p>
                </div>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  啟用
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                關閉
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
