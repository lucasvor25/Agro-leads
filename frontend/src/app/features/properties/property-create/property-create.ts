import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';

import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { environment } from 'src/environments/environment';
import { LeadService } from '../../../core/services/lead';
import { PropertyService } from 'src/app/core/services/property';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    InputNumberModule,
    AutoCompleteModule,
    ToastModule,
    SelectButtonModule
  ],
  providers: [MessageService],
  templateUrl: './property-create.html',
  host: {
    '[class.cursor-draw]': 'selectedMapMode === "draw"',
    '[class.cursor-pin]': 'selectedMapMode === "pin"'
  },
  styleUrls: ['./property-create.css']
})
export class PropertyCreateComponent implements OnInit {

  @Output() onSave = new EventEmitter<void>();

  visible: boolean = false;
  loading: boolean = false;
  step: number = 1;

  isEditMode: boolean = false;
  currentPropertyId: number | null = null;

  newProperty: any = {
    lead: null, name: '', city: null, culture: '', obs: '',
    area: null, geometry: null, lat: null, lng: null
  };

  tempPolygonGeometry: any = null;
  tempPolygonArea: number | null = null;
  tempPinGeometry: any = null;
  tempPinArea: number | null = null;
  tempPinLat: number | null = null;
  tempPinLng: number | null = null;

  leadsList: any[] = [];
  filteredLeads: any[] = [];
  allCities: any[] = [];
  filteredCities: any[] = [];

  cultureOptions = [
    { label: 'Soja', value: 'Soja' },
    { label: 'Milho', value: 'Milho' },
    { label: 'Algodão', value: 'Algodão' }
  ];

  map!: mapboxgl.Map;
  draw!: MapboxDraw;
  mapModeOptions = [
    { label: 'Desenhar Área', value: 'draw' },
    { label: 'Inserir Pin', value: 'pin' }
  ];
  selectedMapMode: 'draw' | 'pin' = 'draw';

  manualAreaInput: number | null = null;
  isMapConfirmed: boolean = false;
  isValidGeometry: boolean = false;
  currentMarker: mapboxgl.Marker | null = null;

  constructor(
    private leadService: LeadService,
    private propertyService: PropertyService,
    private messageService: MessageService,
    private http: HttpClient
  ) {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  ngOnInit() {
    this.leadService.getCitiesMG().subscribe(c => this.allCities = c);
    this.leadService.getLeads().subscribe(l => this.leadsList = l);
  }

  open(propertyToEdit: any = null) {
    this.resetForm(propertyToEdit);
    this.visible = true;
    this.step = 1;
  }

  close() {
    this.visible = false;
  }

  nextStep() {
    if (!this.newProperty.lead || !this.newProperty.name || !this.newProperty.city || !this.newProperty.culture) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    this.step = 2;
    this.isValidGeometry = false;

    setTimeout(() => {
      this.initMap();
      if (!this.isEditMode) {
        this.centerMapOnCity();
        this.startDrawGuidance();
      }
    }, 200);
  }

  prevStep() {
    this.step = 1;
    if (this.map) {
      this.map.remove();
      this.map = undefined!;
    }
  }

  initMap() {
    if (this.map) {
      this.map.remove();
    }

    this.map = new mapboxgl.Map({
      container: 'map-create',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-47.5, -18.5],
      zoom: 5
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const startMode = this.selectedMapMode === 'draw' ? 'draw_polygon' : 'simple_select';

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: startMode
    });

    this.map.addControl(this.draw, 'top-left');

    this.map.on('draw.create', (e) => this.onDrawUpdate(e));
    this.map.on('draw.delete', () => this.onDrawDelete());
    this.map.on('draw.update', (e) => this.onDrawUpdate(e));

    this.map.on('click', (e) => {
      if (this.selectedMapMode === 'pin') {
        this.addPin(e.lngLat);
      }
    });

    this.map.on('load', () => {
      this.map.resize();

      if (this.isEditMode && this.newProperty.geometry) {
        this.loadExistingGeometry();
      } else if (this.selectedMapMode === 'draw') {
        this.messageService.add({ severity: 'info', summary: 'Modo Desenho', detail: 'O mapa está pronto. Clique para desenhar.' });
      }
    });
  }

