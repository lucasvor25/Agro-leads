import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { LeadService } from '../../../core/services/lead.service'; // Ajuste o caminho

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
    CheckboxModule
  ],
  templateUrl: './lead-create.html',
  styles: [`
    :host ::ng-deep .p-dialog-content { overflow-y: visible; }
  `]
})
export class LeadCreateComponent {

  @Output() onSave = new EventEmitter<void>(); // Avisa o pai para atualizar a lista

  visible: boolean = false;
  loading: boolean = false;

  // Objeto vazio para o formulário
  newLead: any = {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    city: '',
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

  constructor(private leadService: LeadService) { }

  // Função chamada pelo componente Pai para abrir a modal
  open() {
    this.resetForm();
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  save() {
    this.loading = true;

    this.leadService.create(this.newLead).subscribe({
      next: () => {
        this.loading = false;
        this.visible = false;
        this.onSave.emit(); // Avisa o pai que salvou com sucesso
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  resetForm() {
    this.newLead = {
      name: '', cpf: '', email: '', phone: '', city: '',
      area: null, status: 'Novo', isPriority: false, obs: ''
    };
  }
}