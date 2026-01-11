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
import { LeadService } from '../../../core/services/lead';
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

  isEditMode: boolean = false;
  currentLeadId: number | null = null;

  cpfInvalid: boolean = false;
  emailInvalid: boolean = false;

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

  open(leadToEdit?: any) {
    this.visible = true;
    this.resetForm();

    if (leadToEdit) {
      this.isEditMode = true;
      this.currentLeadId = leadToEdit.id;
      this.newLead = {
        ...leadToEdit,
        city: leadToEdit.city ? { label: leadToEdit.city, value: leadToEdit.city } : null
      };
    } else {
      this.isEditMode = false;
      this.currentLeadId = null;
    }
  }

  close() {
    this.visible = false;
    this.resetForm();
  }

  save() {
    this.cpfInvalid = false;
    this.emailInvalid = false;
    let cityClean = this.newLead.city;
    if (this.newLead.city && this.newLead.city.value) {
      cityClean = this.newLead.city.value;
    }

    if (!this.newLead.name || !cityClean || !this.newLead.phone) {
      this.messageService.add({ severity: 'warn', summary: 'Campos Incompletos', detail: 'Preencha Nome, Telefone e Município.' });
      return;
    }

    if (!this.newLead.area || this.newLead.area <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Informe uma Área válida (maior que 0).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.newLead.email && !emailRegex.test(this.newLead.email)) {
      this.emailInvalid = true;
      this.messageService.add({ severity: 'error', summary: 'E-mail Inválido', detail: 'Verifique o formato do e-mail.' });
      return;
    }

    const cpfClean = (this.newLead.cpf || '').replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      this.cpfInvalid = true;
      this.messageService.add({ severity: 'error', summary: 'CPF Inválido', detail: 'O CPF deve ter 11 dígitos.' });
      return;
    }

    const payload = { ...this.newLead };
    payload.cpf = cpfClean;
    payload.city = cityClean;

    delete payload.isPriority;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    this.loading = true;

    if (this.isEditMode && this.currentLeadId) {
      this.leadService.update(this.currentLeadId, payload).subscribe({
        next: () => this.finalizeSave('Lead atualizado com sucesso!'),
        error: (err) => this.handleError(err)
      });
    } else {
      this.leadService.create(payload).subscribe({
        next: () => this.finalizeSave('Lead criado com sucesso!'),
        error: (err) => this.handleError(err)
      });
    }
  }

  private finalizeSave(successMessage: string) {
    this.loading = false;
    this.visible = false;
    this.onSave.emit();
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: successMessage });
    this.resetForm();
  }

  private handleError(error: any) {
    this.loading = false;
    console.error('Erro na requisição:', error);

    if (error.status === 409) {
      const msg = error.error?.message || 'Registro duplicado.';

      if (msg.toLowerCase().includes('cpf')) {
        this.cpfInvalid = true;
      }
      if (msg.toLowerCase().includes('e-mail') || msg.toLowerCase().includes('email')) {
        this.emailInvalid = true;
      }

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: msg
      });
      return;
    }

    if (error.status === 400 && error.error?.message) {
      const detail = Array.isArray(error.error.message) ? error.error.message[0] : error.error.message;
      this.messageService.add({ severity: 'error', summary: 'Dados Inválidos', detail });
      return;
    }

    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o lead.' });
  }

  resetForm() {
    this.cpfInvalid = false;
    this.emailInvalid = false;
    this.newLead = {
      name: '', cpf: '', email: '', phone: '', city: null,
      area: null, status: 'Novo', isPriority: false, obs: ''
    };
  }
}