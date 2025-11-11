import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Toast } from '../../../core/models/toast.model';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: false,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  readonly toasts$: Observable<Toast[]> = this.toastService.toasts$;

  constructor(private readonly toastService: ToastService) {}

  trackById(_: number, toast: Toast): string {
    return toast.id;
  }

  onDismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  toastClasses(toast: Toast): string {
    const base = 'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur text-sm';
    switch (toast.variant) {
      case 'success':
        return `${base} border-emerald-300/40 bg-emerald-600/90 text-white`;
      case 'warning':
        return `${base} border-amber-300/40 bg-amber-500/90 text-slate-950`;
      case 'error':
        return `${base} border-rose-300/40 bg-rose-600/90 text-white`;
      default:
        return `${base} border-slate-200/40 bg-slate-800/80 text-white`;
    }
  }
}
