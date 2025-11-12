import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {PlacesService, UpdatePlacePayload} from '../../../../core/places.service';
import {Place} from '../../../../core/models/place.model';
import {ToastService} from '../../../../core/toast.service';

@Component({
  selector: 'app-place-edit',
  templateUrl: './place-edit.component.html',
  styleUrls: ['./place-edit.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceEditComponent implements OnInit {
  place?: Place;
  loading = true;
  saving = false;
  apiError: string | null = null;

  constructor(
    private readonly placesService: PlacesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toast: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.loadPlace();
  }

  submit(payload: UpdatePlacePayload): void {
    if (!this.place) {
      return;
    }
    this.apiError = null;
    this.saving = true;
    this.placesService.update(this.place.id, payload).subscribe({
      next: (updated) => {
        this.saving = false;
        this.toast.success('Lieu mis à jour.');
        void this.router.navigate(['/places', updated.id]);
      },
      error: (error) => {
        this.saving = false;
        this.apiError = error.error?.message ?? 'Impossible de mettre à jour le lieu.';
      },
    });
  }

  cancel(): void {
    if (this.place) {
      void this.router.navigate(['/places', this.place.id]);
    } else {
      void this.router.navigate(['/places']);
    }
  }

  private loadPlace(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.placesService.getById(id).subscribe({
      next: (place) => {
        this.place = place;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Lieu introuvable.');
        void this.router.navigate(['/places']);
      },
    });
  }
}
