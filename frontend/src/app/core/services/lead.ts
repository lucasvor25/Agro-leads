import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lead } from '../models/lead';
import { CityOption } from '../models/common';
import { map } from 'rxjs/operators';

import { PaginatedResponse } from '../models/pagination';
import { environment } from '../../../environments/environment';

const OPTIONS = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class LeadService {

  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) { }

  getLeads(filters?: { search?: string, status?: string, city?: string, priority?: string, page?: number, limit?: number }): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status && filters.status !== 'Todos') params = params.set('status', filters.status);
      if (filters.city && filters.city !== 'Todos') params = params.set('city', filters.city);
      if (filters.priority && filters.priority !== 'Todos') params = params.set('priority', filters.priority);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedResponse<Lead>>(this.apiUrl, { ...OPTIONS, params });
  }

  create(lead: Omit<Lead, 'id'>): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead, OPTIONS);
  }

  getLeadById(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`, OPTIONS);
  }

  update(id: number, lead: Partial<Lead>): Observable<Lead> {
    return this.http.patch<Lead>(`${this.apiUrl}/${id}`, lead, OPTIONS);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, OPTIONS);
  }

  getCitiesMG(): Observable<CityOption[]> {
    return this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios')
      .pipe(
        map(cities => cities.map(c => ({ label: c.nome, value: c.nome })))
      );
  }
}