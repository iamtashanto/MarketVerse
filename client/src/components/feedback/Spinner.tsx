import { cn } from "@/utils/cn";

const SIZES = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-10 w-10 border-[3px]" } as const;

export interface SpinnerProps {
  size?: keyof typeof SIZES;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <span
      role={props["aria-hidden"] ? undefined : "status"}
      aria-label={props["aria-hidden"] ? undefined : "Loading"}
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