  loadExistingGeometry() {
    const geo = this.newProperty.geometry;
    if (!geo) return;

    // Detecta se é um Círculo gerado por Pin (65 coordenadas)
    const isPinPolygon = geo.type === 'Polygon' && geo.coordinates[0].length === 65;

    if (geo.type === 'Point' || isPinPolygon) {
      // --- MODO PIN ---
      this.selectedMapMode = 'pin'; // Garante que a variável esteja certa

      // Precisamos do centro. Se for Point é fácil. Se for Polygon, usamos o Lat/Lng salvo ou calculamos o centro.
      let centerLng, centerLat;

      if (geo.type === 'Point') {
        centerLng = geo.coordinates[0];
        centerLat = geo.coordinates[1];
      } else {
        // Se for Polígono, usa as colunas lat/lng salvas (preferencial) ou calcula centróide
        centerLng = this.newProperty.lng || turf.centroid(geo).geometry.coordinates[0];
        centerLat = this.newProperty.lat || turf.centroid(geo).geometry.coordinates[1];
      }

      // Preenche os backups para troca de aba
      this.tempPinGeometry = geo;
      this.tempPinArea = this.newProperty.area;
      this.tempPinLat = centerLat;
      this.tempPinLng = centerLng;

      this.manualAreaInput = this.newProperty.area;

      this.addPin({ lng: centerLng, lat: centerLat } as any, false);

      this.map.flyTo({ center: [centerLng, centerLat], zoom: 14 });

    } else {
      this.selectedMapMode = 'draw';

      this.tempPolygonGeometry = geo;
      this.tempPolygonArea = this.newProperty.area;

      this.draw.add(geo);
      const center = turf.centroid(geo);
      this.map.flyTo({ center: center.geometry.coordinates as [number, number], zoom: 13 });
      this.isValidGeometry = true;
    }
  }

  changeMode(event: any) {
    const newMode = event.value;

    if (this.selectedMapMode === 'draw') {
      if (this.newProperty.geometry && this.newProperty.geometry.type !== 'Point') {
        this.tempPolygonGeometry = this.newProperty.geometry;
        this.tempPolygonArea = this.newProperty.area;
      }
    } else if (this.selectedMapMode === 'pin') {
      if (this.newProperty.geometry && this.newProperty.geometry.type === 'Point' && this.newProperty.lat) {
        this.tempPinGeometry = this.newProperty.geometry;
        this.tempPinArea = this.manualAreaInput;
        this.tempPinLat = this.newProperty.lat;
        this.tempPinLng = this.newProperty.lng;
      }
    }

    this.selectedMapMode = newMode;
    this.isValidGeometry = false;
    this.isMapConfirmed = false;
    this.draw.deleteAll();
    if (this.currentMarker) this.currentMarker.remove();
    this.removeCircleLayers();

    const drawBtn = document.querySelector('.mapbox-gl-draw_ctrl-draw-group');
    if (drawBtn) drawBtn.classList.remove('highlight-draw-btn');

    if (this.selectedMapMode === 'draw') {
      this.manualAreaInput = null;

      setTimeout(() => {
        this.draw.changeMode('draw_polygon');

        if (this.tempPolygonGeometry) {
          this.draw.add(this.tempPolygonGeometry);
          this.newProperty.geometry = this.tempPolygonGeometry;
          this.newProperty.area = this.tempPolygonArea;
          this.isValidGeometry = true;

          const center = turf.centroid(this.tempPolygonGeometry);
          this.map.flyTo({ center: center.geometry.coordinates as [number, number] });
        } else {
          this.newProperty.area = 0;
          this.newProperty.geometry = null;
        }
      }, 100);

      if (!this.tempPolygonGeometry) this.startDrawGuidance();

    } else {
      this.draw.changeMode('simple_select');
      if (this.tempPinLat && this.tempPinLng) {
        this.manualAreaInput = this.tempPinArea;
        this.newProperty.area = this.tempPinArea;
        this.newProperty.lat = this.tempPinLat;
        this.newProperty.lng = this.tempPinLng;

        this.addPin({ lng: this.tempPinLng, lat: this.tempPinLat } as any, false);
        this.checkPinValidation();
      } else {
        this.manualAreaInput = null;
        this.newProperty.area = 0;
        this.newProperty.geometry = null;
        this.newProperty.lat = null;
        this.newProperty.lng = null;
        this.isValidGeometry = false;

        this.messageService.add({ severity: 'info', summary: 'Modo Pin', detail: 'Clique no local da sede e informe a área.' });
      }
    }
  }

