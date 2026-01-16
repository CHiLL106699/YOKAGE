import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Star,
  Paperclip,
  Image,
  Smile,
  Zap,
  BarChart3,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Settings,
  Bot,
  UserPlus,
  Archive,
  Inbox,
  MessageCircle
} from "lucide-react";

// 渠道圖標
const channelIcons: Record<string, { icon: React.ReactNode; color: string; name: string }> = {
  line: { icon: <MessageSquare className="w-4 h-4" />, color: "bg-green-500", name: "LINE" },
  facebook: { icon: <MessageCircle className="w-4 h-4" />, color: "bg-blue-600", name: "Facebook" },
  instagram: { icon: <Image className="w-4 h-4" />, color: "bg-pink-500", name: "Instagram" },
  website: { icon: <MessageSquare className="w-4 h-4" />, color: "bg-gray-500", name: "網站" }
};

// 模擬對話列表
const conversations = [
  {
    id: 1,
    customer: { name: "王小美", avatar: "", tags: ["VIP", "玻尿酸愛好者"] },
    channel: "line",
    lastMessage: "請問玻尿酸補打的價格是多少？",
    time: "2 分鐘前",
    unread: 2,
    status: "waiting",
    assignee: null
  },
  {
    id: 2,
    customer: { name: "李小華", avatar: "", tags: ["新客"] },
    channel: "facebook",
    lastMessage: "我想預約下週三下午",
    time: "15 分鐘前",
    unread: 0,
    status: "active",
    assignee: "客服 A"
  },
  {
    id: 3,
    customer: { name: "張大偉", avatar: "", tags: ["高消費"] },
    channel: "instagram",
    lastMessage: "術後第三天，想問一下這樣正常嗎？",
    time: "30 分鐘前",
    unread: 1,
    status: "waiting",
    assignee: null
  },
  {
    id: 4,
    customer: { name: "陳小芳", avatar: "", tags: [] },
    channel: "website",
    lastMessage: "謝謝您的回覆！",
    time: "1 小時前",
    unread: 0,
    status: "resolved",
    assignee: "客服 B"
  }
];

// 模擬訊息
const messages = [
  { id: 1, sender: "customer", content: "你好，我想詢問一下玻尿酸的價格", time: "14:30" },
  { id: 2, sender: "agent", content: "您好！感謝您的詢問。我們的玻尿酸療程價格從 NT$8,000/cc 起，實際價格會依據注射部位和劑量而定。", time: "14:32" },
  { id: 3, sender: "customer", content: "那蘋果肌大概需要多少？", time: "14:33" },
  { id: 4, sender: "agent", content: "蘋果肌填充通常需要 2-4cc，費用約 NT$16,000-32,000。建議您預約諮詢，讓醫師為您評估最適合的劑量。", time: "14:35" },
  { id: 5, sender: "customer", content: "請問玻尿酸補打的價格是多少？", time: "14:40" }
];

// 快捷回覆
const quickReplies = [
  "您好！感謝您的詢問，請問有什麼可以幫您的？",
  "好的，我幫您查詢一下，請稍等。",
  "感謝您的耐心等候！",
  "如有其他問題，歡迎隨時詢問。",
  "祝您有美好的一天！"
];

// 客服人員
const agents = [
  { id: 1, name: "客服 A", status: "online", conversations: 5, avgResponseTime: "1.2 分鐘" },
  { id: 2, name: "客服 B", status: "online", conversations: 3, avgResponseTime: "2.5 分鐘" },
  { id: 3, name: "客服 C", status: "away", conversations: 0, avgResponseTime: "-" }
];

