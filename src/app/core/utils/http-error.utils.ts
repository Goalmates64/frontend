import { HttpErrorResponse } from '@angular/common/http';

type ErrorPayload = {
  message?: unknown;
  error?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';

export const isHttpErrorResponse = (
  error: unknown,
): error is HttpErrorResponse => error instanceof HttpErrorResponse;

export const extractHttpErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }

  if (isHttpErrorResponse(error)) {
    const payload: unknown = error.error;
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload.trim();
    }

    if (isRecord(payload)) {
      const { message, error: nestedError } = payload as ErrorPayload;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message.trim();
      }
      if (Array.isArray(message)) {
        const first = message.find(
          (entry): entry is string =>
            typeof entry === 'string' && entry.trim().length > 0,
        );
        if (first) {
          return first.trim();
        }
      }
      if (typeof nestedError === 'string' && nestedError.trim().length > 0) {
        return nestedError.trim();
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (isRecord(error) && typeof error['message'] === 'string') {
    return (error['message'] as string).trim();
  }

  return fallback;
};

export const getHttpErrorPayload = (
  error: unknown,
): Record<string, unknown> | null => {
  if (isHttpErrorResponse(error) && isRecord(error.error)) {
    return error.error;
  }
  return null;
};
