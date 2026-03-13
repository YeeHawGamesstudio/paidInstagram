import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-200 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary/60 bg-[linear-gradient(180deg,_rgba(221,191,136,1),_rgba(201,169,110,1))] text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_32px_rgba(201,169,110,0.2)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(201,169,110,0.28)]",
        secondary:
          "border-white/8 bg-secondary/92 text-secondary-foreground shadow-[0_12px_24px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-secondary",
        destructive:
          "border-red-500/55 bg-[linear-gradient(180deg,_rgba(239,68,68,0.92),_rgba(185,28,28,0.96))] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_32px_rgba(127,29,29,0.28)] hover:-translate-y-0.5 hover:border-red-400/70 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_40px_rgba(127,29,29,0.36)]",
        ghost: "text-foreground/82 hover:bg-white/[0.05] hover:text-foreground",
        outline:
          "border-white/12 bg-white/[0.025] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-primary/45 hover:bg-white/[0.06]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-[0.95rem]",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
