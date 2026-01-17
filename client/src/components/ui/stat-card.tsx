import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  gradient?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
  className,
  onClick,
  gradient = "from-[oklch(0.80_0.14_70)] to-[oklch(0.70_0.14_60)]",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 border-[oklch(0.30_0.06_60/25%)] bg-card group",
        onClick && "cursor-pointer hover:shadow-xl hover:border-[oklch(0.80_0.14_70/40%)]",
        className
      )}
      onClick={onClick}
    >
      {/* 燙金光暈效果 */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} blur-2xl`} />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-5 w-5 text-[oklch(0.12_0.03_250)]" />
          </div>
        )}
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1 bg-[oklch(0.25_0.04_250)]" />
            <Skeleton className="h-4 w-16 bg-[oklch(0.25_0.04_250)]" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-gold-gradient">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    trend.isPositive !== false 
                      ? "text-green-400 bg-green-400/10" 
                      : "text-red-400 bg-red-400/10"
                  )}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                  {trend.label && ` ${trend.label}`}
                </span>
              )}
              {description && (
                <span className="text-sm text-muted-foreground">{description}</span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
