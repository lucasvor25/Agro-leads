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

  filters: PropertyFilters = {
    search: '',
    culture: null,
    city: null,
    sort: 'desc'
  };

  cultureOptions: any[] = [];
  cityOptions: any[] = [];
  sortOptions = [
    { label: 'Maior Área', value: 'desc' },
    { label: 'Menor Área', value: 'asc' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['properties'] && this.properties) {
      this.extractOptions();
    }
  }

  extractOptions() {
    const uniqueCultures = [...new Set(this.properties.map(p => p.culture).filter(c => !!c))].sort();
    this.cultureOptions = [
      { label: 'Todas Culturas', value: null },
      ...uniqueCultures.map(c => ({ label: c, value: c }))
    ];

    const uniqueCities = [...new Set(this.properties.map(p => p.city).filter(c => !!c))].sort();
    this.cityOptions = [
      { label: 'Todos Municípios', value: null },
      ...uniqueCities.map(c => ({ label: c, value: c }))
    ];
  }

  emitFilter() {
    this.onFilterChange.emit(this.filters);
  }
}