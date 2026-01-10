import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import * as mapboxgl from 'mapbox-gl';
import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { environment } from 'src/environments/environment';
import { PropertyCreateComponent } from '../property-create/property-create';

@Component({
    selector: 'app-properties-list',
    standalone: true,
    imports: [
        CommonModule,
        ...PRIMENG_MODULES,
        FormsModule,
        PropertyCreateComponent
    ],
    templateUrl: './properties-list.html',
    styleUrls: ['./properties-list.css']
})
export class PropertiesListComponent implements OnInit, OnDestroy {

    // Referência para o componente filho (Modal de Criação)
    @ViewChild(PropertyCreateComponent) createModal!: PropertyCreateComponent;

    viewMode: 'list' | 'map' = 'list';
    map: mapboxgl.Map | undefined;

    // Lista vazia para começar
    properties: any[] = [];
    loading: boolean = true;

    constructor(private propertyService: PropertyService) {
        (mapboxgl as any).accessToken = environment.mapboxToken;
    }

    ngOnInit() {
        this.loadProperties();
    }

    // Método chamado pelo botão "Nova Propriedade"
    openNewPropertyModal() {
        if (this.createModal) {
            this.createModal.open();
        } else {
            console.error('Erro: Modal de criação não encontrada.');
        }
    }

    loadProperties() {
        this.loading = true;
        this.propertyService.getProperties().subscribe({
            next: (data) => {
                this.properties = data;
                this.loading = false;
                // Se o mapa já estiver aberto, atualiza os pinos
                if (this.viewMode === 'map' && this.map) {
                    this.addMarkersToMap();
                }
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    switchView(mode: 'list' | 'map') {
        this.viewMode = mode;
        if (mode === 'map') {
            setTimeout(() => this.initMap(), 100);
        }
    }

    get totalArea(): number {
        return this.properties.reduce((sum, prop) => sum + Number(prop.area), 0);
    }

    initMap() {
        if (this.map) return; // Evita recriar se já existe

        this.map = new mapboxgl.Map({
            container: 'properties-map',
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [-47.5, -18.5],
            zoom: 6.5
        });

        this.map.addControl(new mapboxgl.NavigationControl());

        // Espera o mapa carregar o estilo para desenhar
        this.map.on('load', () => {
            this.addMarkersToMap();
        });
    }

    addMarkersToMap() {
        if (!this.map) return;

        // Limpa marcadores antigos (opcional, se quiser implementar filtro depois)
        // ...

        this.properties.forEach(prop => {
            // 1. Desenha o Polígono (Área) se existir
            if (prop.geometry) {
                this.addPolygonToMap(prop);
            }

            // 2. Adiciona o PIN (Marcador)
            // Usa lat/lng salvos ou um valor padrão para centralizar
            const lat = prop.lat || -18.5;
            const lng = prop.lng || -47.5;

            // Cria o Popup com informações
            const popupContent = `
                <div style="font-family: sans-serif; color: #333;">
                    <strong style="font-size: 14px;">${prop.name}</strong><br>
                    <span style="font-size: 12px; color: #666;">${prop.culture} • ${prop.area} ha</span>
                </div>
            `;
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

            // Cria o Marcador
            new mapboxgl.Marker({ color: this.getColorByCulture(prop.culture) })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(this.map!);
        });
    }

    // Função auxiliar para desenhar o polígono
    addPolygonToMap(prop: any) {
        const sourceId = `source-${prop.id}`;

        if (this.map?.getSource(sourceId)) return; // Já existe

        this.map?.addSource(sourceId, {
            type: 'geojson',
            data: prop.geometry
        });

        this.map?.addLayer({
            id: `layer-${prop.id}`,
            type: 'fill',
            source: sourceId,
            layout: {},
            paint: {
                'fill-color': this.getColorByCulture(prop.culture),
                'fill-opacity': 0.4
            }
        });

        // Adiciona borda
        this.map?.addLayer({
            id: `outline-${prop.id}`,
            type: 'line',
            source: sourceId,
            layout: {},
            paint: {
                'line-color': '#fff',
                'line-width': 2
            }
        });
    }

    getColorByCulture(culture: string) {
        switch (culture) {
            case 'Soja': return '#22c55e';
            case 'Milho': return '#eab308';
            case 'Algodão': return '#3b82f6';
            default: return '#888';
        }
    }

    getCultureSeverity(culture: string): any {
        switch (culture) {
            case 'Soja': return 'success';
            case 'Milho': return 'warning';
            case 'Algodão': return 'info';
            default: return 'info';
        }
    }

    ngOnDestroy() {
        this.map?.remove();
    }
}