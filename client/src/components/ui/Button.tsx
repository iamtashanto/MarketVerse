import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Spinner } from "@/components/feedback/Spinner";

/**
 * Variant styling via cva, not conditional class strings in JSX — keeps
 * Tailwind logic declarative and out of every call site.
 * See docs/FRONTEND_ARCHITECTURE.md §15.
 */
const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
    "disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-bg-canvas hover:opacity-90",
        secondary: "bg-surface-raised text-text-primary hover:bg-surface",
        ghost: "bg-transparent text-text-primary hover:bg-surface",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  isLoading?: boolean;
}

/**
 * A real <button> — never a styled <div onClick>. Keyboard-activatable and
 * focus-visible by default. See docs/FRONTEND_ARCHITECTURE.md §16.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Spinner size="sm" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
