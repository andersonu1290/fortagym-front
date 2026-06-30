import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // ⬅️ ¡Sin el .development!

@Injectable({
  providedIn: 'root'
})
export class HorariosNutriService {
  private apiUrl = `${environment.apiUrl}/api/nutricionistas/mis-horarios`;

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
