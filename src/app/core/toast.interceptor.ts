import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ToastService } from './toast.service';

export const toastInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const message = extractSuccessMessage(event.body);
          if (message) {
            toastService.success(message);
          }
        }
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const message = extractErrorMessage(error);
      if (message) {
        const variant =
          error.status >= 500
            ? 'error'
            : error.status >= 400
              ? 'warning'
              : 'info';
        toastService.show(message, variant);
      }

      return throwError(() => error);
    }),
  );
};

function extractSuccessMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const maybeMessage = (body as { message?: unknown }).message;
  return typeof maybeMessage === 'string' ? maybeMessage : undefined;
}

function extractErrorMessage(error: HttpErrorResponse): string | undefined {
  const payload: unknown = error.error;
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message) && message.length > 0) {
      const first = message.find((entry) => typeof entry === 'string');
      if (typeof first === 'string') {
        return first;
      }
    }
    if (typeof message === 'string') {
      return message;
    }
    const errorText = (payload as { error?: unknown }).error;
    if (typeof errorText === 'string') {
      return errorText;
    }
  }

  return error.message;
}
