import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../models/property';

@Injectable({ providedIn: 'root' })
export class PropertyService {

  private apiUrl = '/api/properties';

  constructor(private http: HttpClient) { }

  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl);
  }

  getById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  create(property: Property): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, property);
  }

  update(id: number, property: Partial<Property>): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}`, property);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}