import { create } from "zustand";

interface ConnectionState {
  isOnline: boolean;
  socketConnected: boolean;
  setOnline: (isOnline: boolean) => void;
  setSocketConnected: (connected: boolean) => void;
}

/** Backs the offline banner in RootLayout. See docs/FRONTEND_ARCHITECTURE.md §4. */
export const useConnectionStore = create<ConnectionState>((set) => ({
  isOnline: navigator.onLine,
  socketConnected: false,
  setOnline: (isOnline) => set({ isOnline }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),
}));

window.addEventListener("online", () => useConnectionStore.getState().setOnline(true));
window.addEventListener("offline", () => useConnectionStore.getState().setOnline(false));
