import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../../core/auth.service';
import {RegisterPayload} from '../../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  apiError: string | null = null;

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly router: Router) {
    this.form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [this.passwordsMatchValidator],
      }
    );
  }

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

    const payload: RegisterPayload = {
      username: this.f['username'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
    };

    this.loading = true;
    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.apiError =
          err?.error?.message ||
          'Une erreur est survenue lors de la création du compte.';
      },
    });
  }

  private passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : {passwordsMismatch: true};
  }
}
