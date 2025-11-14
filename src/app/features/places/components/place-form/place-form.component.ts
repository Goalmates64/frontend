import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CreatePlacePayload } from '../../../../core/places.service';

interface CountryOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-place-form',
  templateUrl: './place-form.component.html',
  styleUrls: ['./place-form.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceFormComponent implements OnChanges, OnInit {
  @Input() initialValue?: Partial<CreatePlacePayload> | null;
  @Input() submitLabel = 'Enregistrer';
  @Input() loading = false;
  @Input() showCancel = false;
  @Output() formSubmit = new EventEmitter<CreatePlacePayload>();
  @Output() cancel = new EventEmitter<void>();

  countries: CountryOption[] = [];

  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    city: ['', [Validators.required, Validators.maxLength(120)]],
    countryCode: ['FR', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    // Valeurs par défaut = Paris, remplacées par la géoloc si dispo
    lat: [48.8566, [Validators.required, Validators.min(-90), Validators.max(90)]],
    lng: [2.3522, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly geoOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 8000,
    maximumAge: 0,
  };
  private suppressManualFlag = false;
  private coordsManuallyEdited = false;
  private userLocationApplied = false;

  constructor(private readonly http: HttpClient) {
    this.loadCountries();
    this.observeManualCoordinateChanges();
  }

  get currentLat(): number {
    return this.form.controls.lat.value;
  }

  get currentLng(): number {
    return this.form.controls.lng.value;
  }

  ngOnInit(): void {
    this.initUserLocation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      this.runWithoutManualTracking(() =>
        this.form.patchValue({
          name: this.initialValue?.name ?? '',
          city: this.initialValue?.city ?? '',
          countryCode: this.initialValue?.countryCode ?? this.form.value.countryCode,
          // Si initialValue ne fournit pas lat/lng, on garde la valeur actuelle (géoloc ou défaut)
          lat: this.initialValue?.lat ?? this.form.value.lat,
          lng: this.initialValue?.lng ?? this.form.value.lng,
        }),
      );
    }
  }

  onCoordinatesChange(coords: { lat: number; lng: number }): void {
    this.coordsManuallyEdited = true;
    this.form.patchValue({ lat: coords.lat, lng: coords.lng }, { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, city, countryCode, lat, lng } = this.form.getRawValue();
    this.formSubmit.emit({
      name: name.trim(),
      city: city.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      lat,
      lng,
    });
  }

  triggerCancel(): void {
    this.cancel.emit();
  }

  private loadCountries(): void {
    this.http
      .get<CountryOption[]>('data/countries.json')
      .pipe(take(1))
      .subscribe({
        next: (countries) => {
          this.countries = countries.sort((a, b) => a.name.localeCompare(b.name));
        },
        error: () => {
          this.countries = [];
        },
      });
  }

  private initUserLocation(): void {
    if (this.initialValue || this.coordsManuallyEdited || this.userLocationApplied) {
      return;
    }

    // Protection SSR + contextes non sécurisés (obligatoire pour la géoloc navigateur)
    if (typeof window === 'undefined' || !('geolocation' in navigator) || !window.isSecureContext) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (this.initialValue || this.coordsManuallyEdited || this.userLocationApplied) {
          return;
        }
        const { latitude, longitude } = pos.coords;
        this.runWithoutManualTracking(() => {
          this.form.patchValue({ lat: latitude, lng: longitude });
        });
        this.userLocationApplied = true;
        this.cdr.markForCheck();
      },
      () => {
        // En cas de refus / erreur, on garde les valeurs par défaut (Paris)
      },
      this.geoOptions,
    );
  }

  private observeManualCoordinateChanges(): void {
    this.form.controls.lat.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.flagManualCoordinateEdit());
    this.form.controls.lng.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.flagManualCoordinateEdit());
  }

  private flagManualCoordinateEdit(): void {
    if (this.suppressManualFlag) {
      return;
    }
    this.coordsManuallyEdited = true;
  }

  private runWithoutManualTracking(callback: () => void): void {
    this.suppressManualFlag = true;
    callback();
    this.suppressManualFlag = false;
  }
}
