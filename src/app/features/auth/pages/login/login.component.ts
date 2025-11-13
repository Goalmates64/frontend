import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../core/auth.service';
import {Router} from '@angular/router';
import {LoginPayload} from '../../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',

})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  apiError: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.apiError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: LoginPayload = {
      email: this.f['email'].value,
      password: this.f['password'].value,
    };

    this.loading = true;
    this.authService.login(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']); // redirection vers la home
      },
      error: (err) => {
        this.loading = false;
        this.apiError =
          err?.error?.message || 'Identifiants incorrects ou erreur serveur.';
      },
    });
  }
}