  addPin(lngLat: mapboxgl.LngLat, showToast: boolean = true) {
    if (this.currentMarker) this.currentMarker.remove();

    this.currentMarker = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat(lngLat)
      .addTo(this.map);

    this.newProperty.lat = lngLat.lat;
    this.newProperty.lng = lngLat.lng;
    this.newProperty.geometry = { type: 'Point', coordinates: [lngLat.lng, lngLat.lat] };

    this.checkPinValidation();
    this.updateCircleFromPin();

    if (showToast) {
      this.messageService.add({ severity: 'success', summary: 'Local Definido', detail: 'Informe a área para visualizar o raio.' });
    }
  }

  onAreaManualInput() {
    this.newProperty.area = this.manualAreaInput;
    this.updateCircleFromPin();
    this.checkPinValidation();
  }

  updateCircleFromPin() {
    this.removeCircleLayers();
    if (this.selectedMapMode === 'pin' && this.currentMarker && this.manualAreaInput && this.manualAreaInput > 0) {
      const lngLat = this.currentMarker.getLngLat();
      const center = [lngLat.lng, lngLat.lat];
      const areaSqm = this.manualAreaInput * 10000;
      const radiusMeters = Math.sqrt(areaSqm / Math.PI);
      const radiusKm = radiusMeters / 1000;
      const options: any = { steps: 64, units: 'kilometers' };
      const circle = turf.circle(center, radiusKm, options);
      this.newProperty.geometry = circle.geometry;
      this.drawCircleOnMap(circle);
    }
  }

  drawCircleOnMap(geojson: any) {
    if (!this.map.getSource('circle-source')) {
      this.map.addSource('circle-source', { type: 'geojson', data: geojson });
      this.map.addLayer({ id: 'circle-fill', type: 'fill', source: 'circle-source', paint: { 'fill-color': '#faa', 'fill-opacity': 0.4 } });
      this.map.addLayer({ id: 'circle-outline', type: 'line', source: 'circle-source', paint: { 'line-color': '#f00', 'line-width': 2 } });
    } else {
      (this.map.getSource('circle-source') as any).setData(geojson);
    }
  }

  removeCircleLayers() {
    if (this.map.getLayer('circle-fill')) this.map.removeLayer('circle-fill');
    if (this.map.getLayer('circle-outline')) this.map.removeLayer('circle-outline');
    if (this.map.getSource('circle-source')) this.map.removeSource('circle-source');
  }

  checkPinValidation() {
    if (this.selectedMapMode === 'pin') {
      this.isValidGeometry = (!!this.newProperty.lat && (this.newProperty.area > 0));
    }
  }

  onDrawUpdate(e: any) {
    const drawBtn = document.querySelector('.mapbox-gl-draw_ctrl-draw-group');
    if (drawBtn) drawBtn.classList.remove('highlight-draw-btn');

    const data = this.draw.getAll();
    if (data.features.length > 0) {
      const areaSqm = turf.area(data);
      this.newProperty.area = parseFloat((areaSqm / 10000).toFixed(2));
      this.newProperty.geometry = data.features[0].geometry;

      const centroid = turf.centroid(data.features[0]);
      this.newProperty.lng = centroid.geometry.coordinates[0];
      this.newProperty.lat = centroid.geometry.coordinates[1];

      this.isValidGeometry = true;
    }
  }

  onDrawDelete() {
    this.newProperty.area = 0;
    this.newProperty.geometry = null;
    this.isValidGeometry = false;
  }

  startDrawGuidance() {
    if (this.selectedMapMode === 'draw') {
      this.messageService.add({ severity: 'info', summary: 'Modo Desenho', detail: 'Clique no ícone de pentágono (⬠) para desenhar.', life: 5000 });
      const drawBtn = document.querySelector('.mapbox-gl-draw_ctrl-draw-group');
      if (drawBtn) drawBtn.classList.add('highlight-draw-btn');
    }
  }

