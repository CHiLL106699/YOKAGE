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
  Package,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";

type TaskStatus = "pending" | "completed" | "in_progress";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

const taskTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  appointment: { icon: Calendar, color: "text-pink-600", label: "預約" },
  aftercare: { icon: Heart, color: "text-red-600", label: "術後回訪" },
  inventory: { icon: Package, color: "text-blue-600", label: "庫存" },
  other: { icon: Bell, color: "text-gray-600", label: "其他" },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "bg-red-100 text-red-700", label: "高" },
  normal: { color: "bg-yellow-100 text-yellow-700", label: "中" },
  low: { color: "bg-blue-100 text-blue-700", label: "低" },
};

export default function LiffStaffTasksPage() {
  const { organizationId, staffId, isLoading: ctxLoading } = useStaffContext();
  const [activeTab, setActiveTab] = useState("today");
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [noteText, setNoteText] = useState("");

  const utils = trpc.useUtils();

  // Fetch staff tasks
  const tasksQuery = trpc.staffTasks.list.useQuery(
    { organizationId, staffId },
    { enabled: !ctxLoading }
  );

  // Update task status mutation
  const updateTaskStatus = trpc.staffTasks.updateStatus.useMutation({
    onSuccess: () => {
      utils.staffTasks.list.invalidate();
      toast.success("任務已更新");
    },
  });

  // Add task note mutation (using updateStatus to add notes)
    const addTaskNote = trpc.staffTasks.updateStatus.useMutation({
    onSuccess: () => {
      utils.staffTasks.list.invalidate();
      setShowNoteDialog(false);
      setNoteText("");
      setSelectedTask(null);
      toast.success("備註已新增");
    },
  });

  if (ctxLoading || tasksQuery.isLoading) {
    return <PageLoadingSkeleton message="載入任務清單..." />;
  }

  if (tasksQuery.isError) {
    return <PageError message="無法載入任務" onRetry={() => tasksQuery.refetch()} />;
  }

  const rawTasks = tasksQuery.data;
  const allTasks: any[] = Array.isArray(rawTasks) ? rawTasks : (rawTasks as any)?.data ?? [];

  // Filter tasks by status
  const todayTasks = allTasks.filter((t: any) => t.status === "pending" || t.status === "in_progress");
  const completedTasks = allTasks.filter((t: any) => t.status === "completed");

    const handleTaskStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateTaskStatus.mutate({
      id: taskId,
      status: newStatus,
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error("請輸入備註");
      return;
    }
    if (!selectedTask) return;

    addTaskNote.mutate({
      id: selectedTask.id,
      status: selectedTask.status,
      notes: noteText,
    });
  };

  const renderTaskItem = (task: any) => {
    const typeConfig = taskTypeConfig[task.taskType] ?? taskTypeConfig.other;
    const priorityConfig_ = priorityConfig[task.priority] ?? priorityConfig.normal;
    const TypeIcon = typeConfig.icon;

    return (
      <Card key={task.id} className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={(checked) =>
                handleTaskStatusChange(task.id, checked ? "completed" : "pending")
              }
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                  <h3 className={`font-medium ${task.status === "completed" ? "line-through text-gray-400" : ""}`}>
                    {task.title}
                  </h3>
                </div>
                <Badge className={priorityConfig_.color}>{priorityConfig_.label}</Badge>
              </div>

              {task.customerName && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <User className="w-3 h-3" />
                  {task.customerName}
                </p>
              )}

              {task.scheduledTime && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  {task.scheduledTime}
                </p>
              )}

              {task.description && (
                <p className="text-sm text-gray-600 mt-2">{task.description}</p>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowNoteDialog(true);
                  }}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  備註
                </Button>
                {task.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleTaskStatusChange(task.id, "in_progress")}
                    disabled={updateTaskStatus.isPending}
                  >
                    {updateTaskStatus.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    開始執行
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/member">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">任務清單</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white border-b px-4">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0">
            <TabsTrigger
              value="today"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              今日任務 ({todayTasks.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              已完成 ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Today Tasks */}
        <TabsContent value="today" className="p-4 mt-0">
          {todayTasks.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">今日無任務</p>
            </div>
          ) : (
            todayTasks.map((task) => renderTaskItem(task))
          )}
        </TabsContent>

        {/* Completed Tasks */}
        <TabsContent value="completed" className="p-4 mt-0">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暫無已完成任務</p>
            </div>
          ) : (
            completedTasks.map((task) => renderTaskItem(task))
          )}
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新增備註</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTask && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{selectedTask.title}</p>
              </div>
            )}
            <Textarea
              placeholder="輸入備註內容..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-24"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddNote} disabled={addTaskNote.isPending}>
              {addTaskNote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  新增中...
                </>
              ) : (
                "新增備註"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
