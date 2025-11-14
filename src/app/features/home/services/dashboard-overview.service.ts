import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { DashboardOverview } from '../models/dashboard-overview.model';

@Injectable({ providedIn: 'root' })
export class DashboardOverviewService {
  constructor(private readonly http: HttpClient) {}

  loadOverview(): Observable<DashboardOverview> {
    return this.http
      .get<DashboardOverview>(`${environment.apiUrl}/dashboard/overview`)
      .pipe(map((overview) => this.normalizeOverview(overview)));
  }

  private normalizeOverview(overview: DashboardOverview): DashboardOverview {
    const fallbackRaw = overview.raw ?? {
      teams: [],
      upcomingMatches: [],
      previousMatches: [],
      notifications: [],
      places: [],
    };

    return {
      ...overview,
      stats: overview.stats ?? [],
      quickActions: overview.quickActions ?? [],
      teamAvailability: overview.teamAvailability ?? [],
      recentActivity: overview.recentActivity ?? [],
      weeklyLoad: overview.weeklyLoad ?? [],
      recommendedPlaces: overview.recommendedPlaces ?? [],
      trainingFocus: overview.trainingFocus ?? [],
      upcomingMatchesPreview: overview.upcomingMatchesPreview ?? [],
      raw: {
        teams: fallbackRaw.teams ?? [],
        upcomingMatches: fallbackRaw.upcomingMatches ?? [],
        previousMatches: fallbackRaw.previousMatches ?? [],
        notifications: fallbackRaw.notifications ?? [],
        places: fallbackRaw.places ?? [],
      },
    };
  }
}
