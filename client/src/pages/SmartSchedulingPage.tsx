import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  BarChart3,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Bell,
  MessageSquare
} from "lucide-react";

// 預約優化建議
const optimizationSuggestions = [
  {
    id: 1,
    type: "capacity",
    title: "週六下午產能不足",
    description: "預測週六 14:00-18:00 預約需求高於目前產能 35%",
    impact: "high",
    suggestion: "建議增加 1 名醫師值班或開放加班時段",
    potentialRevenue: 85000
  },
  {
    id: 2,
    type: "gap",
    title: "週三上午空檔過多",
    description: "週三 09:00-12:00 平均利用率僅 45%",
    impact: "medium",
    suggestion: "建議推出週三限定優惠吸引預約",
    potentialRevenue: 45000
  },
  {
    id: 3,
    type: "noshow",
    title: "高爽約風險預警",
    description: "檢測到 5 位顧客有較高爽約風險",
    impact: "medium",
    suggestion: "建議發送預約確認提醒",
    potentialRevenue: 35000
  }
];

// 時段分析
const timeSlotAnalysis = [
  { time: "09:00", demand: 65, capacity: 80, utilization: 81 },
  { time: "10:00", demand: 85, capacity: 80, utilization: 100 },
  { time: "11:00", demand: 90, capacity: 80, utilization: 100 },
  { time: "12:00", demand: 45, capacity: 80, utilization: 56 },
  { time: "13:00", demand: 35, capacity: 80, utilization: 44 },
  { time: "14:00", demand: 95, capacity: 80, utilization: 100 },
  { time: "15:00", demand: 100, capacity: 80, utilization: 100 },
  { time: "16:00", demand: 88, capacity: 80, utilization: 100 },
  { time: "17:00", demand: 75, capacity: 80, utilization: 94 },
  { time: "18:00", demand: 55, capacity: 80, utilization: 69 }
];

// 自動化規則
const automationRules = [
  {
    id: 1,
    name: "預約確認提醒",
    trigger: "預約前 24 小時",
    action: "發送 LINE 提醒訊息",
    status: "active",
    executions: 1256
  },
  {
    id: 2,
    name: "爽約風險預警",
    trigger: "偵測到高風險預約",
    action: "發送額外確認 + 通知櫃檯",
    status: "active",
    executions: 89
  },
  {
    id: 3,
    name: "候補名單通知",
    trigger: "有人取消預約",
    action: "自動通知候補名單",
    status: "active",
    executions: 156
  },
  {
    id: 4,
    name: "尖峰時段加價",
    trigger: "熱門時段預約",
    action: "顯示尖峰時段提示",
    status: "paused",
    executions: 0
  }
];

