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
import { AutoCompleteModule } from 'primeng/autocomplete';

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
  styleUrls: ['./lead-create.css']
})
export class LeadCreateComponent implements OnInit {

  @Output() onSave = new EventEmitter<void>();

  visible: boolean = false;
  loading: boolean = false;

  // --- VARIAVEIS DE CONTROLE DE EDIÇÃO ---
  isEditMode: boolean = false;
  currentLeadId: number | null = null;
  // ---------------------------------------

  mgCities: any[] = [];
  filteredCities: any[] = [];

  newLead: any = {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    city: null,
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
    this.leadService.getCitiesMG().subscribe(cities => {
      this.mgCities = cities;
    });
  }

  filterCity(event: any) {
    const query = event.query?.toLowerCase() || '';
    if (!query) {
      this.filteredCities = [...this.mgCities];
    } else {
      this.filteredCities = this.mgCities.filter(city =>
        city.label.toLowerCase().includes(query)
      );
    }
  }

  // --- ALTERADO: Agora aceita um lead opcional ---
  open(leadToEdit?: any) {
    this.visible = true;

    if (leadToEdit) {
      // MODO EDIÇÃO
      this.isEditMode = true;
      this.currentLeadId = leadToEdit.id;

      this.newLead = {
        ...leadToEdit,
        city: leadToEdit.city ? { label: leadToEdit.city, value: leadToEdit.city } : null
      };

    } else {
      // MODO CRIAÇÃO
      this.isEditMode = false;
      this.currentLeadId = null;
      this.resetForm();
    }
  }

  close() {
    this.visible = false;
    this.resetForm();
  }

  save() {

    let cityClean = this.newLead.city;
    if (this.newLead.city && this.newLead.city.value) {
      cityClean = this.newLead.city.value;
    }

    // --- 1. VALIDAÇÃO (Serve para os dois casos) ---
    if (!this.newLead.name || !cityClean || !this.newLead.phone) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha Nome, Telefone e Município.' });
      return;
    }

    if (!this.newLead.area || this.newLead.area <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'A Área é obrigatória.' });
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

    // --- 2. PREPARAÇÃO ---
    const payload = { ...this.newLead };
    payload.cpf = cpfClean;
    payload.city = cityClean; // Envia apenas a string da cidade

    this.loading = true;

    // --- 3. DECISÃO: CRIAR OU ATUALIZAR ---
    if (this.isEditMode && this.currentLeadId) {

      // >>> CHAMADA DE UPDATE <<<
      this.leadService.update(this.currentLeadId, payload).subscribe({
        next: () => {
          this.finalizeSave('Lead atualizado com sucesso!');
        },
        error: (err) => this.handleError(err)
      });

    } else {

      // >>> CHAMADA DE CREATE <<<
      this.leadService.create(payload).subscribe({
        next: () => {
          this.finalizeSave('Lead criado com sucesso!');
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  // Métodos auxiliares para limpar o código do save()
  private finalizeSave(successMessage: string) {
    this.loading = false;
    this.visible = false;
    this.onSave.emit(); // Avisa o pai para recarregar a lista
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: successMessage });
    this.resetForm();
  }

  private handleError(err: any) {
    console.error(err);
    this.loading = false;
    const msg = err.error?.message || 'Falha na operação.';
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
  }

  resetForm() {
    this.newLead = {
      name: '', cpf: '', email: '', phone: '', city: null,
      area: null, status: 'Novo', isPriority: false, obs: ''
    };
  }
}