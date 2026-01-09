import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Importante para pegar o ID
import { Lead } from '../../../core/models/lead';
import { LeadService } from '../../../core/services/lead.service';
import { PRIMENG_MODULES } from '../../../shared/modules/prime-ng-module';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe'; // Se quiser usar o pipe de tempo
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [
    CommonModule,
    ...PRIMENG_MODULES,
    TimeAgoPipe,
    SkeletonModule
  ],
  templateUrl: './lead-detail.html',
  styleUrls: ['./lead-detail.css']
})
export class LeadDetailComponent implements OnInit {

  lead: Lead | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService
  ) { }

  ngOnInit() {
    // 1. Pega o ID da URL (ex: /leads/15)
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadLead(Number(id));
    }
  }

  loadLead(id: number) {
    this.loading = true;
    this.leadService.getLeadById(id).subscribe({
      next: (data) => {
        this.lead = data;
        this.loading = false;
        console.log('Detalhes carregados:', data);
      },
      error: (err) => {
        console.error('Erro ao carregar lead:', err);
        this.loading = false;
        // Opcional: Redirecionar se não achar
        // this.router.navigate(['/leads']); 
      }
    });
  }

  goBack() {
    this.router.navigate(['/leads']);
  }

  // Métodos placeholder para os botões
  editLead() {
    console.log('Editar', this.lead?.id);
  }

  deleteLead() {
    console.log('Excluir', this.lead?.id);
  }

  // Função auxiliar de cor (igual à da lista)
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
}