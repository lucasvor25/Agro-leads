import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { LeadService } from '../../../core/services/lead.service';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete'; // Módulo do AutoComplete

@Component({
  selector: 'app-lead-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    InputNumberModule,
    CheckboxModule,
    InputMaskModule,
    ToastModule,
    AutoCompleteModule
  ],
  providers: [MessageService],
  templateUrl: './lead-create.html',
  styles: [`
    :host ::ng-deep .p-dialog-content { overflow-y: visible; }
  `]
})
export class LeadCreateComponent implements OnInit {

  @Output() onSave = new EventEmitter<void>();

  visible: boolean = false;
  loading: boolean = false;

  // Lista Mestra (Todas as cidades do IBGE)
  mgCities: any[] = [];

  // Lista Filtrada (O que aparece enquanto digita)
  filteredCities: any[] = [];

  newLead: any = {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    city: null, // Pode ser string ou objeto do autocomplete
    area: null,
    status: 'Novo',
    isPriority: false,
    obs: ''
  };

  statusOptions = [
    { label: 'Novo', value: 'Novo' },
    { label: 'Contato Inicial', value: 'Contato Inicial' },
    { label: 'Em Negociação', value: 'Em Negociação' },
    { label: 'Convertido', value: 'Convertido' },
    { label: 'Perdido', value: 'Perdido' }
  ];

  constructor(
    private leadService: LeadService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Carrega todas as cidades na memória
    this.leadService.getCitiesMG().subscribe(cities => {
      this.mgCities = cities;
    });
  }

  // --- LÓGICA DO AUTOCOMPLETE ---
  filterCity(event: any) {
    const query = event.query.toLowerCase();

    // Filtra a lista mestra baseado no que o usuário digitou
    this.filteredCities = this.mgCities.filter(city =>
      city.label.toLowerCase().includes(query)
    );
  }

  open() {
    this.resetForm();
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  save() {

    let cityClean = this.newLead.city;

    if (this.newLead.city && this.newLead.city.value) {
      cityClean = this.newLead.city.value;
    }

    // --- 1. VALIDAÇÃO ---
    // Note que agora validamos 'cityClean', não mais 'this.newLead.city' diretamente
    if (!this.newLead.name || !cityClean || !this.newLead.phone) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha Nome, Telefone e Município.' });
      return;
    }

    if (!this.newLead.area || this.newLead.area <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'A Área é obrigatória para definir prioridade.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.newLead.email || !emailRegex.test(this.newLead.email)) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Email inválido.' });
      return;
    }

    const cpfClean = (this.newLead.cpf || '').replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'O CPF deve ter 11 dígitos.' });
      return;
    }

    // --- 2. PREPARAÇÃO E ENVIO ---
    const leadToSend = { ...this.newLead };
    leadToSend.cpf = cpfClean;
    leadToSend.city = cityClean; // Garante que vai a string da cidade

    this.loading = true;

    this.leadService.create(leadToSend).subscribe({
      next: () => {
        this.loading = false;
        this.visible = false;
        this.onSave.emit();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Lead criado!' });
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        // Tenta pegar mensagem do backend ou usa genérica
        const msg = err.error?.message || 'Falha ao salvar lead.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
      }
    });
  }

  resetForm() {
    this.newLead = {
      name: '', cpf: '', email: '', phone: '', city: null,
      area: null, status: 'Novo', isPriority: false, obs: ''
    };
  }
}