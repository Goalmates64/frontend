import { Component, inject } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth.service';
import { ToastService } from '../../../../core/toast.service';
import { passwordStrengthValidator } from '../../../../core/validators/password-strength.validator';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  loading = false;
  apiError: string | null = null;
  success: string | null = null;
  private readonly fb = inject(FormBuilder);

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {}

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [this.passwordsMatchValidator()] },
  );

  get f() {
    return this.form.controls;
  }

  get passwordsMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.f.confirmPassword.touched;
  }

  onSubmit(): void {
    this.apiError = null;
    this.success = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.loading = true;
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Mot de passe mis a jour.';
        this.toast.success('Mot de passe mis a jour.');
        void this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.apiError = extractHttpErrorMessage(
          error,
          'Impossible de mettre a jour ton mot de passe.',
        );
      },
    });
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (group) => {
      const password = group.get('newPassword')?.value as string | null;
      const confirm = group.get('confirmPassword')?.value as string | null;
      if (!password || !confirm) {
        return null;
      }

      return password === confirm ? null : { passwordMismatch: true };
    };
  }
}
