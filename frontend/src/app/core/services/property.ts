import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../models/property';

const OPTIONS = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class PropertyService {

  private apiUrl = '/api/properties';

  constructor(private http: HttpClient) { }

  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl, OPTIONS);
  }

  getById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`, OPTIONS);
  }

  create(property: Property): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, property, OPTIONS);
  }

  update(id: number, property: Partial<Property>): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}`, property, OPTIONS);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, OPTIONS);
  }
}