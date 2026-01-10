import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Necessário para geocodificação

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
import { LeadService } from '../../../core/services/lead.service';
import { PropertyService } from '../../../core/services/property.service';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule,
    DropdownModule, InputTextareaModule, InputNumberModule, AutoCompleteModule,
    ToastModule, SelectButtonModule
  ],
  providers: [MessageService],
  templateUrl: './property-create.html',
  // Aplica classes ao elemento host do componente para mudar o cursor globalmente
  host: {
    '[class.cursor-draw]': 'selectedMapMode === "draw"',
    '[class.cursor-pin]': 'selectedMapMode === "pin"'
  },
  styles: [`
  :host ::ng-deep .p-dialog-content { overflow-y: visible; }
  #map-create { height: 400px; width: 100%; border-radius: 8px; }

  /* --- MÁGICA VISUAL DO AUTOCOMPLETE --- */
  
  /* 1. Garante largura total */
  :host ::ng-deep .p-autocomplete { width: 100%; }
  
  /* 2. Input ocupa tudo e remove a borda direita (onde encosta no botão) */
  :host ::ng-deep .p-autocomplete-input { 
      width: 100%; 
      border-right: none; 
      border-top-right-radius: 0; 
      border-bottom-right-radius: 0;
  }
  
  /* 3. Transforma o botão lateral em apenas um ícone integrado */
  :host ::ng-deep .p-autocomplete-dropdown {
      background: transparent !important;
      border-left: none !important;
      border-top: 1px solid #ced4da !important;    /* Mesma cor da borda do input */
      border-bottom: 1px solid #ced4da !important; /* Mesma cor da borda do input */
      border-right: 1px solid #ced4da !important;  /* Mesma cor da borda do input */
      color: #6c757d !important; /* Cor cinza do ícone */
  }
  
  /* 4. Tira o efeito de botão azul ao passar o mouse */
  :host ::ng-deep .p-autocomplete-dropdown:hover {
      background: transparent !important;
      color: #6c757d !important;
  }

  /* Cursores do Mapa (mantidos) */
  :host.cursor-draw ::ng-deep .mapboxgl-canvas-container { cursor: crosshair !important; }
  :host.cursor-pin ::ng-deep .mapboxgl-canvas-container { cursor: copy !important; }
`]
})
export class PropertyCreateComponent implements OnInit {

  @Output() onSave = new EventEmitter<void>();

  visible: boolean = false;
  loading: boolean = false;
  step: number = 1;

  newProperty: any = {
    lead: null,
    name: '',
    city: null,
    culture: '',
    obs: '',
    area: null,
    geometry: null,
    lat: null,
    lng: null
  };

  leadsList: any[] = [];
  filteredLeads: any[] = [];
  allCities: any[] = [];
  filteredCities: any[] = [];

  cultureOptions = [
    { label: 'Soja', value: 'Soja' },
    { label: 'Milho', value: 'Milho' },
    { label: 'Algodão', value: 'Algodão' }
  ];

  // --- DADOS PASSO 2 (MAPA) ---
  map!: mapboxgl.Map;
  draw!: MapboxDraw;

  mapModeOptions = [
    { label: 'Desenhar Área', value: 'draw' },
    { label: 'Inserir Pin', value: 'pin' }
  ];
  selectedMapMode: 'draw' | 'pin' = 'draw';

  manualAreaInput: number | null = null;
  isMapConfirmed: boolean = false;
  isValidGeometry: boolean = false; // Controla se o botão Salvar habilita
  currentMarker: mapboxgl.Marker | null = null;

