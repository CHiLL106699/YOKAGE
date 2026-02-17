import { AlertCircle, RefreshCw } from 'lucide-react';
import { Spinner } from './spinner';
import { Button } from './button';
import { SkeletonStats, SkeletonCard } from './skeleton-table';

interface QueryLoadingProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'skeleton-cards';
  cardCount?: number;
}

export function QueryLoading({ message = '載入中...', variant = 'spinner', cardCount = 4 }: QueryLoadingProps) {
  if (variant === 'skeleton') {
    return <SkeletonStats count={cardCount} />;
  }
  if (variant === 'skeleton-cards') {
    return (
      <div className="space-y-4">
        <SkeletonStats count={cardCount} />
        <SkeletonCard />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Spinner className="size-8 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({ message = '載入資料時發生錯誤', onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <AlertCircle className="size-10 mb-3 text-destructive" />
      <p className="text-sm text-destructive mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4 mr-2" />
          重試
        </Button>
      )}
    </div>
  );
}
