import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Trash2, CheckCircle, XCircle, Tag, Send, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================
export interface BatchAction<T = unknown> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  requireConfirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  onExecute: (selectedIds: number[], selectedItems: T[]) => Promise<void> | void;
}

interface BatchActionsProps<T> {
  selectedIds: number[];
  selectedItems: T[];
  totalCount: number;
  actions: BatchAction<T>[];
  onClearSelection: () => void;
  isLoading?: boolean;
}

// ============================================
// Hook for managing selection state
// ============================================
export function useBatchSelection<T extends { id: number }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const selectedItems = items.filter((item) => selectedIds.has(item.id));
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleItem = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: number) => selectedIds.has(id);

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    isAllSelected,
    isPartialSelected,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    hasSelection: selectedIds.size > 0,
  };
}

// ============================================
// Batch Actions Toolbar Component
// ============================================
export function BatchActionsToolbar<T>({
  selectedIds,
  selectedItems,
  totalCount,
  actions,
  onClearSelection,
  isLoading = false,
}: BatchActionsProps<T>) {
  const [confirmAction, setConfirmAction] = useState<BatchAction<T> | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleExecuteAction = async (action: BatchAction<T>) => {
    if (action.requireConfirm) {
      setConfirmAction(action);
      return;
    }
    await executeAction(action);
  };

  const executeAction = async (action: BatchAction<T>) => {
    setIsExecuting(true);
    try {
      await action.onExecute(selectedIds, selectedItems);
      onClearSelection();
    } finally {
      setIsExecuting(false);
      setConfirmAction(null);
    }
  };

  const destructiveActions = actions.filter((a) => a.variant === "destructive");
  const normalActions = actions.filter((a) => a.variant !== "destructive");

  return (
    <>
      <div className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            已選擇 <span className="text-primary">{selectedIds.length}</span> / {totalCount} 項
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {normalActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading || isExecuting}>
                  批次操作
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {normalActions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => handleExecuteAction(action)}
                    disabled={isExecuting}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {destructiveActions.map((action) => (
            <Button
              key={action.id}
              variant="destructive"
              size="sm"
              onClick={() => handleExecuteAction(action)}
              disabled={isLoading || isExecuting}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}

          <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={isExecuting}>
            <XCircle className="h-4 w-4 mr-1" />
            取消選擇
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle || `確認${confirmAction?.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription ||
                `確定要對選中的 ${selectedIds.length} 項執行「${confirmAction?.label}」操作嗎？此操作無法復原。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              disabled={isExecuting}
              className={cn(
                confirmAction?.variant === "destructive" &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {isExecuting ? "處理中..." : "確認"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================
// Selection Checkbox Component
// ============================================
interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function SelectionCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  className,
}: SelectionCheckboxProps) {
  return (
    <Checkbox
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn("data-[state=checked]:bg-primary data-[state=checked]:border-primary", className)}
    />
  );
}

// ============================================
// Pre-built Action Creators
// ============================================
export const createBatchDeleteAction = <T,>(
  onDelete: (ids: number[]) => Promise<void>
): BatchAction<T> => ({
  id: "batch-delete",
  label: "批次刪除",
  icon: <Trash2 className="h-4 w-4" />,
  variant: "destructive",
  requireConfirm: true,
  confirmTitle: "確認批次刪除",
  confirmDescription: "確定要刪除選中的項目嗎？此操作無法復原。",
  onExecute: async (ids) => {
    await onDelete(ids);
  },
});

export const createBatchUpdateStatusAction = <T,>(
  label: string,
  status: string,
  onUpdate: (ids: number[], status: string) => Promise<void>
): BatchAction<T> => ({
  id: `batch-status-${status}`,
  label,
  icon: status === "active" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />,
  requireConfirm: true,
  onExecute: async (ids) => {
    await onUpdate(ids, status);
  },
});

export const createBatchTagAction = <T,>(
  onTag: (ids: number[], tagId: number) => Promise<void>,
  tagId: number,
  tagName: string
): BatchAction<T> => ({
  id: `batch-tag-${tagId}`,
  label: `標記為「${tagName}」`,
  icon: <Tag className="h-4 w-4" />,
  onExecute: async (ids) => {
    await onTag(ids, tagId);
  },
});

export const createBatchExportAction = <T,>(
  onExport: (items: T[]) => Promise<void>
): BatchAction<T> => ({
  id: "batch-export",
  label: "匯出選中項目",
  icon: <Download className="h-4 w-4" />,
  onExecute: async (_, items) => {
    await onExport(items);
  },
});

export const createBatchSendNotificationAction = <T,>(
  onSend: (ids: number[]) => Promise<void>
): BatchAction<T> => ({
  id: "batch-send-notification",
  label: "發送通知",
  icon: <Send className="h-4 w-4" />,
  requireConfirm: true,
  confirmTitle: "確認發送通知",
  confirmDescription: "確定要向選中的客戶發送通知嗎？",
  onExecute: async (ids) => {
    await onSend(ids);
  },
});
