import { create } from "zustand";

export type ModalId = "confirm-terminate-employee" | "upgrade-store" | "iap-purchase" | null;

export interface Toast {
  id: string;
  variant: "success" | "danger" | "info";
  message: string;
}

interface UiState {
  activeModal: ModalId;
  toasts: Toast[];
  openModal: (id: NonNullable<ModalId>) => void;
  closeModal: () => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

/**
 * Global client-only state — selector-based subscriptions mean a component
 * re-renders only when the specific slice it reads changes. See
 * docs/FRONTEND_ARCHITECTURE.md §7–8.
 */
export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  toasts: [],
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  pushToast: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
