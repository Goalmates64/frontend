import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MatchesService } from '../../services/matches.service';
import { Match } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/toast.service';

@Component({
  selector: 'app-matches-history',
  templateUrl: './matches-history.component.html',
  styleUrls: ['./matches-history.component.scss'],

  standalone: false,
})
export class MatchesHistoryComponent implements OnInit {
  readonly matches$ = new BehaviorSubject<Match[]>([]);
  readonly loading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly matchesService: MatchesService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.matchesService.listHistory().subscribe({
      next: (matches) => {
        this.matches$.next(matches);
        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
        this.toast.error('Impossible de charger l’historique des matchs.');
      },
    });
  }
}
