import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {CreatePlacePayload, PlacesService} from '../../../../core/places.service';
import {ToastService} from '../../../../core/toast.service';
import {PlaceWithDistance} from '../../../../core/models/place.model';

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
        if (error.status === 409 && error.error?.conflicts) {
          this.conflicts = error.error.conflicts;
          this.apiError = error.error?.message ?? "Lieu trop proche d'un autre.";
          return;
        }
        this.apiError = error.error?.message ?? 'Impossible de créer le lieu.';
      },
    });
  }

  useConflict(place: PlaceWithDistance): void {
    if (this.returnTo) {
      void this.router.navigateByUrl(`${this.returnTo}?placeId=${place.id}`);
    } else {
      void this.router.navigate(['../', place.id], {relativeTo: this.route});
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

