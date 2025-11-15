import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { passwordStrengthValidator } from '../../../../core/validators/password-strength.validator';
import { ToastService } from '../../../../core/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth.service';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  loading = false;
  apiError: string | null = null;
  tokenMissing = false;
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private token: string | null = null;

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirm: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator() },
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.token = params.get('token');
      this.tokenMissing = !this.token;
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.apiError = null;

    if (this.tokenMissing || !this.token) {
      this.apiError = 'Lien de reinitialisation invalide.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password } = this.form.getRawValue();
    this.loading = true;
    this.authService.resetPassword({ token: this.token, password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
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
      const password = group.get('password')?.value as string | null;
      const confirm = group.get('confirm')?.value as string | null;
      if (!password || !confirm) {
        return null;
      }

      return password === confirm ? null : { mismatch: true };
    };
  }
}
