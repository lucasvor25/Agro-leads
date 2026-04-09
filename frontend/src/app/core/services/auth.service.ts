import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private currentUser$ = new BehaviorSubject<UserProfile | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API}/register`, data, { withCredentials: true });
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API}/login`, data, { withCredentials: true }).pipe(
      tap(() => this.loadMe().subscribe())
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser$.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  loadMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUser$.next(user))
    );
  }

  getUser(): Observable<UserProfile | null> {
    return this.currentUser$.asObservable();
  }

  isAuthenticated(): boolean {
    return this.currentUser$.value !== null;
  }
}
