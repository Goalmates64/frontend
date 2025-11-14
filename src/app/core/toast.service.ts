import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Toast, ToastVariant } from './models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  private readonly timers = new Map<string, number>();
  private counter = 0;

  show(message: string, variant: ToastVariant = 'info', duration = 4000): void {
    if (!message) {
      return;
    }

    const toast: Toast = {
      id: `${Date.now()}-${this.counter++}`,
      message,
      variant,
      duration,
      createdAt: Date.now(),
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (duration > 0) {
      const timer = window.setTimeout(() => this.dismiss(toast.id), duration);
      this.timers.set(toast.id, timer);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 6000);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers.clear();
    this.toastsSubject.next([]);
  }
}
