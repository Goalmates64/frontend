import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

import { AuthService } from '../../../../core/auth.service';
import { ToastService } from '../../../../core/toast.service';
import { UpdateProfilePayload, User } from '../../../../core/models/user.model';

interface CountryDto {
  name: string;
  code: string;
}

interface CountryOption extends CountryDto {
  flag: string;
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  readonly today = new Date().toISOString().split('T')[0];
  loading = false;
  apiError: string | null = null;
  avatarError: string | null = null;
  avatarUploading = false;
  countries: CountryOption[] = [];
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.maxLength(80)]],
    lastName: ['', [Validators.maxLength(80)]],
    dateOfBirth: ['', [this.pastDateValidator()]],
    city: ['', [Validators.maxLength(120)]],
    country: ['', [Validators.maxLength(120)]],
    isChatEnabled: true,
  });
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  readonly user$ = this.authService.currentUser$;
  private readonly toast = inject(ToastService);

  constructor() {
    this.loadCountries();
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
        error: () => {},
      });
  }

  get f() {
    return this.form.controls;
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

  hasCountryOption(value: string | null | undefined): boolean {
    if (!value) {
      return false;
    }

    return this.countries.some((country) => country.name === value);
  }

  private loadCountries(): void {
    this.http
      .get<CountryDto[]>('data/countries.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countries) => {
          this.countries = countries
            .map((country) => ({
              ...country,
              flag: this.countryCodeToFlag(country.code),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        },
        error: () => {
          this.countries = [];
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
      isChatEnabled: user.isChatEnabled,
    });
  }

  private buildPayload(): UpdateProfilePayload {
    const { firstName, lastName, dateOfBirth, city, country, isChatEnabled } =
      this.form.getRawValue();

    return {
      firstName: this.normalizeText(firstName),
      lastName: this.normalizeText(lastName),
      dateOfBirth: dateOfBirth ? dateOfBirth : null,
      city: this.normalizeText(city),
      country: this.normalizeText(country),
      isChatEnabled,
    };
  }

  private countryCodeToFlag(code: string): string {
    const fallback = String.fromCodePoint(0x1f3f3, 0xfe0f);
    if (!code) {
      return fallback;
    }

    const formatted = code.trim().toUpperCase();
    if (formatted.length !== 2 || /[^A-Z]/.test(formatted)) {
      return fallback;
    }

    const first = formatted.codePointAt(0);
    const second = formatted.codePointAt(1);
    if (first === undefined || second === undefined) {
      return fallback;
    }

    return String.fromCodePoint(0x1f1e6 + (first - 65), 0x1f1e6 + (second - 65));
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

      return value <= this.today ? null : { futureDate: true };
    };
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const payload: unknown = error.error;
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload.trim();
    }

    if (payload && typeof payload === 'object') {
      const { message } = payload as { message?: unknown };
      if (typeof message === 'string' && message.trim().length > 0) {
        return message.trim();
      }
      if (Array.isArray(message)) {
        const first = message.find(
          (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
        );
        if (first) {
          return first.trim();
        }
      }
    }

    return 'Une erreur est survenue. Merci de réessayer.';
  }
}
