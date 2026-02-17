import { Skeleton } from "@/components/ui/skeleton";

/**
 * PageSkeleton - 通用頁面骨架屏載入元件
 * 用於 React.lazy() + Suspense 的 fallback，提供比 Spinner 更好的使用者體驗
 */
export function PageSkeleton() {
  return (
    <div className="flex h-screen w-full">
      {/* 側邊欄骨架 */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background p-4 gap-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      {/* 主內容區骨架 */}
      <div className="flex-1 flex flex-col p-6 gap-6">
        {/* 頂部導航列 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        {/* 統計卡片區 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        {/* 主要內容區 */}
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default PageSkeleton;
