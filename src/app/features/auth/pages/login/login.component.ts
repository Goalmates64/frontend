import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth.service';
import { Router } from '@angular/router';
import { LoginPayload } from '../../../../core/models/auth.model';
import {
  extractHttpErrorMessage,
  getHttpErrorPayload,
} from '../../../../core/utils/http-error.utils';
import { ToastService } from '../../../../core/toast.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loading = false;
  apiError: string | null = null;
  showVerificationHelp = false;
  resendLoading = false;
  twoFactorRequired = false;
  private pendingVerificationEmail: string | null = null;
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    twoFactorCode: ['', [Validators.pattern(/^\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*$/)]],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService,
  ) {}

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.apiError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, twoFactorCode } = this.form.getRawValue();
    const normalizedCode = this.normalizeTwoFactorCode(twoFactorCode);
    const payload: LoginPayload = {
      email,
      password,
      twoFactorCode: normalizedCode ?? undefined,
    };

    this.loading = true;
    this.authService.login(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.showVerificationHelp = false;
        this.pendingVerificationEmail = null;
        this.twoFactorRequired = false;
        this.form.patchValue({ twoFactorCode: '' });
        if (response?.user?.mustChangePassword) {
          void this.router.navigate(['/auth/change-password']);
          return;
        }
        void this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.handleLoginError(error, email);
      },
    });
  }

  resendVerification(): void {
    const email = this.pendingVerificationEmail ?? this.form.getRawValue().email;
    if (!email) {
      this.toast.info('Renseigne ton email pour renvoyer le lien.');
      return;
    }

    this.resendLoading = true;
    this.authService.resendVerification(email).subscribe({
      next: (response) => {
        this.resendLoading = false;
        this.toast.success(response?.message ?? 'Un nouveau lien a ete envoye.');
      },
      error: (error) => {
        this.resendLoading = false;
        this.toast.error(
          extractHttpErrorMessage(error, 'Impossible de renvoyer le lien maintenant.'),
        );
      },
    });
  }

  private handleLoginError(error: unknown, email: string): void {
    const payload = getHttpErrorPayload(error);
    const code = typeof payload?.['code'] === 'string' ? payload['code'] : null;
    this.apiError = extractHttpErrorMessage(error, 'Identifiants incorrects ou erreur serveur.');

    if (code === 'EMAIL_NOT_VERIFIED') {
      this.showVerificationHelp = true;
      this.pendingVerificationEmail = email;
    } else {
      this.showVerificationHelp = false;
      this.pendingVerificationEmail = null;
    }

    if (code === 'TWO_FACTOR_REQUIRED' || code === 'TWO_FACTOR_INVALID') {
      this.twoFactorRequired = true;
    } else if (code !== 'EMAIL_NOT_VERIFIED') {
      this.twoFactorRequired = false;
    }
  }
  private normalizeTwoFactorCode(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const sanitized = value.replace(/\s+/g, '').trim();
    return /^\d{6}$/.test(sanitized) ? sanitized : null;
  }
}
