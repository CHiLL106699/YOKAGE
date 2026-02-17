/**
 * 資料匯入頁面
 * 支援 CSV 匯入客戶、產品、員工資料
 */

import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { QueryLoading } from '@/components/ui/query-state';

import {
  Upload,
  FileSpreadsheet,
  Users,
  Package,
  UserCog,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  History,
} from "lucide-react";

type ImportType = "customer" | "product" | "staff";

interface ImportError {
  row: number;
  field?: string;
  message: string;
}

export default function DataImportPage() {
  const [activeTab, setActiveTab] = useState<ImportType>("customer");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    totalRows: number;
    successRows: number;
    failedRows: number;
    errors: ImportError[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Get organizationId from context
  const organizationId = 1;

  // 取得匯入記錄
  const { data: importRecords, refetch: refetchRecords, isLoading } = trpc.dataImport.getImportRecords.useQuery({
    organizationId,
    limit: 10,
  });

  // 匯入 mutations
  const importCustomersMutation = trpc.dataImport.importCustomers.useMutation();
  const importProductsMutation = trpc.dataImport.importProducts.useMutation();
  const importStaffMutation = trpc.dataImport.importStaff.useMutation();

  // 取得範本
  const { data: template } = trpc.dataImport.getTemplate.useQuery({
    type: activeTab,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("請選擇 CSV 檔案");
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    if (!template) return;

    const blob = new Blob([template.content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = template.fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("請先選擇檔案");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const csvContent = await selectedFile.text();

      let result;
      switch (activeTab) {
        case "customer":
          result = await importCustomersMutation.mutateAsync({
            organizationId,
            csvContent,
            fileName: selectedFile.name,
          });
          break;
        case "product":
          result = await importProductsMutation.mutateAsync({
            organizationId,
            csvContent,
            fileName: selectedFile.name,
          });
          break;
        case "staff":
          result = await importStaffMutation.mutateAsync({
            organizationId,
            csvContent,
            fileName: selectedFile.name,
          });
          break;
      }

      setImportResult(result);
      refetchRecords();

      if (result.success) {
        toast.success(`成功匯入 ${result.successRows} 筆資料`);
      } else if (result.successRows > 0) {
        toast.warning(`部分匯入成功：${result.successRows}/${result.totalRows}`);
      } else {
        toast.error("匯入失敗，請檢查資料格式");
      }
    } catch (error) {
      toast.error("匯入過程發生錯誤");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const getTabIcon = (type: ImportType) => {
    switch (type) {
      case "customer":
        return <Users className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      case "staff":
        return <UserCog className="h-4 w-4" />;
    }
  };

  const getTabLabel = (type: ImportType) => {
    switch (type) {
      case "customer":
        return "客戶資料";
      case "product":
        return "產品/服務";
      case "staff":
        return "員工資料";
    }
  };

  if (isLoading) {

    return (

      <div className="p-6">

        <QueryLoading variant="skeleton-cards" />

      </div>

    );

  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">資料匯入</h1>
          <p className="text-gray-500 mt-1">
            透過 CSV 檔案批次匯入客戶、產品、員工資料
          </p>
        </div>

        {/* Import Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as ImportType);
            setSelectedFile(null);
            setImportResult(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-3">
            {(["customer", "product", "staff"] as ImportType[]).map((type) => (
              <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                {getTabIcon(type)}
                {getTabLabel(type)}
              </TabsTrigger>
            ))}
          </TabsList>

          {(["customer", "product", "staff"] as ImportType[]).map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {/* Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    上傳 {getTabLabel(type)} CSV
                  </CardTitle>
                  <CardDescription>
                    選擇 CSV 檔案進行匯入，或下載範本查看格式
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Download Template */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadTemplate}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      下載範本
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      下載 CSV 範本以了解正確格式
                    </span>
                  </div>

                  {/* File Upload */}
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    {selectedFile ? (
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">
                          點擊或拖曳檔案至此處
                        </p>
                        <p className="text-sm text-gray-500">
                          支援 CSV 格式，檔案大小上限 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Import Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleImport}
                      disabled={!selectedFile || isImporting}
                      className="gap-2"
                    >
                      {isImporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          匯入中...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          開始匯入
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Import Result */}
              {importResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {importResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : importResult.successRows > 0 ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      匯入結果
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{importResult.totalRows}</p>
                        <p className="text-sm text-gray-500">總筆數</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {importResult.successRows}
                        </p>
                        <p className="text-sm text-gray-500">成功</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {importResult.failedRows}
                        </p>
                        <p className="text-sm text-gray-500">失敗</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>匯入進度</span>
                        <span>
                          {Math.round(
                            (importResult.successRows / importResult.totalRows) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (importResult.successRows / importResult.totalRows) * 100
                        }
                      />
                    </div>

                    {/* Errors */}
                    {importResult.errors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>匯入錯誤</AlertTitle>
                        <AlertDescription>
                          <div className="mt-2 max-h-48 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-20">行號</TableHead>
                                  <TableHead className="w-24">欄位</TableHead>
                                  <TableHead>錯誤訊息</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {importResult.errors.slice(0, 10).map((error, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{error.row}</TableCell>
                                    <TableCell>{error.field || "-"}</TableCell>
                                    <TableCell>{error.message}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {importResult.errors.length > 10 && (
                              <p className="text-sm mt-2">
                                還有 {importResult.errors.length - 10} 個錯誤...
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              匯入記錄
            </CardTitle>
            <CardDescription>最近的資料匯入歷史</CardDescription>
          </CardHeader>
          <CardContent>
            {!importRecords || importRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>尚無匯入記錄</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>檔案名稱</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>成功/總數</TableHead>
                    <TableHead>時間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importRecords.map((record: Record<string, any>) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.fileName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTabLabel(record.importType as ImportType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "completed"
                              ? "default"
                              : record.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {record.status === "completed"
                            ? "完成"
                            : record.status === "failed"
                            ? "失敗"
                            : "處理中"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.successRows}/{record.totalRows}
                      </TableCell>
                      <TableCell>
                        {new Date(record.createdAt).toLocaleString("zh-TW")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
