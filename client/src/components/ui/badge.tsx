import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-[oklch(0.80_0.14_70)] to-[oklch(0.70_0.14_60)] text-[oklch(0.12_0.03_250)] shadow-sm [a&]:hover:shadow-md",
        secondary:
          "border-[oklch(0.30_0.06_60/40%)] bg-[oklch(0.20_0.04_250)] text-[oklch(0.85_0.12_75)] [a&]:hover:bg-[oklch(0.25_0.05_250)]",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-[oklch(0.30_0.06_60/40%)] text-foreground bg-transparent [a&]:hover:bg-[oklch(0.18_0.04_250)] [a&]:hover:border-[oklch(0.80_0.14_70/60%)]",
        gold:
          "border-transparent bg-gradient-to-r from-[oklch(0.85_0.12_75)] to-[oklch(0.75_0.15_65)] text-[oklch(0.12_0.03_250)] shadow-md",
        diamond:
          "border-[oklch(0.80_0.14_70/50%)] bg-[oklch(0.18_0.04_250)] text-[oklch(0.85_0.12_75)] shadow-sm",
        platinum:
          "border-transparent bg-gradient-to-r from-[oklch(0.75_0.03_250)] to-[oklch(0.65_0.02_250)] text-[oklch(0.12_0.03_250)]",
        success:
          "border-transparent bg-green-500/20 text-green-400",
        warning:
          "border-transparent bg-amber-500/20 text-amber-400",
        info:
          "border-transparent bg-blue-500/20 text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
