import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface SendLineMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
  customerId?: number;
  customerIds?: number[];
  mode: "single" | "bulk";
}

export function SendLineMessageDialog({
  open,
  onOpenChange,
  organizationId,
  customerId,
  customerIds,
  mode,
}: SendLineMessageDialogProps) {
  const { toast } = useToast();
  const [messageType, setMessageType] = useState<"text" | "flex">("text");
  const [content, setContent] = useState("");

  // 發送單一訊息
  const sendMessageMutation = trpc.lineMessaging.sendMessage.useMutation({
    onSuccess: () => {
      toast({ title: "發送成功", description: "LINE 訊息已發送" });
      onOpenChange(false);
      setContent("");
    },
    onError: (error) => {
      toast({ title: "發送失敗", description: error.message, variant: "destructive" });
    },
  });

  // 批量發送訊息
  const sendBulkMessageMutation = trpc.lineMessaging.sendBulkMessage.useMutation({
    onSuccess: (data) => {
      toast({
        title: "發送完成",
        description: `成功：${data.successCount} 筆，失敗：${data.failCount} 筆`,
      });
      onOpenChange(false);
      setContent("");
    },
    onError: (error) => {
      toast({ title: "發送失敗", description: error.message, variant: "destructive" });
    },
  });

  const handleSend = () => {
    if (!content.trim()) {
      toast({ title: "請輸入訊息內容", variant: "destructive" });
      return;
    }

    if (mode === "single" && customerId) {
      sendMessageMutation.mutate({
        organizationId,
        customerId,
        messageType,
        content,
      });
    } else if (mode === "bulk" && customerIds && customerIds.length > 0) {
      sendBulkMessageMutation.mutate({
        organizationId,
        customerIds,
        messageType,
        content,
      });
    }
  };

  const isPending = sendMessageMutation.isPending || sendBulkMessageMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "single" ? "發送 LINE 訊息" : `批量發送訊息（${customerIds?.length || 0} 位客戶）`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">訊息類型</label>
            <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">文字訊息</SelectItem>
                <SelectItem value="flex">Flex Message（進階）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">訊息內容</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                messageType === "text"
                  ? "輸入要發送的訊息內容..."
                  : "輸入 Flex Message JSON（進階功能）"
              }
              rows={8}
            />
          </div>
          {messageType === "flex" && (
            <p className="text-xs text-muted-foreground">
              Flex Message 需要符合 LINE 官方格式，請參考{" "}
              <a
                href="https://developers.line.biz/en/docs/messaging-api/using-flex-messages/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                LINE 官方文件
              </a>
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSend} disabled={isPending}>
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "發送中..." : "發送"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
