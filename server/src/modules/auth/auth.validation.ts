import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(24)
      .regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores only"),
    password: z
      .string()
      .min(10)
      .max(128)
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a digit"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1).optional(), // optional: may arrive via httpOnly cookie instead
  }),
});

export type RegisterDto = z.infer<typeof registerSchema>["body"];
export type LoginDto = z.infer<typeof loginSchema>["body"];
