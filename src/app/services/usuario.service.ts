import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // 🔄 CORREGIDO: Se cambiaron las comillas simples por comillas invertidas ` para inyectar la variable correctamente
  private apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  actualizarPerfil(datos: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/perfil`, datos, { headers });
  }

  subirFoto(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', archivo);

    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}/perfil/foto`, formData, {
      headers: headers,
      responseType: 'text'
    });
  }

  // ✨ ¡ESTE ES EL MÉTODO QUE FALTABA PARA QUE LA NUTRICIONISTA VEA AL PACIENTE! ✨
  getUsuarioPorId(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }
}
