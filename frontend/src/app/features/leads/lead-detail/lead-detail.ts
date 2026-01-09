import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Lead } from '../../../core/models/lead';
import * as mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, ...PRIMENG_MODULES, RouterLink, FormsModule],
  templateUrl: './lead-detail.html',
  styleUrls: ['./lead-detail.css']
})
export class LeadDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  lead: Lead = {
    id: 1, name: 'João Carlos Silva', city: 'Uberlândia', phone: '(34) 99999-1234',
    email: 'joao.silva@email.com', status: 'Em Negociação', area: 450,
    lastContact: 'há 2 anos', isPriority: true, cpf: '123.456.789-00',
    propertiesCount: 2, createdAt: '14 de jan de 2024', updatedAt: '19/01/2024',
    obs: 'Interessado em fertilizantes para soja.'
  };

  // Modal
  displayModal: boolean = false;
  newProperty = { nome: '', municipio: '', cultura: '', area: null, obs: '' };

  // Mapas
  mapMain: mapboxgl.Map | undefined;
  mapModal: mapboxgl.Map | undefined;

  constructor(private route: ActivatedRoute) {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  ngOnInit() {
    // Aqui você pegaria o ID da rota: this.route.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {
    this.initMainMap();
  }

  initMainMap() {
    this.mapMain = new mapboxgl.Map({
      container: 'detail-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-48.27, -18.91],
      zoom: 11
    });
    // Adicione marcadores fictícios aqui se quiser
  }

  showModal() {
    this.displayModal = true;
    setTimeout(() => this.initModalMap(), 200);
  }

  initModalMap() {
    if (this.mapModal) {
      this.mapModal.resize();
      return;
    }
    this.mapModal = new mapboxgl.Map({
      container: 'modal-map',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-48.27, -18.91],
      zoom: 12
    });

    const geocoder = new MapboxGeocoder({
      accessToken: (mapboxgl as any).accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Buscar fazenda...',
      marker: true
    });
    this.mapModal.addControl(geocoder);
  }

  saveProperty() {
    console.log('Salvando:', this.newProperty);
    this.displayModal = false;
  }

  ngOnDestroy() {
    this.mapMain?.remove();
    this.mapModal?.remove();
  }
}