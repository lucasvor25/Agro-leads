import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button'; // Adicionado para o botão "Criar Lead"

import { LeadService } from '../../core/services/lead.service';
import { PropertyService } from '../../core/services/property.service';
import { environment } from 'src/environments/environment';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ChartModule, SkeletonModule, InputTextModule,
    IconFieldModule, InputIconModule, TooltipModule, ButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  leads: any[] = [];
  properties: any[] = [];
  loading: boolean = true;

  // KPIs
  totalLeads: number = 0;
  priorityLeadsCount: number = 0;
  totalArea: number = 0;

  // Gráficos
  statusChartData: any;
  statusChartOptions: any;
  cityChartData: any;
  cityChartOptions: any;

  // Listas
  priorityLeadsList: any[] = [];
  statusSummary: any = {};

  map: mapboxgl.Map | undefined;

  constructor(
    private leadService: LeadService,
    private propertyService: PropertyService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  ngOnInit() {
    this.loadData();
    this.initChartOptions();
  }

  loadData() {
    this.loading = true;
    this.leadService.getLeads().subscribe(leads => {
      this.leads = leads;

      this.propertyService.getProperties().subscribe(props => {
        this.properties = props;

        this.calculateKPIs();

        // Só configura gráficos se tiver leads
        if (this.leads.length > 0) {
          this.setupCharts();
          this.filterLists();
        }

        this.loading = false;
        this.cdr.detectChanges();

        // Só inicia mapa se tiver propriedades
        if (this.properties.length > 0) {
          this.initMap();
        }
      });
    });
  }

  // ... (calculateKPIs e filterLists mantidos iguais) ...
  calculateKPIs() {
    this.totalLeads = this.leads.length;
    this.priorityLeadsCount = this.leads.filter(l => l.isPriority).length;
    this.totalArea = this.leads.reduce((sum, lead) => sum + (Number(lead.area) || 0), 0);
  }

  filterLists() {
    this.priorityLeadsList = this.leads.filter(l =>
      l.isPriority && l.status !== 'Perdido' && l.status !== 'Convertido'
    ).slice(0, 3);

    this.statusSummary = {
      'Novo': this.leads.filter(l => l.status === 'Novo').length,
      'Contato Inicial': this.leads.filter(l => l.status === 'Contato Inicial').length,
      'Em Negociação': this.leads.filter(l => l.status === 'Em Negociação').length,
      'Convertido': this.leads.filter(l => l.status === 'Convertido').length,
      'Perdido': this.leads.filter(l => l.status === 'Perdido').length,
    };
  }

  setupCharts() {
    // ... (código dos gráficos igual ao anterior) ...
    const statusCounts = [
      this.leads.filter(l => l.status === 'Novo').length,
      this.leads.filter(l => l.status === 'Contato Inicial').length,
      this.leads.filter(l => l.status === 'Em Negociação').length,
      this.leads.filter(l => l.status === 'Convertido').length,
      this.leads.filter(l => l.status === 'Perdido').length
    ];

    this.statusChartData = {
      labels: ['Novo', 'Contato Inicial', 'Em Negociação', 'Convertido', 'Perdido'],
      datasets: [{
        data: statusCounts,
        backgroundColor: ['#3b82f6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'],
        hoverBackgroundColor: ['#2563eb', '#0891b2', '#d97706', '#16a34a', '#dc2626']
      }]
    };

    const cityMap: any = {};
    this.leads.forEach(l => {
      const city = l.city || 'Não informado';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });

    const sortedCities = Object.entries(cityMap)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5);

    this.cityChartData = {
      labels: sortedCities.map(c => c[0]),
      datasets: [{
        label: 'Leads',
        data: sortedCities.map(c => c[1]),
        backgroundColor: '#1f4037',
        barThickness: 20,
        borderRadius: 4
      }]
    };
  }

  initChartOptions() {
    // ... (código igual) ...
    this.statusChartOptions = {
      cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }
    };
    this.cityChartOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { display: false, grid: { display: false } }, y: { grid: { display: false } } }
    };
  }

  initMap() {
    if (this.map) return;
    const container = document.getElementById('dashboard-map');
    if (!container) return;

    this.map = new mapboxgl.Map({
      container: 'dashboard-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-47.5, -18.5],
      zoom: 5
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      this.map?.resize();
      this.addContentToMap();
    });
  }

  addContentToMap() {
    if (!this.map || !this.properties.length) return;
    const bounds = new mapboxgl.LngLatBounds();

    this.properties.forEach(prop => {
      const color = this.getColorByCulture(prop.culture);

      // --- PARTE 1: DESENHAR POLÍGONO (JÁ ESTÁ AQUI) ---
      // Se tiver geometria e não for um ponto, ele desenha a área colorida
      if (prop.geometry && prop.geometry.type !== 'Point') {
        const sourceId = `poly-${prop.id}`;
        this.map!.addSource(sourceId, { type: 'geojson', data: prop.geometry });

        // Camada de preenchimento (cor transparente)
        this.map!.addLayer({
          id: sourceId + '-fill', type: 'fill', source: sourceId,
          paint: { 'fill-color': color, 'fill-opacity': 0.4 }
        });
        // Camada de borda (linha branca)
        this.map!.addLayer({
          id: sourceId + '-line', type: 'line', source: sourceId,
          paint: { 'line-color': '#fff', 'line-width': 2 }
        });
      }

      // --- PARTE 2: ADICIONAR PIN (JÁ ESTÁ AQUI) ---
      const lat = prop.lat || (prop.geometry?.type === 'Point' ? prop.geometry.coordinates[1] : null);
      const lng = prop.lng || (prop.geometry?.type === 'Point' ? prop.geometry.coordinates[0] : null);

      if (lat && lng) {
        const el = document.createElement('div');
        el.className = 'dashboard-marker';
        el.style.backgroundColor = color;
        el.innerHTML = `<i class="pi pi-map-marker" style="color: white; font-size: 14px;"></i>`;

        // --- PARTE 3: TOOLTIP AO PASSAR O MOUSE/CLICAR (JÁ ESTÁ AQUI) ---
        const popupContent = `
                  <div style="font-family: sans-serif; color: #333; min-width: 150px;">
                      <strong style="font-size: 14px; display:block; margin-bottom:4px;">${prop.name}</strong>
                      <div style="font-size: 12px; color: #666; display:flex; align-items:center; gap:4px;">
                          <div style="width:8px; height:8px; border-radius:50%; background:${color}"></div>
                          ${prop.culture}
                      </div>
                      <div style="font-size: 11px; color: #888; margin-top:4px;">
                          Lead: <b>${prop.lead?.name || 'N/A'}</b>
                      </div>
                      <div style="font-size: 11px; color: #888;">
                          Área: ${prop.area} ha
                      </div>
                  </div>
              `;

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(this.map!);

        bounds.extend([lng, lat]);
      }
    });

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
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

  goToLead(id: number) { this.router.navigate(['/leads', id]); }

  createLead() { this.router.navigate(['/leads']); }

  ngOnDestroy() { this.map?.remove(); }
}