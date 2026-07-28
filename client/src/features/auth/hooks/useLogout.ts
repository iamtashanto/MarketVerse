import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/state/auth.store";

export function useLogout() {
  const queryClient = useQueryClient();
  const setAnonymous = useAuthStore((s) => s.setAnonymous);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setAnonymous();
      queryClient.clear(); // every cached server-state query belonged to the now-ended session
    },
  });
}
