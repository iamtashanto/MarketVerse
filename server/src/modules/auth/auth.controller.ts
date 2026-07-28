import { Request, Response } from "express";
import { AuthService } from "@/modules/auth/auth.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ok } from "@/common/dto/apiResponse.dto";
import { LoginDto, RegisterDto } from "@/modules/auth/auth.validation";
import { UnauthorizedError } from "@/common/errors/AppError";
import { isProduction } from "@/config/env";

const REFRESH_COOKIE = "refreshToken";
const ACCESS_COOKIE = "accessToken";
const SESSION_COOKIE = "sessionId";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body as RegisterDto, requestMeta(req));
    setAuthCookies(res, result);
    res.status(201).json(ok(result));
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body as LoginDto, requestMeta(req));
    setAuthCookies(res, result);
    res.json(ok(result));
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (!refreshToken || !sessionId) throw new UnauthorizedError("Missing refresh credentials");

    const result = await this.authService.refresh(refreshToken, BigInt(sessionId), requestMeta(req));
    setAuthCookies(res, result);
    res.json(ok(result));
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (sessionId) await this.authService.logout(BigInt(sessionId));
    res.clearCookie(ACCESS_COOKIE).clearCookie(REFRESH_COOKIE).clearCookie(SESSION_COOKIE);
    res.status(204).send();
  });
}

function requestMeta(req: Request) {
  return { ipAddress: req.ip, userAgent: req.headers["user-agent"] };
}

function setAuthCookies(res: Response, result: Awaited<ReturnType<AuthService["login"]>>) {
  const cookieOpts = { httpOnly: true, secure: isProduction, sameSite: "strict" as const };
  res.cookie(ACCESS_COOKIE, result.tokens.accessToken, { ...cookieOpts, maxAge: result.tokens.expiresIn * 1000 });
  res.cookie(REFRESH_COOKIE, result.tokens.refreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.cookie(SESSION_COOKIE, result.tokens.sessionId, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
}
