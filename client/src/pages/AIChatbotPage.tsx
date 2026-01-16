import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Bot, 
  MessageSquare,
  Brain,
  Zap,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Target,
  ArrowRight,
  Send,
  RefreshCw
} from "lucide-react";

// AI Agent 模板
const agentTemplates = [
  {
    id: "customer_service",
    name: "智能客服",
    description: "處理常見問題、預約查詢、療程諮詢",
    icon: MessageSquare,
    color: "bg-blue-500",
    features: ["FAQ 自動回覆", "預約狀態查詢", "療程價格諮詢", "營業時間查詢"]
  },
  {
    id: "sales",
    name: "銷售助手",
    description: "產品推薦、優惠活動介紹、促進轉換",
    icon: Target,
    color: "bg-green-500",
    features: ["療程推薦", "優惠活動推播", "會員權益說明", "購買引導"]
  },
  {
    id: "appointment",
    name: "預約專員",
    description: "自動化預約流程、時段確認、提醒通知",
    icon: Clock,
    color: "bg-purple-500",
    features: ["線上預約", "時段查詢", "預約確認", "改期處理"]
  },
  {
    id: "aftercare",
    name: "術後關懷",
    description: "術後追蹤、注意事項提醒、回診預約",
    icon: Brain,
    color: "bg-pink-500",
    features: ["術後提醒", "注意事項", "回診預約", "問題諮詢"]
  }
];

// 模擬已部署的 AI Agent
const deployedAgents = [
  {
    id: 1,
    name: "YOChiLL 智能客服",
    template: "customer_service",
    status: "active",
    conversations: 1234,
    resolveRate: 85,
    avgResponseTime: "2.3s",
    lastUpdated: "2024-01-15"
  },
  {
    id: 2,
    name: "療程推薦助手",
    template: "sales",
    status: "active",
    conversations: 567,
    resolveRate: 72,
    avgResponseTime: "1.8s",
    lastUpdated: "2024-01-14"
  }
];

// 知識庫條目
const knowledgeBase = [
  { id: 1, category: "療程", title: "玻尿酸注射", content: "玻尿酸注射是一種非侵入性的醫美療程...", status: "active" },
  { id: 2, category: "療程", title: "肉毒桿菌", content: "肉毒桿菌素可用於改善動態紋路...", status: "active" },
  { id: 3, category: "價格", title: "療程價目表", content: "玻尿酸 1cc: NT$8,000 起...", status: "active" },
  { id: 4, category: "營業", title: "營業時間", content: "週一至週五 12:00-20:30...", status: "active" },
  { id: 5, category: "FAQ", title: "術後注意事項", content: "療程後 24 小時內避免...", status: "active" }
];

