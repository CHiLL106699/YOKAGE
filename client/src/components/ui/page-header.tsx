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
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
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
}

export function PageHeaderAction({
  icon: Icon,
  label,
  onClick,
  href,
  variant = "default",
  disabled = false,
}: PageHeaderActionProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (href) {
      navigate(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Button variant={variant} onClick={handleClick} disabled={disabled}>
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}
