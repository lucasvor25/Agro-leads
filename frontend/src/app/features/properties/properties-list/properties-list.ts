import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import * as mapboxgl from 'mapbox-gl';

import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { environment } from 'src/environments/environment';
import { PropertyCreateComponent } from '../property-create/property-create';
import { PropertiesFilterComponent, PropertyFilters } from '../property-filter/property-filter';
import { PropertyService } from 'src/app/core/services/property';

@Component({
    selector: 'app-properties-list',
    standalone: true,
    imports: [
        CommonModule,
        ...PRIMENG_MODULES,
        FormsModule,
        PropertyCreateComponent,
        PropertiesFilterComponent,
        ConfirmDialogModule,
        ToastModule,
        PaginatorModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './properties-list.html',
    styleUrls: ['./properties-list.css']
})
export class PropertiesListComponent implements OnInit, OnDestroy {
    @ViewChild(PropertyCreateComponent) createModal!: PropertyCreateComponent;

    viewMode: 'list' | 'map' = 'list';
    map: mapboxgl.Map | undefined;

    properties: any[] = [];
    filteredProperties: any[] = [];
    loading: boolean = true;

    first: number = 0;
    rows: number = 12;

    currentFilters: PropertyFilters = {
        search: '',
        culture: null,
        city: null,
        sort: 'desc'
    };

    constructor(
        private propertyService: PropertyService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private router: Router
    ) {
        (mapboxgl as any).accessToken = environment.mapboxToken;
    }

    ngOnInit() {
        this.loadProperties();
    }

    get pagedProperties(): any[] {
        return this.filteredProperties.slice(this.first, this.first + this.rows);
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadProperties() {
        this.loading = true;
        this.propertyService.getProperties().subscribe({
            next: (data) => {
                this.properties = data;
                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar propriedades' });
            }
        });
    }

    handleFilterChange(filters: PropertyFilters) {
        this.currentFilters = filters;
        this.applyFilters();
    }

    applyFilters() {
        let temp = [...this.properties];
        const f = this.currentFilters;

        if (f.search) {
            const s = f.search.toLowerCase();
            temp = temp.filter(p =>
                p.name.toLowerCase().includes(s) ||
                (p.lead?.name || '').toLowerCase().includes(s)
            );
        }

        if (f.culture) {
            temp = temp.filter(p => p.culture === f.culture);
        }

        if (f.city) {
            temp = temp.filter(p => p.city === f.city);
        }

        temp.sort((a, b) => {
            const areaA = Number(a.area);
            const areaB = Number(b.area);
            return f.sort === 'desc' ? areaB - areaA : areaA - areaB;
        });

        this.filteredProperties = temp;
        this.first = 0;

        if (this.viewMode === 'map') {
            this.updateMap();
        }
    }

    openLeadDetails(leadId: number) {
        this.router.navigate(['/leads', leadId], { fragment: 'properties' });
    }

    openNewPropertyModal() {
        if (this.createModal) this.createModal.open();
    }

    editProperty(prop: any) {
        if (this.createModal) this.createModal.open(prop);
    }

    deleteProperty(event: Event, id: number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Tem certeza que deseja excluir esta propriedade?',
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim, excluir',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            accept: () => {
                this.propertyService.delete(id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Propriedade excluída' });
                        this.loadProperties();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir' });
                    }
                });
            }
        });
    }

    switchView(mode: 'list' | 'map') {
        this.viewMode = mode;
        if (mode === 'map') {
            setTimeout(() => this.initMap(), 100);
        }
    }

    updateMap() {
        if (this.viewMode === 'map' && this.map) {
            this.addMarkersToMap();
        }
    }

    initMap() {
        if (this.map) return;
        this.map = new mapboxgl.Map({
            container: 'properties-map',
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [-47.5, -18.5],
            zoom: 6.5
        });
        this.map.addControl(new mapboxgl.NavigationControl());
        this.map.on('load', () => this.addMarkersToMap());
    }

    addMarkersToMap() {
        if (!this.map) return;
        this.filteredProperties.forEach(prop => {
            if (prop.geometry) this.addPolygonToMap(prop);
            const lat = prop.lat || -18.5;
            const lng = prop.lng || -47.5;
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; color: #333;">
          <strong style="font-size: 14px;">${prop.name}</strong><br>
          <span style="font-size: 12px; color: #666;">${prop.culture} • ${prop.area} ha</span>
        </div>`);
            new mapboxgl.Marker({ color: this.getColorByCulture(prop.culture) })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(this.map!);
        });
    }

    addPolygonToMap(prop: any) {
        const sourceId = `source-${prop.id}`;
        if (this.map?.getSource(sourceId)) return;
        this.map?.addSource(sourceId, { type: 'geojson', data: prop.geometry });
        this.map?.addLayer({
            id: `layer-${prop.id}`,
            type: 'fill',
            source: sourceId,
            paint: { 'fill-color': this.getColorByCulture(prop.culture), 'fill-opacity': 0.4 }
        });
        this.map?.addLayer({
            id: `outline-${prop.id}`,
            type: 'line',
            source: sourceId,
            paint: { 'line-color': '#fff', 'line-width': 2 }
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