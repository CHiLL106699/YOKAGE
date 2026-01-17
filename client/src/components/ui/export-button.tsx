import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  onExport: (format: "csv" | "xlsx" | "json") => Promise<void> | void;
  formats?: ("csv" | "xlsx" | "json")[];
  disabled?: boolean;
  className?: string;
}

export function ExportButton({
  onExport,
  formats = ["csv", "xlsx"],
  disabled = false,
  className,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    setLoading(true);
    setLoadingFormat(format);
    try {
      await onExport(format);
      toast.success(`匯出 ${format.toUpperCase()} 成功`);
    } catch (error) {
      toast.error(`匯出失敗: ${error instanceof Error ? error.message : "未知錯誤"}`);
    } finally {
      setLoading(false);
      setLoadingFormat(null);
    }
  };

  const formatLabels = {
    csv: { label: "CSV", icon: FileText },
    xlsx: { label: "Excel", icon: FileSpreadsheet },
    json: { label: "JSON", icon: FileText },
  };

  if (formats.length === 1) {
    const format = formats[0];
    const { label, icon: Icon } = formatLabels[format];
    return (
      <Button
        variant="outline"
        onClick={() => handleExport(format)}
        disabled={disabled || loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Icon className="h-4 w-4 mr-2" />
        )}
        匯出 {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || loading} className={className}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          匯出
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {formats.map((format) => {
          const { label, icon: Icon } = formatLabels[format];
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={loading}
            >
              {loadingFormat === format ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 mr-2" />
              )}
              匯出 {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Utility function to download data as CSV
export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) {
    toast.error("沒有資料可匯出");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma or newline
          if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Utility function to download data as JSON
export function downloadJSON(data: unknown, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
