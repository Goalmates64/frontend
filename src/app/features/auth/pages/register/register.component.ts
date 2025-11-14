import { Component, inject } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { RegisterPayload } from '../../../../core/models/auth.model';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  loading = false;
  apiError: string | null = null;
  private readonly fb = inject(FormBuilder);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get f() {
    return this.form.controls;
  }

  get passwordsMismatch(): boolean {
    return (
      this.form.hasError('passwordsMismatch') &&
      this.f['confirmPassword'].touched
    );
  }

  onSubmit(): void {
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
      next: () => {
        this.loading = false;
        void this.router.navigate(['/']);
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

  private readonly passwordsMatchValidator: ValidatorFn = (group) => {
    const passwordControl = group.get('password');
    const confirmControl = group.get('confirmPassword');
    const password =
      typeof passwordControl?.value === 'string' ? passwordControl.value : null;
    const confirm =
      typeof confirmControl?.value === 'string' ? confirmControl.value : null;
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
