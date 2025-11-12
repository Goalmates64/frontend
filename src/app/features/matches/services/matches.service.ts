import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment} from '../../../../environments/environment';
import {Match} from '../../../core/models/user.model';

export interface CreateMatchPayload {
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string;
  location: string;
}

export interface ReportScorePayload {
  homeScore: number;
  awayScore: number;
}

@Injectable({providedIn: 'root'})
export class MatchesService {
  private readonly baseUrl = `${environment.apiUrl}/matches`;

  constructor(private readonly http: HttpClient) {
  }

  listUpcoming(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/upcoming`);
  }

  create(payload: CreateMatchPayload): Observable<Match> {
    return this.http.post<Match>(this.baseUrl, payload);
  }

  reportScore(matchId: number, payload: ReportScorePayload): Observable<Match> {
    return this.http.post<Match>(`${this.baseUrl}/${matchId}/score`, payload);
  }
}

