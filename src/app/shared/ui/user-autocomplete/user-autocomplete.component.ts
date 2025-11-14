import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap, takeUntil } from 'rxjs/operators';

import { UserSearchService } from '../../../core/user-search.service';
import { UserSummary } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-autocomplete',
  templateUrl: './user-autocomplete.component.html',
  styleUrls: ['./user-autocomplete.component.scss'],
  standalone: false,
})
export class UserAutocompleteComponent implements OnInit, OnDestroy {
  @Output() userSelected = new EventEmitter<UserSummary>();

  readonly control = new FormControl('', { nonNullable: true });
  suggestions: UserSummary[] = [];
  loading = false;

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  constructor(private readonly userSearch: UserSearchService) {}

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          const query = term.trim();
          if (!query || query.length < 2) {
            this.loading = false;
            return of<UserSummary[]>([]);
          }
          this.loading = true;
          return this.userSearch.search(query).pipe(finalize(() => (this.loading = false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((results) => {
        this.suggestions = results;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.search$.complete();
  }

  onInput(value: string): void {
    this.search$.next(value);
  }

  selectUser(user: UserSummary): void {
    this.control.setValue(user.username);
    this.suggestions = [];
    this.userSelected.emit(user);
  }
}