export default function MessageCenterPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [filterChannel, setFilterChannel] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    toast.success("訊息已發送");
    setMessageInput("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">訊息中心</h1>
            <p className="text-gray-500 mt-1">統一管理多渠道訊息與即時客服</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
            <Button>
              <Bot className="w-4 h-4 mr-2" />
              AI 助手
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待處理</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">處理中</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">今日已解決</p>
                  <p className="text-2xl font-bold text-green-600">45</p>
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
                  <p className="text-sm text-gray-500">平均回應</p>
                  <p className="text-2xl font-bold">1.8 分</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">滿意度</p>
                  <p className="text-2xl font-bold">4.8</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-320px)]">
          {/* Conversation List */}
          <Card className="col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">對話列表</CardTitle>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Input placeholder="搜尋..." className="flex-1" />
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              {/* Channel Filters */}
              <div className="flex gap-1 mt-2">
                <Button 
                  variant={filterChannel === null ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterChannel(null)}
                >
                  全部
                </Button>
                {Object.entries(channelIcons).map(([key, value]) => (
                  <Button 
                    key={key}
                    variant={filterChannel === key ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterChannel(key)}
                  >
                    {value.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-520px)]">
                {conversations
                  .filter(c => !filterChannel || c.channel === filterChannel)
                  .map((conv) => (
                  <div 
                    key={conv.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conv.customer.avatar} />
                          <AvatarFallback>{conv.customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${channelIcons[conv.channel].color} rounded-full flex items-center justify-center`}>
                          {channelIcons[conv.channel].icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{conv.customer.name}</span>
                          <span className="text-xs text-gray-500">{conv.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {conv.customer.tags.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1">
                              {tag}
                            </Badge>
                          ))}
                          {conv.unread > 0 && (
                            <Badge className="bg-red-500 ml-auto">{conv.unread}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-6">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedConversation.customer.avatar} />
                        <AvatarFallback>{selectedConversation.customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{selectedConversation.customer.name}</span>
                          <Badge className={channelIcons[selectedConversation.channel].color}>
                            {channelIcons[selectedConversation.channel].name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {selectedConversation.customer.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        轉接
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="w-4 h-4 mr-2" />
                        結案
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-620px)] p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${
                            msg.sender === 'agent' 
                              ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg' 
                              : 'bg-gray-100 rounded-r-lg rounded-tl-lg'
                          } px-4 py-2`}>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'}`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t bg-gray-50">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickReplies.map((reply, idx) => (
                      <Button 
                        key={idx} 
                        variant="outline" 
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => setMessageInput(reply)}
                      >
                        {reply.slice(0, 15)}...
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Image className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Input 
                      placeholder="輸入訊息..." 
                      className="flex-1"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>選擇一個對話開始</p>
                </div>
              </div>
            )}
          </Card>

          {/* Customer Info & Agent Panel */}
          <Card className="col-span-3">
            <Tabs defaultValue="customer">
              <TabsList className="w-full">
                <TabsTrigger value="customer" className="flex-1">顧客資訊</TabsTrigger>
                <TabsTrigger value="agents" className="flex-1">客服人員</TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="p-4">
                {selectedConversation && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Avatar className="w-16 h-16 mx-auto">
                        <AvatarImage src={selectedConversation.customer.avatar} />
                        <AvatarFallback className="text-xl">
                          {selectedConversation.customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold mt-2">{selectedConversation.customer.name}</h4>
                      <div className="flex justify-center gap-1 mt-1">
                        {selectedConversation.customer.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">累積消費</p>
                        <p className="font-semibold">NT$156,000</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">到訪次數</p>
                        <p className="font-semibold">24 次</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">最近療程</p>
                        <p className="font-semibold">玻尿酸 - 蘋果肌</p>
                        <p className="text-xs text-gray-500">2024-01-10</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        查看完整資料
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Tag className="w-4 h-4 mr-2" />
                        新增標籤
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="agents" className="p-4">
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            agent.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <Badge variant="secondary">{agent.conversations} 對話</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        平均回應：{agent.avgResponseTime}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">AI 助手</span>
                    <Badge className="bg-green-100 text-green-800">運行中</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    已自動回覆 234 則訊息
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
