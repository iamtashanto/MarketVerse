import { User } from "@prisma/client";

export interface AuthUserResponseDto {
  id: string; // publicId — never the internal bigint
  email: string;
  username: string;
  displayName: string | null;
  createdAt: string;
}

export interface AuthTokensResponseDto {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number; // seconds
}

export interface AuthResponseDto {
  user: AuthUserResponseDto;
  tokens: AuthTokensResponseDto;
}

export function toAuthUserResponseDto(user: User): AuthUserResponseDto {
  return {
    id: user.publicId,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}
