import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CreatePlacePayload,
  PlacesService,
} from '../../../../core/places.service';
import { ToastService } from '../../../../core/toast.service';
import { PlaceWithDistance } from '../../../../core/models/place.model';
import {
  extractHttpErrorMessage,
  getHttpErrorPayload,
  isHttpErrorResponse,
} from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-place-create',
  templateUrl: './place-create.component.html',
  styleUrls: ['./place-create.component.scss'],
  standalone: false,
})
export class PlaceCreateComponent {
  loading = false;
  conflicts: PlaceWithDistance[] = [];
  apiError: string | null = null;
  readonly returnTo: string | null;

  constructor(
    private readonly placesService: PlacesService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.returnTo = this.route.snapshot.queryParamMap.get('returnTo');
  }

  submit(payload: CreatePlacePayload): void {
    this.apiError = null;
    this.conflicts = [];
    this.loading = true;
    this.placesService.create(payload).subscribe({
      next: (place) => {
        this.loading = false;
        this.toast.success('Lieu enregistré.');
        this.redirectAfterCreate(place.id);
      },
      error: (error) => {
        this.loading = false;
        if (isHttpErrorResponse(error) && error.status === 409) {
          const payload = getHttpErrorPayload(error);
          const conflicts = payload?.['conflicts'];
          const payloadMessage = payload?.['message'];
          if (Array.isArray(conflicts)) {
            this.conflicts = conflicts.filter(isPlaceWithDistance);
          }
          this.apiError =
            typeof payloadMessage === 'string'
              ? payloadMessage
              : "Lieu trop proche d'un autre.";
          if (this.conflicts.length > 0) {
            return;
          }
        }

        this.apiError = extractHttpErrorMessage(
          error,
          'Impossible de créer le lieu.',
        );
      },
    });
  }

  useConflict(place: PlaceWithDistance): void {
    if (this.returnTo) {
      void this.router.navigateByUrl(`${this.returnTo}?placeId=${place.id}`);
    } else {
      void this.router.navigate(['../', place.id], { relativeTo: this.route });
    }
  }

  onCancel(): void {
    if (this.returnTo) {
      void this.router.navigateByUrl(this.returnTo);
    } else {
      void this.router.navigate(['/places']);
    }
  }

  private redirectAfterCreate(placeId: number): void {
    if (this.returnTo) {
      void this.router.navigateByUrl(`${this.returnTo}?placeId=${placeId}`);
      return;
    }
    void this.router.navigate(['/places', placeId]);
  }
}

function isPlaceWithDistance(value: unknown): value is PlaceWithDistance {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PlaceWithDistance>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.city === 'string' &&
    typeof candidate.countryCode === 'string' &&
    typeof candidate.lat === 'number' &&
    typeof candidate.lng === 'number'
  );
}
