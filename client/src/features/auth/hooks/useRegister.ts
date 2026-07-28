import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { authKeys } from "@/features/auth/hooks/useSession";
import { useAuthStore } from "@/features/auth/state/auth.store";
import type { RegisterInput } from "@/features/auth/types";

export function useRegister() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (data) => {
      setAuthenticated(data.user);
      queryClient.setQueryData(authKeys.session(), data.user);
    },
  });
}
