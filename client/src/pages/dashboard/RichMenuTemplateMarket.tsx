import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  ArrowLeft,
  Download,
  Star,
  Eye,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import Rating from "@/components/Rating";
import { useLocation } from "wouter";

// 類別定義
const CATEGORIES = [
  { value: "all", label: "全部類別", icon: "🏪" },
  { value: "restaurant", label: "餐飲", icon: "🍽️" },
  { value: "beauty", label: "美容", icon: "💄" },
  { value: "retail", label: "零售", icon: "🛍️" },
  { value: "medical", label: "醫療", icon: "🏥" },
] as const;

const categoryColorMap: Record<string, string> = {
  restaurant: "bg-orange-100 text-orange-700",
  beauty: "bg-pink-100 text-pink-700",
  retail: "bg-blue-100 text-blue-700",
  medical: "bg-green-100 text-green-700",
};

const categoryLabelMap: Record<string, string> = {
  restaurant: "餐飲",
  beauty: "美容",
  retail: "零售",
  medical: "醫療",
};

export default function RichMenuTemplateMarket() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // 篩選與搜尋狀態
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 詳情彈窗狀態
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 評分彈窗狀態
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingTemplateId, setRatingTemplateId] = useState<number | null>(null);
  const [userRating, setUserRating] = useState(0);

  // 搜尋 debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // 簡單的 debounce 實作
    clearTimeout((window as any).__searchTimeout);
    (window as any).__searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
  };

  // 查詢模板列表
  const {
    data: listData,
    isLoading,
    refetch,
  } = trpc.richMenuTemplateMarket.list.useQuery({
    category:
      selectedCategory === "all"
        ? undefined
        : (selectedCategory as "restaurant" | "beauty" | "retail" | "medical"),
    search: debouncedSearch || undefined,
    page: currentPage,
    limit: 12,
  });

  // 查詢選中模板的詳情
  const { data: templateDetail, isLoading: isDetailLoading } =
    trpc.richMenuTemplateMarket.getById.useQuery(
      { id: selectedTemplateId! },
      { enabled: !!selectedTemplateId }
    );

  // 套用模板 mutation
  const applyMutation = trpc.richMenuTemplateMarket.applyTemplate.useMutation({
    onSuccess: (data) => {
      toast({
        title: "套用成功",
        description: data.message,
      });
      setIsDetailOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "套用失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 評分 mutation
  const rateMutation = trpc.richMenuTemplateMarket.rateTemplate.useMutation({
    onSuccess: (data) => {
      toast({
        title: "評分成功",
        description: `新評分：${data.newRating.toFixed(1)} 分`,
      });
      setIsRatingOpen(false);
      setUserRating(0);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "評分失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const templates = listData?.data ?? [];
  const pagination = listData?.pagination;

  // 處理套用模板
  const handleApply = (templateId: number) => {
    applyMutation.mutate({
      templateId,
      organizationId: 1, // TODO: 從 context 取得當前診所 ID
      chatBarText: "查看選單",
    });
  };

  // 處理評分
  const handleRate = () => {
    if (ratingTemplateId && userRating > 0) {
      rateMutation.mutate({
        templateId: ratingTemplateId,
        rating: userRating,
      });
    }
  };

  // 開啟詳情
  const openDetail = (id: number) => {
    setSelectedTemplateId(id);
    setIsDetailOpen(true);
  };

  // 開啟評分
  const openRating = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRatingTemplateId(id);
    setUserRating(0);
    setIsRatingOpen(true);
  };

  // 處理分類切換
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/rich-menu")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Rich Menu 模板市集</h1>
            <p className="text-muted-foreground">
              瀏覽並套用預製的 Rich Menu 模板，快速建立專業的 LINE 圖文選單
            </p>
          </div>
        </div>
      </div>

      {/* 篩選與搜尋列 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="選擇類別" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋模板名稱或描述..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 統計資訊 */}
      {pagination && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          <span>
            共 {pagination.total} 個模板
            {selectedCategory !== "all" &&
              `（${categoryLabelMap[selectedCategory] || selectedCategory}）`}
          </span>
        </div>
      )}

      {/* 模板卡片網格 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="w-full h-40 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              找不到符合條件的模板
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              請嘗試調整篩選條件或搜尋關鍵字
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template: Record<string, any>) => (
            <Card
              key={template.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => openDetail(template.id)}
            >
              <CardContent className="p-0">
                {/* 圖片預覽 */}
                <div className="relative overflow-hidden">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge
                      className={
                        categoryColorMap[template.category] ||
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {categoryLabelMap[template.category] ||
                        template.category}
                    </Badge>
                  </div>
                  {/* 標籤 */}
                  {template.tags &&
                    Array.isArray(template.tags) &&
                    (template.tags as string[]).length > 0 && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        {(template.tags as string[])
                          .slice(0, 2)
                          .map((tag: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    )}
                </div>

                {/* 資訊區 */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-base truncate">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* 評分與使用次數 */}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => openRating(template.id, e)}
                    >
                      <Rating
                        value={Number(template.rating) || 0}
                        size="sm"
                        readonly
                      />
                      <span className="text-xs text-muted-foreground">
                        {Number(template.rating)?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Download className="h-3.5 w-3.5" />
                      <span>{template.usageCount || 0}</span>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(template.id);
                      }}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      預覽
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(template.id);
                      }}
                      disabled={applyMutation.isPending}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      套用
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 分頁 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            上一頁
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            第 {currentPage} / {pagination.totalPages} 頁
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pagination.totalPages}
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(pagination.totalPages, p + 1)
              )
            }
          >
            下一頁
          </Button>
        </div>
      )}

      {/* 模板詳情彈窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {isDetailLoading || !templateDetail ? (
            <div className="space-y-4">
              <Skeleton className="w-full h-64" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{templateDetail.name}</span>
                  <Badge
                    className={
                      categoryColorMap[templateDetail.category] ||
                      "bg-gray-100 text-gray-700"
                    }
                  >
                    {categoryLabelMap[templateDetail.category] ||
                      templateDetail.category}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {templateDetail.description || "暫無描述"}
                </DialogDescription>
              </DialogHeader>

              {/* 大圖預覽 + 按鈕區域標示 */}
              <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={templateDetail.imageUrl}
                  alt={templateDetail.name}
                  className="w-full object-contain"
                 loading="lazy" />
                {/* 按鈕區域標示 */}
                {(Array.isArray(templateDetail.areas) ? (templateDetail.areas as any[]) : []).map(
                    (area: any, idx: number) => {
                      const imgW = templateDetail.imageWidth;
                      const imgH = templateDetail.imageHeight;
                      if (!area.bounds || !imgW || !imgH) return null;
                      const left = (area.bounds.x / imgW) * 100;
                      const top = (area.bounds.y / imgH) * 100;
                      const width = (area.bounds.width / imgW) * 100;
                      const height = (area.bounds.height / imgH) * 100;
                      return (
                        <div
                          key={idx}
                          className="absolute border-2 border-dashed border-blue-400 bg-blue-400/10 flex items-center justify-center"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                          }}
                          title={`區域 ${idx + 1}: ${area.action?.type || "N/A"} - ${area.action?.label || area.action?.text || area.action?.uri || ""}`}
                        >
                          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                            {idx + 1}
                          </span>
                        </div>
                      );
                    }
                  )}
              </div>

              {/* 按鈕區域列表 */}
              {templateDetail.areas &&
                Array.isArray(templateDetail.areas) &&
                (templateDetail.areas as any[]).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      按鈕區域 ({(templateDetail.areas as any[]).length} 個)
                    </h4>
                    <div className="grid gap-2">
                      {(templateDetail.areas as any[]).map(
                        (area: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2 bg-muted/50 rounded text-sm"
                          >
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded font-medium min-w-[24px] text-center">
                              {idx + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {area.action?.type || "N/A"}
                            </Badge>
                            <span className="text-muted-foreground truncate">
                              {area.action?.label ||
                                area.action?.text ||
                                area.action?.uri ||
                                "未設定"}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* 模板資訊 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">圖片尺寸</p>
                  <p className="font-medium">
                    {templateDetail.imageWidth} x {templateDetail.imageHeight}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">使用次數</p>
                  <p className="font-medium flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {templateDetail.usageCount || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">評分</p>
                  <div className="flex items-center gap-1">
                    <Rating
                      value={Number(templateDetail.rating) || 0}
                      size="sm"
                      readonly
                    />
                    <span className="font-medium">
                      {Number(templateDetail.rating)?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">標籤</p>
                  <div className="flex flex-wrap gap-1">
                    {templateDetail.tags &&
                    Array.isArray(templateDetail.tags) &&
                    (templateDetail.tags as string[]).length > 0 ? (
                      (templateDetail.tags as string[]).map(
                        (tag: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        )
                      )
                    ) : (
                      <span className="text-muted-foreground">無</span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRatingTemplateId(templateDetail.id);
                    setUserRating(0);
                    setIsRatingOpen(true);
                  }}
                >
                  <Star className="mr-2 h-4 w-4" />
                  評分
                </Button>
                <Button
                  onClick={() => handleApply(templateDetail.id)}
                  disabled={applyMutation.isPending}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {applyMutation.isPending ? "套用中..." : "一鍵套用"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 評分彈窗 */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>為此模板評分</DialogTitle>
            <DialogDescription>
              請選擇您對此模板的評分（1-5 星）
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <Rating value={userRating} size="lg" onChange={setUserRating} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRatingOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleRate}
              disabled={userRating === 0 || rateMutation.isPending}
            >
              {rateMutation.isPending ? "提交中..." : "提交評分"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
