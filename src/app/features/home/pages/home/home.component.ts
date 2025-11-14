import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';

import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/auth.service';
import { DashboardOverview } from '../../models/dashboard-overview.model';
import { DashboardOverviewService } from '../../services/dashboard-overview.service';

interface HomeViewModel {
  status: 'guest' | 'loading' | 'ready' | 'error';
  isAuthenticated: boolean;
  user: User | null;
  overview: DashboardOverview | null;
  error?: string | null;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly vm$: Observable<HomeViewModel>;
  protected readonly Math = Math;
  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private readonly authService: AuthService,
    private readonly dashboardOverview: DashboardOverviewService,
  ) {
    const authState$ = combineLatest([
      this.authService.isAuthenticated$,
      this.authService.currentUser$,
    ]);

    this.vm$ = combineLatest([authState$, this.refreshTrigger$]).pipe(
      switchMap(([[isAuthenticated, user]]) => {
        if (!isAuthenticated) {
          return of<HomeViewModel>({
            status: 'guest',
            isAuthenticated,
            user,
            overview: null,
            error: null,
          });
        }

        return this.dashboardOverview.loadOverview().pipe(
          map((overview) => ({
            status: 'ready' as const,
            isAuthenticated,
            user,
            overview,
            error: null,
          })),
          startWith<HomeViewModel>({
            status: 'loading',
            isAuthenticated,
            user,
            overview: null,
            error: null,
          }),
          catchError((error) =>
            of<HomeViewModel>({
              status: 'error',
              isAuthenticated,
              user,
              overview: null,
              error: this.toErrorMessage(error),
            }),
          ),
        );
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  reloadDashboard(): void {
    this.refreshTrigger$.next();
  }

  trackById(_index: number, item: { id: string | number }): string | number {
    return item.id;
  }

  trackByLabel(_index: number, item: { label: string }): string {
    return item.label;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Impossible de charger le tableau de bord pour le moment.';
  }
}
