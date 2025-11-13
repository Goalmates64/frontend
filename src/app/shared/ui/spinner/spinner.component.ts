import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: false,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  @Input() label = 'Chargement...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() layout: 'inline' | 'block' = 'inline';
  @Input() colorClass = 'text-gm-muted';

  get accessibleLabel(): string {
    return this.label?.trim().length ? this.label : 'Chargement...';
  }

  get containerClasses(): string {
    const base =
      this.layout === 'block'
        ? 'flex flex-col items-center justify-center gap-3 text-center'
        : 'inline-flex items-center gap-2';
    return `${base} ${this.colorClass}`.trim();
  }

  get circleSizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'spinner-circle--sm';
      case 'lg':
        return 'spinner-circle--lg';
      default:
        return 'spinner-circle--md';
    }
  }
}
