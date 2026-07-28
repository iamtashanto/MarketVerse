export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: "PLAYER" | "ADMIN";
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}
