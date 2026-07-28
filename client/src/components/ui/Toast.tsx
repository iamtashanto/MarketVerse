import { useUiStore } from "@/state/ui.store";
import { cn } from "@/utils/cn";

const VARIANT_STYLES = {
  success: "border-success text-success",
  danger: "border-danger text-danger",
  info: "border-border text-text-primary",
} as const;

/**
 * A single shared aria-live region — both visually-incidental toasts and
 * accessibility-critical announcements (e.g. game events echoed via the
 * bridge, docs/FRONTEND_ARCHITECTURE.md §16) flow through the same queue,
 * so nothing meaningful only exists visually.
 */
export function ToastRegion() {
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-md border bg-surface px-4 py-2 text-sm shadow-lg",
            VARIANT_STYLES[toast.variant],
          )}
        >
          <div className="flex items-center gap-3">
            <span>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-text-muted hover:text-text-primary"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
