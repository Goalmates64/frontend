import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import { TeamsService } from '../../../features/teams/services/teams.service';
import { PublicTeamSummary } from '../../../core/models/user.model';

@Component({
  selector: 'app-team-autocomplete',
  templateUrl: './team-autocomplete.component.html',
  styleUrls: ['./team-autocomplete.component.scss'],
  standalone: false,
})
export class TeamAutocompleteComponent implements OnInit, OnDestroy, OnChanges {
  @Output() teamSelected = new EventEmitter<PublicTeamSummary>();
  @Input() placeholder = 'Rechercher une équipe';
  @Input() label = 'Équipe publique';
  @Input() excludeTeamIds: number[] = [];

  readonly control = new FormControl('', { nonNullable: true });
  suggestions: PublicTeamSummary[] = [];
  loading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly teamsService: TeamsService) {}

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          const query = term.trim();
          if (!query || query.length < 2) {
            this.loading = false;
            return of<PublicTeamSummary[]>([]);
          }
          this.loading = true;
          return this.teamsService.searchPublic(query).pipe(
            catchError(() => of<PublicTeamSummary[]>([])),
            finalize(() => (this.loading = false)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((results) => {
        this.suggestions = this.filterExcluded(results);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['excludeTeamIds'] && this.suggestions.length) {
      this.suggestions = this.filterExcluded(this.suggestions);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTeam(team: PublicTeamSummary): void {
    this.control.setValue(team.name, { emitEvent: false });
    this.suggestions = [];
    this.teamSelected.emit(team);
  }

  reset(): void {
    this.control.setValue('', { emitEvent: false });
    this.suggestions = [];
  }

  private filterExcluded(results: PublicTeamSummary[]): PublicTeamSummary[] {
    if (!this.excludeTeamIds?.length) {
      return results;
    }
    const set = new Set(this.excludeTeamIds);
    return results.filter((team) => !set.has(team.id));
  }
}
