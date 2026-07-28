import { Prisma } from "@prisma/client";
import { AppError, ConflictError, InternalError, NotFoundError, ValidationError } from "@/common/errors/AppError";

/**
 * Translates any thrown value — including raw Prisma errors — into an AppError.
 * A client must never see a raw Prisma/SQL-adjacent error message.
 * See docs/BACKEND_ARCHITECTURE.md §17.
 */
export function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
        return new ConflictError(`A record with this ${target} already exists`);
      }
      case "P2025":
        return new NotFoundError("Record not found");
      case "P2003":
        return new ValidationError({ message: "Invalid reference to a related record" });
      default:
        return new InternalError("Database error", { prismaCode: err.code });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError({ message: "Malformed database query" });
  }

  if (err instanceof Error) {
    return new InternalError(err.message);
  }

  return new InternalError("Unknown error");
}
