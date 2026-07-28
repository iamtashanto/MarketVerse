/**
 * Mirrors the backend's response/error envelope exactly.
 * See docs/API_REFERENCE.md §0.3–0.4.
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody;

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}
