export type ErrorCode =
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "INTERNAL_SERVER_ERROR";

export class HttpError extends Error {
  readonly status: 400 | 401 | 403 | 404 | 429 | 500;
  readonly code: ErrorCode;

  constructor(
    status: 400 | 401 | 403 | 404 | 429 | 500,
    code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export function createHttpError(
  status: 400 | 401 | 403 | 404 | 429 | 500,
  code: ErrorCode,
  message: string,
) {
  return new HttpError(status, code, message);
}

export function errorToResponse(error: unknown) {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
        },
      },
    } as const;
  }

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "服务器内部错误",
      },
    },
  } as const;
}