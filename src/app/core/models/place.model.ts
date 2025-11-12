export interface Place {
  id: number;
  name: string;
  city: string;
  countryCode: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceWithDistance extends Place {
  distance: number;
}

export interface PlacesListResponse {
  items: Place[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export interface PlaceConflict {
  id: number;
  name: string;
  city: string;
  countryCode: string;
  lat: number;
  lng: number;
  distance: number;
}