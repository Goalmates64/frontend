import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

const DEFAULT_COORDS: [number, number] = [48.8566, 2.3522];
const MARKER_ICON_RETINA = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString();
const MARKER_ICON = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString();
const MARKER_SHADOW = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString();
let iconInitialized = false;

function ensureLeafletIconDefaults(): void {
  if (iconInitialized) {
    return;
  }
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: MARKER_ICON_RETINA,
    iconUrl: MARKER_ICON,
    shadowUrl: MARKER_SHADOW,
  });
  iconInitialized = true;
}

@Component({
  selector: 'app-place-map',
  templateUrl: './place-map.component.html',
  styleUrls: ['./place-map.component.scss'],
  standalone: false,

})
export class PlaceMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() lat: number | null = null;
  @Input() lng: number | null = null;
  @Input() readonly = false;
  @Input() height = '320px';
  @Output() coordinatesChange = new EventEmitter<{ lat: number; lng: number }>();
  @ViewChild('mapContainer', {static: true}) private readonly mapContainer?: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit(): void {
    ensureLeafletIconDefaults();
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['lat'] || changes['lng']) && this.map && this.marker) {
      const nextLat = this.lat ?? DEFAULT_COORDS[0];
      const nextLng = this.lng ?? DEFAULT_COORDS[1];
      this.marker.setLatLng([nextLat, nextLng]);
      this.map.setView([nextLat, nextLng]);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initializeMap(): void {
    if (!this.mapContainer) {
      return;
    }
    const initialLat = this.lat ?? DEFAULT_COORDS[0];
    const initialLng = this.lng ?? DEFAULT_COORDS[1];
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    this.marker = L.marker([initialLat, initialLng], {
      draggable: !this.readonly,
    }).addTo(this.map);

    if (!this.readonly) {
      this.marker.on('dragend', () => {
        const position = this.marker?.getLatLng();
        if (position) {
          this.emitCoords(position.lat, position.lng);
        }
      });
      this.map.on('click', (event: L.LeafletMouseEvent) => {
        this.marker?.setLatLng(event.latlng);
        this.emitCoords(event.latlng.lat, event.latlng.lng);
      });
    }
  }

  private emitCoords(lat: number, lng: number): void {
    this.coordinatesChange.emit({lat, lng});
  }
}
