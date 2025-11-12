import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';

import {PlacesService} from '../../../../core/places.service';
import {ToastService} from '../../../../core/toast.service';
import {Place} from '../../../../core/models/place.model';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacesListComponent implements OnInit {
  places: Place[] = [];
  total = 0;
  loading = false;
  page = 1;
  hasMore = false;
  private readonly fb = inject(FormBuilder);
  readonly searchControl = this.fb.control('');

  constructor(
    private readonly placesService: PlacesService,
    private readonly toast: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.loadPlaces(true);
  }

  onSearch(): void {
    this.page = 1;
    this.loadPlaces(true);
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) {
      return;
    }
    this.page += 1;
    this.loadPlaces();
  }

  refresh(): void {
    this.page = 1;
    this.loadPlaces(true);
  }

  delete(place: Place): void {
    if (!confirm(`Supprimer ${place.name} ?`)) {
      return;
    }
    this.placesService.delete(place.id).subscribe({
      next: () => {
        this.toast.success('Lieu supprimé.');
        this.refresh();
      },
      error: () => this.toast.error('Impossible de supprimer ce lieu.'),
    });
  }

  private loadPlaces(reset = false): void {
    this.loading = true;
    const query = this.searchControl.value?.trim() ?? undefined;
    this.placesService
      .list({page: this.page, limit: 10, query})
      .subscribe({
        next: (response) => {
          this.total = response.meta.total;
          this.hasMore = response.meta.page < (response.meta.pageCount || 0);
          this.places = reset ? response.items : [...this.places, ...response.items];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.error('Impossible de charger les lieux.');
        },
      });
  }
}
