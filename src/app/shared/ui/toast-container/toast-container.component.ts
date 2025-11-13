import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Toast } from '../../../core/models/toast.model';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: false,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
  toasts$: Observable<Toast[]>;

  constructor(private readonly toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  trackById(_: number, toast: Toast): string {
    return toast.id;
  }

  onDismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  toastClasses(toast: Toast): string {
    const base =
      'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur text-sm';
    switch (toast.variant) {
      case 'success':
        return `${base} border-emerald-300/40 bg-emerald-600/95 text-white`;
      case 'warning':
        return `${base} border-amber-300/40 bg-amber-300 text-slate-900`;
      case 'error':
        return `${base} border-rose-300/40 bg-rose-600/95 text-white`;
      default:
        return `${base} border-slate-200/40 bg-slate-800/90 text-white`;
    }
  }

  toastIcon(toast: Toast): string {
    switch (toast.variant) {
      case 'success':
        return 'fa-solid fa-circle-check text-emerald-100';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation text-amber-600';
      case 'error':
        return 'fa-solid fa-circle-xmark text-rose-100';
      default:
        return 'fa-solid fa-circle-info text-slate-100';
    }
  }
}