export default function SmartSchedulingPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">智能排程</h1>
            <p className="text-gray-500 mt-1">AI 預約優化、產能分析與自動化管理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新分析
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              排程設定
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均利用率</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">爽約率</p>
                  <p className="text-2xl font-bold text-green-600">3.2%</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowDown className="w-3 h-3" />
                    -1.5% 較上月
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">候補成功</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">優化建議</p>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">潛在營收</p>
                  <p className="text-2xl font-bold text-green-600">+NT$165K</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <Brain className="w-4 h-4 mr-2" />
              AI 建議
            </TabsTrigger>
            <TabsTrigger value="capacity">
              <BarChart3 className="w-4 h-4 mr-2" />
              產能分析
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Zap className="w-4 h-4 mr-2" />
              自動化規則
            </TabsTrigger>
            <TabsTrigger value="waitlist">
              <Users className="w-4 h-4 mr-2" />
              候補管理
            </TabsTrigger>
            <TabsTrigger value="noshow">
              <AlertTriangle className="w-4 h-4 mr-2" />
              爽約預防
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <CardTitle>AI 優化建議</CardTitle>
                </div>
                <CardDescription>根據歷史數據與預測分析生成的優化建議</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className={`p-4 border rounded-lg ${
                      suggestion.impact === 'high' ? 'border-red-200 bg-red-50' :
                      suggestion.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            suggestion.impact === 'high' ? 'bg-red-100' :
                            suggestion.impact === 'medium' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            {suggestion.type === 'capacity' && <Users className={`w-5 h-5 ${
                              suggestion.impact === 'high' ? 'text-red-600' : 'text-yellow-600'
                            }`} />}
                            {suggestion.type === 'gap' && <Clock className="w-5 h-5 text-yellow-600" />}
                            {suggestion.type === 'noshow' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{suggestion.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                            <div className="mt-2 p-2 bg-white rounded-lg">
                              <p className="text-sm">
                                <span className="font-medium">建議：</span>
                                {suggestion.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">潛在營收</p>
                          <p className="font-bold text-green-600">+NT${suggestion.potentialRevenue.toLocaleString()}</p>
                          <Button size="sm" className="mt-2">
                            執行建議
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Capacity Tab */}
          <TabsContent value="capacity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>時段產能分析</CardTitle>
                <CardDescription>各時段的需求與產能對比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeSlotAnalysis.map((slot) => (
                    <div key={slot.time} className="flex items-center gap-4">
                      <span className="w-16 text-sm font-medium">{slot.time}</span>
                      <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className={`absolute inset-y-0 left-0 ${
                            slot.utilization >= 100 ? 'bg-red-400' :
                            slot.utilization >= 80 ? 'bg-yellow-400' :
                            'bg-green-400'
                          }`}
                          style={{ width: `${Math.min(slot.utilization, 100)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                          {slot.utilization}%
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className="text-sm text-gray-500">
                          {slot.demand}/{slot.capacity}
                        </span>
                      </div>
                      {slot.demand > slot.capacity && (
                        <Badge className="bg-red-100 text-red-800">超載</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded" />
                    <span>正常 (&lt;80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded" />
                    <span>忙碌 (80-99%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded" />
                    <span>超載 (≥100%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>自動化規則</CardTitle>
                    <CardDescription>預約相關的自動化流程</CardDescription>
                  </div>
                  <Button>
                    <Zap className="w-4 h-4 mr-2" />
                    新增規則
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{rule.name}</h4>
                            <Badge className={rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {rule.status === 'active' ? '啟用中' : '已暫停'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>觸發：{rule.trigger}</span>
                            <span className="mx-2">→</span>
                            <Bell className="w-4 h-4" />
                            <span>動作：{rule.action}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">執行次數</p>
                            <p className="font-semibold">{rule.executions}</p>
                          </div>
                          <Switch checked={rule.status === 'active'} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Waitlist Tab */}
          <TabsContent value="waitlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>候補名單管理</CardTitle>
                <CardDescription>自動候補通知與管理</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { customer: "王小美", treatment: "玻尿酸", preferredTime: "週六下午", waitingSince: "2024-01-10", priority: "high" },
                    { customer: "李小華", treatment: "皮秒雷射", preferredTime: "週三上午", waitingSince: "2024-01-12", priority: "medium" },
                    { customer: "張大偉", treatment: "肉毒桿菌", preferredTime: "任何時段", waitingSince: "2024-01-15", priority: "low" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{item.customer}</h4>
                            <Badge className={
                              item.priority === 'high' ? 'bg-red-100 text-red-800' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {item.priority === 'high' ? '高優先' :
                               item.priority === 'medium' ? '中優先' : '一般'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.treatment} • 偏好：{item.preferredTime}
                          </p>
                          <p className="text-xs text-gray-400">等候自 {item.waitingSince}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            通知
                          </Button>
                          <Button size="sm">
                            安排預約
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* No-show Tab */}
          <TabsContent value="noshow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>爽約風險預警</CardTitle>
                <CardDescription>AI 預測的高爽約風險預約</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { customer: "陳小明", date: "2024-01-20", time: "14:00", treatment: "玻尿酸", risk: 75, reason: "過去 3 次預約有 2 次爽約" },
                    { customer: "林小芳", date: "2024-01-21", time: "10:00", treatment: "皮秒雷射", risk: 60, reason: "首次預約，無歷史紀錄" },
                    { customer: "黃大偉", date: "2024-01-22", time: "16:00", treatment: "肉毒桿菌", risk: 55, reason: "預約後未讀取確認訊息" }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 border rounded-lg ${
                      item.risk >= 70 ? 'border-red-200 bg-red-50' :
                      item.risk >= 50 ? 'border-yellow-200 bg-yellow-50' :
                      ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{item.customer}</h4>
                            <Badge className={
                              item.risk >= 70 ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              風險 {item.risk}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.date} {item.time} • {item.treatment}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {item.reason}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Bell className="w-4 h-4 mr-2" />
                            發送提醒
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            電話確認
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
