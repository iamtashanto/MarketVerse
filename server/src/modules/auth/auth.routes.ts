import { Router } from "express";
import { AuthController } from "@/modules/auth/auth.controller";
import { AuthService } from "@/modules/auth/auth.service";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { prismaWrite } from "@/lib/prisma";
import { validate } from "@/middlewares/validate.middleware";
import { authLimiter } from "@/middlewares/rateLimiter.middleware";
import { loginSchema, refreshSchema, registerSchema } from "@/modules/auth/auth.validation";

const authRepository = new AuthRepository(prismaWrite);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate(registerSchema), authController.register);
authRouter.post("/login", authLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", authLimiter, validate(refreshSchema), authController.refresh);
authRouter.post("/logout", authController.logout);
