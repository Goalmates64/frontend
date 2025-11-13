import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';

import { MatchesService } from '../../services/matches.service';
import { TeamsService } from '../../../teams/services/teams.service';
import { ToastService } from '../../../../core/toast.service';
import { PublicTeamSummary, Team } from '../../../../core/models/user.model';
import { PlacesService } from '../../../../core/places.service';
import { Place } from '../../../../core/models/place.model';
import { extractHttpErrorMessage } from '../../../../core/utils/http-error.utils';
import { TeamAutocompleteComponent } from '../../../../shared/ui/team-autocomplete/team-autocomplete.component';

@Component({
  selector: 'app-match-create',
  templateUrl: './match-create.component.html',
  styleUrls: ['./match-create.component.scss'],

  standalone: false,
})
export class MatchCreateComponent implements OnInit, OnDestroy {
  @ViewChild(TeamAutocompleteComponent)
  teamAutocomplete?: TeamAutocompleteComponent;

  teams: Team[] = [];
  loading = false;
  apiError: string | null = null;
  placeSuggestions: Place[] = [];
  isSearchingPlaces = false;
  selectedPlace: Place | null = null;
  selectedAwayTeam: PublicTeamSummary | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  readonly placeSearchControl = this.fb.control('');
  readonly form = this.fb.nonNullable.group({
    homeTeamId: [null as number | null, Validators.required],
    awayTeamId: [null as number | null, Validators.required],
    scheduledAt: ['', Validators.required],
    placeId: [null as number | null, Validators.required],
  });

  constructor(
    private readonly matchesService: MatchesService,
    private readonly teamsService: TeamsService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly placesService: PlacesService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.teamsService.getMine().subscribe({
      next: (teams) => (this.teams = teams),
      error: () => this.toast.error('Impossible de charger tes équipes.'),
    });

    this.placeSearchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((value) => {
          const term = value?.trim() ?? '';
          if (!term || term.length < 2 || this.selectedPlace) {
            this.placeSuggestions = [];
            this.isSearchingPlaces = false;
            return of<Place[]>([]);
          }
          this.isSearchingPlaces = true;
          return this.placesService.autocomplete(term).pipe(take(1));
        }),
      )
      .subscribe({
        next: (results) => {
          this.placeSuggestions = results;
          this.isSearchingPlaces = false;
        },
        error: () => {
          this.isSearchingPlaces = false;
          this.placeSuggestions = [];
        },
      });

    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const placeId = params.get('placeId');
      if (placeId) {
        this.loadPlaceById(Number(placeId));
      }
    });

    this.form.controls.homeTeamId.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((homeId) => {
        if (this.selectedAwayTeam && this.selectedAwayTeam.id === homeId) {
          this.clearAwayTeam();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedHomeTeam(): Team | undefined {
    const homeId = this.form.controls.homeTeamId.value;
    return this.teams.find((team) => team.id === homeId);
  }

  selectPlace(place: Place): void {
    this.selectedPlace = place;
    this.placeSuggestions = [];
    this.form.controls.placeId.setValue(place.id);
    this.placeSearchControl.setValue(place.name, { emitEvent: false });
  }

  clearPlace(): void {
    this.selectedPlace = null;
    this.form.controls.placeId.setValue(null);
    this.placeSearchControl.setValue('', { emitEvent: false });
    this.placeSearchControl.updateValueAndValidity();
  }

  openCreatePlace(): void {
    void this.router.navigate(['/places/new'], {
      queryParams: { returnTo: '/matches/create' },
    });
  }

  onAwayTeamSelected(team: PublicTeamSummary): void {
    const homeTeamId = this.form.controls.homeTeamId.value;
    if (homeTeamId && team.id === homeTeamId) {
      this.toast.error('Choisis une équipe différente.');
      this.teamAutocomplete?.reset();
      return;
    }

    this.selectedAwayTeam = team;
    this.form.controls.awayTeamId.setValue(team.id);
    this.apiError = null;
  }

  clearAwayTeam(): void {
    this.selectedAwayTeam = null;
    this.form.controls.awayTeamId.setValue(null);
    this.teamAutocomplete?.reset();
  }

  submit(): void {
    this.apiError = null;
    const { homeTeamId, awayTeamId, scheduledAt, placeId } =
      this.form.getRawValue();
    if (
      this.form.invalid ||
      !homeTeamId ||
      !awayTeamId ||
      !scheduledAt ||
      !placeId
    ) {
      this.form.markAllAsTouched();
      if (!placeId) {
        this.apiError = 'Sélectionne un lieu pour le match.';
      } else if (!awayTeamId) {
        this.apiError = 'Choisis une équipe adverse.';
      }
      return;
    }

    if (homeTeamId === awayTeamId) {
      this.apiError = 'Sélectionne deux équipes différentes.';
      return;
    }

    this.loading = true;
    const payload = {
      homeTeamId,
      awayTeamId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      placeId,
    };

    this.matchesService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Match programmé !');
        void this.router.navigate(['/matches']);
      },
      error: (error) => {
        this.loading = false;
        this.apiError = extractHttpErrorMessage(
          error,
          'Impossible de programmer ce match.',
        );
      },
    });
  }

  private loadPlaceById(id: number): void {
    this.placesService.getById(id).subscribe({
      next: (place) => this.selectPlace(place),
      error: () => this.toast.error('Lieu introuvable.'),
    });
  }
}
