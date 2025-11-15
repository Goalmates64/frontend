import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-verify-email',
  standalone: false,
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  status: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  message = 'Nous v�rifions ton lien...';
  private currentToken: string | null = null;
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.currentToken = params.get('token');
      if (!this.currentToken) {
        this.status = 'error';
        this.message = 'Lien invalide ou expiré.';
        return;
      }
      this.verify(this.currentToken);
    });
  }

  retry(): void {
    if (this.currentToken) {
      this.verify(this.currentToken);
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }

  private verify(token: string): void {
    this.status = 'loading';
    this.message = 'Validation en cours...';
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Email vérifié ! Tu es maintenant connecté.';
      },
      error: (error) => {
        this.status = 'error';
        this.message = extractHttpErrorMessage(error, 'Lien invalide ou déjà utilisé.');
      },
    });
  }
}
