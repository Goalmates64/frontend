import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Team } from '../../../core/models/user.model';

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

  create(name: string): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, { name });
  }

  join(code: string): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/join`, { code });
  }

  update(teamId: number, payload: { name?: string }): Observable<Team> {
    return this.http.patch<Team>(`${this.baseUrl}/${teamId}`, payload);
  }

  addMember(teamId: number, username: string): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/${teamId}/members`, {
      username,
    });
  }
}
