import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { LeadListComponent } from './features/leads/lead-list/lead-list';
import { LeadDetailComponent } from './features/leads/lead-detail/lead-detail';
import { PropertiesListComponent } from './features/properties/properties-list/properties-list';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: RegisterComponent },

  // Rotas protegidas
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'leads', component: LeadListComponent, canActivate: [authGuard] },
  { path: 'leads/:id', component: LeadDetailComponent, canActivate: [authGuard] },
  { path: 'propriedades', component: PropertiesListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];