  get isStep1Valid(): boolean {
    const p = this.newProperty;
    const hasName = !!p.name && p.name.trim().length > 0;
    const hasCulture = !!p.culture;
    const isLeadValid = p.lead && typeof p.lead === 'object' && 'id' in p.lead;
    const isCityValid = p.city && typeof p.city === 'object' && ('label' in p.city || 'value' in p.city);
    return hasName && hasCulture && isLeadValid && isCityValid;
  }

  filterLead(event: any) {
    const query = event.query?.toLowerCase() || '';
    if (!query) {
      this.filteredLeads = [...this.leadsList];
    } else {
      this.filteredLeads = this.leadsList.filter(l => l.name.toLowerCase().includes(query));
    }
  }

  filterCity(event: any) {
    const query = event.query?.toLowerCase() || '';
    if (!query) {
      this.filteredCities = [...this.allCities];
    } else {
      this.filteredCities = this.allCities.filter(c => c.label.toLowerCase().includes(query));
    }
  }

  centerMapOnCity() {
    const cityName = this.newProperty.city.label || this.newProperty.city;
    if (cityName) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${cityName}, Minas Gerais, Brazil.json?access_token=${environment.mapboxToken}&limit=1`;
      this.http.get(url).subscribe((res: any) => {
        if (res.features && res.features.length > 0) {
          const center = res.features[0].center;
          this.map.flyTo({ center: center, zoom: 12 });
        }
      });
    }
  }

  confirmMap() {
    this.isMapConfirmed = true;
    this.messageService.add({ severity: 'success', summary: 'Pronto!', detail: 'Área confirmada.' });
  }

  save() {
    if (!this.isValidGeometry) return;
    this.loading = true;

    const payload = {
      ...this.newProperty,
      leadId: this.newProperty.lead?.id,
      city: this.newProperty.city?.value || this.newProperty.city
    };

    delete payload.lead;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    if (payload.area) payload.area = Number(payload.area);
    if (payload.lat) payload.lat = Number(payload.lat);
    if (payload.lng) payload.lng = Number(payload.lng);

    let request$;
    if (this.isEditMode && this.currentPropertyId) {
      request$ = this.propertyService.update(this.currentPropertyId, payload);
    } else {
      request$ = this.propertyService.create(payload);
    }

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.visible = false;
        this.onSave.emit();
        const msg = this.isEditMode ? 'Propriedade atualizada!' : 'Propriedade criada!';
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: msg });
      },
      error: (err) => {
        console.error('Erro retornado pelo servidor:', err);
        this.loading = false;
        const detailMsg = err.error?.message || 'Falha ao salvar.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: Array.isArray(detailMsg) ? detailMsg[0] : detailMsg });
      }
    });
  }

  resetForm(dataToEdit: any = null) {
    if (this.map) {
      this.map.remove();
      this.map = undefined!;
    }

    this.tempPolygonGeometry = null;
    this.tempPolygonArea = null;
    this.tempPinGeometry = null;
    this.tempPinArea = null;
    this.tempPinLat = null;
    this.tempPinLng = null;

    this.step = 1;
    this.isMapConfirmed = false;
    this.isValidGeometry = false;
    this.manualAreaInput = null;
    this.selectedMapMode = 'draw';

    if (dataToEdit) {
      this.isEditMode = true;
      this.currentPropertyId = dataToEdit.id;
      this.newProperty = { ...dataToEdit };

      if (typeof this.newProperty.city === 'string' && this.allCities.length > 0) {
        const foundCity = this.allCities.find(c => c.label === this.newProperty.city);
        if (foundCity) this.newProperty.city = foundCity;
      }

      if (this.newProperty.geometry) {
        this.isValidGeometry = true;
        this.newProperty.area = parseFloat(this.newProperty.area);
        const isPinPolygon = this.newProperty.geometry.type === 'Polygon' &&
          this.newProperty.geometry.coordinates[0].length === 65;

        if (this.newProperty.geometry.type === 'Point' || isPinPolygon) {
          this.selectedMapMode = 'pin';
          this.manualAreaInput = this.newProperty.area;
        } else {
          this.selectedMapMode = 'draw';
        }
      }
    } else {
      this.isEditMode = false;
      this.currentPropertyId = null;
      this.newProperty = {
        lead: null, name: '', city: null, culture: '', obs: '',
        area: null, geometry: null, lat: null, lng: null
      };
    }
  }
}