export interface AuthenticatedUser {
  id: bigint;
  role: "PLAYER" | "ADMIN";
  adminRole?: "SUPPORT" | "MODERATOR" | "ECONOMY_MANAGER" | "SUPERADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId: string;
    }
  }
}

export {};