  constructor(
    private leadService: LeadService,
    private propertyService: PropertyService,
    private messageService: MessageService,
    private http: HttpClient // Para buscar cidade na API Mapbox
  ) {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  ngOnInit() {
    this.leadService.getCitiesMG().subscribe(c => this.allCities = c);
    this.leadService.getLeads().subscribe(l => this.leadsList = l);
  }

  // --- NAVEGAÇÃO ---

  open() {
    this.resetForm();
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

    // Inicia mapa e geocodificação
    setTimeout(() => {
      this.initMap();
      this.centerMapOnCity(); // Foca na cidade
      this.startDrawGuidance(); // Dicas visuais
    }, 200);
  }

  prevStep() {
    this.step = 1;

    if (this.map) {
      this.map.remove();
      this.map = undefined!;
    }
  }

  get isStep1Valid(): boolean {
    const p = this.newProperty;

    // 1. Validação de Campos de Texto Simples
    const hasName = !!p.name && p.name.trim().length > 0;
    const hasCulture = !!p.culture;

    // 2. Validação RIGOROSA de Lead
    // Verifica se existe, se é do tipo 'object' (não string) e se tem 'id'
    // Se o usuário digitar "teste", o tipo será 'string' e vai retornar FALSE
    const isLeadValid = p.lead && typeof p.lead === 'object' && 'id' in p.lead;

    // 3. Validação RIGOROSA de Município
    // Verifica se é objeto e se tem a propriedade 'label' ou 'value' (vindo do IBGE/Service)
    const isCityValid = p.city && typeof p.city === 'object' && ('label' in p.city || 'value' in p.city);

    return hasName && hasCulture && isLeadValid && isCityValid;
  }

  // --- FILTROS ---
  filterLead(event: any) {
    const query = event.query?.toLowerCase() || '';
    if (!query) {
      this.filteredLeads = [...this.leadsList]; // Mostra todos se vazio
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
      // Busca a cidade na API do Mapbox para centrar o mapa lá
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${cityName}, Minas Gerais, Brazil.json?access_token=${environment.mapboxToken}&limit=1`;
      this.http.get(url).subscribe((res: any) => {
        if (res.features && res.features.length > 0) {
          const center = res.features[0].center;
          this.map.flyTo({ center: center, zoom: 12 });
        }
      });
    }
  }

  initMap() {
    // 1. LIMPEZA: Se existir um mapa "zumbi" da navegação anterior, mata ele.
    if (this.map) {
      this.map.remove();
    }

    // 2. CRIAÇÃO
    this.map = new mapboxgl.Map({
      container: 'map-create',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-47.5, -18.5], // Centro de MG
      zoom: 5
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // 3. FERRAMENTA DE DESENHO
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },

      // --- O SEGREDO ESTÁ AQUI ---
      // 'draw_polygon': O cursor já vira uma mira e o primeiro clique já marca ponto.
      // 'simple_select': O cursor é uma mãozinha e precisa clicar no botão pra desenhar.
      defaultMode: 'draw_polygon'
    });

    // Adiciona os controles no topo esquerdo
    this.map.addControl(this.draw, 'top-left');

    // 4. EVENTOS DE DESENHO (Atualizar área e geometria)
    this.map.on('draw.create', (e) => this.onDrawUpdate(e));
    this.map.on('draw.delete', () => this.onDrawDelete());
    this.map.on('draw.update', (e) => this.onDrawUpdate(e));

    // 5. EVENTO DE CLIQUE (Apenas para o modo PIN)
    this.map.on('click', (e) => {
      if (this.selectedMapMode === 'pin') {
        this.addPin(e.lngLat);
      }
    });

    // 6. FINALIZAÇÃO (Ao carregar o mapa)
    this.map.on('load', () => {
      // Obrigatório para o mapa ocupar 100% da div dentro da Modal
      this.map.resize();

      // Feedback visual para o usuário
      if (this.selectedMapMode === 'draw') {
        this.messageService.add({
          severity: 'info',
          summary: 'Modo Desenho',
          detail: 'O mapa está pronto. Clique para marcar os pontos da área.'
        });
      }
    });
  }

  startDrawGuidance() {
    if (this.selectedMapMode === 'draw') {
      this.messageService.add({
        severity: 'info',
        summary: 'Modo Desenho',
        detail: 'Clique no ícone de pentágono (⬠) no mapa para começar a desenhar.',
        life: 5000
      });

      // Adiciona classe para piscar o botão
      const drawBtn = document.querySelector('.mapbox-gl-draw_ctrl-draw-group');
      if (drawBtn) drawBtn.classList.add('highlight-draw-btn');
    }
  }

  changeMode(event: any) {
    this.selectedMapMode = event.value;

    // Limpezas de praxe
    this.isValidGeometry = false;
    this.isMapConfirmed = false;
    this.draw.deleteAll();
    if (this.currentMarker) this.currentMarker.remove();
    this.removeCircleLayers();
    this.newProperty.area = 0;
    this.newProperty.geometry = null;

    if (this.selectedMapMode === 'draw') {
      // --- A MÁGICA AQUI ---
      // Força a ferramenta de desenho a ativar sozinha
      // O setTimeout é pra garantir que o Mapbox processou a troca de aba
      setTimeout(() => {
        this.draw.changeMode('draw_polygon');
      }, 100);

      this.messageService.add({
        severity: 'info',
        summary: 'Modo Desenho',
        detail: 'Pode clicar no mapa para desenhar.'
      });

    } else {
      // Se for PIN, desliga o desenho e volta pro cursor normal
      this.draw.changeMode('simple_select');

      this.messageService.add({
        severity: 'info',
        summary: 'Modo Pin',
        detail: 'Clique no local da sede.'
      });
    }
  }

  onDrawUpdate(e: any) {
    // Para animação do botão quando começa a desenhar (Feedback Visual)
    const drawBtn = document.querySelector('.mapbox-gl-draw_ctrl-draw-group');
    if (drawBtn) drawBtn.classList.remove('highlight-draw-btn');

    // Pega todos os desenhos do mapa
    const data = this.draw.getAll();

    // Verifica se tem algum desenho
    if (data.features.length > 0) {

      // 1. Calcula a ÁREA (Turf.js)
      const areaSqm = turf.area(data);
      // Converte m² para Hectares e fixa em 2 casas decimais
      this.newProperty.area = parseFloat((areaSqm / 10000).toFixed(2));

      // 2. Salva o GeoJSON COMPLETO (O desenho em si)
      this.newProperty.geometry = data.features[0].geometry;

      // 3. CALCULA O CENTRÓIDE (Aqui está o que você perguntou!)
      // O Turf pega o polígono desenhado e acha o ponto central matemático dele.
      const centroid = turf.centroid(data.features[0]);

      // Salva as coordenadas desse ponto central para usar como PIN na lista
      // O formato do GeoJSON é [Longitude, Latitude] (X, Y)
      this.newProperty.lng = centroid.geometry.coordinates[0];
      this.newProperty.lat = centroid.geometry.coordinates[1];

      // Habilita o botão de salvar
      this.isValidGeometry = true;
    }
  }

  onDrawDelete() {
    this.newProperty.area = 0;
    this.newProperty.geometry = null;
    this.isValidGeometry = false;
  }

  // --- LÓGICA DE PIN ---

  addPin(lngLat: mapboxgl.LngLat) {
    if (this.currentMarker) this.currentMarker.remove();

    this.currentMarker = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat(lngLat)
      .addTo(this.map);

    this.newProperty.lat = lngLat.lat;
    this.newProperty.lng = lngLat.lng;

    // Salva geometria de ponto (fallback)
    this.newProperty.geometry = { type: 'Point', coordinates: [lngLat.lng, lngLat.lat] };

    this.checkPinValidation();
    this.updateCircleFromPin();

    this.messageService.add({ severity: 'success', summary: 'Local Definido', detail: 'Informe a área para visualizar o raio.' });
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

      // Atualiza geometria para o círculo (melhor que ponto)
      this.newProperty.geometry = circle.geometry;

      this.drawCircleOnMap(circle);
    }
  }

  drawCircleOnMap(geojson: any) {
    if (!this.map.getSource('circle-source')) {
      this.map.addSource('circle-source', { type: 'geojson', data: geojson });
      this.map.addLayer({
        id: 'circle-fill', type: 'fill', source: 'circle-source',
        paint: { 'fill-color': '#faa', 'fill-opacity': 0.4 }
      });
      this.map.addLayer({
        id: 'circle-outline', type: 'line', source: 'circle-source',
        paint: { 'line-color': '#f00', 'line-width': 2 }
      });
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
      // Só valida se tiver Pin (Lat/Lng) e Área digitada
      this.isValidGeometry = (!!this.newProperty.lat && (this.newProperty.area > 0));
    }
  }

  // --- FINALIZAÇÃO ---

  confirmMap() {
    this.isMapConfirmed = true;
    this.messageService.add({ severity: 'success', summary: 'Pronto!', detail: 'Área confirmada.' });
  }

  save() {
    if (!this.isValidGeometry) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Defina a área no mapa antes de salvar.' });
      return;
    }

    this.loading = true;

    const payload = {
      ...this.newProperty,
      leadId: this.newProperty.lead.id,
      city: this.newProperty.city.value || this.newProperty.city,
    };
    delete payload.lead;

    this.propertyService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.visible = false;
        this.onSave.emit();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Propriedade Criada!' });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar.' });
      }
    });
  }

  resetForm() {
    if (this.map) {
      this.map.remove();
      this.map = undefined!;
    }

    this.step = 1;
    this.newProperty = {
      lead: null, name: '', city: null, culture: '', obs: '',
      area: null, geometry: null, lat: null, lng: null
    };
    this.step = 1;
    this.isMapConfirmed = false;
    this.isValidGeometry = false;
    this.manualAreaInput = null;
    this.selectedMapMode = 'draw';
    this.map = undefined!;
  }
}