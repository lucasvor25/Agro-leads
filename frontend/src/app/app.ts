import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
// AQUI: Importando a constante como você pediu
import { PRIMENG_MODULES } from './shared/modules/prime-ng-module';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    // AQUI: Usando o spread operator (...) para espalhar os módulos do array
    ...PRIMENG_MODULES
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Controle do Cabeçalho
  pageTitle: string = 'Dashboard';
  pageSubtitle: string = 'Visão geral da sua carteira';

  // Controle da Sidebar
  collapsed = false;

  constructor(private router: Router) { }

  ngOnInit() {
    // Escuta a mudança de rota para atualizar o título
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateHeader(event.urlAfterRedirects || event.url);
    });
  }

  updateHeader(url: string) {
    // Lógica para definir o texto baseado na URL
    if (url.includes('/leads')) {
      this.pageTitle = 'Leads';
      this.pageSubtitle = 'Gerenciamento de contatos e oportunidades';
    } else if (url.includes('/propriedades')) {
      this.pageTitle = 'Propriedades';
      this.pageSubtitle = 'Gestão de fazendas e áreas produtivas';
    } else {
      this.pageTitle = 'Dashboard';
      this.pageSubtitle = 'Visão geral da sua carteira de leads';
    }
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}