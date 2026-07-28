import { apiRequest } from "@/services/apiClient";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "@/features/auth/types";

/**
 * Thin, typed wrappers over apiRequest — no fetching logic of their own.
 * See docs/FRONTEND_ARCHITECTURE.md §10.
 */
export const authApi = {
  register: (input: RegisterInput) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuthRetry: true,
    }),

  login: (input: LoginInput) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuthRetry: true,
    }),

  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),

  me: () => apiRequest<AuthUser>("/users/me"),
};
