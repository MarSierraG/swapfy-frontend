import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';
import Swal from 'sweetalert2';

import { environment } from '../../../environments/environment';

interface RegisterData { name: string; email: string; password: string; }
interface LoginData    { email: string; password: string; }

interface LoginResp {
  token: string;
  user: {
    userId: number;
    name: string;
    roles: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl    = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'token';
  private readonly ID_KEY    = 'userId';
  private readonly NAME_KEY  = 'userName';
  private readonly ROLES_KEY = 'userRoles';


  constructor(private http: HttpClient, private router: Router) {}


  isLoggedIn(): boolean          { return !!localStorage.getItem(this.TOKEN_KEY); }
  currentUserId(): number | null { return Number(localStorage.getItem(this.ID_KEY)) || null; }
  currentUserName(): string|null { return localStorage.getItem(this.NAME_KEY); }


  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: LoginData): Observable<LoginResp> {
    return this.http.post<LoginResp>(`${this.apiUrl}/login`, data).pipe(
      tap(({ token, user }) => {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.ID_KEY,   String(user.userId));
        localStorage.setItem(this.NAME_KEY, user.name);
        localStorage.setItem(this.ROLES_KEY, JSON.stringify(user.roles));

        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  isAdmin(): boolean {
    const raw = localStorage.getItem(this.ROLES_KEY);

    if (!raw || raw === 'undefined') return false;

    try {
      const roles = JSON.parse(raw);
      return roles.includes('ADMIN');
    } catch (err) {
      console.error('Error al parsear roles:', err);
      return false;
    }
  }

  checkEmailExists(email: string, excludeId?: number) {
    let url = `${environment.apiUrl}/users/check-email?email=${encodeURIComponent(email)}`;
    if (excludeId !== undefined) {
      url += `&excludeId=${excludeId}`;
    }
    return this.http.get<boolean>(url);
  }

  logout(): void {
    localStorage.clear();

    Swal.fire({
      title: 'Has cerrado sesión',
      text:  '¡Hasta pronto!',
      icon:  'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#14b8a6'
    }).then(() => this.router.navigate(['/login']));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { email: string; code: string; newPassword: string }) {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  currentUserRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles[0];
    } catch (e) {
      return '';
    }
  }

  getUserRoles(): string[] {
    const raw = localStorage.getItem(this.ROLES_KEY);
    if (!raw || raw === 'undefined') return [];

    try {
      return JSON.parse(raw) as string[];
    } catch (err) {
      console.error('Error al parsear roles:', err);
      return [];
    }
  }


}
