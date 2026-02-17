import { Skeleton } from '@/components/ui/skeleton';

/** Full-page centered spinner skeleton */
export function PageLoadingSkeleton({ message = '載入中...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="space-y-3 mt-6">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">{message}</p>
      </div>
    </div>
  );
}

/** Card-style skeleton for dashboard stats */
export function StatsCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex items-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="ml-4 space-y-2 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** List skeleton for appointment / customer lists */
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
          <Skeleton className="h-10 w-16 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Calendar skeleton */
export function CalendarSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 w-full" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`d-${i}`} className="h-10 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

/** LIFF mobile card skeleton */
export function LiffCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

/** Inline error display with retry */
export function PageError({ message = '載入資料時發生錯誤', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
      <div className="text-red-500 text-4xl mb-4">⚠</div>
      <p className="text-red-600 font-medium mb-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          重試
        </button>
      )}
    </div>
  );
}
