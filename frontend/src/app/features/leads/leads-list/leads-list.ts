import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Lead } from '../../../core/models/lead';
import { LeadService } from '../../../core/services/lead.service'; // <--- Importando o Serviço
import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { LeadFilters, LeadsFilterComponent } from '../leads-filter/leads-filter';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';
import { LeadCreateComponent } from '../lead-create/lead-create';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-leads-list',
    standalone: true,
    imports: [
        CommonModule,
        ...PRIMENG_MODULES,
        FormsModule,
        LeadsFilterComponent,
        TimeAgoPipe,
        LeadCreateComponent,
        ButtonModule
    ],
    templateUrl: './leads-list.html',
    styleUrls: ['./leads-list.css']
})
export class LeadsListComponent implements OnInit {

    @ViewChild(LeadCreateComponent) createModal!: LeadCreateComponent;

    leads: Lead[] = [];

    displayModal: boolean = false;

    newLead: any = {
        name: '',
        email: '',
        cpf: '',
        phone: '',
        city: '',
        status: 'Novo',
        area: null,
        culture: '',
        obs: ''
    };

    constructor(
        private router: Router,
        private leadService: LeadService
    ) { }

    ngOnInit() {
        this.loadLeads();
    }

    loadLeads(filters?: LeadFilters) {
        this.leadService.getLeads(filters).subscribe({
            next: (dados) => {
                this.leads = dados;
            }
        });
    }

    handleFilterChange(filters: LeadFilters) {
        console.log('Filtros recebidos do componente filho:', filters);
        this.loadLeads(filters);
    }

    viewDetails(id: number) {
        if (id) {
            this.router.navigate(['/leads', id]);
        }
    }

    openNewLeadModal() {
        this.createModal.open();
    }

    onLeadCreated() {
        this.loadLeads();
    }

    saveLead() {
        console.log('Botão Salvar clicado. Dados:', this.newLead);
        this.displayModal = false;
        this.resetForm();
    }

    resetForm() {
        this.newLead = {
            name: '', email: '', cpf: '', phone: '', city: '',
            status: 'Novo', area: null, culture: '', obs: ''
        };
    }

    getStatusSeverity(status: string): "success" | "info" | "warning" | "danger" | undefined {
        switch (status) {
            case 'Novo': return 'info';           // Azul
            case 'Contato Inicial': return 'info'; // Azul
            case 'Em Negociação': return 'warning'; // Amarelo
            case 'Convertido': return 'success';   // Verde
            case 'Perdido': return 'danger';       // Vermelho
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