import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as mapboxgl from 'mapbox-gl';
import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-properties-list',
    standalone: true,
    imports: [CommonModule, ...PRIMENG_MODULES, FormsModule],
    templateUrl: './properties-list.html',
    styleUrls: ['./properties-list.css']
})
export class PropertiesListComponent implements OnInit, OnDestroy {
    // Controle de Visualização (Lista ou Mapa)
    viewMode: 'list' | 'map' = 'list';

    // Mapa
    map: mapboxgl.Map | undefined;

    // Dados Mockados (Iguais ao seu print image_03fdc4.png)
    properties = [
        { id: 1, name: 'Fazenda Santa Clara', owner: 'João Carlos Silva', city: 'Uberlândia', area: 250, culture: 'Soja', desc: 'Solo de alta qualidade, irrigação disponível.', lat: -18.91, lng: -48.27 },
        { id: 2, name: 'Fazenda Boa Vista', owner: 'João Carlos Silva', city: 'Uberlândia', area: 200, culture: 'Milho', desc: 'Segunda safra de milho.', lat: -18.95, lng: -48.30 },
        { id: 3, name: 'Sítio São José', owner: 'Pedro Henrique Santos', city: 'Patos de Minas', area: 220, culture: 'Milho', desc: 'Produtor familiar expandindo área.', lat: -18.57, lng: -46.51 },
        { id: 4, name: 'Fazenda do Cerrado', owner: 'Ana Beatriz Costa', city: 'Patrocínio', area: 350, culture: 'Soja', desc: 'Cliente consolidado, alta produtividade.', lat: -18.94, lng: -46.99 },
        { id: 5, name: 'Fazenda Algodoeira', owner: 'Fernanda Rodrigues', city: 'Uberlândia', area: 520, culture: 'Algodão', desc: 'Produção de algodão de alta qualidade.', lat: -18.88, lng: -48.25 },
        { id: 6, name: 'Fazenda Horizonte', owner: 'Ricardo Almeida', city: 'Paracatu', area: 800, culture: 'Soja', desc: 'Uma das maiores da região.', lat: -17.22, lng: -46.87 },
        { id: 7, name: 'Fazenda Pioneira', owner: 'Ricardo Almeida', city: 'Paracatu', area: 400, culture: 'Milho', desc: 'Rotação soja-milho.', lat: -17.25, lng: -46.90 }
    ];

    constructor() {
        (mapboxgl as any).accessToken = environment.mapboxToken;
    }

    ngOnInit() { }

    // Função para trocar a visualização e carregar o mapa se necessário
    switchView(mode: 'list' | 'map') {
        this.viewMode = mode;

        if (mode === 'map') {
            // Pequeno delay para o container existir no DOM
            setTimeout(() => this.initMap(), 100);
        }
    }

    initMap() {
        this.map = new mapboxgl.Map({
            container: 'properties-map', // ID da div
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [-47.5, -18.5], // Centro de MG (aproximado entre as cidades)
            zoom: 6.5
        });

        this.map.addControl(new mapboxgl.NavigationControl());

        // Adiciona os Pinos (Markers) para cada fazenda
        this.properties.forEach(prop => {
            // Cria o Popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<strong>${prop.name}</strong><br>${prop.culture} • ${prop.area} ha`
            );

            // Define a cor do marcador baseado na cultura
            const color = prop.culture === 'Soja' ? '#22c55e' : (prop.culture === 'Milho' ? '#eab308' : '#fff');

            new mapboxgl.Marker({ color: color })
                .setLngLat([prop.lng, prop.lat])
                .setPopup(popup)
                .addTo(this.map!);
        });
    }

    getCultureSeverity(culture: string): "success" | "info" | "warning" | "danger" | undefined {
        switch (culture) {
            case 'Soja': return 'success'; // Verde
            case 'Milho': return 'warning'; // Amarelo
            case 'Algodão': return 'info';  // Azul
            default: return 'info';
        }
    }

    ngOnDestroy() {
        this.map?.remove();
    }
}