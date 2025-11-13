import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Place,
  PlacesListResponse,
  PlaceWithDistance,
} from './models/place.model';

export interface CreatePlacePayload {
  name: string;
  city: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export type UpdatePlacePayload = Partial<CreatePlacePayload>;

export interface PlacesListParams {
  page?: number;
  limit?: number;
  query?: string;
}

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly baseUrl = `${environment.apiUrl}/places`;

  constructor(private readonly http: HttpClient) {}

  autocomplete(query: string, limit = 10): Observable<Place[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return of([]);
    }

    let params = new HttpParams().set('query', trimmed);
    params = params.set('limit', String(limit));
    return this.http.get<Place[]>(this.baseUrl, { params });
  }

  list(params: PlacesListParams): Observable<PlacesListResponse> {
    let httpParams = new HttpParams();
    if (params.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    if (params.query?.trim()) {
      httpParams = httpParams.set('query', params.query.trim());
    }
    return this.http.get<PlacesListResponse>(`${this.baseUrl}/list`, {
      params: httpParams,
    });
  }

  nearby(
    lat: number,
    lng: number,
    radius?: number,
  ): Observable<PlaceWithDistance[]> {
    let params = new HttpParams()
      .set('lat', String(lat))
      .set('lng', String(lng));
    if (radius) {
      params = params.set('radius', String(radius));
    }
    return this.http.get<PlaceWithDistance[]>(`${this.baseUrl}/nearby`, {
      params,
    });
  }

  getById(id: number): Observable<Place> {
    return this.http.get<Place>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreatePlacePayload): Observable<Place> {
    return this.http.post<Place>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdatePlacePayload): Observable<Place> {
    return this.http.patch<Place>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
