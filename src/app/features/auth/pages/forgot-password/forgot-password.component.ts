import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth.service';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  loading = false;
  successMessage: string | null = null;
  apiError: string | null = null;
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.apiError = null;
    this.successMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email } = this.form.getRawValue();
    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response?.message ??
          'Si un compte correspond a cet email, un lien vient d\'etre envoye.';
      },
      error: (error) => {
        this.loading = false;
        this.apiError = extractHttpErrorMessage(error, 'Impossible d\'envoyer l\'email pour le moment.');
      },
    });
  }
}
