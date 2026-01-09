import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as mapboxgl from 'mapbox-gl';
import { PRIMENG_MODULES } from '../../shared/modules/prime-ng-module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ...PRIMENG_MODULES],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  statusChartData: any;
  cityChartData: any;
  chartOptions: any;
  barOptions: any;

  priorityLeads = [
    {
      name: 'João Carlos Silva',
      city: 'Uberlândia',
      phone: '(34) 99999-1234',
      email: 'joao.silva@email.com',
      status: 'Em Negociação',
      area: 450,
      time: 'há quase 2 anos'
    },
    {
      name: 'Pedro Henrique Santos',
      city: 'Patos de Minas',
      phone: '(34) 97777-9012',
      email: 'pedro.santos@email.com',
      status: 'Contato Inicial',
      area: 220,
      time: 'há quase 2 anos'
    },
    {
      name: 'Fernanda Rodrigues',
      city: 'Uberlândia',
      phone: '(34) 94444-1234',
      email: 'fernanda.rodrigues@email.co',
      status: 'Em Negociação',
      area: 520,
      time: 'há quase 2 anos'
    }
  ];

  statusSummary = [
    { label: 'Novo', count: 2 },
    { label: 'Contato Inicial', count: 2 },
    { label: 'Em Negociacao', count: 2 },
    { label: 'Convertido', count: 1 },
    { label: 'Perdido', count: 1 }
  ];

  ngOnInit() {
    this.initCharts();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    (mapboxgl as any).accessToken = environment.mapboxToken;

    const map = new mapboxgl.Map({
      container: 'dashboard-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-48.2772, -18.9186],
      zoom: 6.5
    });
    map.addControl(new mapboxgl.NavigationControl());
  }

  initCharts() {
    this.statusChartData = {
      labels: ['Novo', 'Contato Inicial', 'Em Negociação', 'Convertido', 'Perdido'],
      datasets: [{
        data: [20, 20, 30, 20, 10],
        backgroundColor: ['#3B82F6', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444']
      }]
    };
    this.chartOptions = { plugins: { legend: { display: false } }, cutout: '60%' };

    this.cityChartData = {
      labels: ['Uberlândia', 'Uberaba', 'Patos de Minas', 'Patrocínio', 'Araguari', 'Paracatu'],
      datasets: [{
        label: 'Leads',
        backgroundColor: '#2D4A3E',
        borderRadius: 4,
        data: [12, 8, 8, 7, 7, 6]
      }]
    };
    this.barOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { grid: { display: false } } }
    };
  }

  // Helper para cores das tags
  getSeverity(status: string): "success" | "info" | "warning" | "danger" | undefined {
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