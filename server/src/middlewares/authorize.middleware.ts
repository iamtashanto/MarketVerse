import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/common/errors/AppError";
import { AuthenticatedUser } from "@/common/types/express";

/**
 * Coarse-grained, role-based authorization for admin routes.
 * Fine-grained ownership checks (e.g. "is this store yours") live in the
 * relevant service method instead — see docs/BACKEND_ARCHITECTURE.md §10.
 */
export function authorize(...allowedAdminRoles: NonNullable<AuthenticatedUser["adminRole"]>[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    if (req.user.role !== "ADMIN" || !req.user.adminRole) {
      throw new ForbiddenError("Admin access required");
    }
    if (!allowedAdminRoles.includes(req.user.adminRole)) {
      throw new ForbiddenError(`Requires one of: ${allowedAdminRoles.join(", ")}`);
    }
    next();
  };
}
