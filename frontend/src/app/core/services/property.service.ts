import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropertyService {

  private apiUrl = '/api/properties';

  constructor(private http: HttpClient) { }

  // Listar todas
  getProperties(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Buscar uma específica (útil para recarregar dados na edição se necessário)
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Criar (POST)
  create(property: any): Observable<any> {
    return this.http.post(this.apiUrl, property);
  }

  // Atualizar (PATCH)
  // O backend espera receber o ID na URL e os dados no corpo
  update(id: number, property: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, property);
  }

  // Deletar (DELETE)
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}