import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/api/auth`;
  private usuariosUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, credentials);
  }

  // 📡 NUEVO MÉTODO: Trae los datos del usuario logueado usando el token
  getPerfil(): Observable<any> {
    return this.http.get(`${this.usuariosUrl}/perfil`);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  registrar(usuario: any): Observable<any> {
    // Apuntamos al endpoint que definimos en la Fase 2 (Puerto 8089)
    return this.http.post(`${environment.apiUrl}/api/usuarios/registro`, usuario);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
