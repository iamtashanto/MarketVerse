import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "@/common/errors/AppError";

/**
 * Validates { body, query, params } against a Zod schema and replaces the
 * request's fields with the parsed (and thus stripped-of-unknown-keys) data.
 * See docs/BACKEND_ARCHITECTURE.md §8.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({ body: req.body, query: req.query, params: req.params });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ValidationError(err.flatten()));
        return;
      }
      next(err);
    }
  };
}
