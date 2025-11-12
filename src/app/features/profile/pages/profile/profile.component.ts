import {ChangeDetectionStrategy, Component, DestroyRef, inject} from '@angular/core';
import {FormBuilder, ValidatorFn, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, take} from 'rxjs';

import {AuthService} from '../../../../core/auth.service';
import {ToastService} from '../../../../core/toast.service';
import {UpdateProfilePayload, User} from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly today = new Date().toISOString().split('T')[0];
  loading = false;
  apiError: string | null = null;
  avatarError: string | null = null;
  avatarUploading = false;
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.maxLength(80)]],
    lastName: ['', [Validators.maxLength(80)]],
    dateOfBirth: ['', [this.pastDateValidator()]],
    city: ['', [Validators.maxLength(120)]],
    country: ['', [Validators.maxLength(120)]],
  });
  private readonly authService = inject(AuthService);
  readonly user$ = this.authService.currentUser$;
  private readonly toast = inject(ToastService);

  constructor() {
    this.user$
      .pipe(
        filter((user): user is User => !!user),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((user) => this.populateForm(user));

    this.authService
      .fetchProfile()
      .pipe(take(1))
      .subscribe({
        error: () => {
        }
      });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.avatarError = null;
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.avatarError = 'Image trop volumineuse (max 2 Mo).';
      input.value = '';
      return;
    }

    this.avatarUploading = true;
    this.authService
      .uploadAvatar(file)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.avatarUploading = false;
          this.toast.success('Photo de profil mise à jour.');
          input.value = '';
        },
        error: (error: HttpErrorResponse) => {
          this.avatarUploading = false;
          this.avatarError = this.extractErrorMessage(error);
        },
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

    this.loading = true;
    const payload = this.buildPayload();

    this.authService
      .updateProfile(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast.success('Profil mis à jour avec succès');
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.apiError = this.extractErrorMessage(error);
        },
      });
  }

  private populateForm(user: User): void {
    this.form.patchValue({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      dateOfBirth: user.dateOfBirth ?? '',
      city: user.city ?? '',
      country: user.country ?? '',
    });
  }

  private buildPayload(): UpdateProfilePayload {
    const {firstName, lastName, dateOfBirth, city, country} =
      this.form.getRawValue();

    return {
      firstName: this.normalizeText(firstName),
      lastName: this.normalizeText(lastName),
      dateOfBirth: dateOfBirth ? dateOfBirth : null,
      city: this.normalizeText(city),
      country: this.normalizeText(country),
    };
  }

  private normalizeText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private pastDateValidator(): ValidatorFn {
    return (control) => {
      const value = control.value as string | null;
      if (!value) {
        return null;
      }

      return value <= this.today ? null : {futureDate: true};
    };
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return Array.isArray(error.error.message)
        ? error.error.message.join(' ')
        : String(error.error.message);
    }

    return "Une erreur est survenue. Merci de réessayer.";
  }
}
