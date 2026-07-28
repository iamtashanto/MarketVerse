export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  return { success: true, data, ...(meta && { meta }) };
}
