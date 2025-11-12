import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {take} from 'rxjs';

import {CreatePlacePayload} from '../../../../core/places.service';

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
export class PlaceFormComponent implements OnChanges {
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
    lat: [48.8566, [Validators.required, Validators.min(-90), Validators.max(90)]],
    lng: [2.3522, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });

  constructor(private readonly http: HttpClient) {
    this.loadCountries();
  }

  get currentLat(): number {
    return this.form.controls.lat.value;
  }

  get currentLng(): number {
    return this.form.controls.lng.value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      this.form.patchValue({
        name: this.initialValue.name ?? '',
        city: this.initialValue.city ?? '',
        countryCode: this.initialValue.countryCode ?? this.form.value.countryCode,
        lat: this.initialValue.lat ?? this.form.value.lat,
        lng: this.initialValue.lng ?? this.form.value.lng,
      });
    }
  }

  onCoordinatesChange(coords: { lat: number; lng: number }): void {
    this.form.patchValue({lat: coords.lat, lng: coords.lng}, {emitEvent: false});
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {name, city, countryCode, lat, lng} = this.form.getRawValue();
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
}
