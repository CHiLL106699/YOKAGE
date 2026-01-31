import { ReactNode } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PageTemplateProps {
  children: ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function PageTemplate({
  children,
  title,
  description,
  isLoading = false,
  error = null,
  onRetry,
}: PageTemplateProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* 頁面標題 */}
      {title && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* 載入動畫 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">載入中...</p>
        </div>
      )}

      {/* 錯誤提示 */}
      {error && !isLoading && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>發生錯誤</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-4 underline hover:no-underline"
              >
                重試
              </button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 頁面內容 */}
      {!isLoading && !error && children}
    </div>
  );
}

// 載入骨架屏組件
export function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="space-y-2">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-6 w-96 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// 空狀態組件
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
