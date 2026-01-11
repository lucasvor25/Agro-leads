import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeadListComponent } from './lead-list';
import { LeadService } from '../../../core/services/lead';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';

describe('LeadListComponent', () => {
    let component: LeadListComponent;
    let fixture: ComponentFixture<LeadListComponent>;
    let leadServiceMock: any;
    let routerMock: any;

    const mockLeads = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Lead ${i + 1}`,
        status: 'Novo',
        createdAt: new Date().toISOString()
    }));

    beforeEach(async () => {

        leadServiceMock = jasmine.createSpyObj('LeadService', ['getLeads', 'delete', 'getCitiesMG']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        leadServiceMock.getCitiesMG.and.returnValue(of([{ label: 'BH', value: 'BH' }]));
        leadServiceMock.getLeads.and.returnValue(of(mockLeads));

        await TestBed.configureTestingModule({
            imports: [
                LeadListComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: LeadService, useValue: leadServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LeadListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('deve carregar a lista de leads ao iniciar', () => {
        expect(leadServiceMock.getLeads).toHaveBeenCalled();
        expect(component.leads.length).toBe(15);
    });

    it('deve calcular corretamente os leads visíveis baseado na paginação (rows = 12)', () => {

        expect(component.visibleLeads.length).toBe(12);
        expect(component.visibleLeads[0].id).toBe(1);
        component.onPageChange({ first: 12, rows: 12 });
        expect(component.visibleLeads.length).toBe(3);
        expect(component.visibleLeads[0].id).toBe(13);
    });

    it('deve navegar para os detalhes do lead ao chamar viewDetails', () => {
        component.viewDetails(5);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/leads', 5]);
    });

    it('deve abrir o modal de criação ao chamar openNewLeadModal', () => {

        spyOn(component.createModal, 'open');

        component.openNewLeadModal();

        expect(component.createModal.open).toHaveBeenCalled();
    });

    it('deve retornar a severidade correta para cada status', () => {
        expect(component.getStatusSeverity('Convertido')).toBe('success');
        expect(component.getStatusSeverity('Perdido')).toBe('danger');
        expect(component.getStatusSeverity('Em Negociação')).toBe('warning');
        expect(component.getStatusSeverity('Novo')).toBe('info');
    });

    it('deve identificar contatos antigos (mais de 30 dias)', () => {
        const dataAntiga = new Date();
        dataAntiga.setDate(dataAntiga.getDate() - 40);

        const dataRecente = new Date();

        expect(component.isContactOld(dataAntiga)).toBeTrue();
        expect(component.isContactOld(dataRecente)).toBeFalse();
    });
});