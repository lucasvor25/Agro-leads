import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { LeadListComponent } from './features/leads/lead-list/lead-list';
import { LeadDetailComponent } from './features/leads/lead-detail/lead-detail';
import { PropertiesListComponent } from './features/properties/properties-list/properties-list';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'leads', component: LeadListComponent },
    { path: 'leads/:id', component: LeadDetailComponent },
    { path: 'propriedades', component: PropertiesListComponent },
    { path: '**', redirectTo: 'dashboard' }
];