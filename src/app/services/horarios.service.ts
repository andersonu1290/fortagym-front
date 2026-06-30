import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private apiUrl = `${environment.apiUrl}/api/entrenadores/mis-horarios`;

  constructor(private http: HttpClient) {}

  obtenerMisHorarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  guardarHorario(horario: any): Observable<any> {
    return this.http.post(this.apiUrl, horario);
  }

  cambiarEstado(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, {});
  }

  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
