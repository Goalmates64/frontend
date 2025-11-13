import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PublicTeamSummary, Team } from '../../../core/models/user.model';

export interface UpdateTeamPayload {
  name?: string;
  isPublic?: boolean;
}

export interface CreateTeamPayload {
  name: string;
  isPublic?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly baseUrl = `${environment.apiUrl}/teams`;

  constructor(private readonly http: HttpClient) {}

  getMine(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/mine`);
  }

  getById(teamId: number): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${teamId}`);
  }

  create(payload: CreateTeamPayload): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, payload);
  }

  join(code: string): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/join`, { code });
  }

  update(teamId: number, payload: UpdateTeamPayload): Observable<Team> {
    return this.http.patch<Team>(`${this.baseUrl}/${teamId}`, payload);
  }

  uploadLogo(teamId: number, file: File): Observable<Team> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Team>(`${this.baseUrl}/${teamId}/logo`, formData);
  }

  addMember(teamId: number, username: string): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/${teamId}/members`, {
      username,
    });
  }

  searchPublic(query: string): Observable<PublicTeamSummary[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<PublicTeamSummary[]>(`${this.baseUrl}/search`, {
      params,
    });
  }
}
