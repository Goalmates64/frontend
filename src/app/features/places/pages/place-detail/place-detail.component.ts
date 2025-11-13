import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {PlacesService} from '../../../../core/places.service';
import {Place, PlaceWithDistance} from '../../../../core/models/place.model';
import {ToastService} from '../../../../core/toast.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.component.html',
  styleUrls: ['./place-detail.component.scss'],
  standalone: false,

})
export class PlaceDetailComponent implements OnInit {
  place?: Place;
  loading = true;
  nearby: PlaceWithDistance[] = [];

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

  delete(): void {
    if (!this.place) {
      return;
    }
    if (!confirm(`Supprimer ${this.place.name} ?`)) {
      return;
    }
    this.placesService.delete(this.place.id).subscribe({
      next: () => {
        this.toast.success('Lieu supprimé.');
        void this.router.navigate(['/places']);
      },
      error: () => this.toast.error('Impossible de supprimer ce lieu.'),
    });
  }

  goToMatches(): void {
    if (!this.place) {
      return;
    }
    void this.router.navigate(['/matches/create'], {queryParams: {placeId: this.place.id}});
  }

  private loadPlace(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.placesService.getById(id).subscribe({
      next: (place) => {
        this.place = place;
        this.loading = false;
        this.loadNearby(place);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Lieu introuvable.');
        void this.router.navigate(['/places']);
      },
    });
  }

  private loadNearby(place: Place): void {
    this.placesService.nearby(place.lat, place.lng, 1000).subscribe({
      next: (results) => {
        this.nearby = results.filter((p) => p.id !== place.id).slice(0, 5);
      },
      error: () => {
        this.nearby = [];
      },
    });
  }
}
