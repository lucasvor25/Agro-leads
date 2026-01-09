import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // <--- Importe HttpParams
import { Observable } from 'rxjs';
import { Lead } from '../models/lead';

@Injectable({
  providedIn: 'root'
})
export class LeadService {

  private apiUrl = '/api/leads';

  constructor(private http: HttpClient) { }

  getLeads(filters?: { search?: string, status?: string, city?: string, priority?: string }): Observable<Lead[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status && filters.status !== 'Todos') params = params.set('status', filters.status);
      if (filters.city && filters.city !== 'Todos') params = params.set('city', filters.city);
      if (filters.priority && filters.priority !== 'Todos') params = params.set('priority', filters.priority);
    }

    return this.http.get<Lead[]>(this.apiUrl, { params });
  }

  create(lead: any): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead);
  }
}