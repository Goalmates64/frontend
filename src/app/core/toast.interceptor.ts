import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { tap } from 'rxjs/operators';

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
      error: (error: HttpErrorResponse) => {
        const message = extractErrorMessage(error);
        if (message) {
          const variant = error.status >= 500 ? 'error' : error.status >= 400 ? 'warning' : 'info';
          toastService.show(message, variant);
        }

        throw error;
      },
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
  if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return error.error;
  }

  const payload = error.error;
  if (payload && typeof payload === 'object') {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message) && message.length > 0) {
      return String(message[0]);
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
