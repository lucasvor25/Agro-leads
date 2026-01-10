import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

export interface PropertyFilters {
  search: string;
  culture: string | null;
  city: string | null;
  sort: string;
}

@Component({
  selector: 'app-property-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, InputTextModule],
  templateUrl: './property-filter.html',
  styleUrls: ['./property-filter.css']
})
export class PropertiesFilterComponent implements OnChanges {

  @Input() properties: any[] = [];
  @Output() onFilterChange = new EventEmitter<PropertyFilters>();

  // Estado dos Filtros
  filters: PropertyFilters = {
    search: '',
    culture: null,
    city: null,
    sort: 'desc' // Padrão: Maior área
  };

  // Opções Dinâmicas
  cultureOptions: any[] = [];
  cityOptions: any[] = [];

  // Opções Fixas (Ordenação)
  sortOptions = [
    { label: 'Maior Área', value: 'desc' },
    { label: 'Menor Área', value: 'asc' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    // Sempre que os dados mudarem (ex: carregou do banco ou criou nova), atualiza os dropdowns
    if (changes['properties'] && this.properties) {
      this.extractOptions();
    }
  }

  extractOptions() {
    // 1. Extrair Culturas Únicas
    const uniqueCultures = [...new Set(this.properties.map(p => p.culture).filter(c => !!c))].sort();
    this.cultureOptions = [
      { label: 'Todas Culturas', value: null },
      ...uniqueCultures.map(c => ({ label: c, value: c }))
    ];

    // 2. Extrair Cidades Únicas (AQUI ESTÁ A MÁGICA)
    // Pega apenas as cidades que estão nas propriedades carregadas
    const uniqueCities = [...new Set(this.properties.map(p => p.city).filter(c => !!c))].sort();
    this.cityOptions = [
      { label: 'Todos Municípios', value: null },
      ...uniqueCities.map(c => ({ label: c, value: c }))
    ];
  }

  // Emite a mudança para o Pai
  emitFilter() {
    this.onFilterChange.emit(this.filters);
  }
}