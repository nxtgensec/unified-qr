import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex h-chip items-center gap-2 rounded-full px-4 text-small font-medium whitespace-nowrap transition-colors [&_svg]:size-icon-xs [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-border bg-card/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        active: "border-brand bg-brand text-brand-foreground",
        ghost:
          "border border-dashed border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof chipVariants> {
  asChild?: boolean;
}

function Chip({ className, variant, asChild = false, ...props }: ChipProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(chipVariants({ variant, className }))} {...props} />;
}

export { Chip, chipVariants };
