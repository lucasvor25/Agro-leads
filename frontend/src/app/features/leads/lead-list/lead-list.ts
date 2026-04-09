import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Lead } from '../../../core/models/lead';
import { LeadService } from '../../../core/services/lead';
import { LoggerService } from 'src/app/core/services/logger.service';
import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { LeadFilters, LeadsFilterComponent } from '../leads-filter/leads-filter';
import { LeadCreateComponent } from '../lead-create/lead-create';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';

@Component({
    selector: 'app-lead-list',
    standalone: true,
    imports: [
        CommonModule,
        ...PRIMENG_MODULES,
        FormsModule,
        LeadsFilterComponent,
        LeadCreateComponent,
        ButtonModule,
        TableModule,
        PaginatorModule
    ],
    templateUrl: './lead-list.html',
    styleUrls: ['./lead-list.css']
})
export class LeadListComponent implements OnInit {

    @ViewChild(LeadCreateComponent) createModal!: LeadCreateComponent;

    leads: Lead[] = [];
    displayModal: boolean = false;

    first: number = 0;
    rows: number = 12;
    totalRecords: number = 0;
    currentFilters?: LeadFilters;

    newLead: Partial<Lead> & { culture?: string; area?: number | null } = {
        name: '', email: '', cpf: '', phone: '', city: '',
        status: 'Novo', area: undefined, culture: '', obs: ''
    };

    constructor(
        private router: Router,
        private leadService: LeadService,
        private logger: LoggerService
    ) { }

    ngOnInit() {
        this.loadLeads();
    }

    onPageChange(event: { first?: number, rows?: number }) {
        this.first = event.first || 0;
        this.rows = event.rows || 12;
        const page = Math.floor(this.first / this.rows) + 1;
        this.loadLeads(this.currentFilters, page, this.rows);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadLeads(filters?: LeadFilters, page: number = 1, limit?: number) {
        const queryParams = { ...filters, page, limit: limit || this.rows };
        this.leadService.getLeads(queryParams).subscribe({
            next: (response) => {
                this.leads = response.data;
                this.totalRecords = response.meta.totalItems;
            }
        });
    }

    handleFilterChange(filters: LeadFilters) {
        this.currentFilters = filters;
        this.first = 0;
        this.loadLeads(filters, 1, this.rows);
    }

    viewDetails(id: number) {
        if (id) this.router.navigate(['/leads', id]);
    }

    openNewLeadModal() {
        this.createModal.open();
    }

    editLead(lead: Lead, event: Event) {
        event.stopPropagation();
        this.createModal.open(lead);
    }

    deleteLead(lead: Lead, event: Event) {
        event.stopPropagation();
        if (confirm(`Tem certeza que deseja excluir o lead ${lead.name}?`)) {
            this.leadService.delete(lead.id).subscribe({
                next: () => {
                    this.leads = this.leads.filter(l => l.id !== lead.id);
                },
                error: (err) => { this.logger.error('Erro ao excluir lead', err); alert('Erro ao excluir.'); }
            });
        }
    }

    onLeadCreated() {
        this.loadLeads();
    }

    saveLead() {
        this.displayModal = false;
        this.resetForm();
    }

    resetForm() {
        this.newLead = { name: '', email: '', cpf: '', phone: '', city: '', status: 'Novo', area: undefined, culture: '', obs: '' };
    }

    getStatusSeverity(status: string): "success" | "info" | "warning" | "danger" | undefined {
        switch (status) {
            case 'Novo': return 'info';
            case 'Contato Inicial': return 'info';
            case 'Em Negociação': return 'warning';
            case 'Convertido': return 'success';
            case 'Perdido': return 'danger';
            default: return 'info';
        }
    }

    isContactOld(dateString: string | Date): boolean {
        if (!dateString) return false;
        const date = new Date(dateString);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date < thirtyDaysAgo;
    }
}