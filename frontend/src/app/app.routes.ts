import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { LeadsListComponent } from './features/leads/leads-list/leads-list';
import { LeadDetailComponent } from './features/leads/lead-detail/lead-detail';
import { PropertiesListComponent } from './features/properties/properties-list/properties-list';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'leads', component: LeadsListComponent },
    { path: 'leads/:id', component: LeadDetailComponent },

    // AQUI: O caminho deve ser 'propriedades' (minúsculo, igual ao sidebar)
    { path: 'propriedades', component: PropertiesListComponent },

    { path: '**', redirectTo: 'dashboard' }
];