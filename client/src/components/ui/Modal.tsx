import { createContext, useContext, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { VisuallyHidden } from "@/components/layout/VisuallyHidden";
import { cn } from "@/utils/cn";

interface ModalContextValue {
  onClose: () => void;
  titleId: string;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext(component: string): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error(`Modal.${component} must be used within Modal.Root`);
  return ctx;
}

interface RootProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  titleId: string;
}

/**
 * Compound component — Root owns all the accessibility wiring (focus trap,
 * aria-modal, Escape-to-close, focus restore) exactly once, so no per-usage
 * modal ever forgets it. See docs/FRONTEND_ARCHITECTURE.md §15–16.
 */
function Root({ open, onClose, children, titleId }: RootProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl"
      >
        <ModalContext.Provider value={{ onClose, titleId }}>{children}</ModalContext.Provider>
      </div>
    </div>,
    document.body,
  );
}

function Header({ children }: { children: ReactNode }) {
  const { titleId, onClose } = useModalContext("Header");
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <h2 id={titleId} className="text-lg font-semibold text-text-primary">
        {children}
      </h2>
      <button
        onClick={onClose}
        className={cn(
          "rounded-md p-1 text-text-muted hover:bg-surface-raised",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
        )}
      >
        <VisuallyHidden>Close dialog</VisuallyHidden>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

function Body({ children }: { children: ReactNode }) {
  return <div className="text-sm text-text-primary">{children}</div>;
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}

export const Modal = { Root, Header, Body, Footer };
