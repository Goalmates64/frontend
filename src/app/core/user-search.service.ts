import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment} from '../../environments/environment';
import {UserSummary} from './models/user.model';

@Injectable({providedIn: 'root'})
export class UserSearchService {
  private readonly baseUrl = `${environment.apiUrl}/users/search`;

  constructor(private readonly http: HttpClient) {
  }

  search(query: string): Observable<UserSummary[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<UserSummary[]>(this.baseUrl, {params});
  }
}
