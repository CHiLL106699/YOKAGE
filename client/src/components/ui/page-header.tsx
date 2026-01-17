import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  actions,
  children,
}: PageHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backHref && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(backHref)}
              className="shrink-0 border border-[oklch(0.30_0.06_60/30%)] hover:border-[oklch(0.80_0.14_70)] hover:bg-[oklch(0.18_0.04_250)]"
            >
              <ArrowLeft className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gold-gradient">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

interface PageHeaderActionProps {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  disabled?: boolean;
  premium?: boolean;
}

export function PageHeaderAction({
  icon: Icon,
  label,
  onClick,
  href,
  variant = "default",
  disabled = false,
  premium = false,
}: PageHeaderActionProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (href) {
      navigate(href);
    } else if (onClick) {
      onClick();
    }
  };

  // 尊爵按鈕樣式
  const premiumClass = premium 
    ? "btn-gold" 
    : variant === "default" 
      ? "bg-[oklch(0.80_0.14_70)] text-[oklch(0.12_0.03_250)] hover:bg-[oklch(0.85_0.12_75)] shadow-md"
      : "";

  return (
    <Button 
      variant={premium ? undefined : variant} 
      onClick={handleClick} 
      disabled={disabled}
      className={premiumClass}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}
