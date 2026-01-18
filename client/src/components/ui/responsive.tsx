import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { ReactNode } from "react";

// ============================================
// Responsive Container
// ============================================
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  /** 在行動裝置上使用全寬 */
  fullWidthOnMobile?: boolean;
  /** 最大寬度 */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function ResponsiveContainer({
  children,
  className,
  fullWidthOnMobile = true,
  maxWidth = "2xl",
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto",
        fullWidthOnMobile ? "px-4 sm:px-6 lg:px-8" : "px-4",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// Responsive Grid
// ============================================
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  /** 行動裝置上的列數 */
  mobileCols?: 1 | 2;
  /** 平板上的列數 */
  tabletCols?: 2 | 3 | 4;
  /** 桌面上的列數 */
  desktopCols?: 2 | 3 | 4 | 5 | 6;
  /** 間距大小 */
  gap?: "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  className,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 4,
  gap = "md",
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2 sm:gap-3 lg:gap-4",
    md: "gap-4 sm:gap-5 lg:gap-6",
    lg: "gap-6 sm:gap-8 lg:gap-10",
  };

  const mobileColsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
  };

  const tabletColsClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  };

  const desktopColsClasses = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  };

  return (
    <div
      className={cn(
        "grid",
        mobileColsClasses[mobileCols],
        tabletColsClasses[tabletCols],
        desktopColsClasses[desktopCols],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// Responsive Stack
// ============================================
interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  /** 在行動裝置上垂直堆疊，桌面上水平排列 */
  direction?: "row" | "column" | "responsive";
  /** 間距大小 */
  gap?: "sm" | "md" | "lg";
  /** 對齊方式 */
  align?: "start" | "center" | "end" | "stretch";
  /** 分佈方式 */
  justify?: "start" | "center" | "end" | "between" | "around";
}

export function ResponsiveStack({
  children,
  className,
  direction = "responsive",
  gap = "md",
  align = "stretch",
  justify = "start",
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  const directionClasses = {
    row: "flex-row",
    column: "flex-col",
    responsive: "flex-col sm:flex-row",
  };

  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// Show/Hide Components
// ============================================
interface ShowOnProps {
  children: ReactNode;
  className?: string;
}

/** 僅在行動裝置上顯示 */
export function ShowOnMobile({ children, className }: ShowOnProps) {
  return <div className={cn("block sm:hidden", className)}>{children}</div>;
}

/** 僅在平板以上顯示 */
export function ShowOnTablet({ children, className }: ShowOnProps) {
  return <div className={cn("hidden sm:block lg:hidden", className)}>{children}</div>;
}

/** 僅在桌面上顯示 */
export function ShowOnDesktop({ children, className }: ShowOnProps) {
  return <div className={cn("hidden lg:block", className)}>{children}</div>;
}

/** 在行動裝置上隱藏 */
export function HideOnMobile({ children, className }: ShowOnProps) {
  return <div className={cn("hidden sm:block", className)}>{children}</div>;
}

/** 在桌面上隱藏 */
export function HideOnDesktop({ children, className }: ShowOnProps) {
  return <div className={cn("block lg:hidden", className)}>{children}</div>;
}

// ============================================
// Responsive Text
// ============================================
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  /** 文字大小 */
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  /** 是否在行動裝置上縮小 */
  shrinkOnMobile?: boolean;
}

export function ResponsiveText({
  children,
  className,
  size = "base",
  shrinkOnMobile = true,
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: shrinkOnMobile ? "text-xs" : "text-xs",
    sm: shrinkOnMobile ? "text-xs sm:text-sm" : "text-sm",
    base: shrinkOnMobile ? "text-sm sm:text-base" : "text-base",
    lg: shrinkOnMobile ? "text-base sm:text-lg" : "text-lg",
    xl: shrinkOnMobile ? "text-lg sm:text-xl" : "text-xl",
    "2xl": shrinkOnMobile ? "text-xl sm:text-2xl" : "text-2xl",
    "3xl": shrinkOnMobile ? "text-2xl sm:text-3xl" : "text-3xl",
    "4xl": shrinkOnMobile ? "text-3xl sm:text-4xl" : "text-4xl",
  };

  return <span className={cn(sizeClasses[size], className)}>{children}</span>;
}

// ============================================
// Responsive Table Wrapper
// ============================================
interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0", className)}>
      <div className="min-w-[640px] sm:min-w-0">{children}</div>
    </div>
  );
}

// ============================================
// Mobile Card Layout (for tables on mobile)
// ============================================
interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border p-4 space-y-3",
        onClick && "cursor-pointer hover:bg-accent/50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MobileCardRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MobileCardRow({ label, value, className }: MobileCardRowProps) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// ============================================
// Responsive Hook
// ============================================
export function useResponsive() {
  const isMobile = useIsMobile();

  return {
    isMobile,
    isTablet: !isMobile && typeof window !== "undefined" && window.innerWidth < 1024,
    isDesktop: typeof window !== "undefined" && window.innerWidth >= 1024,
    breakpoint: isMobile ? "mobile" : typeof window !== "undefined" && window.innerWidth < 1024 ? "tablet" : "desktop",
  };
}

// ============================================
// Responsive Padding
// ============================================
interface ResponsivePaddingProps {
  children: ReactNode;
  className?: string;
  /** 內距大小 */
  size?: "sm" | "md" | "lg" | "xl";
}

export function ResponsivePadding({ children, className, size = "md" }: ResponsivePaddingProps) {
  const paddingClasses = {
    sm: "p-2 sm:p-3 lg:p-4",
    md: "p-4 sm:p-5 lg:p-6",
    lg: "p-6 sm:p-8 lg:p-10",
    xl: "p-8 sm:p-10 lg:p-12",
  };

  return <div className={cn(paddingClasses[size], className)}>{children}</div>;
}

// ============================================
// Responsive Spacing
// ============================================
interface ResponsiveSpacingProps {
  children: ReactNode;
  className?: string;
  /** 垂直間距 */
  y?: "sm" | "md" | "lg" | "xl";
}

export function ResponsiveSpacing({ children, className, y = "md" }: ResponsiveSpacingProps) {
  const spacingClasses = {
    sm: "space-y-2 sm:space-y-3 lg:space-y-4",
    md: "space-y-4 sm:space-y-5 lg:space-y-6",
    lg: "space-y-6 sm:space-y-8 lg:space-y-10",
    xl: "space-y-8 sm:space-y-10 lg:space-y-12",
  };

  return <div className={cn(spacingClasses[y], className)}>{children}</div>;
}
