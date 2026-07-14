import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cut press inline-flex items-center justify-center gap-2 font-mono uppercase tracking-wide text-xs font-bold transition focusable disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        accent: "btn-accent",
        surface: "surface-2 text-text hover:brightness-110",
        ghost: "text-muted hover:text-text",
        danger: "bg-miss text-white hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-11 px-5",
        lg: "h-14 px-6 text-sm",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "accent", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
