import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule as PrimeInputText } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

export interface LeadFilters {
  search?: string;
  status?: string;
  city?: string;
  priority?: string;
}

@Component({
  selector: 'app-lead-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    PrimeInputText,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './leads-filter.html',
  styleUrls: ['./leads-filter.css']
})
export class LeadsFilterComponent implements OnChanges {

  @Input() leadsData: any[] = [];
  @Output() filterChange = new EventEmitter<LeadFilters>();

  filters: LeadFilters = {
    search: '',
    status: 'Todos',
    city: 'Todos',
    priority: 'Todos'
  };

  statusOptions: any[] = [{ label: 'Todos Status', value: 'Todos' }];
  cityOptions: any[] = [{ label: 'Todos Municípios', value: 'Todos' }];

  priorityOptions = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Prioritário', value: 'Prioritário' },
    { label: 'Normal', value: 'Normal' }
  ];

  private optionsLoaded = false;
  private searchTimeout: any;

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['leadsData'] && this.leadsData.length > 0 && !this.optionsLoaded) {
      this.extractOptions();
      this.optionsLoaded = true;
    }
  }

  extractOptions() {

    const uniqueStatuses = [...new Set(this.leadsData.map(l => l.status))].sort();
    this.statusOptions = [
      { label: 'Todos Status', value: 'Todos' },
      ...uniqueStatuses.map(s => ({ label: s, value: s }))
    ];

    const uniqueCities = [...new Set(this.leadsData.map(l => l.city))].sort();
    this.cityOptions = [
      { label: 'Todos Municípios', value: 'Todos' },
      ...uniqueCities.map(c => ({ label: c, value: c }))
    ];
  }

  onFilterChange(type: string) {

    if (type === 'search') {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.emitFilters();
      }, 500);
    } else {
      this.emitFilters();
    }
  }

  emitFilters() {
    this.filterChange.emit(this.filters);
  }
}