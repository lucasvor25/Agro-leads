import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Lead } from '../../../core/models/lead';
import { LeadService } from '../../../core/services/lead';
import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { SkeletonModule } from 'primeng/skeleton';
import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { environment } from 'src/environments/environment';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PropertyService } from 'src/app/core/services/property';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [
    CommonModule,
    ...PRIMENG_MODULES,
    SkeletonModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './lead-detail.html',
  styleUrls: ['./lead-detail.css']
})
export class LeadDetailComponent implements OnInit, OnDestroy {

  lead: Lead | null = null;
  properties: any[] = [];
  loading: boolean = true;

  map: mapboxgl.Map | undefined;
  selectedPropId: number | null = null;

  private mapInitAttempts = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef
  ) {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLead(Number(id));
    }
  }

  loadLead(id: number) {
    this.loading = true;
    this.leadService.getLeadById(id).subscribe({
      next: (data) => {
        this.lead = data;
        this.loadProperties(id);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadProperties(leadId: number) {
    this.propertyService.getProperties().subscribe(props => {
      this.properties = props.filter(p => p.lead?.id === leadId);
      this.loading = false;

      this.cdr.detectChanges();

      if (this.properties.length > 0) {
        this.mapInitAttempts = 0;
        this.tryInitMap();
      }
    });
  }

  tryInitMap() {

    const container = document.getElementById('mini-map');

    if (container) {
      this.initMap();
    } else {
      this.mapInitAttempts++;
      if (this.mapInitAttempts < 50) {
        setTimeout(() => this.tryInitMap(), 100);
      } else {
        console.warn('Abortando criação do mapa: Container #mini-map não encontrado após 5s.');
      }
    }
  }

  initMap() {
    if (this.map) return;

    this.map = new mapboxgl.Map({
      container: 'mini-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-47.5, -18.5],
      zoom: 6
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      this.map?.resize();
      this.addMarkersAndFitBounds();
    });
  }

  addMarkersAndFitBounds() {
    if (!this.map || !this.properties.length) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidBounds = false;

    this.properties.forEach(prop => {

      if (prop.geometry && prop.geometry.type !== 'Point') {
        this.addPolygon(prop);
        const bbox = turf.bbox(prop.geometry);
        bounds.extend([bbox[0], bbox[1]] as any);
        bounds.extend([bbox[2], bbox[3]] as any);
        hasValidBounds = true;
      }

      let lat = prop.lat;
      let lng = prop.lng;

      if (!lat && prop.geometry) {
        if (prop.geometry.type === 'Point') {
          lng = prop.geometry.coordinates[0];
          lat = prop.geometry.coordinates[1];
        } else {
          const center = turf.centroid(prop.geometry);
          lng = center.geometry.coordinates[0];
          lat = center.geometry.coordinates[1];
        }
      }

      if (lat && lng) {
        this.addMarker(prop, lng, lat);
        bounds.extend([lng, lat]);
        hasValidBounds = true;
      }
    });

    if (hasValidBounds) {
      this.map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }

  addMarker(prop: any, lng: number, lat: number) {
    if (!this.map) return;

    const el = document.createElement('div');
    el.className = 'custom-marker';
    const color = this.getColorByCulture(prop.culture);
    el.style.backgroundColor = color;
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.innerHTML = `<i class="pi pi-map-marker text-white" style="font-size: 12px;"></i>`;

    new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="font-family: sans-serif; color: #333;">
            <b>${prop.name}</b><br>
            <span style="font-size: 12px; color: #666;">${prop.culture} • ${prop.area} ha</span>
          </div>
      `))
      .addTo(this.map);
  }

  addPolygon(prop: any) {
    if (!this.map) return;

    const id = `poly-${prop.id}`;
    if (this.map.getSource(id)) return;

    this.map.addSource(id, { type: 'geojson', data: prop.geometry });

    this.map.addLayer({
      id: id, type: 'fill', source: id,
      paint: {
        'fill-color': this.getColorByCulture(prop.culture),
        'fill-opacity': 0.4
      }
    });

    this.map.addLayer({
      id: id + '-line', type: 'line', source: id,
      paint: { 'line-color': '#fff', 'line-width': 2 }
    });
  }

  focusOnMap(prop: any) {
    this.selectedPropId = prop.id;

    if (!this.map) return;

    if (prop.geometry) {
      if (prop.geometry.type === 'Point') {
        this.map.flyTo({
          center: prop.geometry.coordinates as [number, number],
          zoom: 15
        });
      } else {
        const bbox = turf.bbox(prop.geometry);
        this.map.fitBounds(bbox as any, { padding: 50 });
      }
    } else if (prop.lat && prop.lng) {
      this.map.flyTo({ center: [prop.lng, prop.lat], zoom: 15 });
    }
  }

  getColorByCulture(culture: string) {
    switch (culture) {
      case 'Soja': return '#22c55e';
      case 'Milho': return '#eab308';
      case 'Algodão': return '#3b82f6';
      default: return '#64748b';
    }
  }

  getCultureClass(culture: string) {
    switch (culture) {
      case 'Soja': return 'text-green-500';
      case 'Milho': return 'text-yellow-500';
      case 'Algodão': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  }

  goBack() { this.router.navigate(['/leads']); }

  ngOnDestroy() { this.map?.remove(); }

  getStatusSeverity(status: string): any {
    switch (status) {
      case 'Novo': return 'info';
      case 'Contato Inicial': return 'info';
      case 'Em Negociação': return 'warning';
      case 'Convertido': return 'success';
      case 'Perdido': return 'danger';
      default: return 'info';
    }
  }
}