export default function AIChatbotPage() {
  const [activeTab, setActiveTab] = useState("agents");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(false);

  const handleTestChat = async () => {
    if (!testMessage.trim()) return;
    setIsTestLoading(true);
    
    // 模擬 AI 回覆
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      "您好！感謝您的詢問。我們的玻尿酸療程價格從 NT$8,000/cc 起，實際價格會依據注射部位和劑量而定。建議您預約諮詢，讓醫師為您評估最適合的療程方案。需要幫您預約嗎？",
      "您好！我們的營業時間為週一至週五 12:00-20:30，週六 10:30-19:00，週日休診。您可以透過 LINE 或電話預約，我們會盡快為您安排。",
      "感謝您的詢問！術後建議避免按壓注射部位、24小時內不要化妝、一週內避免三溫暖和激烈運動。如有任何不適，請隨時與我們聯繫。"
    ];
    
    setTestResponse(responses[Math.floor(Math.random() * responses.length)]);
    setIsTestLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI 智能客服</h1>
            <p className="text-gray-500 mt-1">管理 AI Agent、知識庫與對話流程</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            建立 AI Agent
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總對話數</p>
                  <p className="text-2xl font-bold">12,847</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +23% 較上月
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">AI 解決率</p>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5% 較上月
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均回應時間</p>
                  <p className="text-2xl font-bold">2.1s</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    -0.3s 較上月
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">節省人力成本</p>
                  <p className="text-2xl font-bold">NT$45K</p>
                  <p className="text-xs text-gray-500 mt-1">本月估算</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="agents">
              <Bot className="w-4 h-4 mr-2" />
              AI Agent
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <BookOpen className="w-4 h-4 mr-2" />
              知識庫
            </TabsTrigger>
            <TabsTrigger value="flows">
              <Zap className="w-4 h-4 mr-2" />
              對話流程
            </TabsTrigger>
            <TabsTrigger value="test">
              <MessageSquare className="w-4 h-4 mr-2" />
              測試對話
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              數據分析
            </TabsTrigger>
          </TabsList>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            {/* Agent Templates */}
            <Card>
              <CardHeader>
                <CardTitle>AI Agent 模板</CardTitle>
                <CardDescription>選擇預建模板快速部署 AI Agent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {agentTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id ? 'border-primary ring-2 ring-primary/20' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center mb-3`}>
                        <template.icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {template.features.slice(0, 2).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deployed Agents */}
            <Card>
              <CardHeader>
                <CardTitle>已部署的 AI Agent</CardTitle>
                <CardDescription>管理您的 AI Agent 實例</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deployedAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          agent.template === 'customer_service' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <Bot className={`w-6 h-6 ${
                            agent.template === 'customer_service' ? 'text-blue-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{agent.name}</h4>
                            <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {agent.status === 'active' ? '運行中' : '已暫停'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{agent.conversations} 對話</span>
                            <span>解決率 {agent.resolveRate}%</span>
                            <span>回應 {agent.avgResponseTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>知識庫管理</CardTitle>
                    <CardDescription>管理 AI Agent 的知識來源</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增知識
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {knowledgeBase.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.category}</Badge>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-500 truncate max-w-md">{item.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {item.status === 'active' ? '啟用' : '停用'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dialog Flows Tab */}
          <TabsContent value="flows" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>對話流程設計</CardTitle>
                    <CardDescription>設計多輪對話流程與意圖識別</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增流程
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 預約流程 */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">預約諮詢流程</h4>
                      <Badge className="bg-green-100 text-green-800">啟用中</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">1</div>
                        <span>觸發：「預約」、「想約」、「諮詢」</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">2</div>
                        <span>詢問療程類型</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">3</div>
                        <span>顯示可預約時段</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</div>
                        <span>確認預約</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">編輯</Button>
                      <Button variant="outline" size="sm">測試</Button>
                    </div>
                  </div>

                  {/* 價格查詢流程 */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">價格查詢流程</h4>
                      <Badge className="bg-green-100 text-green-800">啟用中</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">1</div>
                        <span>觸發：「價格」、「多少錢」、「費用」</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">2</div>
                        <span>識別療程類型</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">3</div>
                        <span>回覆價格資訊</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-3" />
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs">?</div>
                        <span>詢問是否預約</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">編輯</Button>
                      <Button variant="outline" size="sm">測試</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Chat Tab */}
          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>測試對話</CardTitle>
                <CardDescription>測試 AI Agent 的回應品質</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chat Interface */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <span className="font-medium">YOChiLL 智能客服</span>
                      <Badge className="bg-green-100 text-green-800 ml-auto">線上</Badge>
                    </div>
                    <div className="h-80 p-4 overflow-y-auto bg-gray-50">
                      {testResponse && (
                        <div className="space-y-4">
                          <div className="flex justify-end">
                            <div className="bg-primary text-white rounded-lg px-4 py-2 max-w-xs">
                              {testMessage}
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-white border rounded-lg px-4 py-2 max-w-xs">
                              {testResponse}
                            </div>
                          </div>
                        </div>
                      )}
                      {!testResponse && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>輸入訊息開始測試</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t flex gap-2">
                      <Input 
                        placeholder="輸入測試訊息..." 
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                      />
                      <Button onClick={handleTestChat} disabled={isTestLoading}>
                        {isTestLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Test Scenarios */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">快速測試情境</h4>
                    <div className="space-y-2">
                      {[
                        "玻尿酸多少錢？",
                        "我想預約下週三下午",
                        "術後要注意什麼？",
                        "你們營業時間是？",
                        "有什麼優惠活動嗎？"
                      ].map((scenario, idx) => (
                        <Button 
                          key={idx} 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            setTestMessage(scenario);
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {scenario}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>對話趨勢</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>對話量趨勢圖</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>意圖分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { intent: "價格查詢", count: 456, percentage: 35 },
                      { intent: "預約諮詢", count: 324, percentage: 25 },
                      { intent: "療程資訊", count: 260, percentage: 20 },
                      { intent: "術後問題", count: 156, percentage: 12 },
                      { intent: "其他", count: 104, percentage: 8 }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.intent}</span>
                          <span className="text-gray-500">{item.count} ({item.percentage}%)</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>解決率分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>AI 完全解決</span>
                      </div>
                      <span className="font-semibold text-green-600">78%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span>需人工協助</span>
                      </div>
                      <span className="font-semibold text-yellow-600">15%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span>無法解決</span>
                      </div>
                      <span className="font-semibold text-red-600">7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>熱門問題</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { question: "玻尿酸價格", count: 234 },
                      { question: "預約時間", count: 189 },
                      { question: "術後注意事項", count: 156 },
                      { question: "肉毒效果", count: 123 },
                      { question: "優惠活動", count: 98 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm">{item.question}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
