import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Phone,
  ChevronRight,
  Bell,
  Sparkles,
  Heart,
  Package
} from "lucide-react";
import { Link } from "wouter";

// 模擬任務資料
const mockTasks = {
  today: [
    {
      id: "task-001",
      type: "appointment",
      title: "王小美 - 玻尿酸填充",
      time: "10:00",
      status: "pending",
      priority: "high",
      customer: { name: "王小美", phone: "0912-345-678" },
      notes: "蘋果肌填充，客戶第一次做"
    },
    {
      id: "task-002",
      type: "appointment",
      title: "李大明 - 皮秒雷射",
      time: "11:30",
      status: "in_progress",
      priority: "normal",
      customer: { name: "李大明", phone: "0923-456-789" },
      notes: "全臉淨膚"
    },
    {
      id: "task-003",
      type: "aftercare",
      title: "張小華 - 術後回訪",
      time: "14:00",
      status: "pending",
      priority: "normal",
      customer: { name: "張小華", phone: "0934-567-890" },
      notes: "肉毒術後第3天追蹤"
    },
    {
      id: "task-004",
      type: "appointment",
      title: "陳美玲 - 美白導入",
      time: "15:30",
      status: "pending",
      priority: "normal",
      customer: { name: "陳美玲", phone: "0945-678-901" },
      notes: "VIP 客戶"
    },
    {
      id: "task-005",
      type: "inventory",
      title: "補充美白精華庫存",
      time: "17:00",
      status: "pending",
      priority: "low",
      notes: "目前庫存剩餘 5 瓶"
    }
  ],
  completed: [
    {
      id: "task-006",
      type: "appointment",
      title: "林小芳 - 肉毒除皺",
      time: "09:00",
      status: "completed",
      priority: "normal",
      customer: { name: "林小芳", phone: "0956-789-012" },
      notes: "前額 + 魚尾紋",
      completedAt: "09:45"
    }
  ]
};

const taskTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  appointment: { icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-100" },
  aftercare: { icon: Heart, color: "text-pink-600", bgColor: "bg-pink-100" },
  inventory: { icon: Package, color: "text-orange-600", bgColor: "bg-orange-100" }
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "緊急", color: "bg-red-500" },
  normal: { label: "一般", color: "bg-blue-500" },
  low: { label: "低", color: "bg-gray-400" }
};

export default function LiffStaffTasksPage() {
  const [activeTab, setActiveTab] = useState("today");
  const [selectedTask, setSelectedTask] = useState<typeof mockTasks.today[0] | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");

  const handleCompleteTask = () => {
    toast.success("任務已完成！");
    setShowCompleteDialog(false);
    setSelectedTask(null);
    setCompleteNotes("");
  };

  const TaskCard = ({ task }: { task: typeof mockTasks.today[0] }) => {
    const TypeIcon = taskTypeConfig[task.type]?.icon || Calendar;
    
    return (
      <Card 
        className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
          task.status === "completed" ? "opacity-60" : ""
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Priority Indicator */}
            <div className={`w-1 ${priorityConfig[task.priority]?.color}`} />
            
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${taskTypeConfig[task.type]?.bgColor}`}>
                    <TypeIcon className={`w-5 h-5 ${taskTypeConfig[task.type]?.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-500">{task.time}</span>
                      {task.status === "in_progress" && (
                        <Badge className="bg-yellow-500 text-xs">進行中</Badge>
                      )}
                      {task.status === "completed" && (
                        <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已完成
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
              
              {task.notes && (
                <p className="text-sm text-gray-500 mt-2 ml-13 line-clamp-1">
                  {task.notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/staff/clock">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">任務清單</h1>
        </div>

        {/* Summary */}
        <div className="px-4 pb-3 flex gap-3">
          <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{mockTasks.today.length}</p>
            <p className="text-xs text-gray-500">待處理</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{mockTasks.completed.length}</p>
            <p className="text-xs text-gray-500">已完成</p>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {mockTasks.today.filter(t => t.status === "in_progress").length}
            </p>
            <p className="text-xs text-gray-500">進行中</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="today">今日任務</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {activeTab === "today" && (
          <>
            {mockTasks.today.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-500">今日任務已全部完成！</p>
              </div>
            ) : (
              mockTasks.today.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            {mockTasks.completed.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">尚無已完成任務</p>
              </div>
            ) : (
              mockTasks.completed.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </>
        )}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">預定時間</p>
                    <p className="font-medium">{selectedTask.time}</p>
                  </div>
                </div>

                {/* Customer Info */}
                {selectedTask.customer && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">客戶資訊</p>
                      <p className="font-medium">{selectedTask.customer.name}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      撥打
                    </Button>
                  </div>
                )}

                {/* Notes */}
                {selectedTask.notes && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">備註</p>
                      <p className="text-sm">{selectedTask.notes}</p>
                    </div>
                  </div>
                )}

                {/* Priority */}
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">優先級</p>
                    <Badge className={priorityConfig[selectedTask.priority]?.color}>
                      {priorityConfig[selectedTask.priority]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                {selectedTask.customer && (
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    發送提醒
                  </Button>
                )}
                {selectedTask.status !== "completed" && (
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setShowCompleteDialog(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    完成任務
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>完成任務</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-3">請填寫完成備註（選填）</p>
            <Textarea 
              placeholder="例如：客戶滿意度高，建議下次預約..."
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCompleteTask}>
              確認完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
