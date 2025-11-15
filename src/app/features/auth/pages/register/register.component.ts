import { Component, inject } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth.service';
import { RegisterPayload } from '../../../../core/models/auth.model';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';
import { ToastService } from '../../../../core/toast.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  loading = false;
  apiError: string | null = null;
  verificationEmailSent = false;
  successMessage: string | null = null;
  lastRegisteredEmail: string | null = null;
  resendLoading = false;
  private readonly fb = inject(FormBuilder);

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastService,
  ) {}

  get f() {
    return this.form.controls;
  }

  get passwordsMismatch(): boolean {
    return this.form.hasError('passwordsMismatch') && this.f['confirmPassword'].touched;
  }

  onSubmit(): void {
    if (this.verificationEmailSent) {
      return;
    }

    this.apiError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.form.getRawValue();
    const payload: RegisterPayload = {
      username,
      email,
      password,
    };

    this.loading = true;
    this.authService.register(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.verificationEmailSent = true;
        this.successMessage =
          response?.message ??
          'Un email de vérification vient de partir. Clique dessus pour activer ton compte.';
        this.lastRegisteredEmail = email;
        this.form.disable({ emitEvent: false });
      },
      error: (error) => {
        this.loading = false;
        this.apiError = extractHttpErrorMessage(
          error,
          'Une erreur est survenue lors de la création du compte.',
        );
      },
    });
  }

  resendVerificationEmail(): void {
    const email = this.lastRegisteredEmail ?? this.form.get('email')?.value ?? '';
    if (!email) {
      this.toast.info('Renseigne ton email avant de renvoyer le lien.');
      return;
    }

    this.resendLoading = true;
    this.authService.resendVerification(email).subscribe({
      next: (response) => {
        this.resendLoading = false;
        this.toast.success(response?.message ?? 'Un nouvel email a �t� envoy�.');
      },
      error: (error) => {
        this.resendLoading = false;
        this.toast.error(
          extractHttpErrorMessage(error, "Impossible de renvoyer l'email pour le moment."),
        );
      },
    });
  }

  private readonly passwordsMatchValidator: ValidatorFn = (group) => {
    const passwordControl = group.get('password');
    const confirmControl = group.get('confirmPassword');
    const password = typeof passwordControl?.value === 'string' ? passwordControl.value : null;
    const confirm = typeof confirmControl?.value === 'string' ? confirmControl.value : null;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordsMismatch: true };
  };

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.passwordsMatchValidator],
    },
  );
}
